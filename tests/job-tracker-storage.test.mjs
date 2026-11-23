import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  STORAGE_KEY,
  addApplication,
  buildApplication,
  getApplicationsSnapshot,
  loadApplications,
  persistApplications,
  removeApplication,
  resetApplicationsCache,
} from "../lib/job-tracker-storage.ts";

function createMockStorage({ throwOnGet = false, throwOnSet = false } = {}) {
  const map = new Map();
  return {
    map,
    throwOnGet,
    throwOnSet,
    getItem(key) {
      if (this.throwOnGet) {
        throw new Error("SecurityError: blocked");
      }
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      if (this.throwOnSet) {
        throw new Error("QuotaExceededError");
      }
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

let storage;

beforeEach(() => {
  storage = createMockStorage();
});

afterEach(() => {
  storage = undefined;
});

function seedStorage(content) {
  storage.setItem(STORAGE_KEY, content);
}

test("missing storage entry loads as a healthy empty tracker", () => {
  const result = loadApplications(storage);
  assert.deepEqual(result.applications, []);
  assert.equal(result.healthy, true);
});

test("empty string entry loads as a healthy empty tracker", () => {
  seedStorage("   ");
  const result = loadApplications(storage);
  assert.deepEqual(result.applications, []);
  assert.equal(result.healthy, true);
});

test("corrupted JSON does not break the page", () => {
  seedStorage("{ this is not valid json");
  const result = loadApplications(storage);
  assert.deepEqual(result.applications, []);
  assert.equal(result.healthy, false);
});

test("non-array JSON is reported as unreadable", () => {
  seedStorage(JSON.stringify({ not: "an array" }));
  const result = loadApplications(storage);
  assert.deepEqual(result.applications, []);
  assert.equal(result.healthy, false);
});

test("valid entries survive alongside invalid ones", () => {
  seedStorage(
    JSON.stringify([
      {
        id: "a-1",
        company: "Acme",
        jobTitle: "Analyst",
        status: "Applied",
        notes: "ok",
        savedAt: "2026-11-01T10:00:00.000Z",
      },
      "not an object",
      { id: "", company: "Nope" },
      { company: "Missing id and title" },
      null,
      {
        id: "a-2",
        company: "Beta",
        jobTitle: "Engineer",
        status: "Not-A-Status",
        savedAt: "garbage-date",
      },
    ]),
  );

  const result = loadApplications(storage);
  assert.equal(result.applications.length, 2);
  assert.equal(result.healthy, false);
  assert.equal(result.applications[0].company, "Acme");
  assert.equal(result.applications[1].company, "Beta");
  assert.equal(result.applications[1].status, "Saved");
  assert.equal(result.applications[1].notes, "");
  assert.ok(!Number.isNaN(Date.parse(result.applications[1].savedAt)));
});

test("saved applications round-trip through storage", () => {
  const first = buildApplication({
    company: "  Acme Racing Analytics  ",
    jobTitle: " Junior Data Analyst ",
    status: "Applied",
    notes: "  Referral from Maria.  ",
  });
  assert.equal(persistApplications([first], storage), true);

  const second = buildApplication({
    company: "Beta",
    jobTitle: "Engineer",
    status: "Offer",
    notes: "",
  });
  assert.equal(persistApplications([second, first], storage), true);

  const result = loadApplications(storage);
  assert.equal(result.healthy, true);
  assert.deepEqual(
    result.applications.map((a) => a.company),
    ["Beta", "Acme Racing Analytics"],
  );
  assert.equal(result.applications[1].jobTitle, "Junior Data Analyst");
  assert.equal(result.applications[1].notes, "Referral from Maria.");
  assert.ok(!Number.isNaN(Date.parse(result.applications[1].savedAt)));
});

test("deleting an entry persists the removal", () => {
  const a = buildApplication({
    company: "Keep",
    jobTitle: "A",
    status: "Saved",
    notes: "",
  });
  const b = buildApplication({
    company: "Drop",
    jobTitle: "B",
    status: "Saved",
    notes: "",
  });
  persistApplications([b, a], storage);

  const next = [a];
  assert.equal(persistApplications(next, storage), true);
  const result = loadApplications(storage);
  assert.deepEqual(
    result.applications.map((a) => a.company),
    ["Keep"],
  );
});

test("every generated id is unique", () => {
  const ids = new Set(
    Array.from({ length: 50 }, () =>
      buildApplication({
        company: "C",
        jobTitle: "T",
        status: "Saved",
        notes: "",
      }).id,
    ),
  );
  assert.equal(ids.size, 50);
});

test("blocked localStorage loads empty without throwing", () => {
  const result = loadApplications(createMockStorage({ throwOnGet: true }));
  assert.deepEqual(result.applications, []);
  assert.equal(result.healthy, false);
});

test("persistence failure is reported instead of throwing", () => {
  const application = buildApplication({
    company: "Acme",
    jobTitle: "Analyst",
    status: "Saved",
    notes: "",
  });
  assert.equal(
    persistApplications([application], createMockStorage({ throwOnSet: true })),
    false,
  );
});

test("no localStorage at all stays silent and empty", () => {
  const loadResult = loadApplications(null);
  assert.deepEqual(loadResult.applications, []);
  assert.equal(loadResult.healthy, false);
  const application = buildApplication({
    company: "Acme",
    jobTitle: "Analyst",
    status: "Saved",
    notes: "",
  });
  assert.equal(persistApplications([application], null), false);
});

test("store-level add persists and is visible in the snapshot", () => {
  globalThis.window = {
    localStorage: createMockStorage(),
    addEventListener() {},
    removeEventListener() {},
  };

  try {
    const result = addApplication({
      company: "  Store Co  ",
      jobTitle: "  Analyst  ",
      status: "Interview",
      notes: "  Round two Thursday.  ",
    });

    assert.equal(result.ok, true);
    const snapshot = getApplicationsSnapshot();
    assert.equal(snapshot.healthy, true);
    assert.equal(snapshot.applications.length, 1);
    assert.equal(snapshot.applications[0].company, "Store Co");
    assert.equal(snapshot.applications[0].status, "Interview");
    assert.equal(
      snapshot.applications[0].notes,
      "Round two Thursday.",
    );
  } finally {
    delete globalThis.window;
    resetApplicationsCache();
  }
});

test("store-level remove deletes the entry from storage", () => {
  const mock = createMockStorage();
  globalThis.window = {
    localStorage: mock,
    addEventListener() {},
    removeEventListener() {},
  };

  try {
    const first = addApplication({
      company: "Keep",
      jobTitle: "A",
      status: "Saved",
      notes: "",
    });
    const second = addApplication({
      company: "Drop",
      jobTitle: "B",
      status: "Saved",
      notes: "",
    });
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);

    assert.equal(removeApplication(second.application.id), true);
    const snapshot = getApplicationsSnapshot();
    assert.deepEqual(
      snapshot.applications.map((a) => a.company),
      ["Keep"],
    );
  } finally {
    delete globalThis.window;
    resetApplicationsCache();
  }
});

test("store-level add reports failure without corrupting the snapshot", () => {
  globalThis.window = {
    localStorage: createMockStorage({ throwOnSet: true }),
    addEventListener() {},
    removeEventListener() {},
  };

  try {
    const result = addApplication({
      company: "Acme",
      jobTitle: "Analyst",
      status: "Saved",
      notes: "",
    });
    assert.equal(result.ok, false);
  } finally {
    delete globalThis.window;
    resetApplicationsCache();
  }
});

test("store snapshot exposes corrupted storage as unhealthy", () => {
  globalThis.window = {
    localStorage: createMockStorage(),
    addEventListener() {},
    removeEventListener() {},
  };

  try {
    globalThis.window.localStorage.setItem(STORAGE_KEY, "{corrupted");
    const snapshot = getApplicationsSnapshot();
    assert.deepEqual(snapshot.applications, []);
    assert.equal(snapshot.healthy, false);
  } finally {
    delete globalThis.window;
    resetApplicationsCache();
  }
});
