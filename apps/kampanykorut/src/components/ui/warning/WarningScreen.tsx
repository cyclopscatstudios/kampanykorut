import { ReactNode, useState } from "react";
import { Icon, Text } from "@/shared/ui";

export function WarningScreen({
  allowWarning,
  label,
  description,
  children,
}: {
  allowWarning: boolean;
  label: string;
  description: string;
  children?: ReactNode;
}) {
  const [showWarningScreen, setShowWarningScreen] = useState(true);
  return (
    showWarningScreen &&
    allowWarning && (
      <div className="absolute top-0 left-0 z-50 w-full">
        <div className="relative border-2 border-yellow-400 bg-gray-800/80 p-4 text-center">
          <Text weight="bold">{label}</Text>
          <Text>{description}</Text>
          {children}
          <button
            type="button"
            onClick={() => setShowWarningScreen(false)}
            className="absolute right-2 top-2 cursor-pointer"
            aria-label="Close development warning"
          >
            <Icon name="x-circle" size="large" />
          </button>
        </div>
      </div>
    )
  );
}
