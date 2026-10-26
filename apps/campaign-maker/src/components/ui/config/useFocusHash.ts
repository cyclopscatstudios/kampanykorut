import { useEffect } from "react";

export function useFocusHash() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    window.requestAnimationFrame(() => document.getElementById(id)?.focus());
  }, []);
}
