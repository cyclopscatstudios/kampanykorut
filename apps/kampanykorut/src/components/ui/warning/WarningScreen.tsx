import { ReactNode, useState } from "react";
import { Text } from "@/shared/ui";
import { Button } from "@/shared/ui/Button";

export function WarningScreen({
  allowWarning,
  label,
  description,
  children,
  id,
}: {
  allowWarning: boolean;
  label: string;
  description: string;
  children?: ReactNode;
  id?: string;
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
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            onClick={() => setShowWarningScreen(false)}
            className="absolute right-2 top-2"
            aria-label="Close development warning"
            data-testid={id}
          >
            <Button.Icon name="x-lg" />
          </Button>
        </div>
      </div>
    )
  );
}
