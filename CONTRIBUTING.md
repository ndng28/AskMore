# Contributing to Ask More 🦄

Thanks for helping make this game better. This project is a small,
kid-facing math game, and we want every change to land cleanly and
safely. Please read this document before opening a pull request.

## Ground rules

These rules apply to every commit, pull request, and code review.

### 1. Atomic commits

- One logical change per commit.
- Do not bundle unrelated refactors, formatting, or features into a
  single commit. If your change can be split into independently-revertable
  units, split it.
- A good test: `git revert <sha>` on any single commit in your PR should
  leave the repo in a working state. If it does not, your commits are not
  atomic enough.

### 2. The pre-commit pipeline must pass

Every commit runs three gates via husky + lint-staged:

1. **Lint & format** — `eslint --fix` then `prettier --write` on staged
   files. The ESLint config enforces strict "AI slop" rules (no `var`,
   no `console.log`, no empty catches, complexity ≤ 10, function ≤ 50
   lines, `===` only, etc.). See `AGENTS.md` for the full table.
2. **Secrets scan** — `gitleaks protect --staged`. Any staged change
   containing API keys, tokens, private keys, or high-entropy strings
   will be blocked.
3. **Tests** — `jest` runs the full test suite. All tests must pass.

All three gates are mandatory. If any gate fails, fix the root cause,
re-stage, and commit again. Do not disable a rule, do not skip a gate,
do not push a commit that has not passed this pipeline.

### 3. Never bypass the hooks

Specifically:

- Do not use `git commit --no-verify`.
- Do not set `HUSKY=0` or `HUSKY_SKIP_HOOKS=1`.
- Do not uninstall, rename, or chmod away the husky hooks.
- Do not add `--testPathIgnorePatterns` to skip failing tests.
- Do not add `// eslint-disable-next-line` to silence a rule that the
  project deliberately enforces.

If a gate is blocking a change you believe is correct, the answer is
almost always to fix the change — not bypass the gate. Discuss in the
PR if you genuinely think a rule is wrong.

### 4. No `TODO:` / `FIXME:` / `HACK:` in committed code

ESLint's `no-warning-comments` rule rejects these. Track follow-up work
in GitHub issues instead, and reference the issue number in the commit
or PR body. Example:

```
feat(game): add multiplication mode (closes #42)
```

If you find yourself wanting to leave a `TODO:` in the code, open an
issue first and reference it. The exception is `XXX` inside a comment
explaining a known issue — but prefer an issue link.

## Pull request workflow

1. Branch from `main` using a conventional name:
   - `feat/<short-description>` — new feature
   - `fix/<short-description>` — bug fix
   - `refactor/<short-description>` — code restructuring
   - `docs/<short-description>` — documentation only
   - `chore/<short-description>` — tooling, deps, build
   - `ci/<short-description>` — CI / pipeline changes
2. Make atomic commits as described above.
3. Push the branch and open a PR against `main`.
4. Wait for CI to pass (lint + tests).
5. The maintainer reviews and merges.

## Commit message format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

<optional body — wrap at 72 chars>

<optional footer — references, breaking changes>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`, `perf`.
Keep the subject line under 72 characters and in the imperative mood
("add", not "added" or "adds").

## Running the pipeline locally

```bash
npm start            # Start the server on :3000
npm test             # Run the full Jest suite
npx eslint .         # Lint everything
npx prettier --check .  # Verify formatting
```

Before opening a PR, run all of the above. If `npm test` passes locally,
CI will pass on the PR.

## Questions?

Open an issue. We are a small project and a quick conversation is
cheaper than a long PR.
