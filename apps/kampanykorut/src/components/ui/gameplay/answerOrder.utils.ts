const sessionSeed = Math.floor(Math.random() * 2 ** 32);

function hashString(value: string, seed: number): number {
  let hash = seed ^ 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash = Math.imul(hash ^ value.charCodeAt(i), 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded by question id so the order survives leaving and returning to the question.
export function orderAnswers<T>(
  answers: T[],
  questionId: string,
  random: boolean | undefined,
  seed: number = sessionSeed,
): T[] {
  if (!random) {
    return answers;
  }
  const next = mulberry32(hashString(questionId, seed));
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
