# Viber Development Review

This document records six authentic development-review episodes from the Viber
Coding Agent session used to build this portfolio for ISBA2438 Assignment 2.
Examples 1–3 cover Part 1; Examples 4–6 cover Part 2 (contact API routes, blog
API, admin page, and public blog pages). All prompts, decisions, code changes,
and test results below are taken from the real session. Where the exact prompt
wording was not retained, the instruction is summarized and marked as such
rather than invented.

> Note on Git history: all development happened inside the Viber session and was
> committed to Git once, at Part 1 completion. No incremental development
> commits exist, and none were manufactured.

---

## Example 1 — Repsol Honda theme colors not rendering (Turbopack cache)

### Chronology

1. **What Viber implemented.** The site was restyled into a Repsol Honda
   livery: racing orange `#FF7200`, racing red, deep navy `#101B32`, white, and
   charcoal. Theme tokens were declared in Tailwind 4 `@theme` blocks inside
   `app/globals.css`, and pages/components referenced utilities such as
   `bg-navy`, `text-racing-orange`, and `bg-racing-red`.
2. **What the user observed.** The user reported that the racing colors were
   not rendering as intended and directed inspection of the `@theme` tokens in
   `app/globals.css`, explicitly raising Tailwind compilation and Turbopack
   cache behavior as suspected causes. *(Exact prompt wording not retained;
   summarized.)*
3. **Investigation.** The `@theme` tokens were present and correct in the
   source; the failure was in the build pipeline, not the markup. The running
   `next dev` server (Turbopack) had cached stale compiled CSS from before the
   tokens were added, so newly named color utilities were not being emitted.
4. **What the user accepted.** The corrective action — clearing the `.next`
   cache and restarting the dev server, later adding a convenience script —
   was accepted, and the user asked that the cache-clearing step be preserved
   for future use.
5. **Corrective action.** `rm -rf .next` followed by a dev-server restart, and
   a permanent `dev:fresh` script was added to `package.json`:
   `"dev:fresh": "rm -rf .next && next dev"`.
6. **How it was checked.** Headless-Chrome screenshots of the rendered pages
   were pixel-scanned: the deep-navy `#101B32` and racing-orange `#FF7200`
   hex values were confirmed present in the rendered output (e.g. navy
   occupying ~16.8% of desktop-page pixels in final checks), and
   `npm run build` compiled cleanly.
7. **Observed outcome.** Correct theme colors render at both desktop and
   mobile widths; the `dev:fresh` script remains the documented remedy for
   stale Turbopack CSS.

### Related source files
- `app/globals.css` (`@theme` color tokens)
- `package.json` (`dev:fresh` script)

---

## Example 2 — SCU coursework visibility regression (dark text on navy)

### Chronology

1. **Original change.** While aligning the bottom chip rows of the two
   education cards, the education card markup was restructured into two
   branches: a coursework branch (Marquette) and an else branch (SCU). In that
   edit, the SCU chip `<li>` was hardcoded with light-theme classes
   (`border-navy/15 text-charcoal`) and the original
   `item.dark ? "border-white/25 text-white/85" : ...` conditional was dropped.
2. **Regression.** The SCU card is rendered with the navy background
   (`dark: true`), so its five coursework chips — Statistical Modeling, Data
   Visualization, Machine Learning, Deep Learning, Database Management —
   rendered in near-invisible dark text on navy. The chips still existed in
   the DOM; only styling was broken.
3. **User report (actual instruction).** "Fix the visual regression in the
   Santa Clara University education card… The five coursework chips still
   exist in the DOM, but their text has become dark and is nearly invisible
   against the navy background. This regression appeared after the previous
   education card alignment changes." The user required inspection of the SCU
   `<ul>`/`<li>` styling, restoration of readable light text with outlined
   borders, computed-style/contrast checks, and rendered verification at
   desktop and mobile widths.
4. **What was accepted/rejected and why.** The user rejected the regressed
   layout because the content was unreadable and the SCU card is visually a
   dark card; the conditional styling had to be restored to match the original
   navy-card design rather than restyling the chips.
5. **Fix.** The `item.dark` conditional was restored on the SCU branch:
   `item.dark ? "border-white/25 text-white/85" : "border-navy/15 text-charcoal"`.
6. **How it was checked.** Via Chrome DevTools Protocol: computed chip color
   (white at 85% opacity) and border (white at 25%); blended text color over
   navy computed to `rgb(219,221,224)` → contrast **12.60:1** (WCAG AA needs
   4.5:1); per-chip light-pixel analysis of rendered screenshots at 1440px and
   390px confirmed all five chips readable; bottom alignment between the two
   cards was re-measured unchanged (both last-chip rows at the same page
   y-coordinate, 1057px).
7. **Observed outcome.** All five SCU coursework chips render clearly readable
   on both widths; alignment, content, and card dimensions unchanged.

### Related source files
- `app/about-me/page.tsx` (education card branches; restored conditional)

---

## Example 3 — Contact storage reliability (audit-driven hardening)

### Chronology

1. **Initial implementation.** `lib/contact-store.ts` originally persisted
   submissions with a plain read-modify-write: `JSON.parse` of
   `data/contacts.json` inside a `try/catch` that fell back to `[]`, a direct
   `fs.writeFile` over the same file, and `catch { return false }` around
   everything.
2. **Audit findings.** A user-directed acceptance audit flagged: (a) malformed
   or unreadable existing JSON was **silently treated as an empty store**, so
   the next save would destroy recoverable data; (b) direct overwrites were
   vulnerable to partial writes; (c) unserialized read-modify-write allowed
   concurrent submissions to lose updates.
3. **User instruction (actual instruction).** "Fix the remaining data-integrity
   issues identified in the Assignment 2 Part 1 audit. Focus on
   `lib/contact-store.ts` and its tests," with requirements to make malformed
   existing data a storage error, never overwrite corrupted data, use safe
   temporary-file writing with atomic replacement, apply a concurrency solution
   proportionate to the single-server architecture (explicitly: no database,
   no unnecessary dependencies, no distributed locking), preserve the existing
   interface/JSON format/Server Action behavior, and add reproducible tests in
   isolated temporary directories.
4. **What was accepted/rejected and why.** The audit findings were accepted in
   full; the proportionate in-process fix was accepted specifically to avoid
   introducing a database or locking infrastructure for a single-server
   course project.
5. **Revised design.** Strict read validation (missing file → empty store;
   unreadable file, malformed JSON, non-array JSON, or invalid entries →
   storage error, original file untouched); writes go to a unique temp file in
   the same directory followed by atomic `fs.rename`, with temp cleanup on
   failure; saves are serialized through an in-process promise queue.
   Public interface (`saveContact(input): Promise<boolean>`) and JSON format
   unchanged.
6. **Automated tests.** `tests/contact-store.test.mjs` (Node built-in
   `node:test`, isolated `mkdtemp` directories via a `CONTACTS_DATA_DIR`
   override so real submissions are never touched) — 11 tests covering valid
   persistence, missing-file initialization, malformed JSON, unreadable files,
   non-array content, invalid entries, failed writes with temp-file cleanup,
   repeated submissions, existing-data preservation, and 5-way concurrent
   submissions.
7. **Observed results.** `npm test`: **11/11 pass**. ESLint clean; production
   build passes; live end-to-end browser check after the change: valid
   submission → success message + correctly formatted record on disk; invalid
   submission → accurate field errors with the data file hash unchanged.

### Related source files
- `lib/contact-store.ts` (hardened storage)
- `tests/contact-store.test.mjs` (new test suite)
- `package.json` (`test` script), `README.md` (testing docs)

---

# Part 2 examples

## Example 4 — Unknown blog slugs returned HTTP 200 in production (Cache Components streaming)

### Chronology

1. **What Viber implemented.** For the public blog feature, `/blogs/[slug]`
   rendered a post by reading the JSON store at request time and calling
   `notFound()` for unknown slugs. The project scaffold enabled
   `cacheComponents` in `next.config.ts`, which forbids `export const dynamic
   = "force-dynamic"`; Viber first satisfied its validation with a `<Suspense>`
   boundary and `connection()`, then simplified to a blocking route via
   `export const instant = false`. In the dev server, unknown slugs returned
   HTTP 404, so the behavior looked correct.
2. **What the user observed.** Before publishing Part 2, the user asked for a
   full production-build check and specifically to "verify why it's needed and
   confirm that the invalid URL really returns HTTP 404 in production."
3. **Investigation.** Against `next build` + `next start`, the invalid slug
   `/blogs/unknown-slug` returned **HTTP 200** — the correct not-found UI was
   rendered, but the status code was wrong. The bundled Next.js documentation
   (`streaming.md`) explains why: with Cache Components, the prerendered shell
   is sent immediately, so the response *"starts a 200 … even when … the route
   sets `instant = false`"*; a later `notFound()` renders the not-found UI and
   adds `noindex`, but the status line has already been written. The Part 1
   route `/projects/unknown-project` had the same production regression.
4. **What was accepted/rejected and why.** The 200-with-404-UI behavior was
   rejected: the assignment explicitly requires unknown slugs to return a
   proper 404 response, and a graded checker (or any HTTP client) sees the
   status code, not the streamed UI. Keeping Cache Components was therefore
   not an option for these routes, and no caching feature of the site depended
   on it (the blog list and forms fetch data client-side or through route
   handlers).
5. **Corrective action.** `cacheComponents` (and `partialPrefetching`, which
   errors without it) were removed from `next.config.ts`; `/blogs/[slug]` was
   changed to `export const dynamic = "force-dynamic"`, which under the
   standard model renders per request — both fixing the 404 status and
   guaranteeing newly published posts appear without a rebuild. One
   intermediate re-test initially still reported 200 because a stale server
   process still held port 3000 (an `EADDRINUSE` in the start log); after
   killing it and restarting from the fresh build, results were re-measured
   cleanly.
6. **How it was checked.** Fresh production build + `next start`: the full
   route sweep returned 200 for all valid pages, **404** for
   `/blogs/unknown-slug` and `/projects/unknown-project`, and 307 for the
   `/blog-posts` redirect; both real slugs served their distinct content.
   Headless-browser checks confirmed the list page, click-through, and the
   not-found UI on the invalid slug.
7. **Observed outcome.** Unknown slugs return a true HTTP 404 in production
   on both dynamic routes; `npm test` 28/28, lint clean, production build
   passes (16/16 pages).

### Related source files
- `next.config.ts` (`cacheComponents` removed)
- `app/blogs/[slug]/page.tsx` (`dynamic = "force-dynamic"`, `notFound()`)

---

## Example 5 — Node's test runner could not resolve `@/` imports and extensionless TS imports

### Chronology

1. **Initial implementation.** The contact/blog API test suites and the shared
   API handler modules were written with the codebase's usual import style:
   the `@/*` path alias and extensionless relative imports.
2. **Failure.** Running the suites through `node --test` failed at module
   resolution: Node does not read `tsconfig.json`, so it can neither expand the
   `@/` alias nor infer a `.ts` extension for an extensionless import. The
   tests could not load `lib/contact-api.ts` / `lib/blog-api.ts` at all.
3. **Resolution.** Modules imported by tests and scripts
   (`lib/contact-api.ts`, `lib/blog-api.ts`) were switched to explicit
   relative imports with `.ts` extensions; the test files import the
   `lib/` modules directly (e.g. `../lib/contact-store.ts`); and
   `"allowImportingTsExtensions": true` was added to `tsconfig.json` so
   TypeScript and ESLint accept the explicit extensions. Alias imports remain
   in app components, which are compiled by Next.js/Turbopack rather than run
   by Node directly.
4. **How it was checked.** `npm test` passes **28/28** (11 contact-store, 6
   contact-api, 11 blog-api); `npm run lint` clean; `npm run build` passes —
   confirming the change satisfies both the Node runner and the TypeScript
   toolchain. The same pattern was reused for `scripts/seed-blogs.mjs`,
   which imports `../lib/blog-store.ts` directly.
5. **Observed outcome.** Tests, seed script, and app build all run from the
   same source with no duplicated storage logic; no `tsconfig-paths` or test
   bundler dependency was needed.

### Related source files
- `tests/contact-api.test.mjs`, `tests/blog-api.test.mjs`, `tests/contact-store.test.mjs`
- `lib/contact-api.ts` (explicit `.ts` imports), `tsconfig.json`
- `scripts/seed-blogs.mjs`

---

## Example 6 — Lint error in the admin page's data-loading effect

### Chronology

1. **Initial implementation.** `components/blog-admin.tsx` loads the existing
   posts on mount. The first version fetched the posts inside `useEffect` and
   called the state setter synchronously with the parsed result.
2. **Failure.** `npm run lint` failed with `react-hooks/set-state-in-effect`
   on that setter — the React hooks rule flags synchronous `setState` during
   the effect body because it forces an immediate extra render pass.
3. **Corrective action.** The load logic was restructured so the state update
   happens asynchronously: an async function performs the `fetch` and updates
   state from its awaited result (same UI behavior, no synchronous update in
   the effect body). No rule was disabled and no dependency was added.
4. **How it was checked.** `npm run lint` clean; headless-browser run of
   `/admin/blogs` confirmed the posts list still renders on load, publishing
   still shows the success banner, and the list refresh includes the new
   post.
5. **Observed outcome.** Admin page behaves identically with lint passing;
   rule stays enforced for future edits.

### Related source files
- `components/blog-admin.tsx` (data-loading effect)
