import { useRef, useState } from "react";
import { createPortal } from "react-dom";

type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: React.ReactElement;
  content: string;
  delay?: number;
  position?: TooltipPosition;
}

export function Tooltip({
  children,
  content,
  delay = 200,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const show = () => {
    if (timeoutRef.current) return;

    timeoutRef.current = setTimeout(() => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;

      const offset = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = rect.top - offset;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + offset;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - offset;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + offset;
          break;
      }

      setCoords({ top, left });
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setVisible(false);
  };

  const getTransform = () => {
    switch (position) {
      case "top":
        return "translate(-50%, -100%)";
      case "bottom":
        return "translate(-50%, 0)";
      case "left":
        return "translate(-100%, -50%)";
      case "right":
        return "translate(0, -50%)";
    }
  };

  return (
    <>
      <div
        ref={ref}
        className="inline-block"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform: getTransform(),
              zIndex: 9999,
            }}
            className="pointer-events-none transition-opacity duration-200 opacity-100"
          >
            <div className="rounded-md bg-black px-2 py-1 text-sm text-white shadow-lg">
              {content}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
