# Accessibility — Detailed Rules

Referenced from AGENTS.md. MUST be read before creating or modifying any template
or interactive UI.

## Standard

- MUST meet WCAG AA: focus management, color contrast, ARIA attributes.
- Order of preference: native HTML element, then Angular Material, then ARIA.
  ARIA only fills gaps. Wrong ARIA is worse than none.
- Rely on Angular Material's built-in semantics and assert them in specs (roles,
  labels, names, focus, keyboard) through harnesses. See testing.md.

## Setting ARIA attributes

| Case | Write | Do NOT write |
|------|-------|--------------|
| Static value | `aria-label="Close"` | `[attr.aria-label]="'Close'"`, `attr.aria-label="Close"` |
| Dynamic value (template) | `[aria-label]="label()"` | `[attr.aria-label]` when the plain form compiles |
| Static value (`host` object) | `'aria-valuemin': '0'` | `'[attr.aria-valuemin]': "'0'"` |
| Dynamic value (`host` object) | `'[attr.aria-valuenow]': 'value()'` | `'[aria-valuenow]'` |

- A static ARIA attribute needs no binding syntax at all.
- `attr.aria-label="x"` without brackets is a defect: it creates a literal
  `attr.aria-label` attribute with no ARIA effect.
- Never use the camelCase form (`[ariaLabel]`, `[attr.ariaLabel]`). It does not
  set the ARIA attribute.
- Binding `null` or `undefined` removes the attribute. Never bind the strings
  `'null'`, `'undefined'`, or an empty string to mean "absent".
- If a template binding like `[aria-label]` fails to compile ("Can't bind to
  ..."), fall back to `[attr.aria-label]` and tell the user.

## Accessible names

- Every interactive control has an accessible name. Priority: visible text,
  `<label>` / `mat-label`, then `aria-labelledby` pointing at visible text, and
  only then `aria-label` (icon-only buttons, controls with no visible text).
- No redundancy: no `aria-label` that repeats the visible text, no `role` equal
  to the native role (`role="button"` on `<button>`).
- Icon-only buttons (`mat-icon-button`) always have `aria-label`. `mat-icon` is
  decorative and hidden from assistive technology by default; do not add ARIA
  to it.
- Form fields use `mat-form-field` + `mat-label`, and `mat-error` / `mat-hint`
  for messages. Do not hand-wire `aria-describedby` for what Material already
  connects.

## Keyboard and focus

- Every action is reachable and operable with the keyboard. Use `<button>` and
  `<a>`; never put `(click)` on a `div` or `span`.
- No positive `tabindex`. Use `tabindex="-1"` only for programmatic focus targets.
- Keep a visible focus indicator. Never remove `outline` without a replacement.
- After a route change, a dialog closing, or content being removed, focus must
  land somewhere meaningful. Material dialogs restore focus; custom overlays use
  CDK focus trapping (`cdkTrapFocus`).
- Announce async status changes (saved, error, results loaded) with
  `LiveAnnouncer` from `@angular/cdk/a11y`.

## Structure and visuals

- One `<h1>` per page, no skipped heading levels, real landmarks (`header`,
  `nav`, `main`).
- Meaningful images have descriptive `alt`; decorative images use `alt=""`.
- Never convey information by color alone. Respect `prefers-reduced-motion`.
- Text must stay readable when the browser font size is increased.

## Verification

- Assert role, name, label, focus, keyboard, and state through harnesses
  (testing.md, "Accessibility assertions").
- Template accessibility lint rules from `angular-eslint`, when enabled, MUST
  pass. Enabling or changing them is an "ask first" change.