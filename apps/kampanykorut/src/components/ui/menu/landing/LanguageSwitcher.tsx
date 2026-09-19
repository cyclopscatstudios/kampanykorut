import classNames from "classnames";
import { useSettings } from "@/logic/application";
import { type LanguageId, supportedLanguages } from "@/shared/types";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { settings, updateSettings } = useSettings();

  const selectLanguage = (language: LanguageId) => {
    updateSettings({ language });
  };

  return (
    <div
      className={classNames(
        "z-10 flex gap-1 rounded-full border border-white/20 bg-black/30 p-1",
        className,
      )}
    >
      {supportedLanguages.map((language) => {
        const isActive = settings.language === language.id;
        return (
          <button
            key={language.id}
            type="button"
            aria-pressed={isActive}
            aria-label={language.label}
            onClick={() => selectLanguage(language.id)}
            className={classNames(
              "rounded-full px-3 py-1 text-xs font-semibold uppercase transition",
              isActive
                ? "bg-blue-500 text-white"
                : "text-slate-300 hover:text-white",
            )}
          >
            {language.id}
          </button>
        );
      })}
    </div>
  );
}
