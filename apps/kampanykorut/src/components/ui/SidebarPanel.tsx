import { Button } from "../../../../../shared/ui/Button";

interface SidebarPanelProps<T> {
  data: readonly T[];
  getKey: (item: T) => React.Key;
  renderItem: (item: T) => React.ReactNode;
  onSelect?: (item: T) => void;
  selected?: T;
}

export function SidebarPanel<T>({
  data,
  getKey,
  renderItem,
  onSelect,
  selected,
}: SidebarPanelProps<T>) {
  return (
    <>
      {data.map((item) => (
        <Button
          key={getKey(item)}
          selected={selected === item}
          size="lg"
          variant="tertiary"
          block
          className="mb-2"
          onClick={() => onSelect?.(item)}
        >
          {renderItem(item)}
        </Button>
      ))}
    </>
  );
}
