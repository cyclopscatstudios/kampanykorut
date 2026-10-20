const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface TurnstileRenderOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  language?: string;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
}

export interface Turnstile {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export const TURNSTILE_SITE_KEY: string | undefined =
  import.meta.env.VITE_TURNSTILE_SITE_KEY || undefined;

let scriptLoading: Promise<Turnstile> | null = null;

export function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  scriptLoading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile did not initialise"));
    script.onerror = () => {
      scriptLoading = null;
      script.remove();
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });

  return scriptLoading;
}
