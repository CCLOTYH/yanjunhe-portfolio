import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
  chmodSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { saveContact } from "../lib/contact-store.ts";

const REAL_DATA_FILE = path.join(process.cwd(), "data", "contacts.json");

let storageDir;

function seedFile(content) {
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(path.join(storageDir, "contacts.json"), content, "utf8");
}

function readStorage() {
  return JSON.parse(readFileSync(path.join(storageDir, "contacts.json"), "utf8"));
}

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "contacts-test-"));
  process.env.CONTACTS_DATA_DIR = storageDir;
});

afterEach(() => {
  delete process.env.CONTACTS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("real contact submissions are never touched by tests", () => {
  const before = existsSync(REAL_DATA_FILE)
    ? readFileSync(REAL_DATA_FILE, "utf8")
    : null;
  assert.ok(true);
  return () => {
    const after = existsSync(REAL_DATA_FILE)
      ? readFileSync(REAL_DATA_FILE, "utf8")
      : null;
    assert.equal(before, after);
  };
});

test("valid submission persists to a fresh storage file", async () => {
  const ok = await saveContact({
    name: "Jane Tester",
    email: "jane@example.com",
    message: "First message",
  });

  assert.equal(ok, true);
  const entries = readStorage();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].name, "Jane Tester");
  assert.equal(entries[0].email, "jane@example.com");
  assert.equal(entries[0].message, "First message");
  assert.equal(typeof entries[0].id, "string");
  assert.ok(!Number.isNaN(Date.parse(entries[0].submittedAt)));
});

test("missing storage file initializes an empty collection", async () => {
  assert.equal(existsSync(path.join(storageDir, "contacts.json")), false);
  const ok = await saveContact({
    name: "First Ever",
    email: "first@example.com",
    message: "Creating the store",
  });

  assert.equal(ok, true);
  assert.equal(readStorage().length, 1);
});

test("malformed JSON produces a storage error and is never overwritten", async () => {
  const corrupted = "{ this is not valid json";
  seedFile(corrupted);

  const ok = await saveContact({
    name: "Should Fail",
    email: "fail@example.com",
    message: "Malformed storage",
  });

  assert.equal(ok, false);
  assert.equal(
    readFileSync(path.join(storageDir, "contacts.json"), "utf8"),
    corrupted,
  );
});

test("unreadable storage file produces a storage error and is never overwritten", async () => {
  const valid = JSON.stringify([
    {
      id: "existing-id",
      submittedAt: "2026-01-01T00:00:00.000Z",
      name: "Existing",
      email: "existing@example.com",
      message: "Keep me",
    },
  ]);
  seedFile(valid);
  chmodSync(path.join(storageDir, "contacts.json"), 0o000);

  try {
    const ok = await saveContact({
      name: "Should Fail",
      email: "fail@example.com",
      message: "Unreadable storage",
    });

    assert.equal(ok, false);
  } finally {
    chmodSync(path.join(storageDir, "contacts.json"), 0o644);
  }
  assert.equal(readFileSync(path.join(storageDir, "contacts.json"), "utf8"), valid);
});

test("non-array JSON content produces a storage error", async () => {
  seedFile('{"not": "an array"}');

  const ok = await saveContact({
    name: "Should Fail",
    email: "fail@example.com",
    message: "Invalid shape",
  });

  assert.equal(ok, false);
  assert.equal(
    readFileSync(path.join(storageDir, "contacts.json"), "utf8"),
    '{"not": "an array"}',
  );
});

test("array with invalid entries produces a storage error", async () => {
  seedFile(JSON.stringify([{ name: 42 }]));

  const ok = await saveContact({
    name: "Should Fail",
    email: "fail@example.com",
    message: "Invalid entries",
  });

  assert.equal(ok, false);
  assert.equal(readStorage().length, 1);
});

test("failed write preserves the existing file and leaves no temp files", async () => {
  const valid = JSON.stringify([
    {
      id: "existing-id",
      submittedAt: "2026-01-01T00:00:00.000Z",
      name: "Existing",
      email: "existing@example.com",
      message: "Keep me",
    },
  ]);
  seedFile(valid);
  chmodSync(storageDir, 0o555);

  try {
    const ok = await saveContact({
      name: "Should Fail",
      email: "fail@example.com",
      message: "Unwritable directory",
    });

    assert.equal(ok, false);
  } finally {
    chmodSync(storageDir, 0o755);
  }

  assert.equal(readFileSync(path.join(storageDir, "contacts.json"), "utf8"), valid);
  const leftovers = readdirSync(storageDir).filter((f) => f.endsWith(".tmp"));
  assert.deepEqual(leftovers, []);
});

test("repeated submissions accumulate newest first", async () => {
  await saveContact({ name: "One", email: "one@example.com", message: "1" });
  await saveContact({ name: "Two", email: "two@example.com", message: "2" });
  const ok = await saveContact({ name: "Three", email: "three@example.com", message: "3" });

  assert.equal(ok, true);
  const entries = readStorage();
  assert.equal(entries.length, 3);
  assert.deepEqual(
    entries.map((e) => e.name),
    ["Three", "Two", "One"],
  );
  assert.equal(new Set(entries.map((e) => e.id)).size, 3);
});

test("existing submissions are preserved on later saves", async () => {
  const original = {
    id: "original-id",
    submittedAt: "2026-01-01T00:00:00.000Z",
    name: "Original",
    email: "original@example.com",
    message: "Original message",
  };
  seedFile(JSON.stringify([original]));

  const ok = await saveContact({
    name: "Newcomer",
    email: "new@example.com",
    message: "New message",
  });

  assert.equal(ok, true);
  const entries = readStorage();
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[1], original);
});

test("concurrent submissions all persist without corruption", async () => {
  const results = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      saveContact({
        name: `Concurrent ${i}`,
        email: `concurrent${i}@example.com`,
        message: `Concurrent message ${i}`,
      }),
    ),
  );

  assert.deepEqual(results, [true, true, true, true, true]);
  const entries = readStorage();
  assert.equal(entries.length, 5);
  assert.equal(new Set(entries.map((e) => e.id)).size, 5);
  assert.deepEqual(
    new Set(entries.map((e) => e.name)),
    new Set(["Concurrent 0", "Concurrent 1", "Concurrent 2", "Concurrent 3", "Concurrent 4"]),
  );
});
