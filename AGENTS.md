# Ask More 🦄 — Magical Math Game for Kids

## Commit Policy (Read First)

This is a hard rule for every contributor, human or AI:

- **Atomic commits only.** One logical change per commit. Never bundle unrelated
  refactors, formatting, or features into a single commit. If a change can be
  split into independently-revertable units, split it.
- **The pre-commit pipeline must pass on every commit.** The pipeline is:
  `lint-staged` → `gitleaks` → `jest`. Every gate is mandatory.
- **Never bypass the pipeline.** No `git commit --no-verify`, no `HUSKY=0`, no
  uninstalling hooks, no skipping `gitleaks`, no `--testPathIgnorePatterns`.
  If a gate fails, fix the root cause and re-stage. Do not disable the rule
  to make the commit land.
- **No `TODO:` / `FIXME:` / `HACK:` comments in committed code.** ESLint's
  `no-warning-comments` rule will reject them. Track follow-ups in issues
  instead, and reference the issue number in the commit/PR.

A commit that lands without passing all three gates will be reverted.

## Overview

A progressive math game. Players solve arithmetic problems across 5 ranks, leveling up after 5 consecutive correct answers. Built as a single-page web app with an Express + SQLite backend.

## Quick Start

```bash
npm start           # Start server on port 3000
npm test            # Run Jest tests
docker compose up   # Run dev container on 127.0.0.1:8080
```

## Project Structure

| File                      | Purpose                                                                |
| ------------------------- | ---------------------------------------------------------------------- |
| `index.html`              | Frontend SPA (vanilla JS modules, CSS animations, Web Audio, confetti) |
| `server.js`               | Express server + `node:sqlite` database (users, rounds)                |
| `game.js`                 | ES module: problem generation, scoring, level progression              |
| `game.test.js`            | Jest tests covering all game logic                                     |
| `en.js`                   | English localization strings (rank names, labels, copy)                |
| `eslint.config.mjs`       | ESLint flat config — AI slop rules, complexity gates, security checks  |
| `.prettierrc`             | Prettier formatting config                                             |
| `.husky/pre-commit`       | Pre-commit hook: lint-staged → gitleaks → jest                         |
| `Dockerfile`              | Multi-stage Node 22 Alpine build with dumb-init, signal handling       |
| `docker-compose.yml`      | Dev compose file (bind-mount, dev defaults)                            |
| `docker-compose.prod.yml` | Production overrides (named volume, hardening, log rotation)           |
| `deploy/nginx/`           | nginx reverse proxy config with security headers + CSP                 |
| `docs/DEPLOYMENT.md`      | Single-host production deployment guide                                |
| `AGENTS.md`               | Project context for AI coding agents                                   |

## Game Ranks (5 Levels)

| Level | Max Number | Operations | Rank Name |
| ----- | ---------- | ---------- | --------- |
| 1     | 4          | +          | Foal      |
| 2     | 6          | +          | Pony      |
| 3     | 9          | +          | Unicorn   |
| 4     | 6          | +, -       | Pegasus   |
| 5     | 9          | +, -       | Alicorn   |

- **Level-up condition:** 5 consecutive correct answers (`updateLevel` in `game.js`)
- **Round size:** 10 problems per round
- **Subtraction:** `a` is always >= `b` (no negative results)

## API Endpoints

| Method | Path                      | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/users`              | List all user names                      |
| GET    | `/api/users/:name`        | Get user (currentLevel, streak)          |
| GET    | `/api/users/:name/rounds` | Round history (desc)                     |
| POST   | `/api/rounds`             | Save round + upsert user (transactional) |

## Database

- **Engine:** `node:sqlite` (built-in, no npm dependency)
- **Location:** `./data/database.sqlite`
- **Pragma:** WAL mode
- **Tables:** `users` (name PK, current_level, streak, timestamps), `rounds` (auto-increment, user FK)

## Game Flow

1. **Name Screen** — Pick existing user from SQLite or enter new name
2. **Game Screen** — 10 problems, answer via numpad (click/touch) or keyboard
3. **Feedback** — Correct: confetti + chime, Wrong: shake + buzz + show correct answer
4. **Level-Up Banner** — 2s overlay when ranking up (with fanfare sound)
5. **Summary Screen** — Stars (1-5), percentage, rank, "Play Again" button

## Key Game Logic (`game.js`)

- `generateProblem(level)` — returns `{ a, b, operator, answer }`
- `checkAnswer(problem, answer)` — accepts number or numeric string
- `updateLevel(consecutiveCorrect, currentLevel)` — returns new level (clamped 1-5)
- `generateRound(count, level)` — array of `count` problems
- `scoreRound(results)` — returns `{ correct, total, pct }`

## Pre-Commit Pipeline

Every commit runs three automated checks via **husky** + **lint-staged**:

| Stage            | Tool              | What It Catches                               |
| ---------------- | ----------------- | --------------------------------------------- |
| 1. Lint & Format | ESLint + Prettier | AI slop, unused code, style issues            |
| 2. Secrets       | gitleaks          | API keys, tokens, passwords in staged changes |
| 3. Tests         | Jest              | Regression failures                           |

### What ESLint Enforces

| Rule                     | Severity      | What It Catches                              |
| ------------------------ | ------------- | -------------------------------------------- |
| `no-console`             | warn          | `console.log` debugging artifacts            |
| `no-alert`               | warn          | `alert()` / `confirm()` debugging artifacts  |
| `no-empty`               | error         | Empty catch blocks (AI skips error handling) |
| `no-unused-vars`         | error         | Dead code, refactoring leftovers             |
| `no-var`                 | error         | Old-style `var` declarations                 |
| `prefer-const`           | error         | `let` used where `const` works               |
| `no-eval`                | error         | `eval()` and `new Function()` calls          |
| `no-implied-eval`        | error         | `setTimeout`/`setInterval` with strings      |
| `no-throw-literal`       | error         | `throw` must use `Error` objects             |
| `complexity`             | warn (max 10) | Overly complex functions                     |
| `max-depth`              | warn (max 4)  | Deeply nested blocks                         |
| `max-lines-per-function` | warn (max 50) | "God functions"                              |
| `max-params`             | warn (max 4)  | Too many function parameters                 |
| `max-nested-callbacks`   | warn (max 3)  | Callback hell                                |
| `eqeqeq`                 | error         | `==` instead of `===` (allows `== null`)     |
| `curly`                  | error         | All control statements need braces           |
| `no-warning-comments`    | warn          | `TODO:`, `FIXME:`, `HACK:` placeholders      |
| `no-useless-return`      | error         | Unnecessary return statements                |
| `no-useless-concat`      | error         | Unnecessary string concatenation             |
| `no-useless-escape`      | warn          | Unnecessary escape characters                |

### Security Gates

`gitleaks protect --staged` runs on every commit. It blocks any staged change containing:

- API keys and tokens (AWS, GitHub, Stripe, etc.)
- Private SSH keys and certificates
- Database connection strings with credentials
- High-entropy strings that look like secrets

## Testing

```bash
npm test            # Full Jest suite
npx jest --watch    # Watch mode during development
npx jest --coverage # Coverage report
```

Tests cover: level configs, problem generation (operators, bounds), answer checking (including edge cases), level progression (streaks, clamping), round generation, and scoring.

## Deployment

```bash
# Dev (bind-mount, fast iteration)
docker compose up

# Production (named volume, hardening, log rotation)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

The Node server binds to `127.0.0.1:8080` (mapped from container
port 3000) and is intended to sit behind an nginx reverse proxy —
see `deploy/nginx/askmore.conf` and `docs/DEPLOYMENT.md`.

**Image characteristics:**

- Multi-stage build — devDependencies never ship in the final image
- `dumb-init` for proper SIGTERM forwarding (clean `docker stop`)
- Non-root user (`node:node`), read-only root FS, dropped capabilities
- Named volume `askmore-data` for the SQLite database
- `tmpfs` for `/app/data` so WAL files survive the read-only FS

**Environment variables** (see `.env.example`):

| Variable   | Default      | Notes                                           |
| ---------- | ------------ | ----------------------------------------------- |
| `PORT`     | `3000`       | Express listen port                             |
| `DATA_DIR` | `/app/data`  | Directory containing `database.sqlite`          |
| `NODE_ENV` | `production` | Set in Dockerfile; override in `.env` if needed |

**Backups:** `sqlite3 .backup` from inside the container produces a
consistent snapshot without downtime. See `docs/DEPLOYMENT.md` for
the full operator runbook (TLS, upgrades, log rotation, observability).

## Architecture Notes

- **No build step** — Frontend uses ES modules (`<script type="module">`) directly in the browser
- **Offline-tolerant** — API failures silently degrade (no saved users list, no persistence)
- **Sound effects** — Web Audio API transient oscillator tones (no audio files)
- **Accessibility** — `prefers-reduced-motion` disables animations/confetti, `aria-live` regions for dynamic content
- **i18n-ready** — All strings in `en.js`, just add locale files and swap
