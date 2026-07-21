"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Paper, Text, Badge, Stack, Loader, Group, Divider } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDebounce } from "@/hooks/useDebounce";
import classes from "./SearchOverlay.module.css";

interface SearchEntry {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
  section?: string;
}

interface SearchOverlayProps {
  opened: boolean;
  onClose: () => void;
  query: string;
  locale: string;
}

const MAX_RESULTS = 8;

const CATEGORY_COLORS: Record<string, string> = {
  page: "gray",
  product: "blue",
  capability: "green",
  "case-study": "orange",
  faq: "violet",
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className={classes.highlight}>{match}</mark>
      {after}
    </>
  );
}

export function SearchOverlay({
  opened,
  onClose,
  query,
  locale,
}: SearchOverlayProps) {
  const router = useRouter();
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 150);
  const hasFetched = useRef(false);

  // Fetch index on first open
  useEffect(() => {
    if (opened && !hasFetched.current) {
      hasFetched.current = true;
      setLoading(true);
      fetch(`/search-index-${locale}.json`)
        .then((res) => res.json())
        .then((data: SearchEntry[]) => setIndex(data))
        .catch(() => setIndex([]))
        .finally(() => setLoading(false));
    }
  }, [opened, locale]);

  // Close on Escape
  useEffect(() => {
    if (!opened) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [opened, onClose]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    return index
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.text.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [index, debouncedQuery]);

  const handleViewAll = () => {
    onClose();
    router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
  };

  if (!opened) return null;

  return (
    <Paper className={classes.overlay} shadow="md" p="sm" radius="md" withBorder>
      {loading ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      ) : !debouncedQuery.trim() ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          <IconSearch size={14} style={{ marginRight: 6, verticalAlign: -3 }} />
          Start typing to search...
        </Text>
      ) : results.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No results for &ldquo;{debouncedQuery}&rdquo;
        </Text>
      ) : (
        <>
          <Stack gap={2}>
            {results.map((entry) => (
              <a
                key={entry.id}
                href={`/${locale}${entry.href}`}
                className={classes.resultRow}
                onClick={onClose}
              >
                <Group gap="xs" wrap="nowrap" justify="space-between">
                  <Text size="sm" fw={500} className={classes.resultTitle}>
                    {highlightMatch(entry.title, debouncedQuery)}
                  </Text>
                  <Badge
                    variant="light"
                    size="xs"
                    color={CATEGORY_COLORS[entry.type] || "gray"}
                    className={classes.badge}
                  >
                    {entry.type === "case-study" ? "case" : entry.type}
                  </Badge>
                </Group>
              </a>
            ))}
          </Stack>
          <Divider my="xs" />
          <a className={classes.viewAll} onClick={handleViewAll}>
            View all results ({results.length === MAX_RESULTS ? `${MAX_RESULTS}+` : results.length})
          </a>
        </>
      )}
    </Paper>
  );
}
