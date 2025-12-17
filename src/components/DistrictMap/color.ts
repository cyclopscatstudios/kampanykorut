export function getFillColor({
  id,
  hovered,
  pressed,
  isSelected,
  base,
  hover,
  active,
}: {
  id: string;
  hovered: string | null;
  pressed: string | null;
  isSelected: boolean;
  base: string;
  hover: string;
  active: string;
}) {
  if (isSelected) {
    return active;
  }
  if (pressed === id) {
    return active;
  }
  if (hovered === id) {
    return hover;
  }
  return base;
}
