import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { NavigationBar } from "./NavigationBar";
import classes from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={classes.root}>
      <TopBar />
      <MainHeader />
      <NavigationBar />
    </header>
  );
}
