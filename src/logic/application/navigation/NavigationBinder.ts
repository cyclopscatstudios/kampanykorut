import { useNavigate } from "react-router";
import { Navigation } from "./Navigation";
import { container } from "tsyringe";
import { useEffect } from "react";

export function NavigationBinder() {
  const navigate = useNavigate();
  const navigationService = container.resolve(Navigation);

  useEffect(() => {
    navigationService.setNavigate(navigate);
  }, [navigate, navigationService]);

  return null;
}
