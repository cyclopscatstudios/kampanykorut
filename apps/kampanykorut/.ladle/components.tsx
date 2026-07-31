import "reflect-metadata";
import "../src/di/container";
import "./styles.css";
import { MemoryRouter } from "react-router";

export const Provider = ({ children }: any) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};
