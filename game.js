export function getLevelConfig(level) {
  return { maxNumber: 0, operations: [] };
}

export function generateProblem(level) {
  return { a: 0, b: 0, operator: '+', answer: 0 };
}

export function checkAnswer(problem, answer) {
  return false;
}

export function updateLevel(consecutiveCorrect, currentLevel) {
  return 1;
}

export function generateRound(count, level) {
  return [];
}

export function scoreRound(results) {
  return { correct: 0, total: 0, pct: 0 };
}
