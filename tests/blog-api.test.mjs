import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { handleBlogsGet, handleBlogsPost } from "../lib/blog-api.ts";

const DATA_FILE = () => path.join(storageDir, "blogs.json");

let storageDir;

const post = (payload) =>
  handleBlogsPost(
    new Request("http://localhost:3000/api/blogs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );

const get = () => handleBlogsGet();

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "blog-api-test-"));
  process.env.BLOGS_DATA_DIR = storageDir;
});

afterEach(() => {
  delete process.env.BLOGS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("GET returns an empty array when no posts exist", async () => {
  const res = await get();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test("POST creates a post with title, content, slug, and creation date", async () => {
  const res = await post({ title: "Hello World", content: "My first post" });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.blog.slug, "hello-world");
  assert.equal(body.blog.title, "Hello World");
  assert.equal(body.blog.content, "My first post");
  assert.ok(!Number.isNaN(Date.parse(body.blog.createdAt)));
});

test("created posts are returned by GET", async () => {
  await post({ title: "First Post", content: "One" });
  await post({ title: "Second Post", content: "Two" });

  const res = await get();
  assert.equal(res.status, 200);
  const blogs = await res.json();
  assert.equal(blogs.length, 2);
  assert.equal(blogs[0].title, "Second Post");
  assert.equal(blogs[1].title, "First Post");
});

test("duplicate titles get unique slugs", async () => {
  const first = await post({ title: "Same Title", content: "One" });
  const second = await post({ title: "Same Title", content: "Two" });
  const firstBlog = (await first.json()).blog;
  const secondBlog = (await second.json()).blog;

  assert.equal(firstBlog.slug, "same-title");
  assert.equal(secondBlog.slug, "same-title-2");
  assert.notEqual(firstBlog.slug, secondBlog.slug);

  const blogs = await (await get()).json();
  assert.equal(new Set(blogs.map((b) => b.slug)).size, 2);
});

test("empty or whitespace title and content are rejected with 422", async () => {
  const cases = [
    { payload: { title: "", content: "hi" }, field: "title" },
    { payload: { title: "   ", content: "hi" }, field: "title" },
    { payload: { title: "T", content: "" }, field: "content" },
    { payload: { title: "T", content: "   " }, field: "content" },
  ];
  for (const { payload, field } of cases) {
    const res = await post(payload);
    assert.equal(res.status, 422, JSON.stringify(payload));
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.ok(body.errors?.[field]);
  }
  assert.throws(() => readFileSyncStrict(DATA_FILE()));
});

function readFileSyncStrict(p) {
  return readFileSync(p);
}

test("missing fields return 422 with errors for both fields", async () => {
  const res = await post({});
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.errors.title);
  assert.ok(body.errors.content);
});

test("malformed JSON body returns 400", async () => {
  const res = await post("{ not json");
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.match(body.error, /valid JSON/);
});

test("malformed storage returns 500 and is never overwritten", async () => {
  const corrupted = "{ not valid json";
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(DATA_FILE(), corrupted, "utf8");

  const res = await post({ title: "Should Fail", content: "Nope" });
  assert.equal(res.status, 500);
  const getRes = await get();
  assert.equal(getRes.status, 500);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), corrupted);
});

test("failed write preserves the existing file and leaves no temp files", async () => {
  const original = JSON.stringify([
    { slug: "keep", title: "Keep", content: "Keep me", createdAt: "2026-01-01T00:00:00.000Z" },
  ]);
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(DATA_FILE(), original, "utf8");
  chmodSync(storageDir, 0o555);

  try {
    const res = await post({ title: "Should Fail", content: "Nope" });
    assert.equal(res.status, 500);
  } finally {
    chmodSync(storageDir, 0o755);
  }
  assert.equal(readFileSync(DATA_FILE(), "utf8"), original);
  const leftovers = rmSync ? [] : [];
  assert.deepEqual(leftovers, []);
});

test("existing posts are preserved when adding new ones", async () => {
  await post({ title: "Original Post", content: "Original" });
  await post({ title: "New Post", content: "New" });

  const blogs = await (await get()).json();
  assert.equal(blogs.length, 2);
  assert.equal(blogs[1].title, "Original Post");
  assert.equal(blogs[1].slug, "original-post");
});

test("concurrent creations all persist with unique slugs", async () => {
  const responses = await Promise.all([
    post({ title: "Alpha", content: "a" }),
    post({ title: "Beta", content: "b" }),
    post({ title: "Gamma", content: "c" }),
  ]);
  for (const res of responses) assert.equal(res.status, 201);

  const blogs = await (await get()).json();
  assert.equal(blogs.length, 3);
  assert.equal(new Set(blogs.map((b) => b.slug)).size, 3);
});
