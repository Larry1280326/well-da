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

export function AccountManager() {
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
        if (!res.ok) throw new Error("Failed to load accounts.");
        return res.json();
      })
      .then((data) => {
        setAccounts(data.accounts ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load accounts.");
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
        setCreateError(data.error ?? "Failed to create account.");
        return;
      }

      // Reset form and refresh
      setNewUsername("");
      setNewPassword("");
      setNewRole("engineer");
      setNewDisplayName("");
      await loadAccounts();
    } catch {
      setCreateError("An unexpected error occurred.");
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
        alert(data.error ?? "Failed to delete account.");
        return;
      }

      closeDelete();
      setDeleteTarget(null);
      await loadAccounts();
    } catch {
      alert("An unexpected error occurred.");
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
      <Title order={3}>Account Management</Title>

      {/* Create Account Form */}
      <Card withBorder>
        <Title order={5} mb="md">
          Create New Account
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
              label="Username"
              placeholder="Enter username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.currentTarget.value)}
              required
              minLength={3}
              maxLength={255}
              style={{ flex: 1 }}
            />
            <PasswordInput
              label="Password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              required
              minLength={8}
              style={{ flex: 1 }}
            />
            <Select
              label="Role"
              data={ADMIN_ROLES.map((r) => ({ value: r, label: r }))}
              value={newRole}
              onChange={setNewRole}
              required
              style={{ width: 140 }}
            />
            <TextInput
              label="Display Name"
              placeholder="Optional"
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
              Create
            </Button>
          </Group>
        </form>
      </Card>

      {/* Accounts Table */}
      <Card withBorder>
        <Title order={5} mb="md">
          Existing Accounts ({accounts.length})
        </Title>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Username</Table.Th>
              <Table.Th>Display Name</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Last Login</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th w={80}>Actions</Table.Th>
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
                    {acct.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {acct.last_login_at
                    ? new Date(acct.last_login_at).toLocaleDateString("en-GB")
                    : "Never"}
                </Table.Td>
                <Table.Td>
                  {new Date(acct.created_at).toLocaleDateString("en-GB")}
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
                    {acct.is_active ? "Deactivate" : "Inactive"}
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
        title="Deactivate Account"
        size="sm"
      >
        <Stack>
          <Text>
            Are you sure you want to deactivate{" "}
            <strong>{deleteTarget?.username}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            This will prevent them from logging in. Their session data will be
            preserved.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={closeDelete} disabled={deleting}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleting}
            >
              Deactivate
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
