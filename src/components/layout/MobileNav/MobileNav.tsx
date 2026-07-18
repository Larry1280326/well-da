"use client";

import { usePathname } from "next/navigation";
import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Anchor,
  Drawer,
  Stack,
  Text,
} from "@mantine/core";
import { getNavItems } from "@/config/navigation";
import { useLocale } from "@/i18n/locale-context";
import { HashLink } from "@/components/ui/HashLink";

interface MobileNavProps {
  opened: boolean;
  onClose: () => void;
}

export function MobileNav({ opened, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { locale, dict } = useLocale();
  const navItems = getNavItems(locale);

  function localizeHref(href: string) {
    return `/${locale}${href}`;
  }

  const itemsWithChildren = navItems.filter((item) => item.children?.length);
  const itemsWithoutChildren = navItems.filter((item) => !item.children?.length);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={dict.mobileNav.menu}
      position="left"
      size="xs"
      hiddenFrom="sm"
    >
      <Stack gap="md">
        {itemsWithoutChildren.map((item) => {
          const localizedHref = localizeHref(item.href);
          return (
            <Anchor
              key={item.label}
              component={HashLink}
              href={localizedHref}
              onClick={onClose}
              fw={pathname === localizedHref ? 600 : 500}
              underline="never"
            >
              {item.label}
            </Anchor>
          );
        })}

        <Accordion chevronPosition="right" variant="separated">
          {itemsWithChildren.map((item) => (
            <AccordionItem key={item.label} value={item.label}>
              <AccordionControl>
                <Text fw={500}>{item.label}</Text>
              </AccordionControl>
              <AccordionPanel>
                <Stack gap="xs">
                  <Anchor
                    component={HashLink}
                    href={localizeHref(item.href)}
                    onClick={onClose}
                    size="sm"
                    underline="never"
                  >
                    {dict.mobileNav.overview}
                  </Anchor>
                  {item.children!.map((child) => (
                    <Anchor
                      key={child.href}
                      component={HashLink}
                      href={localizeHref(child.href)}
                      onClick={onClose}
                      size="sm"
                      underline="never"
                    >
                      {child.label}
                    </Anchor>
                  ))}
                </Stack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Stack>
    </Drawer>
  );
}
