import { Button } from "./Button";
import { Text } from "./Text";

interface MenuListProps {
  listItems: string[];
}

export function MenuList({ listItems }: MenuListProps) {
  return (
    <div className="px-8 py-12 outline outline-1 outline-emerald-800/60">
      <ul className="w-[450px]">
        {listItems.map((item, index) => (
          <li
            key={index}
            className={index !== listItems.length - 1 ? "pb-4" : ""}
          >
            <Button block>
              <Text color="emerald">{item}</Text>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
