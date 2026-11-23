import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";import { tmpdir } from "node:os";
import path from "node:path";

import {
  handleMilestonesDelete,
  handleMilestonesGet,
  handleMilestonesPatch,
  handleMilestonesPost,
  handleMilestonesPut,
} from "../lib/milestone-api.ts";

const DATA_FILE = () => path.join(storageDir, "milestones.json");

let storageDir;

function request(method, payload, id) {
  const url = id
    ? `http://localhost:3000/api/milestones?id=${encodeURIComponent(id)}`
    : "http://localhost:3000/api/milestones";
  return new Request(url, {
    method,
    headers: { "content-type": "application/json" },
    body:
      payload === undefined ? undefined : typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

const post = (payload) => handleMilestonesPost(request("POST", payload));
const put = (payload, id) => handleMilestonesPut(request("PUT", payload, id));
const patch = (payload, id) => handleMilestonesPatch(request("PATCH", payload, id));
const del = (id) => handleMilestonesDelete(request("DELETE", undefined, id));
const get = () => handleMilestonesGet();

const validMilestone = {
  title: "Finish the dashboard",
  description: "Ship the analytics dashboard",
  dueDate: "2026-12-01",
  priority: "High",
  status: "Planned",
};

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "milestone-api-test-"));
  process.env.MILESTONES_DATA_DIR = storageDir;
});

afterEach(() => {
  delete process.env.MILESTONES_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("GET returns an empty array when no milestones exist", async () => {
  const res = await get();
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), []);
});

test("POST creates a milestone with id, createdAt, and updatedAt", async () => {
  const res = await post(validMilestone);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.milestone.title, "Finish the dashboard");
  assert.equal(body.milestone.description, "Ship the analytics dashboard");
  assert.equal(body.milestone.dueDate, "2026-12-01");
  assert.equal(body.milestone.priority, "High");
  assert.equal(body.milestone.status, "Planned");
  assert.ok(!Number.isNaN(Date.parse(body.milestone.createdAt)));
  assert.ok(!Number.isNaN(Date.parse(body.milestone.updatedAt)));
});

test("created milestones are returned by GET newest first", async () => {
  await post({ ...validMilestone, title: "First" });
  await post({ ...validMilestone, title: "Second" });

  const res = await get();
  assert.equal(res.status, 200);
  const milestones = await res.json();
  assert.equal(milestones.length, 2);
  assert.equal(milestones[0].title, "Second");
  assert.equal(milestones[1].title, "First");
});

test("POST trims whitespace and rejects empty title with 422", async () => {
  const res = await post({ ...validMilestone, title: "   " });
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.ok(body.errors.title);
});

test("POST rejects an invalid due date format with 422", async () => {
  const cases = ["12/01/2026", "2026-13-01", "2026-12-01T00:00:00", "not-a-date"];
  for (const dueDate of cases) {
    const res = await post({ ...validMilestone, dueDate });
    assert.equal(res.status, 422, dueDate);
    const body = await res.json();
    assert.ok(body.errors.dueDate, dueDate);
  }
});

test("POST rejects invalid priority and status values with 422", async () => {
  const res = await post({ ...validMilestone, priority: "Urgent", status: "Maybe" });
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.errors.priority);
  assert.ok(body.errors.status);
});

test("POST rejects missing fields with 422 errors for every field", async () => {
  const res = await post({});
  assert.equal(res.status, 422);
  const body = await res.json();
  assert.ok(body.errors.title);
  assert.ok(body.errors.description);
  assert.ok(body.errors.dueDate);
  assert.ok(body.errors.priority);
  assert.ok(body.errors.status);
});

test("malformed JSON body returns 400", async () => {
  const res = await post("{ not json");
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.ok, false);
  assert.match(body.error, /valid JSON/);
});

test("PUT updates every field, keeps createdAt, and bumps updatedAt", async () => {
  const created = (await (await post(validMilestone)).json()).milestone;

  await new Promise((resolve) => setTimeout(resolve, 10));
  const res = await put(
    {
      title: "Renamed",
      description: "Updated description",
      dueDate: "2027-01-15",
      priority: "Critical",
      status: "In Progress",
    },
    created.id,
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.milestone.title, "Renamed");
  assert.equal(body.milestone.priority, "Critical");
  assert.equal(body.milestone.status, "In Progress");
  assert.equal(body.milestone.createdAt, created.createdAt);
  assert.notEqual(body.milestone.updatedAt, created.updatedAt);

  const milestones = await (await get()).json();
  assert.equal(milestones.length, 1);
  assert.equal(milestones[0].title, "Renamed");
});

test("PATCH updates only the provided fields", async () => {
  const created = (await (await post(validMilestone)).json()).milestone;

  const res = await patch({ status: "Blocked" }, created.id);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.milestone.status, "Blocked");
  assert.equal(body.milestone.title, "Finish the dashboard");
  assert.equal(body.milestone.priority, "High");
  assert.equal(body.milestone.dueDate, "2026-12-01");

  const milestones = await (await get()).json();
  assert.equal(milestones[0].status, "Blocked");
});

test("PATCH rejects invalid and empty patches with 422", async () => {
  const created = (await (await post(validMilestone)).json()).milestone;

  const badField = await patch({ priority: "Urgent" }, created.id);
  assert.equal(badField.status, 422);

  const emptyPatch = await patch({}, created.id);
  assert.equal(emptyPatch.status, 422);
  const body = await emptyPatch.json();
  assert.match(body.errors.description, /at least one field/i);
});

test("updates with an unknown id return 404 and save nothing", async () => {
  await post(validMilestone);

  const putRes = await put({ ...validMilestone }, "missing-id");
  assert.equal(putRes.status, 404);
  const patchRes = await patch({ status: "Done" }, "missing-id");
  assert.equal(patchRes.status, 404);

  const milestones = await (await get()).json();
  assert.equal(milestones.length, 1);
  assert.equal(milestones[0].status, "Planned");
});

test("updates without an id query parameter return 400", async () => {
  const putRes = await handleMilestonesPut(request("PUT", validMilestone));
  assert.equal(putRes.status, 400);
  const patchRes = await handleMilestonesPatch(request("PATCH", { status: "Done" }));
  assert.equal(patchRes.status, 400);
  const deleteRes = await handleMilestonesDelete(request("DELETE"));
  assert.equal(deleteRes.status, 400);
});

test("DELETE removes a milestone and later deletes return 404", async () => {
  const created = (await (await post(validMilestone)).json()).milestone;

  const res = await del(created.id);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.id, created.id);

  assert.deepEqual(await (await get()).json(), []);

  const repeat = await del(created.id);
  assert.equal(repeat.status, 404);
});

test("milestones persist across separate requests like a page refresh", async () => {
  const first = (await (await post({ ...validMilestone, title: "Persisted" })).json())
    .milestone;
  await post({ ...validMilestone, title: "Also persisted" });

  const patched = await patch({ status: "Done" }, first.id);
  assert.equal(patched.status, 200);

  const milestones = await (await get()).json();
  assert.equal(milestones.length, 2);
  const persisted = milestones.find((m) => m.title === "Persisted");
  assert.equal(persisted.status, "Done");
  assert.equal(persisted.priority, "High");

  const toDelete = milestones.find((m) => m.title === "Also persisted");
  const deleted = await del(toDelete.id);
  assert.equal(deleted.status, 200);
  const afterDelete = await (await get()).json();
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].title, "Persisted");
  assert.equal(afterDelete[0].status, "Done");
});

test("concurrent creations all persist without losing records", async () => {
  const responses = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      post({ ...validMilestone, title: `Concurrent Milestone ${i}` }),
    ),
  );
  for (const res of responses) assert.equal(res.status, 201);

  const milestones = await (await get()).json();
  assert.equal(milestones.length, 5);
  assert.equal(new Set(milestones.map((m) => m.id)).size, 5);
});

test("corrupted storage returns 500 and never crashes", async () => {
  await post(validMilestone);
  writeFileSync(DATA_FILE(), "{ corrupted", "utf8");

  const getRes = await get();
  assert.equal(getRes.status, 500);
  const body = await getRes.json();
  assert.equal(body.ok, false);
  assert.ok(body.error);

  const postRes = await post(validMilestone);
  assert.equal(postRes.status, 500);
});
