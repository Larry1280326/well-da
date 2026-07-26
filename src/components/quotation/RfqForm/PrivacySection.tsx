"use client";

import { Anchor, Checkbox, Paper, Text } from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  error?: string;
}

export function PrivacySection({ dict, disabled, error }: Props) {
  const sec = dict.sections.privacy;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Text size="sm" mb="md">
        {sec.text}{" "}
        <Anchor href="/privacy" underline="always">
          Privacy Policy
        </Anchor>
      </Text>
      <Checkbox
        name="privacy_accepted"
        label={sec.checkboxLabel}
        required
        disabled={disabled}
        error={error}
        suppressHydrationWarning
      />
    </Paper>
  );
}
