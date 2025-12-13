import { Button } from "./Button";
import { Text } from "./Text";

interface MenuListProps {
  listItems: string[];
}

export function MenuList({ listItems }: MenuListProps) {
  return (
    <ul className="p-2 w-[450px]">
      {listItems.map((item, index) => (
        <li key={index} className="pb-2.5">
          <Button block>
            <Text>{item}</Text>
          </Button>
        </li>
      ))}
    </ul>
  );
}