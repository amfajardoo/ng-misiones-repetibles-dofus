You are an expert in TypeScript, Angular, and scalable web application development.
You write functional, maintainable, performant, and accessible code following Angular
and TypeScript best practices.

## Project

- Angular 22, strict TypeScript, pnpm, Angular Material, Vitest (via `ng test`).
- If two rules conflict, or a rule cannot be followed, STOP and ask. Never work
  around a rule silently.

## Commands and verification

- `pnpm lint`, `pnpm build`, `pnpm test:run` (single run; if the script is missing,
  create it as `ng test --watch=false` in its own tooling commit).
- After every code change run them in that order. Fix any failure before declaring
  the task complete. Never report done with a failing check.

## Boundaries

### Always do

- Run the verification commands before declaring a task complete.
- Read `.github/instructions/testing.md` BEFORE touching any `*.spec.ts`.
- Read `.github/instructions/process.md` BEFORE committing or opening a PR.

### Ask first

- Adding or removing dependencies.
- Changing build, test, or lint configuration (including ESLint rules).
- Modifying the public API of a shared service or component.

### Never do

- Commit secrets, API keys, tokens, or `.env` files.
- Force-push to `main` or any protected branch.
- Mix tooling/setup changes with feature code in the same commit.
- Write to `node_modules/`, `dist/`, or other generated directories.
- Disable or downgrade an ESLint rule (rules in `eslint.config.js` are `error`).

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

## Angular

- Standalone components only. Do NOT set `standalone: true` (default).
- Do NOT set `changeDetection: OnPush` explicitly (default).
- Lazy-load feature routes.
- No `@HostBinding` / `@HostListener`; use the `host` object in the decorator.
- `NgOptimizedImage` for static images (not for inline base64).
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
- **Directives** for DOM manipulation, event handling, and reusable UI logic;
  structural directives for permission/auth checks.

## Components

- Build on **Angular Material**. Use the Material component that covers the needed
  semantics; reimplementing a Material primitive is a defect.
- Small, single-responsibility components. Prefer inline templates when small.
- `input()` / `output()` functions, not decorators. `model()` for `[(prop)]`.
- `computed()` for derived state; `linkedSignal()` for state derived from several
  sources that must stay in sync.
- Prefer Signal Forms (`@angular/forms/signals`) for new forms; otherwise Reactive
  forms, never Template-driven.
- No `ngClass` / `ngStyle`; use `class` and `style` bindings.
- External templates/styles use paths relative to the component file.

## Accessibility

- MUST meet WCAG AA: focus management, color contrast, ARIA attributes.
- Rely on Angular Material's built-in semantics, and assert them in specs (roles,
  labels, names, focus, keyboard) through harnesses. See testing.md.

## State and reactivity

| Situation | Use | Do NOT use |
|-----------|-----|------------|
| Value derived from other signals | `computed()` | `effect()` setting a signal |
| Derived from several sources, must stay in sync | `linkedSignal()` | `computed()` + `effect()` |
| Local component state | `signal()` | `BehaviorSubject` |
| Side effect (logging, analytics, DOM) | `effect()` | `computed()` |
| Async data fetch | `resource()` / `httpResource()` | `subscribe()` + manual `set` |

- Keep state transformations pure. Use `update` / `set`, never `mutate`.

## Templates

- Keep them simple. Native control flow (`@if`, `@for`, `@switch`), `track` always.
- Async pipe for observables.
- Templates cannot access globals like `new Date()`; expose the value from the
  class (signal or `computed()`).
- No `CommonModule`; import only the directives/pipes used (`AsyncPipe`, ...).

## Services

- Single responsibility. Use `inject()`, not constructor injection.
- New root singletons use `@Service()`. Use `@Injectable` only for non-root scopes
  (`platform`, `any`, a module) or when editing an existing one. Do not migrate
  existing services as a side effect of a feature change.

## Testing

Read `.github/instructions/testing.md` first. Non-negotiable:

- Vitest (`vi`), never Jasmine APIs. No `fakeAsync` / `tick`.
- AAA structure; nested `describe` blocks naming the behavior.
- Test behavior, not functions.
- Always drive component specs through a CDK `ComponentHarness` (Material first);
  no raw DOM queries.
- Never `.subscribe()` in specs; use `lastValueFrom` / `firstValueFrom`.