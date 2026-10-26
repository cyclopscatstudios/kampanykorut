export function parseEffectInput(value: string): number | null {
  if (value.trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= -10 && amount <= 10
    ? amount
    : null;
}
