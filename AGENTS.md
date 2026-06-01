# Ask More 🦄 — Magical Math Game for Kids

## Overview
A unicorn-themed progressive math game. Players solve arithmetic problems across 5 ranks, leveling up after 5 consecutive correct answers. Built as a single-page web app with an Express + SQLite backend.

## Quick Start
```bash
npm start           # Start server on port 3000
npm test            # Run Jest tests
docker-compose up   # Run via Docker on port 8080
```

## Project Structure
| File | Purpose |
|------|---------|
| `index.html` | Frontend SPA (vanilla JS modules, CSS animations, Web Audio, confetti) |
| `server.js` | Express server + `node:sqlite` database (users, rounds) |
| `game.js` | ES module: problem generation, scoring, level progression |
| `game.test.js` | Jest tests covering all game logic |
| `en.js` | English localization strings (unicorn/magic themed) |
| `Dockerfile` | Node 22 Alpine, WAL-mode SQLite in `/app/data` |
| `docker-compose.yml` | Port 127.0.0.1:8080 → 3000, memory limit 128M, healthcheck |

## Game Ranks (5 Levels)
| Level | Max Number | Operations | Rank Name |
|-------|-----------|------------|-----------|
| 1 | 4 | + | Foal |
| 2 | 6 | + | Pony |
| 3 | 9 | + | Unicorn |
| 4 | 6 | +, - | Pegasus |
| 5 | 9 | +, - | Alicorn |

- **Level-up condition:** 5 consecutive correct answers (`updateLevel` in `game.js`)
- **Round size:** 10 problems per round
- **Subtraction:** `a` is always >= `b` (no negative results)

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List all user names |
| GET | `/api/users/:name` | Get user (currentLevel, streak) |
| GET | `/api/users/:name/rounds` | Round history (desc) |
| POST | `/api/rounds` | Save round + upsert user (transactional) |

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

## Testing
```bash
npm test            # Full Jest suite
npx jest --watch    # Watch mode during development
npx jest --coverage # Coverage report
```
Tests cover: level configs, problem generation (operators, bounds), answer checking (including edge cases), level progression (streaks, clamping), round generation, and scoring.

## Architecture Notes
- **No build step** — Frontend uses ES modules (`<script type="module">`) directly in the browser
- **Offline-tolerant** — API failures silently degrade (no saved users list, no persistence)
- **Sound effects** — Web Audio API transient oscillator tones (no audio files)
- **Accessibility** — `prefers-reduced-motion` disables animations/confetti, `aria-live` regions for dynamic content
- **i18n-ready** — All strings in `en.js`, just add locale files and swap
