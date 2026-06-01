import {
  getLevelConfig,
  generateProblem,
  checkAnswer,
  updateLevel,
  generateRound,
  scoreRound,
} from './game';

describe('getLevelConfig', () => {
  test.each([
    [1, { maxNumber: 4, operations: ['+'] }],
    [2, { maxNumber: 6, operations: ['+'] }],
    [3, { maxNumber: 9, operations: ['+'] }],
    [4, { maxNumber: 6, operations: ['+', '-'] }],
    [5, { maxNumber: 9, operations: ['+', '-'] }],
  ])('level %i returns correct config', (level, expected) => {
    expect(getLevelConfig(level)).toEqual(expected);
  });

  test.each([0, -1, 99])('invalid level %i defaults to level 1', (level) => {
    expect(getLevelConfig(level)).toEqual(getLevelConfig(1));
  });
});

describe('generateProblem', () => {
  test('returns a valid problem structure', () => {
    const problem = generateProblem(1);
    expect(problem).toHaveProperty('a');
    expect(problem).toHaveProperty('b');
    expect(problem).toHaveProperty('operator');
    expect(problem).toHaveProperty('answer');
    expect(typeof problem.a).toBe('number');
    expect(typeof problem.b).toBe('number');
    expect(typeof problem.answer).toBe('number');
  });

  test('addition problem answer equals a + b', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(3);
      if (problem.operator === '+') {
        expect(problem.answer).toBe(problem.a + problem.b);
      }
    }
  });

  test('subtraction problem answer equals a - b', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(5);
      if (problem.operator === '-') {
        expect(problem.answer).toBe(problem.a - problem.b);
      }
    }
  });

  test('subtraction: a is always >= b', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(5);
      if (problem.operator === '-') {
        expect(problem.a).toBeGreaterThanOrEqual(problem.b);
      }
    }
  });

  test('values stay within level maxNumber', () => {
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem(2);
      expect(problem.a).toBeLessThanOrEqual(6);
      expect(problem.b).toBeLessThanOrEqual(6);
    }
  });

  test('level 1 produces only addition', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateProblem(1).operator).toBe('+');
    }
  });

  test('level 5 produces both operators', () => {
    const operators = new Set();
    for (let i = 0; i < 200; i++) {
      operators.add(generateProblem(5).operator);
    }
    expect(operators.has('+')).toBe(true);
    expect(operators.has('-')).toBe(true);
  });
});

describe('checkAnswer', () => {
  test('returns true for correct answer', () => {
    const problem = { a: 3, b: 5, operator: '+', answer: 8 };
    expect(checkAnswer(problem, 8)).toBe(true);
  });

  test('returns false for incorrect answer', () => {
    const problem = { a: 3, b: 5, operator: '+', answer: 8 };
    expect(checkAnswer(problem, 7)).toBe(false);
  });

  test('handles numeric string input', () => {
    const problem = { a: 4, b: 2, operator: '+', answer: 6 };
    expect(checkAnswer(problem, '6')).toBe(true);
    expect(checkAnswer(problem, '5')).toBe(false);
  });

  test('edge case: answer is 0', () => {
    const problem = { a: 2, b: 2, operator: '-', answer: 0 };
    expect(checkAnswer(problem, 0)).toBe(true);
    expect(checkAnswer(problem, '0')).toBe(true);
  });
});

describe('updateLevel', () => {
  test('stays same when streak < 5', () => {
    expect(updateLevel(3, 1)).toBe(1);
    expect(updateLevel(0, 2)).toBe(2);
    expect(updateLevel(4, 3)).toBe(3);
  });

  test('advances when streak is 5', () => {
    expect(updateLevel(5, 1)).toBe(2);
  });

  test('advances when streak > 5', () => {
    expect(updateLevel(7, 2)).toBe(3);
  });

  test('never exceeds level 5', () => {
    expect(updateLevel(5, 5)).toBe(5);
    expect(updateLevel(99, 5)).toBe(5);
  });

  test('never goes below level 1', () => {
    expect(updateLevel(0, 0)).toBe(1);
    expect(updateLevel(0, -1)).toBe(1);
  });
});

describe('generateRound', () => {
  test('returns array of expected length', () => {
    expect(generateRound(10, 1)).toHaveLength(10);
    expect(generateRound(5, 3)).toHaveLength(5);
  });

  test('all problems match the given level config', () => {
    const round = generateRound(20, 2);
    for (const p of round) {
      expect(p.a).toBeLessThanOrEqual(6);
      expect(p.b).toBeLessThanOrEqual(6);
      expect(p.operator).toBe('+');
    }
  });
});

describe('scoreRound', () => {
  test('returns correct, total, pct', () => {
    const results = [{ isCorrect: true }, { isCorrect: false }, { isCorrect: true }];
    const summary = scoreRound(results);
    expect(summary).toEqual({ correct: 2, total: 3, pct: 67 });
  });

  test('all correct returns 100%', () => {
    const results = [{ isCorrect: true }, { isCorrect: true }];
    expect(scoreRound(results).pct).toBe(100);
  });

  test('none correct returns 0%', () => {
    const results = [{ isCorrect: false }, { isCorrect: false }, { isCorrect: false }];
    expect(scoreRound(results).pct).toBe(0);
  });

  test('partial correct returns correct percentage', () => {
    const results = [
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: true },
      { isCorrect: false },
    ];
    expect(scoreRound(results)).toEqual({ correct: 3, total: 4, pct: 75 });
  });

  test('empty array returns zeros', () => {
    expect(scoreRound([])).toEqual({ correct: 0, total: 0, pct: 0 });
  });
});
