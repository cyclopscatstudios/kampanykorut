import icons from "bootstrap-icons/font/bootstrap-icons.json";

export type IconSource = "bootstrap" | "svg";

export type BootstrapIcon = keyof typeof icons;

export type LocalIcon = `/${string}`;

export type IconName = BootstrapIcon | LocalIcon;
