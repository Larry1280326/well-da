"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Title,
  Card,
  Table,
  Badge,
  Button,
  TextInput,
  PasswordInput,
  Select,
  Modal,
  Alert,
  Loader,
  Center,
  Group,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconAlertCircle, IconPlus, IconTrash } from "@tabler/icons-react";
import { ADMIN_ROLES } from "@/lib/auth/types";

interface Account {
  id: number;
  username: string;
  role: string;
  display_name: string | null;
  created_at: string;
  last_login_at: string | null;
  is_active: boolean;
}

export interface AccountManagerDict {
  title: string;
  createTitle: string;
  existingTitle: string;
  username: string;
  usernamePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  role: string;
  displayName: string;
  displayNamePlaceholder: string;
  create: string;
  tableHeaders: {
    username: string;
    displayName: string;
    role: string;
    status: string;
    lastLogin: string;
    created: string;
    actions: string;
  };
  status: {
    active: string;
    inactive: string;
  };
  never: string;
  deactivate: string;
  deleteTitle: string;
  deleteConfirm: string;
  deleteWarning: string;
  cancel: string;
  errors: {
    load: string;
    create: string;
    delete: string;
    unexpected: string;
  };
}

export function AccountManager({
  lang,
  dict,
}: {
  lang: string;
  dict: AccountManagerDict;
}) {
  const dateLocale = lang === "zh" ? "zh-HK" : "en-GB";
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteModalOpen, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string | null>("engineer");
  const [newDisplayName, setNewDisplayName] = useState("");

  const loadAccounts = () => {
    Promise.resolve()
      .then(() => {
        setLoading(true);
        setError(null);
        return fetch("/api/admin/accounts");
      })
      .then((res) => {
        if (!res.ok) throw new Error(dict.errors.load);
        return res.json();
      })
      .then((data) => {
        setAccounts(data.accounts ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(dict.errors.load);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
          displayName: newDisplayName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? dict.errors.create);
        return;
      }

      // Reset form and refresh
      setNewUsername("");
      setNewPassword("");
      setNewRole("engineer");
      setNewDisplayName("");
      await loadAccounts();
    } catch {
      setCreateError(dict.errors.unexpected);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/accounts/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? dict.errors.delete);
        return;
      }

      closeDelete();
      setDeleteTarget(null);
      await loadAccounts();
    } catch {
      alert(dict.errors.unexpected);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {error}
      </Alert>
    );
  }

  const roleColor = (role: string): string =>
    role === "root" ? "red" : role === "owner" ? "blue" : "gray";

  return (
    <Stack>
      <Title order={3}>{dict.title}</Title>

      {/* Create Account Form */}
      <Card withBorder>
        <Title order={5} mb="md">
          {dict.createTitle}
        </Title>
        {createError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            mb="md"
          >
            {createError}
          </Alert>
        )}
        <form onSubmit={handleCreate}>
          <Group align="end" gap="sm" wrap="wrap">
            <TextInput
              label={dict.username}
              placeholder={dict.usernamePlaceholder}
              value={newUsername}
              onChange={(e) => setNewUsername(e.currentTarget.value)}
              required
              minLength={3}
              maxLength={255}
              style={{ flex: 1 }}
            />
            <PasswordInput
              label={dict.password}
              placeholder={dict.passwordPlaceholder}
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              required
              minLength={8}
              style={{ flex: 1 }}
            />
            <Select
              label={dict.role}
              data={ADMIN_ROLES.map((r) => ({ value: r, label: r }))}
              value={newRole}
              onChange={setNewRole}
              required
              style={{ width: 140 }}
            />
            <TextInput
              label={dict.displayName}
              placeholder={dict.displayNamePlaceholder}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.currentTarget.value)}
              maxLength={255}
              style={{ flex: 1 }}
            />
            <Button
              type="submit"
              leftSection={<IconPlus size={16} />}
              loading={creating}
            >
              {dict.create}
            </Button>
          </Group>
        </form>
      </Card>

      {/* Accounts Table */}
      <Card withBorder>
        <Title order={5} mb="md">
          {dict.existingTitle} ({accounts.length})
        </Title>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{dict.tableHeaders.username}</Table.Th>
              <Table.Th>{dict.tableHeaders.displayName}</Table.Th>
              <Table.Th>{dict.tableHeaders.role}</Table.Th>
              <Table.Th>{dict.tableHeaders.status}</Table.Th>
              <Table.Th>{dict.tableHeaders.lastLogin}</Table.Th>
              <Table.Th>{dict.tableHeaders.created}</Table.Th>
              <Table.Th w={80}>{dict.tableHeaders.actions}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {accounts.map((acct) => (
              <Table.Tr
                key={acct.id}
                style={{ opacity: acct.is_active ? 1 : 0.5 }}
              >
                <Table.Td fw={500}>{acct.username}</Table.Td>
                <Table.Td>{acct.display_name ?? "—"}</Table.Td>
                <Table.Td>
                  <Badge
                    color={roleColor(acct.role)}
                    variant="light"
                    size="sm"
                  >
                    {acct.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={acct.is_active ? "green" : "red"}
                    variant="light"
                    size="sm"
                  >
                    {acct.is_active ? dict.status.active : dict.status.inactive}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {acct.last_login_at
                    ? new Date(acct.last_login_at).toLocaleDateString(dateLocale)
                    : dict.never}
                </Table.Td>
                <Table.Td>
                  {new Date(acct.created_at).toLocaleDateString(dateLocale)}
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    size="xs"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => {
                      setDeleteTarget(acct);
                      openDelete();
                    }}
                    disabled={!acct.is_active}
                  >
                    {acct.is_active ? dict.deactivate : dict.status.inactive}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={closeDelete}
        title={dict.deleteTitle}
        size="sm"
      >
        <Stack>
          <Text>
            {dict.deleteConfirm.replace(
              "{username}",
              deleteTarget?.username ?? "",
            )}
          </Text>
          <Text size="sm" c="dimmed">
            {dict.deleteWarning}
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDelete} disabled={deleting}>
              {dict.cancel}
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleting}
            >
              {dict.deactivate}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
