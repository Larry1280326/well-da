"use client";

import { useState } from "react";
import {
  Button,
  Collapse,
  Group,
  MultiSelect,
  Paper,
  SimpleGrid,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  errors: Record<string, string | undefined>;
  controlledValues: Record<string, string>;
  controlledArrays: Record<string, string[]>;
  onValueChange: (key: string, value: string) => void;
  onArrayChange: (key: string, value: string[]) => void;
}

export function TechnicalSection({
  dict,
  disabled,
  errors,
  controlledValues,
  controlledArrays,
  onValueChange,
  onArrayChange,
}: Props) {
  const f = dict.fields;
  const [opened, setOpened] = useState(false);
  const showProtectionOther = (controlledArrays.protection_req ?? []).includes("Not Sure") ||
    controlledValues.protection_req_other;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Group justify="space-between" mb={opened ? "lg" : 0}>
        <Title order={3}>{dict.sections.technical.title}</Title>
        <Button
          variant="subtle"
          onClick={() => setOpened((o) => !o)}
        >
          {opened
            ? dict.sections.technical.toggleHide
            : dict.sections.technical.toggleShow}
        </Button>
      </Group>
      <Collapse expanded={opened}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
          <TextInput
            name="approx_dimensions"
            label={f.approxDimensions.label}
            placeholder={f.approxDimensions.placeholder}
            disabled={disabled}
            error={errors.approx_dimensions}
            suppressHydrationWarning
          />
          <MultiSelect
            label={f.operatingEnv.label}
            placeholder={f.operatingEnv.placeholder}
            data={Object.entries(f.operatingEnv.options ?? {}).map(([value, label]) => ({
              value,
              label,
            }))}
            clearable
            disabled={disabled}
            value={controlledArrays.operating_env ?? []}
            onChange={(v) => onArrayChange("operating_env", v)}
            suppressHydrationWarning
          />
          <MultiSelect
            label={f.protectionReq.label}
            placeholder={f.protectionReq.placeholder}
            data={Object.entries(f.protectionReq.options ?? {}).map(([value, label]) => ({
              value,
              label,
            }))}
            clearable
            disabled={disabled}
            value={controlledArrays.protection_req ?? []}
            onChange={(v) => onArrayChange("protection_req", v)}
            suppressHydrationWarning
          />
          {showProtectionOther && (
            <TextInput
              name="protection_req_other"
              label={f.protectionReqOther.label}
              placeholder={f.protectionReqOther.placeholder}
              disabled={disabled}
              error={errors.protection_req_other}
              suppressHydrationWarning
            />
          )}
          {!showProtectionOther && <div />}
          <MultiSelect
            label={f.inspectionReq.label}
            placeholder={f.inspectionReq.placeholder}
            data={Object.entries(f.inspectionReq.options ?? {}).map(([value, label]) => ({
              value,
              label,
            }))}
            clearable
            disabled={disabled}
            value={controlledArrays.inspection_req ?? []}
            onChange={(v) => onArrayChange("inspection_req", v)}
            suppressHydrationWarning
          />
          <MultiSelect
            label={f.certReport.label}
            placeholder={f.certReport.placeholder}
            data={Object.entries(f.certReport.options ?? {}).map(([value, label]) => ({
              value,
              label,
            }))}
            clearable
            disabled={disabled}
            value={controlledArrays.cert_report ?? []}
            onChange={(v) => onArrayChange("cert_report", v)}
            suppressHydrationWarning
          />
        </SimpleGrid>
        <Textarea
          name="special_req_notes"
          label={f.specialReqNotes.label}
          placeholder={f.specialReqNotes.placeholder}
          mt="md"
          minRows={3}
          maxRows={6}
          maxLength={5000}
          disabled={disabled}
          error={errors.special_req_notes}
          suppressHydrationWarning
        />
      </Collapse>
    </Paper>
  );
}
