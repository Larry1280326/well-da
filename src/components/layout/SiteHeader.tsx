import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { NavigationBar } from "./NavigationBar";
import type { Locale } from "@/i18n/locale-context";
import classes from "./SiteHeader.module.css";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className={classes.root}>
      <TopBar locale={locale} />
      <MainHeader />
      <NavigationBar />
    </header>
  );
}
