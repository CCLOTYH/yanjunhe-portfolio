# yanjunhe-portfolio

Personal portfolio website for Yanjun He, Business Analytics graduate student at Santa Clara University. Built with [Next.js](https://nextjs.org) (App Router) and TypeScript for ISBA2438 Assignment 2.

## Getting Started

Requires Node.js 26 (developed and tested on Node v26.13.1).

```bash
npm install
npm run dev
npm run seed:blogs   # optional: create two sample blog posts
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Routes

- `/` — landing page (hero, about, toolbox, featured work, contact CTA)
- `/about-me` — education, industry exhibitions, experience, skills, languages, interests
- `/projects` — projects listing
- `/projects/[slug]` — dynamic project detail pages; unknown slugs return 404 via `notFound()` (`generateStaticParams` prerenders both known slugs: `c103-last-mile-delivery`, `cc-lot-website`)
- `/contact-me-server-form` — contact page with a Server Action form
- `/contact-me` — contact page submitting to the contact API (same storage)
- `/blogs` — public blog list (reads the blog API)
- `/blogs/[slug]` — public blog detail pages; unknown slugs return HTTP 404
- `/blog-posts` — redirects to `/blogs`
- `/admin/blogs` — admin page to publish new blog posts
- `/api/contact`, `/api/contacts` — contact POST APIs (shared storage with the Server Action form)
- `/api/blogs` — blog GET/POST API

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

## Data storage

Submissions are appended (newest first) as JSON to `data/contacts.json`
(outside `public/`, gitignored, not web-accessible). Reads validate strictly:
a missing file starts an empty collection; unreadable, malformed, or
structurally invalid data is a storage error and is never overwritten. Writes
go to a temporary file followed by an atomic rename; saves are serialized
in-process.

## Scripts

- `npm run dev` — start the development server
- `npm run dev:fresh` — clear the `.next` Turbopack cache, then start dev
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run test` — run the storage test suite (`node --test`)
- `npm run seed:blogs` — create two sample blog posts for testing

## Sample blog posts

`data/blogs.json` starts empty, so `/blogs` shows nothing on a fresh clone.
Run `npm run seed:blogs` to create two sample posts (they appear on `/blogs`
immediately). The script is safe to re-run: posts whose title already exists
are skipped, and existing posts are never overwritten or removed.

## Testing

`npm run test` runs 28 tests (Node's built-in `node --test`) across three
suites: contact storage (`tests/contact-store.test.mjs`), the contact API
(`tests/contact-api.test.mjs`), and the blog API (`tests/blog-api.test.mjs`).
Tests use isolated temporary directories (`CONTACTS_DATA_DIR` /
`BLOGS_DATA_DIR`), so real data in `data/` is never read or modified. Covered:
valid persistence, missing-file initialization, malformed/unreadable/invalid
storage (rejected without overwriting), failed writes (original file
preserved, no temp-file leftovers), repeated and concurrent submissions,
existing-data preservation, API status-code semantics (201/422/400/500), and
unique-slug allocation for blog posts.

## Known limitations

- `data/contacts.json` and `data/blogs.json` are local to the deploying
  machine; submissions are not emailed, backed up, or replicated.
- Save serialization is in-process only: correct for a single-server
  deployment, but multiple app instances could still interleave writes
  (last-rename-wins).
- The data files live outside `public/` and are gitignored; they must be moved
  or backed up manually between deployments.

## Development tools

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- ESLint (`eslint-config-next`) and Node's built-in test runner
- Developed interactively with the Viber Coding Agent — see
  [`docs/viber-development-review.md`](docs/viber-development-review.md) for a
  review of six real development episodes (theme cache debugging, a styling
  regression and its fix, contact-storage hardening, the production 200-vs-404
  issue, test-runner module resolution, and a lint fix in the admin page)

## License

Released under the [MIT License](LICENSE).
