"use client";

import Link from "next/link";
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
import { navItems } from "@/config/navigation";

interface MobileNavProps {
  opened: boolean;
  onClose: () => void;
}

export function MobileNav({ opened, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const itemsWithChildren = navItems.filter((item) => item.children?.length);
  const itemsWithoutChildren = navItems.filter((item) => !item.children?.length);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title="Menu"
      position="left"
      size="xs"
      hiddenFrom="sm"
    >
      <Stack gap="md">
        {itemsWithoutChildren.map((item) => (
          <Anchor
            key={item.label}
            component={Link}
            href={item.href}
            onClick={onClose}
            fw={pathname === item.href ? 600 : 500}
            underline="never"
          >
            {item.label}
          </Anchor>
        ))}

        <Accordion chevronPosition="right" variant="separated">
          {itemsWithChildren.map((item) => (
            <AccordionItem key={item.label} value={item.label}>
              <AccordionControl>
                <Text fw={500}>{item.label}</Text>
              </AccordionControl>
              <AccordionPanel>
                <Stack gap="xs">
                  <Anchor
                    component={Link}
                    href={item.href}
                    onClick={onClose}
                    size="sm"
                    underline="never"
                  >
                    Overview
                  </Anchor>
                  {item.children!.map((child) => (
                    <Anchor
                      key={child.href}
                      component={Link}
                      href={child.href}
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
