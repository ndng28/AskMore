const CONFIGS = [
  { maxNumber: 4, operations: ['+'] },
  { maxNumber: 6, operations: ['+'] },
  { maxNumber: 9, operations: ['+'] },
  { maxNumber: 6, operations: ['+', '-'] },
  { maxNumber: 9, operations: ['+', '-'] },
];

const MAX_LEVEL = CONFIGS.length;

function clampLevel(level) {
  if (level < 1 || level > MAX_LEVEL) return 1;
  return level;
}

export function getLevelConfig(level) {
  return CONFIGS[clampLevel(level) - 1];
}

function randomInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

export function generateProblem(level) {
  const config = getLevelConfig(level);
  const operator = config.operations[randomInt(config.operations.length - 1)];
  let a, b;

  if (operator === '-') {
    a = randomInt(config.maxNumber);
    b = randomInt(a);
  } else {
    a = randomInt(config.maxNumber);
    b = randomInt(config.maxNumber);
  }

  const answer = operator === '+' ? a + b : a - b;

  return { a, b, operator, answer };
}

export function checkAnswer(problem, answer) {
  return Number(answer) === problem.answer;
}

export function updateLevel(consecutiveCorrect, currentLevel) {
  const clamped = clampLevel(currentLevel);
  if (consecutiveCorrect >= 5 && clamped < MAX_LEVEL) {
    return clamped + 1;
  }
  return clamped;
}

export function generateRound(count, level) {
  const round = [];
  for (let i = 0; i < count; i++) {
    round.push(generateProblem(level));
  }
  return round;
}

export function scoreRound(results) {
  if (results.length === 0) {
    return { correct: 0, total: 0, pct: 0 };
  }
  const correct = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);
  return { correct, total, pct };
}
