import { Anchor, Container, Group, Text } from "@mantine/core";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { getContactInfo } from "@/config/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { Locale } from "@/i18n/locale-context";
import classes from "./TopBar.module.css";

export function TopBar({ locale }: { locale: Locale }) {
  const contact = getContactInfo(locale);

  return (
    <div className={classes.root}>
      <Container size="xl" className={classes.container}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="lg" wrap="wrap">
            <Anchor
              href={contact.phoneHref}
              className={classes.link}
              underline="never"
            >
              <IconPhone size={14} stroke={1.75} />
              <Text component="span" size="sm">
                {contact.phone}
              </Text>
            </Anchor>
            <Anchor
              href={contact.emailHref}
              className={classes.link}
              underline="never"
            >
              <IconMail size={14} stroke={1.75} />
              <Text component="span" size="sm">
                {contact.email}
              </Text>
            </Anchor>
          </Group>

          <LanguageSwitcher />
        </Group>
      </Container>
    </div>
  );
}
