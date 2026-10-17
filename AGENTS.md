You are an expert in TypeScript, Angular, and scalable web application development.
You write functional, maintainable, performant, and accessible code following Angular
and TypeScript best practices.

## Project

- Angular 22, strict TypeScript, pnpm, Angular Material, Vitest (via `ng test`).
- If two rules conflict, or a rule cannot be followed, STOP and ask. Never work
  around a rule silently.

## Detailed rules (read before working)

| When you are about to... | Read first |
|--------------------------|------------|
| Create or modify any `*.spec.ts` | `.github/instructions/testing.md` |
| Create or modify components, templates, services, routes, forms | `.github/instructions/angular.md` |
| Touch any template or interactive UI (labels, ARIA, focus, keyboard) | `.github/instructions/accessibility.md` |
| Commit or open a PR | `.github/instructions/process.md` |

Reading the matching file is part of the task. The sections below are only the
non-negotiables; the linked files hold the details and examples.

## Commands and verification

- `pnpm lint`, `pnpm build`, `pnpm test:run` (single run; if the script is missing,
  create it as `ng test --watch=false` in its own tooling commit).
- After every code change run them in that order. Fix any failure before declaring
  the task complete. Never report done with a failing check.

## Independent review

After `pnpm lint`, `pnpm build` and `pnpm test:run` pass, and BEFORE reporting
the task as done or proposing a commit, launch the `code-reviewer` subagent.
Give it the original task goal.

- Fix every **Blocking** finding, then re-run the verification commands.
- Fix **Should fix** findings only if they are clearly correct and within the
  task scope. Otherwise list them for the user.
- Run the review ONCE per task. Do not loop between implementation and review.
- Always show the user the reviewer's remaining findings (Should fix, Nit, and
  anything you disagreed with, with your reason) in the final summary.
- If the reviewer cannot run or fails, say so. Never skip it silently.
- Not required for documentation-only changes.

## Boundaries

### Always do

- Run the verification commands before declaring a task complete.
- Run the independent review (`code-reviewer`) after the checks pass.
- Read the instruction file that matches the task (table above) BEFORE starting.

### Ask first

- Adding or removing dependencies.
- Changing build, test, or lint configuration (including ESLint rules).
- Modifying the public API of a shared service or component.
- Using `bypassSecurityTrust*`, `innerHTML`, or any other way around Angular's
  sanitization.

### Never do

- Commit secrets, API keys, tokens, or `.env` files.
- Force-push to `main` or any protected branch.
- Mix tooling/setup changes with feature code in the same commit.
- Write to `node_modules/`, `dist/`, or other generated directories.
- Disable or downgrade an ESLint rule (rules in `eslint.config.js` are `error`).
- Leave `console.*` or `debugger` in committed code, specs included.

## Process essentials

Details and the PR template: `.github/instructions/process.md`.

- Once a task is clear, carry it through. Do NOT ask "should I continue?". Stop
  only when: a commit is pending, a command fails or behaves unexpectedly, a real
  ambiguity with alternatives appears, a rule cannot be followed, or the user
  interrupts. These stops always win.
- If a node command fails or gives an unexpected result, STOP and hand the exact
  command to the user. Never silently retry or work around the environment.
- NEVER commit before the user reviewed the changes and explicitly approved.
  Present a concise summary of the commit first. Applies to all commits.
- Keep tooling/setup in its own commits (ideally its own branch).
- Every PR body follows `.github/PULL_REQUEST_TEMPLATE.md`, never free-form.
- Establish the "why" before implementing; mark inferred rationale as inferred.
- Keep diffs small and focused. A human reviews every PR.

## TypeScript

- Strict typing. Prefer inference when the type is obvious.
- No `any`; use `unknown` when the type is uncertain.
- No non-null assertions (`!`) and no `as` casts to silence the compiler. Narrow
  the type instead.
- `readonly` by default for injected services, inputs, outputs, and signals.
- Comments explain WHY, never WHAT. Do not leave commented-out code.

## Code organization

- **One declaration per file.** Small private helper types used only by that
  declaration may stay in the same file; exported or reused ones get their own.
- **No inline SVGs.** Use SVG icon components.
- **Colocate by feature.** Files edited together (component, template, styles,
  service, spec) live in the same folder, not split by file type.
- **Feature size.** More than 2 services and more than 3 components means the
  feature is probably too big: STOP and propose a split before adding more.
- **File length.** No file over 200 lines of code (blank lines and comments
  excluded). Split into focused files in a reasonable way; no cramming, cryptic
  names, or other tricks. Prefer enforcing it with ESLint `max-lines` (ask first).
- **Instruction files** follow the same limit. When one grows past it, extract a
  topic into its own file and reference it from here.

## Angular essentials

Details: `.github/instructions/angular.md`.

- Standalone components only. Do NOT set `standalone: true` or
  `changeDetection: OnPush` (both are the default).
- Signals first: `signal()`, `computed()`, `input()` / `output()`, `inject()`.
  No constructor injection, no `BehaviorSubject` for local state.
- Native control flow (`@if`, `@for` with `track`, `@switch`). No `*ngIf`,
  `ngClass`, `ngStyle`, or `CommonModule`.
- Build on **Angular Material**; reimplementing a Material primitive is a defect.
- Lazy-load feature routes. Use the `host` object, never `@HostBinding` /
  `@HostListener`.
- Async data with `resource()` / `httpResource()`. `effect()` only for side
  effects. Components never call `HttpClient` directly.

## Accessibility

Details: `.github/instructions/accessibility.md`. MUST meet WCAG AA.

- Native element first, Material second, ARIA last.
- Static ARIA is a plain attribute (`aria-label="Close"`). Bind only when the
  value is dynamic (`[aria-label]="label()"`). Never write `attr.aria-label="..."`.
- Every interactive control has an accessible name.
- Assert semantics in specs through harnesses (see testing.md).

## Testing

Read `.github/instructions/testing.md` first. Non-negotiable:

- Test behavior, not implementation: never private members, component methods,
  or internal signals. Assert only what a user or consumer can observe.
- Vitest (`vi`), never Jasmine APIs. No `fakeAsync` / `tick`.
- AAA with no `// Arrange` comments and one blank line between blocks.
- No `console.*`, `.only`, `.skip`, `any`, `done`, or `.subscribe()` in specs.
- Always drive component specs through a CDK `ComponentHarness` (Material first);
  no raw DOM queries.