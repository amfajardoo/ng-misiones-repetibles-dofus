# Testing — Detailed Rules

Referenced from AGENTS.md. MUST be read before creating or modifying any spec.

## Core principle: test behavior, not implementation

A spec verifies what a user or a consumer can observe. It never verifies how the
code is built inside.

- Observable behavior is: rendered UI, emitted outputs, navigation, HTTP
  requests sent, and the results of a service's public API.
- NEVER test variables, fields, signals, or methods for their own sake. A value
  only matters through the behavior it produces.
- NEVER access `private` / `protected` members: no `component['field']`, no
  `as any` / `as unknown as` casts to reach internals.
- NEVER call component methods or read component properties directly
  (`fixture.componentInstance.x`). Drive the component the way a user would,
  through harnesses and inputs.
- Internal signals, `computed()`, and resources are implementation details.
  Assert their effect on the UI or on a public output, never their value.
- Do NOT assert how many times an internal collaborator was called. Assert a
  call only when the call IS the behavior (an HTTP request, a navigation, a
  notification shown to the user).
- Do NOT test the framework or Angular Material (e.g. that `mat-button` emits
  a click). Test what this project does with them.
- Name tests after the behavior (`shows the updated count`), never after a
  member (`increment() sets count`).

Litmus test: if the internals are rewritten and the behavior stays the same
(rename a method, turn a signal into a `computed()`, split a component), every
spec MUST still pass. If a spec breaks, it was testing implementation: rewrite
the spec, not the code.

## Runner

- Runner is **Vitest**, executed through `ng test`. Single run: `pnpm test:run`
  (`ng test --watch=false`).
- Mocks and spies use Vitest only: `import { vi } from 'vitest'` and `vi.fn()`,
  `vi.spyOn()`, `vi.mocked()`. Never use Jasmine APIs (`jasmine.createSpyObj`,
  `spyOn`).
- Do NOT use Zone-based helpers: `fakeAsync`, `tick`, `flush`, `waitForAsync`.
  Use `await fixture.whenStable()`, harness auto-waiting, and Vitest fake timers.
- Never use the `done` callback and never `.subscribe()` inside a spec. Use
  `async` / `await` (`lastValueFrom` for Observables).
- Never use `any` in specs. Type stubs with `satisfies Partial<T>`.
- Restore spies and mocks after each spec (`vi.restoreAllMocks()` in
  `afterEach`) so nothing leaks between specs.

## Structure (AAA)

- Every spec follows Arrange / Act / Assert.
- NEVER write `// Arrange`, `// Act` or `// Assert` comments. The structure is
  shown only by blank lines.
- Separate the three blocks with exactly one blank line. No blank lines inside
  a block.
- Arrange builds the world: `TestBed`, stubs, inputs, the spec-local `setup()`
  call. Act is the user action, or the harness reads that obtain the observed
  result, stored in a `const`. Assert contains only `expect(...)` lines.
- A harness lookup or read (`getAllHarnesses`, `getHarness`, `parallel`) and the
  `expect` that checks it NEVER share a block: put a blank line between them.
- Exception: a single getter on an already obtained harness may sit inline in the
  `expect` (`expect(await counter.getCount()).toBe('1')`).
- If a spec has no arrange step, it has two blocks (act, assert). Never add or
  split a block just to fill the pattern.
- One act per spec. If a second act is needed, write a second spec.
- One behavior per spec. Do not assert unrelated behaviors in the same `it`.

## Forbidden in specs

- No `console.log`, `console.warn`, `console.error`, `console.debug` or
  `debugger`. Remove debugging output before committing.
- To verify that something is logged, spy with
  `vi.spyOn(console, 'error').mockImplementation(() => {})` and assert on the
  spy. Only do this when logging is the behavior.
- No committed `it.only`, `describe.only`, `it.skip`, `it.todo`, `fit`,
  `fdescribe`.
- No raw DOM access: `fixture.debugElement.query`,
  `fixture.nativeElement.querySelector`, `document.querySelector`.

## Setup

- Test setup lives with the spec. Each spec (or spec group) configures its own
  `TestBed` explicitly.
- Do not create a project-wide wrapper unless the same setup is repeated in 5 or
  more specs.
- Stub what the spec does not care about: replace irrelevant dependencies with
  minimal stubs.
- Set component inputs with `fixture.componentRef.setInput(name, value)`, then
  `await fixture.whenStable()`.
- For routed components that use `withComponentInputBinding()`, test through
  `RouterTestingHarness`.

## Stubbing

- **Services**: provide a typed partial stub.
  ```ts
  { provide: UserService, useValue: { user: signal(null) } satisfies Partial<UserService> }
  ```
- **HTTP**: `provideHttpClient()` + `provideHttpClientTesting()`, then drive
  responses with `HttpTestingController` (`expectOne(...).flush(...)`). Call
  `verify()` in `afterEach`. This also applies to `httpResource()`.
- **Router**: `provideRouter([])`, or `RouterTestingHarness.create()` when the
  spec needs navigation.
- **Time** (debounce, timeouts): `vi.useFakeTimers()` in the arrange step,
  advance with `await vi.advanceTimersByTimeAsync(ms)`, and ALWAYS restore with
  `vi.useRealTimers()` in `afterEach`. Never wait with real `setTimeout`.
- **Signals / resources**: stub with writable `signal()` values so the spec can
  change state and assert the resulting UI.

## Harnesses

- Always drive component specs through a harness. Prefer the harness that ships
  with Angular Material for the component under test (e.g. `MatButtonHarness`
  from `@angular/material/button/testing`).
- `@angular/cdk/testing` ships with Angular Material (Angular CDK). Import it
  directly. It is NOT a new dependency and needs no tooling commit.
- Get a loader with `TestbedHarnessEnvironment.loader(fixture)`.
- Harnesses expose typed methods (`click()`, `getText()`, `isDisabled()`) instead
  of raw DOM queries.

### Custom harnesses

- Create one only when no Material harness covers the behavior.
- File: `<name>.harness.ts`, colocated with the component, one harness per file.
- Extend `ComponentHarness`, declare `static hostSelector`, and build every query
  with a typed `locatorFor` / `locatorForOptional` / `locatorForAll`.
- Prefer composing Material harnesses inside the custom one over selectors.
- Selectors are allowed ONLY inside a harness. Prefer `[data-testid="..."]`
  over CSS classes or tag names.
- Expose behavior and state (`increment()`, `getCount()`), never DOM details.

## Overlays

Dialogs, menus, selects, autocompletes, tooltips, and snackbars render outside
the fixture. Locate them with the document root loader:

```ts
const overlay = TestbedHarnessEnvironment.documentRootLoader(fixture);
const menu = await overlay.getHarness(MatMenuHarness);
```

## Accessibility assertions

Assert the semantics defined in AGENTS.md as observable behavior, via harnesses:

- **Role / name / label**: `(await harness.host()).getAttribute('role')`,
  `getAttribute('aria-label')`, or the harness's own `getText()`/`getLabel()`.
- **Focus**: `await harness.focus()` then `expect(await harness.isFocused())`.
- **Keyboard**: `(await harness.host()).sendKeys(TestKey.ENTER)` and assert the
  outcome, not that the key was pressed.
- **State**: `isDisabled()`, `isChecked()`, `isExpanded()` where the harness
  provides them.

## Non-component specs

Test the public API only, as a consumer would use it.

- **Services**: `TestBed.inject(Service)`. Only skip `TestBed` if the service has
  no DI at all.
- **Pipes**: instantiate directly (`new MyPipe()`) when it has no dependencies.
- **Directives**: test through a minimal host component declared in the spec
  and a harness for that host.
- **Guards / resolvers**: `TestBed.runInInjectionContext(() => guard(route, state))`.
  Convert Observable results with `lastValueFrom`.

## Test data and determinism

- Specs MUST be deterministic: no `Math.random()`, no unpinned `new Date()` /
  `Date.now()`. Pin time with `vi.setSystemTime(...)` and a fixed date.
- Build domain objects with a spec-local helper that accepts overrides
  (`buildUser({ name: 'Ana' })`). Only set the fields the spec cares about.

## Assertions

- Assert the exact expected value (`toBe`, `toEqual`). Avoid vague matchers
  such as `toBeTruthy()` or `toBeDefined()` when a precise value exists.
- Assert outcomes, never that a key was pressed or a method was invoked.
- When a spec claims that something is shown, assert WHAT is shown (labels, text,
  values), never only a count or its existence. A count alone passes with the
  wrong items.
- Specs that differ only in data use `it.each`. Do not copy-paste a spec and
  change one value.

## Extraction

- If the same arrange/act/assert logic appears in 3 specs, extract it into a
  spec-local helper colocated with those specs.
- Do not extract before the third repetition.

## Examples

### Good

```ts
describe('CounterComponent', () => {
  describe('when the user presses Increment', () => {
    it('shows the updated count', async () => {
      const fixture = TestBed.createComponent(CounterComponent);
      const counter = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        CounterHarness,
      );

      await counter.increment();

      expect(await counter.getCount()).toBe('1');
    });
  });
});
```

```ts
// counter.harness.ts
export class CounterHarness extends ComponentHarness {
  static hostSelector = 'app-counter';

  private readonly incrementButton = this.locatorFor(
    MatButtonHarness.with({ text: 'Increment' }),
  );
  private readonly count = this.locatorFor('[data-testid="count"]');

  async increment(): Promise<void> {
    await (await this.incrementButton()).click();
  }

  async getCount(): Promise<string> {
    return (await this.count()).text();
  }
}
```

### Good (data-driven, content assertions)

```ts
describe('QuestListComponent', () => {
  describe('period filter', () => {
    it.each([
      { filter: 'all', expected: ['Daily quest', 'Weekly quest'] },
      { filter: 'daily', expected: ['Daily quest'] },
      { filter: 'weekly', expected: ['Weekly quest'] },
    ] as const)('shows $expected when the filter is $filter', async ({ filter, expected }) => {
      const { loader } = await setup(filter);

      const checkboxes = await loader.getAllHarnesses(MatCheckboxHarness);
      const labels = await parallel(() => checkboxes.map(c => c.getLabelText()));

      expect(labels).toEqual(expected);
    });
  });
});
```

### Bad

```ts
it('increments', done => {
  // Arrange
  const fixture = TestBed.createComponent(CounterComponent);
  // Act
  fixture.componentInstance.increment();            // calls a method, not user behavior
  fixture.detectChanges();
  // Assert
  expect(fixture.componentInstance['count']()).toBe(1); // reads private state
  fixture.componentInstance.count$.subscribe(v => {     // .subscribe() + done()
    expect(
      fixture.nativeElement.querySelector('.count').textContent, // raw DOM
    ).toBe('1');
    console.log(v);                                     // console.log
    done();
  });
});
```

## Before finishing a spec

- [ ] Tests behavior only: no private members, no component methods, no internal state
- [ ] Still passes if internals are refactored without changing behavior
- [ ] AAA without comments, one blank line between blocks, harness reads
      separated from the `expect`
- [ ] Assertions check content, not only counts; data-only variations use `it.each`
- [ ] No `console.*`, `.only`, `.skip`, `any`, `done`, `.subscribe()`
- [ ] No raw DOM queries outside harnesses
- [ ] Timers and mocks restored, HTTP `verify()` called
- [ ] Lint and `pnpm test:run` pass