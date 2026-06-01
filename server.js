const express = require('express');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'database.sqlite');
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    name TEXT PRIMARY KEY,
    current_level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    level INTEGER NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    pct INTEGER NOT NULL,
    played_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_name) REFERENCES users(name)
  )
`);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/users', (req, res) => {
  const stmt = db.prepare('SELECT name FROM users ORDER BY name');
  const users = stmt.all();
  res.json(users.map((u) => u.name));
});

app.get('/api/users/:name', (req, res) => {
  if (req.params.name === 'favicon.ico') {
    return res.status(404).end();
  }
  const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
  const user = stmt.get(req.params.name);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ name: user.name, currentLevel: user.current_level, streak: user.streak });
});

app.get('/api/users/:name/rounds', (req, res) => {
  const stmt = db.prepare('SELECT * FROM rounds WHERE user_name = ? ORDER BY played_at DESC');
  const rounds = stmt.all(req.params.name);
  res.json(
    rounds.map((r) => ({
      id: r.id,
      level: r.level,
      correct: r.correct,
      total: r.total,
      pct: r.pct,
      playedAt: r.played_at,
    })),
  );
});

app.post('/api/rounds', (req, res) => {
  const { userName, level, correct, total, pct, currentLevel, streak } = req.body;
  if (!userName || level == null || correct == null || total == null || pct == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const upsertUser = db.prepare(`
    INSERT INTO users (name, current_level, streak, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(name) DO UPDATE SET
      current_level = excluded.current_level,
      streak = excluded.streak,
      updated_at = excluded.updated_at
  `);

  const insertRound = db.prepare(
    'INSERT INTO rounds (user_name, level, correct, total, pct) VALUES (?, ?, ?, ?, ?)',
  );

  db.exec('BEGIN');
  try {
    upsertUser.run(userName, currentLevel ?? level, streak ?? 0);
    const result = insertRound.run(userName, level, correct, total, pct);
    db.exec('COMMIT');
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  } catch (err) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
