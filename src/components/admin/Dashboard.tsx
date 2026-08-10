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
  TextInput,
  Select,
  Pill,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconInbox,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import type { AdminRole } from "@/lib/auth/types";
import { useDebounce } from "@/hooks/useDebounce";

interface RfqSummary {
  id: number;
  status: string;
  submittedAt: string;
  projectName: string;
  material: string;
  companyName?: string;
}

interface ColumnFilter {
  column: string;
  label: string;
  value: string;
}

export interface DashboardDict {
  title: string;
  columns: {
    reference: string;
    projectName: string;
    company: string;
    material: string;
    status: string;
    submitted: string;
  };
  status: {
    initiated: string;
    reviewing: string;
    quoted: string;
  };
  filter: {
    selectColumn: string;
    selectStatus: string;
    selectColumnFirst: string;
    enterValueHint: string;
  };
  empty: {
    noMatch: string;
    noSubmissions: string;
  };
  error: string;
}

interface DashboardProps {
  role: AdminRole;
  lang: string;
  dict: DashboardDict;
}

export function Dashboard({ role, lang, dict }: DashboardProps) {
  const router = useRouter();

  const FILTER_COLUMNS = [
    { value: "reference", label: dict.columns.reference },
    { value: "projectName", label: dict.columns.projectName },
    { value: "company", label: dict.columns.company },
    { value: "material", label: dict.columns.material },
    { value: "status", label: dict.columns.status },
  ] as const;

  const STATUS_OPTIONS = [
    { value: "initiated", label: dict.status.initiated },
    { value: "reviewing", label: dict.status.reviewing },
    { value: "quoted", label: dict.status.quoted },
  ] as const;
  const [rfqs, setRfqs] = useState<RfqSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 20;

  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const debouncedFilters = useDebounce(filters, 300);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve()
      .then(() => {
        if (cancelled) return;
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        for (const filter of debouncedFilters) {
          if (filter.value) params.set(filter.column, filter.value);
        }
        if (sortOrder !== "desc") params.set("sort", sortOrder);
        return fetch(`/api/admin/rfqs?${params.toString()}`);
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
          setError(dict.error);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [page, debouncedFilters, sortOrder]);

  const addFilter = () => {
    if (!selectedColumn || !filterValue.trim()) return;

    const columnDef = FILTER_COLUMNS.find((c) => c.value === selectedColumn);
    if (!columnDef) return;

    const trimmedValue = filterValue.trim();

    setFilters((prev) => {
      const withoutExisting = prev.filter((f) => f.column !== selectedColumn);
      return [
        ...withoutExisting,
        { column: columnDef.value, label: columnDef.label, value: trimmedValue },
      ];
    });
    setSelectedColumn(null);
    setFilterValue("");
    setPage(1);
  };

  const removeFilter = (column: string) => {
    setFilters((prev) => prev.filter((f) => f.column !== column));
    setPage(1);
  };

  const handleColumnSelect = (value: string | null) => {
    setSelectedColumn(value);
    setFilterValue("");
  };

  const handleValueKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addFilter();
    }
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isEngineer = role === "engineer";
  const hasActiveFilters = filters.length > 0;
  const dateLocale = lang === "zh" ? "zh-HK" : "en-GB";

  const statusColor = (status: string): string => {
    const colors: Record<string, string> = {
      initiated: "blue",
      reviewing: "yellow",
      quoted: "green",
    };
    return colors[status] ?? "gray";
  };

  const statusLabel = (status: string): string =>
    dict.status[status as keyof typeof dict.status] ?? status;

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
          {statusLabel(rfq.status)}
        </Badge>
      </Table.Td>
      <Table.Td>
        {new Date(rfq.submittedAt).toLocaleDateString(dateLocale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack>
      <Title order={3}>{dict.title}</Title>

      {/* Active Filter Pills */}
      {filters.length > 0 && (
        <Group gap="xs" wrap="wrap">
          {filters.map((f) => {
            let displayValue = f.value;
            if (f.column === "status") {
              displayValue =
                f.value.charAt(0).toUpperCase() + f.value.slice(1);
            }
            return (
              <Pill
                key={f.column}
                withRemoveButton
                onRemove={() => removeFilter(f.column)}
                size="md"
              >
                {f.label}: {displayValue}
              </Pill>
            );
          })}
        </Group>
      )}

      {/* Filter Builder Row */}
      <Group align="flex-end" gap="sm">
        <Select
          data={FILTER_COLUMNS.filter(
            (c) => c.value !== "company" || !isEngineer,
          )}
          value={selectedColumn}
          onChange={handleColumnSelect}
          clearable
          placeholder={dict.filter.selectColumn}
          w={180}
        />
        {selectedColumn === "status" ? (
          <Select
            data={STATUS_OPTIONS}
            value={filterValue || null}
            onChange={(val) => {
              if (val) {
                setFilters((prev) => {
                  const withoutExisting = prev.filter(
                    (f) => f.column !== "status",
                  );
                  return [
                    ...withoutExisting,
                    { column: "status", label: dict.columns.status, value: val },
                  ];
                });
                setSelectedColumn(null);
                setFilterValue("");
                setPage(1);
              } else {
                setFilterValue("");
              }
            }}
            placeholder={dict.filter.selectStatus}
            w={180}
          />
        ) : (
          <TextInput
            placeholder={
              selectedColumn
                ? dict.filter.enterValueHint.replace(
                    "{label}",
                    FILTER_COLUMNS.find((c) => c.value === selectedColumn)?.label ?? "",
                  )
                : dict.filter.selectColumnFirst
            }
            value={filterValue}
            onChange={(e) => setFilterValue(e.currentTarget.value)}
            onKeyDown={handleValueKeyDown}
            disabled={!selectedColumn}
            style={{ flex: 1 }}
          />
        )}
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      ) : rfqs.length === 0 ? (
        <Stack align="center" py="xl" gap="md">
          <IconInbox size={48} stroke={1.5} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="lg">
            {hasActiveFilters
              ? dict.empty.noMatch
              : dict.empty.noSubmissions}
          </Text>
        </Stack>
      ) : (
        <>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{dict.columns.reference}</Table.Th>
                <Table.Th>{dict.columns.projectName}</Table.Th>
                {!isEngineer && <Table.Th>{dict.columns.company}</Table.Th>}
                <Table.Th>{dict.columns.material}</Table.Th>
                <Table.Th>{dict.columns.status}</Table.Th>
                <Table.Th
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={handleSortToggle}
                >
                  <Group gap={4} wrap="nowrap">
                    {dict.columns.submitted}
                    {sortOrder === "asc" ? (
                      <IconArrowUp size={14} />
                    ) : (
                      <IconArrowDown size={14} />
                    )}
                  </Group>
                </Table.Th>
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
        </>
      )}
    </Stack>
  );
}
