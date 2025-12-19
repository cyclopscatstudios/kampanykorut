import { Button } from "../components/ui/Button";

export function ButtonDev() {
  const buttons = [
    {
      variant: "primary",
      size: "normal",
      color: "darkBlue",
      text: "Primary",
      fullRounded: true,
      block: false,
    },
    {
      variant: "primary",
      size: "normal",
      color: "darkBlue",
      text: "Primary",
      fullRounded: false,
      block: false,
    },
    {
      variant: "primary",
      size: "normal",
      color: "darkBlue",
      text: "Primary",
      fullRounded: true,
      block: true,
    },
    {
      variant: "primary",
      size: "normal",
      color: "darkBlue",
      text: "Primary",
      fullRounded: false,
      block: true,
    },
    {
      variant: "secondary",
      size: "normal",
      text: "Secondary",
      fullRounded: true,
      block: false,
    },
    {
      variant: "secondary",
      size: "normal",
      text: "Secondary",
      fullRounded: false,
      block: false,
    },
    {
      variant: "secondary",
      size: "normal",
      text: "Secondary",
      fullRounded: true,
      block: true,
    },
    {
      variant: "secondary",
      size: "normal",
      text: "Tetriary",
      fullRounded: false,
      block: true,
    },
    {
      variant: "tertiary",
      size: "normal",
      text: "Tetriary",
      fullRounded: true,
      block: false,
    },
    {
      variant: "tertiary",
      size: "normal",
      text: "Tetriary",
      fullRounded: false,
      block: false,
    },
    {
      variant: "tertiary",
      size: "normal",
      text: "Tetriary",
      fullRounded: true,
      block: true,
    },
    {
      variant: "tertiary",
      size: "normal",
      text: "Tetriary",
      fullRounded: false,
      block: true,
    },
  ];

  return buttons.map((btn) => (
    <Button
      variant={btn.variant as any}
      className="m-2"
      fullRounded={btn.fullRounded}
      block={btn.block}
    >
      <Button.Text>{btn.text}</Button.Text>
    </Button>
  ));
}
