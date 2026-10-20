import { t } from "i18next";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "../../../../../../brand-assets/svg/logo-horizontal-dark.svg";
import { LandingFooter } from "../menu/landing/LandingFooter";
import { LanguageSwitcher } from "../menu/landing/LanguageSwitcher";

export function NewsPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0f172a] text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" aria-label={t("news.home")}>
            <img src={logo} alt="Kampánykörút" className="h-8 w-auto" />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
