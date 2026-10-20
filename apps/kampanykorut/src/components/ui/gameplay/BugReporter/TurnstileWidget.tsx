import i18next from "i18next";
import { useEffect, useLayoutEffect, useRef } from "react";
import { loadTurnstile } from "../../../../logic/application/bugReport/turnstile";

interface TurnstileWidgetProps {
  siteKey: string;
  onToken: (token: string | null) => void;
}

export function TurnstileWidget({ siteKey, onToken }: TurnstileWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);

  useLayoutEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let widgetId: string | null = null;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId = turnstile.render(container.current, {
          sitekey: siteKey,
          theme: "dark",
          language: i18next.language,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [siteKey]);

  return <div ref={container} className="min-h-[65px]" />;
}
