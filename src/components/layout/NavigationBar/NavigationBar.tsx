"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Container,
  Group,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { getNavItems } from "@/config/navigation";
import { useLocale } from "@/i18n/locale-context";
import classes from "./NavigationBar.module.css";

export function NavigationBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const navItems = getNavItems(locale);

  function localizeHref(href: string) {
    return `/${locale}${href}`;
  }

  return (
    <nav className={classes.root} aria-label="Main navigation">
      <Container size="xl" className={classes.container}>
        <Group gap={0} wrap="nowrap" visibleFrom="sm">
          {navItems.map((item) => {
            const localizedHref = localizeHref(item.href);
            const isActive =
              pathname === localizedHref ||
              pathname.startsWith(`${localizedHref}/`) ||
              pathname === `/${locale}${item.href}`;

            if (!item.children?.length) {
              return (
                <Anchor
                  key={item.label}
                  component={Link}
                  href={localizedHref}
                  className={classes.navLink}
                  data-active={isActive || undefined}
                  underline="never"
                >
                  {item.label}
                </Anchor>
              );
            }

            return (
              <Menu
                key={item.label}
                trigger="click-hover"
                openDelay={100}
                closeDelay={150}
                withinPortal
              >
                <MenuTarget>
                  <UnstyledButton
                    className={classes.navButton}
                    data-active={isActive || undefined}
                    aria-haspopup="menu"
                  >
                    <Text component="span" size="sm" fw={500}>
                      {item.label}
                    </Text>
                    <IconChevronDown size={14} stroke={2} />
                  </UnstyledButton>
                </MenuTarget>

                <MenuDropdown>
                  {item.children.map((child) => (
                    <MenuItem
                      key={child.href}
                      component={Link}
                      href={localizeHref(child.href)}
                    >
                      {child.label}
                    </MenuItem>
                  ))}
                </MenuDropdown>
              </Menu>
            );
          })}
        </Group>
      </Container>
    </nav>
  );
}
