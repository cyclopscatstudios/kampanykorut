import { useEffect } from "react";
import { useNavigate } from "react-router";
import { container } from "tsyringe";
import { Navigation } from "./Navigation";

export function NavigationBinder() {
  const navigate = useNavigate();
  const navigationService = container.resolve(Navigation);

  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate, navigationService]);

  return null;
}
