import {
  cloneElement,
  createContext,
  isValidElement,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface MenuContextValue {
  close: () => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

interface MenuProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: "left" | "right";
}

export function Menu({ trigger, children, align = "right" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: () => setOpen((prev) => !prev),
      } as never)
    : trigger;

  return (
    <MenuContext.Provider
      value={{
        close: () => setOpen(false),
      }}
    >
      <div ref={ref} className="relative inline-flex">
        {triggerElement}

        {open && (
          <div
            className={[
              "absolute top-full z-50 mt-1 min-w-[200px]",
              "rounded-md border border-gray-300",
              "bg-white shadow-lg",
              align === "right" ? "right-0" : "left-0",
            ].join(" ")}
          >
            {children}
          </div>
        )}
      </div>
    </MenuContext.Provider>
  );
}

function useMenu() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("Menu component missing");
  }

  return context;
}

interface SubMenuProps {
  label: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function SubMenu({ label, children, align = "right" }: SubMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-100"
      >
        <span>{label}</span>
        <span>›</span>
      </button>

      {open && (
        <div
          className={
            align === "left"
              ? "absolute right-full top-0 pr-1"
              : "absolute left-full top-0 pl-1"
          }
        >
          <div className="min-w-50 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  closeOnClick?: boolean;
}

export function MenuItem({
  children,
  onClick,
  disabled,
  closeOnClick = true,
}: MenuItemProps) {
  const { close } = useMenu();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.();

        if (closeOnClick) {
          close();
        }
      }}
      className={[
        "block w-full px-4 py-3 text-left",
        "hover:bg-gray-100",
        "disabled:cursor-not-allowed disabled:opacity-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function MenuDivider() {
  return <div className="h-px bg-gray-200" />;
}
