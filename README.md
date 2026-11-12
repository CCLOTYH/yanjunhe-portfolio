# yanjunhe-portfolio

Personal portfolio website for Yanjun He, Business Analytics graduate student at Santa Clara University. Built with [Next.js](https://nextjs.org) (App Router) and TypeScript for ISBA2438 Assignment 2, Part 1.

## Getting Started

Requires Node.js 20.9+ (developed on Node 26).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Routes

- `/` — landing page (hero, about, toolbox, featured work, contact CTA)
- `/about-me` — education, industry exhibitions, experience, skills, languages, interests
- `/projects` — projects listing
- `/projects/[slug]` — dynamic project detail pages; unknown slugs return 404 via `notFound()` (`generateStaticParams` prerenders both known slugs: `c103-last-mile-delivery`, `cc-lot-website`)
- `/contact-me-server-form` — contact page with a Server Action form

Navigation is provided by the shared header (`components/site-header.tsx`).

## Contact Form flow

The contact page renders a client form (`components/contact-form.tsx`) wired
through `useActionState` to the Server Action `submitContact`
(`app/contact-me-server-form/actions.ts`):

1. The action calls `validateContact` (`lib/contact-validation.ts`) — pure,
   server-side rules: trim inputs; nonempty name/message; email must contain
   exactly one `@`, no whitespace, and a dotted domain with nonempty labels.
2. Invalid input returns per-field errors (re-displayed with the entered
   values); nothing is stored.
3. Valid input is passed to `saveContact` (`lib/contact-store.ts`).
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

## Testing

`npm run test` runs `tests/contact-store.test.mjs` against the contact storage
layer. Tests use isolated temporary directories (`CONTACTS_DATA_DIR`), so real
submissions in `data/contacts.json` are never read or modified. Covered: valid
persistence, missing-file initialization, malformed/unreadable/invalid storage
(rejected without overwriting), failed writes (original file preserved, no
temp-file leftovers), repeated and concurrent submissions, and existing-data
preservation.

## Known limitations

- `data/contacts.json` is local to the deploying machine; submissions are not
  emailed, backed up, or replicated.
- Save serialization is in-process only: correct for a single-server
  deployment, but multiple app instances could still interleave writes
  (last-rename-wins).
- The data file lives outside `public/` and is gitignored; it must be moved or
  backed up manually between deployments.

## Development tools

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- ESLint (`eslint-config-next`) and Node's built-in test runner
- Developed interactively with the Viber Coding Agent — see
  [`docs/viber-development-review.md`](docs/viber-development-review.md) for a
  review of three real development episodes (theme cache debugging, a styling
  regression and its fix, and contact-storage hardening)

## License

Released under the [MIT License](LICENSE).
