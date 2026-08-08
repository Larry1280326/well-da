"use client";

import { Alert, Button, Paper, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";
import type { RfqFormDict, SuccessData } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  data: SuccessData;
  emailWarning?: string;
  onReset: () => void;
}

export function SuccessPanel({ dict, data, emailWarning }: Props) {
  const s = dict.success;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack gap="lg">
        <Alert
          variant="light"
          color="green"
          title={s.title}
          icon={<IconCheck size={24} />}
        >
          <Text mt="xs">{s.message}</Text>
        </Alert>

        {emailWarning && (
          <Alert
            variant="light"
            color="yellow"
            title={s.emailWarningTitle}
            icon={<IconAlertTriangle size={24} />}
          >
            <Text mt="xs">
              {s.emailWarningDesc
                .replace("{reason}", emailWarning)
                .replace("{email}", data.email)}
            </Text>
          </Alert>
        )}

        <Stack gap="md">
          <div>
            <Text size="sm" c="dimmed">
              {s.referenceLabel}
            </Text>
            <Text fw={700} size="lg">
              {data.reference}
            </Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              {s.projectLabel}
            </Text>
            <Text fw={500}>{data.projectName}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              {s.dateLabel}
            </Text>
            <Text>{data.submittedAt}</Text>
          </div>
          <div>
            <Text size="sm" c="dimmed">
              {s.emailLabel}
            </Text>
            <Text>{data.email}</Text>
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}
