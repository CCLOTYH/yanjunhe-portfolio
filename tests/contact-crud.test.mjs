import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  handleContactPost,
  handleContactsDelete,
  handleContactsGet,
  handleContactsPatch,
} from "../lib/contact-api.ts";

const REAL_DATA_FILE = path.join(process.cwd(), "data", "contacts.json");
const DATA_FILE = () => path.join(storageDir, "contacts.json");

let storageDir;

function request(method, { payload, id } = {}) {
  const url = id
    ? `http://localhost:3000/api/contacts?id=${encodeURIComponent(id)}`
    : "http://localhost:3000/api/contacts";
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

const post = (payload) => handleContactPost(request("POST", { payload }));
const patch = (payload, id) => handleContactsPatch(request("PATCH", { payload, id }));
const del = (id) => handleContactsDelete(request("DELETE", { id }));
const get = () => handleContactsGet();

const EXISTING_RECORD = {
  id: "existing-record-id",
  submittedAt: "2026-01-01T00:00:00.000Z",
  name: "Original Sender",
  email: "original@example.com",
  message: "Keep me no matter what",
};

const postbody = { name: "Jane Tester", email: "jane@example.com", message: "Hello" };

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "contact-crud-test-"));
  process.env.CONTACTS_DATA_DIR = storageDir;
  writeFileSync(DATA_FILE(), JSON.stringify([EXISTING_RECORD], null, 2), "utf8");
});

afterEach(() => {
  delete process.env.CONTACTS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("tests never touch the real contacts file", () => {
  const before = readFileSync(REAL_DATA_FILE, "utf8");
  assert.ok(before.length > 0);
});

test("GET returns saved submissions newest first", async () => {
  await post(postbody);

  const res = await get();
  assert.equal(res.status, 200);
  const contacts = await res.json();
  assert.equal(contacts.length, 2);
  assert.equal(contacts[0].name, "Jane Tester");
  assert.equal(contacts[1].id, EXISTING_RECORD.id);
});

test("every submission has a stable unique id", async () => {
  await post(postbody);
  await post({ ...postbody, name: "Second" });

  const contacts = await (await get()).json();
  const ids = new Set(contacts.map((c) => c.id));
  assert.equal(ids.size, contacts.length);
  for (const id of ids) {
    assert.equal(typeof id, "string");
    assert.ok(id.length > 0);
  }
});

test("PATCH updates only the provided fields and keeps submittedAt", async () => {
  await post(postbody);
  const contactsBefore = await (await get()).json();
  const target = contactsBefore.find((c) => c.id !== EXISTING_RECORD.id);

  const res = await patch({ message: "Updated message" }, target.id);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.contact.message, "Updated message");
  assert.equal(body.contact.name, "Jane Tester");
  assert.equal(body.contact.email, "jane@example.com");
  assert.equal(body.contact.submittedAt, target.submittedAt);
  assert.ok(body.contact.updatedAt);

  const contacts = await (await get()).json();
  const stored = contacts.find((c) => c.id === target.id);
  assert.equal(stored.message, "Updated message");
});

test("PATCH can update all fields at once", async () => {
  await post(postbody);
  const contactsBefore = await (await get()).json();
  const target = contactsBefore.find((c) => c.id !== EXISTING_RECORD.id);

  const res = await patch(
    { name: "New Name", email: "new@example.com", message: "New message" },
    target.id,
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.contact.name, "New Name");
  assert.equal(body.contact.email, "new@example.com");
  assert.equal(body.contact.message, "New message");
});

test("PATCH rejects invalid updates with 422", async () => {
  await post(postbody);
  const contactsBefore = await (await get()).json();
  const target = contactsBefore.find((c) => c.id !== EXISTING_RECORD.id);

  const badEmail = await patch({ email: "not-an-email" }, target.id);
  assert.equal(badEmail.status, 422);
  const badEmailBody = await badEmail.json();
  assert.ok(badEmailBody.errors.email);

  const emptyName = await patch({ name: "   " }, target.id);
  assert.equal(emptyName.status, 422);
  assert.ok((await emptyName.json()).errors.name);

  const emptyPatch = await patch({}, target.id);
  assert.equal(emptyPatch.status, 422);
  assert.match((await emptyPatch.json()).errors.message, /at least one field/i);

  const contacts = await (await get()).json();
  const stored = contacts.find((c) => c.id === target.id);
  assert.equal(stored.message, "Hello");
});

test("PATCH with an unknown id returns 404 and saves nothing", async () => {
  await post(postbody);
  const before = readFileSync(DATA_FILE(), "utf8");

  const res = await patch({ name: "Nobody" }, "missing-id");
  assert.equal(res.status, 404);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), before);
});

test("PATCH without an id returns 400", async () => {
  const res = await handleContactsPatch(request("PATCH", { payload: { name: "X" } }));
  assert.equal(res.status, 400);
});

test("malformed JSON body returns 400", async () => {
  const res = await handleContactsPatch(request("PATCH", { payload: "{ not json", id: "x" }));
  assert.equal(res.status, 400);
});

test("DELETE removes only the target record", async () => {
  await post(postbody);
  const contactsBefore = await (await get()).json();
  const target = contactsBefore.find((c) => c.id !== EXISTING_RECORD.id);

  const res = await del(target.id);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.id, target.id);

  const contacts = await (await get()).json();
  assert.equal(contacts.length, 1);
  assert.equal(contacts[0].id, EXISTING_RECORD.id);
  assert.equal(contacts[0].message, "Keep me no matter what");
});

test("DELETE of an unknown id returns 404, repeat deletes never crash", async () => {
  await post(postbody);
  const contactsBefore = await (await get()).json();
  const target = contactsBefore.find((c) => c.id !== EXISTING_RECORD.id);

  assert.equal((await del(target.id)).status, 200);
  const repeat = await del(target.id);
  assert.equal(repeat.status, 404);
  assert.equal((await (await get()).json()).length, 1);
});

test("DELETE without an id returns 400", async () => {
  const res = await handleContactsDelete(request("DELETE"));
  assert.equal(res.status, 400);
});

test("existing records survive the full CRUD cycle", async () => {
  const before = readFileSync(DATA_FILE(), "utf8");

  await post(postbody);
  let contacts = await (await get()).json();
  const target = contacts.find((c) => c.id !== EXISTING_RECORD.id);

  await patch({ name: "Renamed Sender" }, target.id);
  await del(target.id);

  contacts = await (await get()).json();
  assert.equal(contacts.length, 1);
  assert.equal(contacts[0].id, EXISTING_RECORD.id);
  assert.equal(contacts[0].name, "Original Sender");
  assert.equal(contacts[0].message, "Keep me no matter what");

  const after = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(after.length, 1);
  assert.deepEqual(after[0], EXISTING_RECORD);
  assert.notEqual(after, before);
});

test("corrupted storage returns 500 instead of wiping data", async () => {
  writeFileSync(DATA_FILE(), "{ corrupted", "utf8");

  const res = await get();
  assert.equal(res.status, 500);
  const delRes = await del("whatever");
  assert.equal(delRes.status, 500);

  assert.equal(readFileSync(DATA_FILE(), "utf8"), "{ corrupted");
});
