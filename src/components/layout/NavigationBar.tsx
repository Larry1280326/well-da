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
import { navItems } from "@/config/navigation";
import classes from "./NavigationBar.module.css";

export function NavigationBar() {
  const pathname = usePathname();

  return (
    <nav className={classes.root} aria-label="Main navigation">
      <Container size="xl" className={classes.container}>
        <Group gap={0} wrap="nowrap" visibleFrom="sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            if (!item.children?.length) {
              return (
                <Anchor
                  key={item.label}
                  component={Link}
                  href={item.href}
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
                      href={child.href}
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
