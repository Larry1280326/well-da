"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  TextInput,
  Text,
  Paper,
  Badge,
  Stack,
  Group,
  Title,
  Loader,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./SearchContent.module.css";

interface SearchEntry {
  id: string;
  type: string;
  title: string;
  text: string;
  href: string;
  section?: string;
}

interface SearchDict {
  pageTitle: string;
  placeholder: string;
  noQuery: string;
  noResults: string;
  viewAll: string;
  categories: Record<string, string>;
}

interface SearchContentProps {
  dict: SearchDict;
  locale: string;
  initialQuery: string;
}

const MAX_SNIPPET_LENGTH = 200;

function highlightText(text: string, query: string): React.ReactNode {
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

function getSnippet(text: string, query: string): string {
  if (!query) return text.slice(0, MAX_SNIPPET_LENGTH);
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) return text.slice(0, MAX_SNIPPET_LENGTH);

  // Expand around the match
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 140);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

const CATEGORY_COLORS: Record<string, string> = {
  page: "gray",
  product: "blue",
  capability: "green",
  "case-study": "orange",
  faq: "violet",
};

export function SearchContent({
  dict,
  locale,
  initialQuery,
}: SearchContentProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/search-index-${locale}.json`);
        if (!res.ok) throw new Error("Failed to load search index");
        const data: SearchEntry[] = await res.json();
        if (!cancelled) setIndex(data);
      } catch {
        if (!cancelled) setIndex([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return index.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.text.toLowerCase().includes(q),
    );
  }, [index, query]);

  const grouped = useMemo(() => {
    const map: Record<string, SearchEntry[]> = {};
    for (const r of results) {
      const type = r.type;
      if (!map[type]) map[type] = [];
      map[type].push(r);
    }
    return map;
  }, [results]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        router.replace(`/${locale}/search?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [query, locale, router],
  );

  return (
    <Container size="md" className={classes.wrapper}>
      <Title order={1} mb="lg">
        {dict.pageTitle}
      </Title>

      <form onSubmit={handleSubmit} className={classes.searchBar}>
        <TextInput
          placeholder={dict.placeholder}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={18} stroke={1.75} />}
          size="lg"
          autoFocus
          classNames={{ input: classes.searchInput }}
        />
      </form>

      {loading ? (
        <Group justify="center" mt="xl">
          <Loader size="sm" />
        </Group>
      ) : !query.trim() ? (
        <Text c="dimmed" ta="center" mt="xl" className={classes.emptyState}>
          {dict.noQuery}
        </Text>
      ) : results.length === 0 ? (
        <Text c="dimmed" ta="center" mt="xl" className={classes.emptyState}>
          {dict.noResults} &ldquo;{query}&rdquo;
        </Text>
      ) : (
        <Stack gap="lg" mt="lg">
          {Object.entries(grouped).map(([type, entries]) => (
            <div key={type}>
              <Badge
                variant="light"
                color={CATEGORY_COLORS[type] || "gray"}
                mb="xs"
              >
                {dict.categories[type === "case-study" ? "caseStudy" : type] ||
                  type}
              </Badge>
              <Stack gap="sm">
                {entries.map((entry) => (
                  <Paper
                    key={entry.id}
                    component={Link}
                    href={`/${locale}${entry.href}`}
                    className={classes.resultCard}
                    withBorder
                    p="md"
                    radius="md"
                  >
                    <Text fw={600} className={classes.resultTitle}>
                      {highlightText(entry.title, query)}
                    </Text>
                    {entry.section && (
                      <Text size="xs" c="dimmed" mb={2}>
                        {entry.section}
                      </Text>
                    )}
                    {entry.text !== entry.title && (
                      <Text size="sm" c="dimmed" className={classes.resultSnippet}>
                        {highlightText(
                          getSnippet(entry.text, query),
                          query,
                        )}
                      </Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            </div>
          ))}
        </Stack>
      )}
    </Container>
  );
}
