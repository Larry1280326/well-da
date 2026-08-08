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

export interface LoginFormDict {
  title: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
}

export function LoginForm({
  lang,
  dict,
}: {
  lang: string;
  dict: LoginFormDict;
}) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Paper p="xl" radius="md" withBorder maw={420} mx="auto" mt="15vh">
      <Title order={2} mb="lg">
        {dict.title}
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
            label={dict.username}
            placeholder={dict.usernamePlaceholder}
            required
            autoComplete="username"
          />
          <PasswordInput
            name="password"
            label={dict.password}
            placeholder={dict.passwordPlaceholder}
            required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth loading={pending} mt="sm">
            {dict.signIn}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
