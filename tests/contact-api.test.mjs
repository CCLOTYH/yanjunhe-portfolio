import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, chmodSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { handleContactPost } from "../lib/contact-api.ts";

const DATA_FILE = () => path.join(storageDir, "contacts.json");

let storageDir;

const post = (payload) =>
  handleContactPost(
    new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "contact-api-test-"));
  process.env.CONTACTS_DATA_DIR = storageDir;
});

afterEach(() => {
  delete process.env.CONTACTS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("valid submission returns 201 and persists to the shared JSON store", async () => {
  const res = await post({ name: "Api Tester", email: "api@example.com", message: "Hello via API" });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.match(body.message, /has been sent/);

  const entries = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(entries.length, 1);
  assert.equal(entries[0].email, "api@example.com");
});

test("validation failures return 422 with useful per-field errors and store nothing", async () => {
  const cases = [
    { payload: { name: "   ", email: "a@b.com", message: "hi" }, field: "name" },
    { payload: { name: "A", email: "no-at", message: "hi" }, field: "email" },
    { payload: { name: "A", email: "a@@b.com", message: "hi" }, field: "email" },
    { payload: { name: "A", email: "a@nodot", message: "hi" }, field: "email" },
    { payload: { name: "A", email: "a b@c.com", message: "hi" }, field: "email" },
    { payload: { name: "A", email: "a@b.com", message: "  " }, field: "message" },
  ];
  for (const { payload, field } of cases) {
    const res = await post(payload);
    assert.equal(res.status, 422, JSON.stringify(payload));
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.ok(body.errors?.[field], `expected ${field} error for ${JSON.stringify(payload)}`);
  }
  assert.equal(existsSync_(DATA_FILE()), false);
});

function existsSync_(p) {
  try {
    readFileSync(p);
    return true;
  } catch {
    return false;
  }
}

test("malformed JSON body returns 400", async () => {
  const res = await post("{ not json");
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.match(body.error, /valid JSON/);
});

test("missing fields return 422 with errors for every required field", async () => {
  const res = await post({});
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.errors.name);
  assert.ok(body.errors.email);
  assert.ok(body.errors.message);
});

test("failed write returns 500 and preserves the existing file", async () => {
  const original = JSON.stringify([
    { id: "keep", submittedAt: "2026-01-01T00:00:00.000Z", name: "Keep", email: "keep@example.com", message: "Keep me" },
  ]);
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(DATA_FILE(), original, "utf8");
  chmodSync(storageDir, 0o555);

  try {
    const res = await post({ name: "Fail", email: "fail@example.com", message: "Unwritable" });
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.ok, false);
    assert.match(body.error, /could not be saved/);
  } finally {
    chmodSync(storageDir, 0o755);
  }
  assert.equal(readFileSync(DATA_FILE(), "utf8"), original);
});

test("repeated submissions accumulate in the same store", async () => {
  await post({ name: "One", email: "one@example.com", message: "1" });
  const res = await post({ name: "Two", email: "two@example.com", message: "2" });
  assert.equal(res.status, 201);
  const entries = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(entries.length, 2);
  assert.equal(entries[0].name, "Two");
});
