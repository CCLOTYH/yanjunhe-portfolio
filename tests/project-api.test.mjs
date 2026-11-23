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
  handleProjectsDelete,
  handleProjectsGet,
  handleProjectsPatch,
  handleProjectsPost,
} from "../lib/project-api.ts";

const DATA_FILE = () => path.join(storageDir, "projects.json");

let storageDir;

function request(method, { payload, slug } = {}) {
  const url = slug
    ? `http://localhost:3000/api/projects?slug=${encodeURIComponent(slug)}`
    : "http://localhost:3000/api/projects";
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

const post = (payload) => handleProjectsPost(request("POST", { payload }));
const patch = (payload, slug) => handleProjectsPatch(request("PATCH", { payload, slug }));
const del = (slug) => handleProjectsDelete(request("DELETE", { slug }));
const get = () => handleProjectsGet();

const EXISTING_PROJECT = {
  slug: "c103-last-mile-delivery",
  number: "01",
  category: "Academic Analytics Project",
  title: "C103 Last-Mile Delivery Network Optimization",
  description: "Study of last-mile delivery network decisions.",
  focusAreas: ["Logistics", "Network Optimization"],
  href: "/projects/c103-last-mile-delivery",
  details: {
    background: "Last-mile delivery background text.",
    objectives: ["Objective one.", "Objective two."],
    approach: ["Step one.", "Step two."],
  },
};

const validProject = {
  number: "03",
  category: "Analytics Project",
  title: "Sales Dashboard",
  description: "Interactive sales dashboard.",
  focusAreas: ["Dashboards", "SQL"],
  details: {
    background: "Sales reporting was manual.",
    objectives: ["Automate reporting."],
    approach: ["Built a dashboard."],
  },
};

beforeEach(() => {
  storageDir = mkdtempSync(path.join(tmpdir(), "project-api-test-"));
  process.env.PROJECTS_DATA_DIR = storageDir;
  mkdirSync(storageDir, { recursive: true });
  writeFileSync(DATA_FILE(), JSON.stringify([EXISTING_PROJECT], null, 2), "utf8");
});

afterEach(() => {
  delete process.env.PROJECTS_DATA_DIR;
  rmSync(storageDir, { recursive: true, force: true });
});

test("GET returns stored projects", async () => {
  const res = await get();
  assert.equal(res.status, 200);
  const projects = await res.json();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].slug, "c103-last-mile-delivery");
  assert.equal(projects[0].details.objectives.length, 2);
});

test("POST creates a project with generated slug, href, and timestamps", async () => {
  const res = await post(validProject);
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.project.slug, "sales-dashboard");
  assert.equal(body.project.href, "/projects/sales-dashboard");
  assert.ok(!Number.isNaN(Date.parse(body.project.updatedAt)));
  assert.equal(body.project.details.background, "Sales reporting was manual.");
});

test("POST duplicate titles get unique slugs", async () => {
  const first = await post(validProject);
  const second = await post(validProject);
  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  const firstBody = await first.json();
  const secondBody = await second.json();
  assert.equal(firstBody.project.slug, "sales-dashboard");
  assert.equal(secondBody.project.slug, "sales-dashboard-2");
  assert.notEqual(firstBody.project.href, secondBody.project.href);
});

test("POST rejects invalid projects with 422 and saves nothing", async () => {
  const cases = [
    { payload: { ...validProject, title: "  " }, field: "title" },
    { payload: { ...validProject, number: "" }, field: "number" },
    { payload: { ...validProject, focusAreas: "not-an-array" }, field: "focusAreas" },
    {
      payload: { ...validProject, focusAreas: ["Ok", "   "] },
      field: "focusAreas",
    },
    {
      payload: { ...validProject, details: { ...validProject.details, background: "" } },
      field: "background",
    },
    {
      payload: { ...validProject, details: { ...validProject.details, objectives: [] } },
      field: "objectives",
    },
    {
      payload: { ...validProject, details: { ...validProject.details, approach: [42] } },
      field: "approach",
    },
    { payload: { ...validProject, details: null }, field: "details" },
  ];
  for (const { payload, field } of cases) {
    const res = await post(payload);
    assert.equal(res.status, 422, field);
    const body = await res.json();
    assert.ok(body.errors[field], field);
  }
  const projects = await (await get()).json();
  assert.equal(projects.length, 1);
});

test("malformed JSON body returns 400", async () => {
  const res = await post("{ not json");
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /valid JSON/);
});

test("PATCH updates a single field and keeps slug, href, and other fields", async () => {
  const res = await patch({ description: "Updated description." }, "c103-last-mile-delivery");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.project.description, "Updated description.");
  assert.equal(body.project.title, EXISTING_PROJECT.title);
  assert.equal(body.project.slug, "c103-last-mile-delivery");
  assert.equal(body.project.href, EXISTING_PROJECT.href);
  assert.ok(body.project.updatedAt);

  const stored = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(stored[0].details.background, EXISTING_PROJECT.details.background);
});

test("PATCH merges details deeply, preserving untouched sections", async () => {
  const res = await patch(
    { details: { objectives: ["New objective."] } },
    "c103-last-mile-delivery",
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.project.details.objectives, ["New objective."]);
  assert.equal(body.project.details.background, EXISTING_PROJECT.details.background);
  assert.deepEqual(body.project.details.approach, EXISTING_PROJECT.details.approach);
});

test("PATCH replaces focusAreas wholesale", async () => {
  const res = await patch(
    { focusAreas: ["Retail", "Forecasting", "Pricing"] },
    "c103-last-mile-delivery",
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.project.focusAreas, ["Retail", "Forecasting", "Pricing"]);
});

test("PATCH rejects invalid patches with 422 and saves nothing", async () => {
  const emptyTitle = await patch({ title: "   " }, "c103-last-mile-delivery");
  assert.equal(emptyTitle.status, 422);

  const emptyPatch = await patch({}, "c103-last-mile-delivery");
  assert.equal(emptyPatch.status, 422);

  const badDetails = await patch({ details: { background: "" } }, "c103-last-mile-delivery");
  assert.equal(badDetails.status, 422);

  const stored = JSON.parse(readFileSync(DATA_FILE(), "utf8"));
  assert.equal(stored[0].title, EXISTING_PROJECT.title);
});

test("PATCH with an unknown slug returns 404 and saves nothing", async () => {
  const before = readFileSync(DATA_FILE(), "utf8");
  const res = await patch({ title: "Ghost" }, "missing-slug");
  assert.equal(res.status, 404);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), before);
});

test("PATCH without a slug returns 400", async () => {
  const res = await handleProjectsPatch(request("PATCH", { payload: { title: "X" } }));
  assert.equal(res.status, 400);
});

test("DELETE removes only the target project", async () => {
  await post(validProject);

  const res = await del("sales-dashboard");
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.slug, "sales-dashboard");

  const projects = await (await get()).json();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].slug, "c103-last-mile-delivery");
  assert.equal(projects[0].number, "01");
});

test("DELETE of an unknown slug returns 404, missing slug returns 400", async () => {
  assert.equal((await del("missing-slug")).status, 404);
  assert.equal(
    (await handleProjectsDelete(request("DELETE"))).status,
    400,
  );
  const projects = await (await get()).json();
  assert.equal(projects.length, 1);
});

test("existing project survives the full CRUD cycle untouched", async () => {
  const created = (await (await post(validProject)).json()).project;

  await patch({ title: "Renamed Project" }, created.slug);
  await del(created.slug);

  const projects = await (await get()).json();
  assert.equal(projects.length, 1);
  const stored = projects[0];
  assert.equal(stored.slug, EXISTING_PROJECT.slug);
  assert.equal(stored.title, EXISTING_PROJECT.title);
  assert.equal(stored.number, EXISTING_PROJECT.number);
  assert.equal(stored.href, EXISTING_PROJECT.href);
  assert.deepEqual(stored.focusAreas, EXISTING_PROJECT.focusAreas);
  assert.deepEqual(stored.details, EXISTING_PROJECT.details);
  assert.equal(stored.updatedAt, undefined);
});

test("concurrent creations all persist with unique slugs", async () => {
  const responses = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      post({
        ...validProject,
        title: `Concurrent Project ${i}`,
        number: `1${i}`,
      }),
    ),
  );
  for (const res of responses) assert.equal(res.status, 201);

  const projects = await (await get()).json();
  assert.equal(projects.length, 6);
  assert.equal(new Set(projects.map((p) => p.slug)).size, 6);
  assert.ok(projects.some((p) => p.slug === "c103-last-mile-delivery"));
});

test("concurrent mutations keep every record intact", async () => {
  const created = (await (await post(validProject)).json()).project;

  const mutations = [
    patch({ description: "Patch 1" }, created.slug),
    patch({ number: "99" }, created.slug),
    post({ ...validProject, title: "Extra Project", number: "98" }),
    patch({ category: "New Category" }, "c103-last-mile-delivery"),
  ];
  const results = await Promise.all(mutations);
  for (const res of results) {
    assert.ok([200, 201].includes(res.status), `status ${res.status}`);
  }

  const projects = await (await get()).json();
  assert.equal(projects.length, 3);
  const stored = projects.find((p) => p.slug === created.slug);
  assert.equal(stored.description, "Patch 1");
  assert.equal(stored.number, "99");
  const c103 = projects.find((p) => p.slug === "c103-last-mile-delivery");
  assert.equal(c103.category, "New Category");
  assert.equal(c103.title, EXISTING_PROJECT.title);
});

test("corrupted storage returns 500 instead of wiping data", async () => {
  writeFileSync(DATA_FILE(), "{ corrupted", "utf8");

  assert.equal((await get()).status, 500);
  assert.equal((await post(validProject)).status, 500);
  assert.equal((await patch({ title: "X" }, "c103-last-mile-delivery")).status, 500);
  assert.equal((await del("c103-last-mile-delivery")).status, 500);
  assert.equal(readFileSync(DATA_FILE(), "utf8"), "{ corrupted");
});
