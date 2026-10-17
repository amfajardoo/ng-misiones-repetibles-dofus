# Process — Detailed Policies

Referenced from AGENTS.md. MUST be read before committing or opening a PR.

## Precedence

The stop conditions below always win over any instruction to keep going.

## When to stop

Once a task is clear and unambiguous, carry it through to completion. Do NOT ask
"should I continue?" at every step. Stop for the user only when:

1. A commit is pending (see Review before commit).
2. A command fails or produces an unexpected result (see Node commands).
3. A genuinely ambiguous decision with real alternatives arises.
4. A rule cannot be followed.
5. The user explicitly interrupts.

## Node commands

The agent runs node-based commands. If one fails or produces an unexpected result,
STOP and hand the exact command to the user to execute and report back the output.
Never silently retry or work around environment issues.

## Review before commit

The agent MUST NOT commit until the user has reviewed the pending changes (in the
editor/IDE) and explicitly approved. Before every commit, present a concise summary
of what it will contain and wait for approval. This applies to all commits,
including documentation and tooling changes.

## Branching and commits

- Never mix tooling/setup changes with feature code.
- Keep process/environment setup in its own commits (ideally its own branch),
  separate from feature implementation.

## Pull requests

Every PR body MUST follow `.github/PULL_REQUEST_TEMPLATE.md`, including PRs for
process, tooling, or documentation changes and the PR that introduces or changes
the template itself. Do NOT write a free-form description in its place.

If the template does not exist, create it before opening the first PR, in its own
commit on its own branch (it is a tooling change). It has six sections:

1. **Summary & decisions** — what changed and why. Distinguish the author's stated
   reason from inferred rationale (mark the latter as inferred).
2. **Type of Change** — feature, fix, refactor, docs, or tooling.
3. **Changes** — short list of what changed, grouped by area.
4. **Scope guard** — what is deliberately NOT included; confirm no tooling is mixed
   with feature code.
5. **Local verification** — result of `pnpm lint`, `pnpm build`, `pnpm test:run`.
6. **Notes for the reviewer** — decisions needing human judgement, risks, where to
   look first.

## Capture the "why"

Before implementing, establish the intent behind the change: the problem it solves,
its rationale, and its expected user impact. If the "why" is not explicit in the
request, ask for it or derive it from AGENTS.md, existing code, and session history,
and state the derivation in the PR body so the human can correct it.

## Human-supervised AI work

Every PR is reviewed by a human. Keep diffs small and focused, avoid giant files and
sprawling change sets, and write PR bodies that give the reviewer the decision
context the diff cannot convey — not a regurgitated summary of the code changes.