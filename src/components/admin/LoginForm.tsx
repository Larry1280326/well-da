"use client";

import { useActionState } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Alert,
  Paper,
  Title,
  Stack,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { login } from "@/app/actions/admin";

export function LoginForm({ lang }: { lang: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Paper p="xl" radius="md" withBorder maw={420} mx="auto" mt="15vh">
      <Title order={2} mb="lg">
        Admin Login
      </Title>

      {state?.error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          mb="md"
          variant="light"
        >
          {state.error}
        </Alert>
      )}

      <form action={action}>
        <input type="hidden" name="lang" value={lang} />
        <Stack>
          <TextInput
            name="username"
            label="Username"
            placeholder="Enter your username"
            required
            autoComplete="username"
          />
          <PasswordInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={pending} mt="sm">
            Sign In
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
