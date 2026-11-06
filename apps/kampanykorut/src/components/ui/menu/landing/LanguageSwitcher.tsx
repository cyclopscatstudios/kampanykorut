import classNames from "classnames";
import { useSettings } from "@/logic/application";
import { type LanguageId, supportedLanguages } from "@/shared/types";
import { Button } from "@/shared/ui/Button";

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
        "z-10 flex gap-1 rounded-xl border border-white/20 bg-black/30 p-1",
        className,
      )}
    >
      {supportedLanguages.map((language) => {
        const isActive = settings.language === language.id;
        return (
          <Button
            key={language.id}
            variant="tab"
            size="sm"
            selected={isActive}
            aria-pressed={isActive}
            aria-label={language.label}
            onClick={() => selectLanguage(language.id)}
            className="uppercase"
          >
            {language.id}
          </Button>
        );
      })}
    </div>
  );
}
