export const CAMPAIGN_TEASER_LENGTH = 260;

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
