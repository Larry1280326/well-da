"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  ActionIcon,
  Checkbox,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconFile, IconUpload, IconX } from "@tabler/icons-react";
import type { RfqFormDict } from "@/lib/types/rfq";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
} from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  errors: Record<string, string | undefined>;
  files: File[];
  additionalOptions: string[];
  onFilesChange: (files: File[]) => void;
  onAdditionalOptionsChange: (options: string[]) => void;
}

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadSection({
  dict,
  disabled,
  errors,
  files,
  additionalOptions,
  onFilesChange,
  onAdditionalOptionsChange,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const sec = dict.sections.files;

  function validateFiles(newFiles: File[]): File[] {
    const accepted: File[] = [];
    const totalExisting = files.reduce((s, f) => s + f.size, 0);

    for (const f of newFiles) {
      const ext = getFileExtension(f.name);
      if (!(ACCEPTED_EXTENSIONS as readonly string[]).includes(ext)) {
        setLocalError(`"${f.name}" has an unsupported file type`);
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        setLocalError(`"${f.name}" exceeds the 50 MB per-file limit`);
        continue;
      }
      accepted.push(f);
    }

    const combined = [...files, ...accepted];
    if (combined.length > MAX_FILES) {
      setLocalError(`Maximum ${MAX_FILES} files allowed`);
      return [];
    }

    const totalSize = combined.reduce((s, f) => s + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setLocalError("Total file size exceeds 100 MB");
      return [];
    }

    setLocalError(null);
    return accepted;
  }

  function handleFilesAdded(newFiles: File[]) {
    const valid = validateFiles(newFiles);
    if (valid.length > 0) {
      onFilesChange([...files, ...valid]);
    }
  }

  function handleRemove(index: number) {
    setLocalError(null);
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items?.length > 0) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const dropped = Array.from(e.dataTransfer?.files ?? []);
    if (dropped.length > 0) {
      handleFilesAdded(dropped);
    }
  }

  const toggleOption = (opt: string) => {
    if (additionalOptions.includes(opt)) {
      onAdditionalOptionsChange(additionalOptions.filter((o) => o !== opt));
    } else {
      onAdditionalOptionsChange([...additionalOptions, opt]);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="xs">
        {sec.title}
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        {sec.description}
      </Text>
      <Text size="sm" mb="md">
        {sec.formatsLabel} {sec.formats}
      </Text>

      {/* Drop Zone */}
      <Paper
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        withBorder
        p="xl"
        style={{
          borderStyle: isDragging ? "solid" : "dashed",
          borderColor: isDragging
            ? "var(--mantine-color-green-6)"
            : "var(--mantine-color-gray-4)",
          backgroundColor: isDragging
            ? "var(--mantine-color-green-0)"
            : "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "center",
          transition: "all 0.2s ease",
        }}
        onClick={() => {
          if (!disabled) fileInputRef.current?.click();
        }}
      >
        <Stack align="center" gap="xs">
          <IconUpload size={32} stroke={1.5} color="var(--mantine-color-gray-6)" />
          <Text>{sec.dropText}</Text>
          <Text size="xs" c="dimmed">
            {sec.limits}
          </Text>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.join(",")}
            disabled={disabled}
            style={{ display: "none" }}
            onChange={(e) => {
              const selected = Array.from(e.target.files ?? []);
              if (selected.length > 0) {
                handleFilesAdded(selected);
                // Reset so re-selecting the same file triggers onChange again
                e.target.value = "";
              }
            }}
          />
        </Stack>
      </Paper>

      {/* File error */}
      {(errors.files || localError) && (
        <Text c="red" size="sm" mt="xs">
          {localError || errors.files}
        </Text>
      )}

      {/* File list */}
      {files.length > 0 && (
        <Stack mt="md" gap="xs">
          {files.map((f, i) => (
            <Group
              key={`${f.name}-${i}`}
              justify="space-between"
              p="sm"
              style={{
                border: "1px solid var(--mantine-color-gray-3)",
                borderRadius: "var(--mantine-radius-sm)",
              }}
            >
              <Group gap="sm">
                <IconFile size={20} stroke={1.5} color="var(--mantine-color-gray-6)" />
                <div>
                  <Text size="sm" fw={500}>
                    {f.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatSize(f.size)}
                  </Text>
                </div>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => handleRemove(i)}
                disabled={disabled}
              >
                <IconX size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      {/* Additional options checkboxes */}
      <Stack mt="lg" gap="xs">
        <Checkbox
          label={sec.noDrawingLabel}
          checked={additionalOptions.includes("NO_DRAWING")}
          onChange={() => toggleOption("NO_DRAWING")}
          disabled={disabled}
          suppressHydrationWarning
        />
        <Checkbox
          label={sec.requireNdaLabel}
          checked={additionalOptions.includes("REQUIRE_NDA")}
          onChange={() => toggleOption("REQUIRE_NDA")}
          disabled={disabled}
          suppressHydrationWarning
        />
      </Stack>
    </Paper>
  );
}
