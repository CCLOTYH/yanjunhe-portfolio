# yanjunhe-portfolio

Personal portfolio website for Yanjun He, Business Analytics graduate student at Santa Clara University. Built with [Next.js](https://nextjs.org) (App Router) and TypeScript for ISBA2438 Assignment 2 and the midterm.

## Getting Started

Requires Node.js 26 (developed and tested on Node v26.13.1).

```bash
npm install
npm run dev
npm run seed:blogs   # optional: create two sample blog posts
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Routes

- `/` — landing page (hero, about, toolbox, featured work from the project store, contact CTA)
- `/about-me` — education, industry exhibitions, experience, skills, languages, interests
- `/projects` — projects listing, read live from the project API storage
- `/projects/[slug]` — dynamic project detail pages (`force-dynamic`); unknown slugs return 404 via `notFound()`
- `/contact-me-server-form` — contact page with a Server Action form
- `/contact-me` — contact page submitting to the contact API (same storage)
- `/blogs` — public blog list (reads the blog API with `cache: "no-store"`)
- `/blogs/[slug]` — public blog detail pages; unknown slugs return HTTP 404
- `/blog-posts` — redirects to `/blogs`
- `/job-tracker` — midterm: job application tracker saved in browser LocalStorage
- `/milestones` — midterm: project milestone manager (REST API + server-side JSON)
- `/admin/blogs` — admin page to publish, edit, and delete blog posts
- `/admin/contacts` — midterm: admin page to view, edit, and delete contact submissions
- `/admin/projects` — midterm: admin page to create, edit, and delete projects

## Midterm features

### Job Application Tracker (`/job-tracker`)

Add applications (company, job title, status, notes) saved to browser
LocalStorage under the key `job-tracker.applications.v1`
(`lib/job-tracker-storage.ts`). Entries survive a page refresh, are exposed to
React through `useSyncExternalStore` (subscribe/getSnapshot/getServerSnapshot),
and empty or corrupted LocalStorage data is handled without breaking the page.
Covered by `tests/job-tracker-storage.test.mjs`.

### Project Milestone Manager (`/milestones`)

Manage milestones (title, description, due date, priority, status) through the
`/api/milestones` REST API backed by `data/milestones.json`. The parent
component `components/milestone-manager.tsx` fetches from the API and passes
data and handlers as props to the reusable children
`components/milestone-form.tsx` and `components/milestone-list.tsx`.

### Contact, blog, and project CRUD

All four resources (contacts, blogs, projects, milestones) support full CRUD
through their API routes, backed by server-side JSON files with atomic writes
(temp file + rename) and an in-process write queue. Slugs/ids are stable
identifiers: editing a blog title or project title never changes its URL.
Edits are visible on the public pages after a refresh.

## API endpoints

| Endpoint | Methods | Notes |
| --- | --- | --- |
| `/api/contacts` | GET, POST, PATCH, DELETE | `id` query parameter for PATCH/DELETE |
| `/api/contact` | POST | original single-purpose endpoint (unchanged) |
| `/api/blogs` | GET, POST, PATCH, DELETE | `slug` query parameter for PATCH/DELETE; slug is stable |
| `/api/projects` | GET, POST, PATCH, DELETE | `slug` query parameter; slug and `href` generated on POST, immutable on PATCH |
| `/api/milestones` | GET, POST, PUT, PATCH, DELETE | `id` query parameter; PUT = full update, PATCH = partial update |

Semantics shared by all four: valid creates return **201**, updates **200**,
deletes **200**; missing id/slug **400**; unknown id/slug **404**; invalid
payloads **422** with per-field errors; malformed JSON bodies **400**; storage
failures **500** without overwriting existing data. Every request is logged
server-side as `[api] <timestamp> <METHOD> <route> -> <status> id=…` (see
`lib/api-logger.ts`) so traffic is auditable in the server console.

## Contact Form flow

The site has two contact pages that store to the same file:

- `/contact-me-server-form` renders a client form (`components/contact-form.tsx`)
  wired through `useActionState` to the Server Action `submitContact`
  (`app/contact-me-server-form/actions.ts`).
- `/contact-me` renders a fetch-based form (`components/contact-form-fetch.tsx`)
  that POSTs JSON to `/api/contacts`.

Both paths share validation and storage:

1. `validateContact` (`lib/contact-validation.ts`) — pure, server-side rules:
   trim inputs; nonempty name/message; email must contain exactly one `@`, no
   whitespace, and a dotted domain with nonempty labels.
2. Invalid input returns per-field errors (re-displayed with the entered
   values); nothing is stored. The APIs return 422 with the same field errors.
3. Valid input is passed to `saveContact` (`lib/contact-store.ts`); the APIs
   return 201 on success and 500 on storage errors.
4. Success/failure feedback is rendered via `role="status"` / `role="alert"`.
5. Submissions can be reviewed, edited (PATCH), and removed (DELETE) at
   `/admin/contacts` (`components/contact-admin.tsx`).

## Data storage

| File | Resource | Git |
| --- | --- | --- |
| `data/contacts.json` | contact submissions | gitignored (personal data) |
| `data/blogs.json` | blog posts | gitignored (runtime data; reseedable) |
| `data/milestones.json` | milestones | gitignored (runtime data) |
| `data/projects.json` | portfolio projects | **committed** (portfolio content, no PII) |

All stores live outside `public/` (not web-accessible) and validate strictly
on read: a missing file starts an empty collection; unreadable, malformed, or
structurally invalid data is a storage error and is never overwritten. Writes
go to a temporary file followed by an atomic rename; writes are serialized
in-process through a promise queue (`queued()` in each store module).
`data/projects.json` is seeded with the two original projects
(`c103-last-mile-delivery`, `cc-lot-website`) so their URLs work from a fresh
clone.

## Scripts

- `npm run dev` — start the development server
- `npm run dev:fresh` — clear the `.next` Turbopack cache, then start dev
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run test` — run the full test suite (`node --test`)
- `npm run seed:blogs` — create two sample blog posts for testing
- `npx tsc --noEmit` — TypeScript check

## Sample blog posts

`data/blogs.json` starts empty, so `/blogs` shows nothing on a fresh clone.
Run `npm run seed:blogs` to create two sample posts (they appear on `/blogs`
immediately). The script is safe to re-run: posts whose title already exists
are skipped, and existing posts are never overwritten or removed.

## Testing

`npm run test` runs 104 tests (Node's built-in `node --test`) across seven
suites: contact storage (`tests/contact-store.test.mjs`), the contact API
(`tests/contact-api.test.mjs`), contact CRUD (`tests/contact-crud.test.mjs`),
the blog API (`tests/blog-api.test.mjs`), blog CRUD (`tests/blog-crud.test.mjs`),
the milestone API (`tests/milestone-api.test.mjs`), the project API
(`tests/project-api.test.mjs`), and job-tracker LocalStorage
(`tests/job-tracker-storage.test.mjs`). Tests use isolated temporary
directories (`CONTACTS_DATA_DIR` / `BLOGS_DATA_DIR` / `MILESTONES_DATA_DIR` /
`PROJECTS_DATA_DIR`), so real data in `data/` is never read or modified —
verified by hashing `data/projects.json` before and after a full run. Covered:
valid persistence, missing-file initialization, malformed/unreadable/invalid
storage (rejected without overwriting), failed writes (original file
preserved, no temp-file leftovers), repeated and concurrent submissions,
existing-data preservation across full CRUD cycles, API status-code semantics
(201/200/422/400/404/500), unique-slug allocation, and LocalStorage
round-trips with corrupted-data handling.

## Known limitations

- Runtime data files are local to the deploying machine; submissions are not
  emailed, backed up, or replicated.
- Save serialization is in-process only: correct for a single-server
  deployment, but multiple app instances could still interleave writes
  (last-rename-wins).
- The job tracker is per-browser (LocalStorage) and does not sync across
  devices.

## Development tools

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- ESLint (`eslint-config-next`) and Node's built-in test runner
- Developed interactively with the Viber Coding Agent — see
  [`docs/viber-development-review.md`](docs/viber-development-review.md) for a
  review of seven real development episodes (theme cache debugging, a styling
  regression and its fix, contact-storage hardening, the production 200-vs-404
  issue, test-runner module resolution, a lint fix in the admin page, and the
  write-queue double-invocation bug found during midterm development)

## License

Released under the [MIT License](LICENSE).
