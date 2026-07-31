"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  Title,
  Alert,
  Loader,
  Center,
  Pagination,
  Group,
  Badge,
  Stack,
  Text,
} from "@mantine/core";
import { IconAlertCircle, IconInbox } from "@tabler/icons-react";
import type { AdminRole } from "@/lib/auth/types";

interface RfqSummary {
  id: number;
  status: string;
  submittedAt: string;
  projectName: string;
  material: string;
  companyName?: string;
}

interface DashboardProps {
  role: AdminRole;
  lang: string;
}

export function Dashboard({ role, lang }: DashboardProps) {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RfqSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setError(null);
        return fetch(`/api/admin/rfqs?page=${page}&limit=${limit}`);
      })
      .then((res) => {
        if (cancelled || !res) return;
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setRfqs(data.rfqs ?? []);
          setTotal(data.total ?? 0);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load RFQ submissions.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isEngineer = role === "engineer";

  const statusColor = (status: string): string => {
    const colors: Record<string, string> = {
      initiated: "blue",
      reviewing: "yellow",
      quoted: "green",
    };
    return colors[status] ?? "gray";
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

  if (rfqs.length === 0) {
    return (
      <Stack align="center" py="xl" gap="md">
        <IconInbox size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
        <Text c="dimmed" size="lg">
          No RFQ submissions yet.
        </Text>
      </Stack>
    );
  }

  const rows = rfqs.map((rfq) => (
    <Table.Tr
      key={rfq.id}
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/${lang}/administrator/rfq/${rfq.id}`)}
    >
      <Table.Td>RFQ-{new Date(rfq.submittedAt).getFullYear()}-{String(rfq.id).padStart(6, "0")}</Table.Td>
      <Table.Td fw={500}>{rfq.projectName}</Table.Td>
      {!isEngineer && <Table.Td>{rfq.companyName ?? "—"}</Table.Td>}
      <Table.Td>{rfq.material}</Table.Td>
      <Table.Td>
        <Badge color={statusColor(rfq.status)} variant="light" size="sm">
          {rfq.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        {new Date(rfq.submittedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Title order={3}>RFQ Submissions</Title>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Reference</Table.Th>
            <Table.Th>Project Name</Table.Th>
            {!isEngineer && <Table.Th>Company</Table.Th>}
            <Table.Th>Material</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Submitted</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center" mt="md">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
          />
        </Group>
      )}
    </Stack>
  );
}
