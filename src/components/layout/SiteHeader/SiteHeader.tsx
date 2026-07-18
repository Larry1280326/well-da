import { TopBar } from "../TopBar/TopBar";
import { MainHeader } from "../MainHeader/MainHeader";
import { NavigationBar } from "../NavigationBar/NavigationBar";
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
