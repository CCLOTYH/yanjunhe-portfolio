import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  handleBlogsDelete,
  handleBlogsGet,
  handleBlogsPatch,
  handleBlogsPost,
} from "../lib/blog-api.ts";

const DATA_FILE = () => path.join(storageDir, "blogs.json");

let storageDir;

function request(method, { payload, slug } = {}) {
  const url = slug
    ? `http://localhost:3000/api/blogs?slug=${encodeURIComponent(slug)}`
    : "http://localhost:3000/api/blogs";
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body:
      payload === undefined
        ? undefined
        : typeof payload === "string"
          ? payload
          : JSON.stringify(payload),
  });
}

const post = (payload) => handleBlogsPost(request("POST", { payload }));
const patch = (payload, slug) => handleBlogsPatch(request("PATCH", { payload, slug }));
const del = (slug) => handleBlogsDelete(request("DELETE", { slug }));
const get = () => handleBlogsGet();

const EXISTING_POST = {
  slug: "existing-post",
  title: "Existing Post",
  content: "Keep me no matter what",
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "blog-crud-test-"));
  process.env.BLOGS_DATA_DIR = storageDir;
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(DATA_FILE(), JSON.stringify([EXISTING_POST], null, 2), "utf8");
});

afterEach(() => {
  delete process.env.BLOGS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("PATCH updates title and keeps slug, content, and createdAt", async () => {
  const res = await patch({ title: "Renamed Post" }, "existing-post");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.blog.title, "Renamed Post");
  assert.equal(body.blog.slug, "existing-post");
  assert.equal(body.blog.content, "Keep me no matter what");
  assert.equal(body.blog.createdAt, EXISTING_POST.createdAt);
  assert.ok(body.blog.updatedAt);

  const blogs = await (await get()).json();
  assert.equal(blogs.length, 1);
  assert.equal(blogs[0].slug, "existing-post");
});

test("PATCH updates content only and preserves the title", async () => {
  const res = await patch({ content: "Fresh content" }, "existing-post");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.blog.content, "Fresh content");
  assert.equal(body.blog.title, "Existing Post");
});

test("PATCH updates both fields and the detail URL stays stable", async () => {
  const res = await patch(
    { title: "New Title", content: "New body" },
    "existing-post",
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.blog.title, "New Title");
  assert.equal(body.blog.content, "New body");
  assert.equal(body.blog.slug, "existing-post");
});

test("PATCH rejects empty title or content with 422 and saves nothing", async () => {
  const badTitle = await patch({ title: "   " }, "existing-post");
  assert.equal(badTitle.status, 422);
  assert.ok((await badTitle.json()).errors.title);

  const badContent = await patch({ content: "" }, "existing-post");
  assert.equal(badContent.status, 422);
  assert.ok((await badContent.json()).errors.content);

  const emptyPatch = await patch({}, "existing-post");
  assert.equal(emptyPatch.status, 422);
  assert.match((await emptyPatch.json()).errors.content, /at least one field/i);

  const stored = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(stored[0].title, "Existing Post");
  assert.equal(stored[0].content, "Keep me no matter what");
});

test("PATCH with an unknown slug returns 404 and saves nothing", async () => {
  const before = readFileSync(DATA_FILE(), "utf8");
  const res = await patch({ title: "Ghost" }, "missing-slug");
  assert.equal(res.status, 404);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), before);
});

test("PATCH without a slug returns 400", async () => {
  const res = await handleBlogsPatch(request("PATCH", { payload: { title: "X" } }));
  assert.equal(res.status, 400);
});

test("malformed JSON body returns 400", async () => {
  const res = await handleBlogsPatch(
    request("PATCH", { payload: "{ not json", slug: "existing-post" }),
  );
  assert.equal(res.status, 400);
});

test("DELETE removes only the target post", async () => {
  await post({ title: "Temp Post", content: "Bye" });

  const res = await del("existing-post");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.slug, "existing-post");

  const blogs = await (await get()).json();
  assert.equal(blogs.length, 1);
  assert.equal(blogs[0].slug, "temp-post");
});

test("DELETE of an unknown slug returns 404 and never crashes", async () => {
  const res = await del("missing-slug");
  assert.equal(res.status, 404);
  const blogs = await (await get()).json();
  assert.equal(blogs.length, 1);
  assert.equal(blogs[0].slug, "existing-post");
});

test("DELETE without a slug returns 400", async () => {
  const res = await handleBlogsDelete(request("DELETE"));
  assert.equal(res.status, 400);
});

test("existing posts survive the full CRUD cycle", async () => {
  const created = (await (await post({ title: "Cycle Post", content: "One" })).json())
    .blog;

  await patch({ content: "Two" }, created.slug);
  await del(created.slug);

  const blogs = await (await get()).json();
  assert.equal(blogs.length, 1);
  assert.equal(blogs[0].slug, "existing-post");
  assert.equal(blogs[0].title, "Existing Post");
  assert.equal(blogs[0].content, "Keep me no matter what");
  assert.equal(blogs[0].createdAt, EXISTING_POST.createdAt);
  assert.equal(blogs[0].updatedAt, undefined);
});

test("create still works after edits and deletions", async () => {
  await patch({ title: "Renamed" }, "existing-post");
  await del("existing-post");
  const res = await post({ title: "Fresh Post", content: "Hello" });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.blog.slug, "fresh-post");
  const blogs = await (await get()).json();
  assert.equal(blogs.length, 1);
  assert.equal(blogs[0].slug, "fresh-post");
});

test("corrupted storage returns 500 instead of wiping data", async () => {
  writeFileSync(DATA_FILE(), "{ corrupted", "utf8");

  assert.equal((await get()).status, 500);
  assert.equal((await patch({ title: "X" }, "existing-post")).status, 500);
  assert.equal((await del("existing-post")).status, 500);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), "{ corrupted");
});
