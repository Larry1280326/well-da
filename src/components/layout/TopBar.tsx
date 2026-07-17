import { Anchor, Container, Group, Text } from "@mantine/core";
import { IconMail, IconPhone, IconWorld } from "@tabler/icons-react";
import { contactInfo } from "@/config/navigation";
import classes from "./TopBar.module.css";

export function TopBar() {
  return (
    <div className={classes.root}>
      <Container size="xl" className={classes.container}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="lg" wrap="wrap">
            <Anchor
              href={contactInfo.phoneHref}
              className={classes.link}
              underline="never"
            >
              <IconPhone size={14} stroke={1.75} />
              <Text component="span" size="sm">
                {contactInfo.phone}
              </Text>
            </Anchor>
            <Anchor
              href={contactInfo.emailHref}
              className={classes.link}
              underline="never"
            >
              <IconMail size={14} stroke={1.75} />
              <Text component="span" size="sm">
                {contactInfo.email}
              </Text>
            </Anchor>
          </Group>

          <button
            type="button"
            className={classes.langButton}
            aria-label="Select language"
          >
            <IconWorld size={16} stroke={1.75} />
          </button>
        </Group>
      </Container>
    </div>
  );
}
