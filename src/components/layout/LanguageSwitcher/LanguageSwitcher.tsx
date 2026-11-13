"use client";

import { useRouter, usePathname } from "next/navigation";
import { IconWorld } from "@tabler/icons-react";
import { useLocale } from "@/i18n/locale-context";
import classes from "../TopBar/TopBar.module.css";
import { sourcePage } from "@/lib/rfq-source";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, dict } = useLocale();

  function handleSwitch() {
    const newLocale = locale === "en" ? "zh" : "en";

    // Replace the locale segment in the pathname (preserves hash & query)
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLocale;

    // Set cookie so proxy remembers the choice
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    // Keep search/hash navigation and translate only a validated attribution path.
    const query = new URLSearchParams(window.location.search);
    const source = sourcePage(query.get("source"));
    if (source) query.set("source", source.replace(/^\/(en|zh)(?=\/|$)/, `/${newLocale}`));
    else query.delete("source");
    router.push("/" + segments.join("/") + (query.size ? `?${query}` : "") + window.location.hash);
  }

  return (
    <button
      type="button"
      className={classes.langButton}
      onClick={handleSwitch}
      aria-label={`Switch language to ${dict.topBar.switchTo}`}
    >
      <IconWorld size={16} stroke={1.75} />
      <span style={{ marginLeft: 4, fontSize: "0.8rem" }}>
        {dict.topBar.switchTo}
      </span>
    </button>
  );
}
