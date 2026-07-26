"use client";

import {
  Paper,
  SimpleGrid,
  TextInput,
  Title,
  MultiSelect,
  Radio,
  Group,
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

export function PartProjectSection({
  dict,
  disabled,
  errors,
  controlledValues,
  controlledArrays,
  onValueChange,
  onArrayChange,
}: Props) {
  const f = dict.fields;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        {dict.sections.partProject.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          name="project_name"
          label={f.projectName.label}
          placeholder={f.projectName.placeholder}
          required
          disabled={disabled}
          error={errors.project_name}
          suppressHydrationWarning
        />
        <TextInput
          name="part_number"
          label={f.partNumber.label}
          placeholder={f.partNumber.placeholder}
          disabled={disabled}
          error={errors.part_number}
          suppressHydrationWarning
        />
        <TextInput
          name="drawing_code"
          label={f.drawingNumber.label}
          placeholder={f.drawingNumber.placeholder}
          disabled={disabled}
          error={errors.drawing_code}
          suppressHydrationWarning
        />
        <TextInput
          name="drawing_revision"
          label={f.drawingRevision.label}
          placeholder={f.drawingRevision.placeholder}
          disabled={disabled}
          error={errors.drawing_revision}
          suppressHydrationWarning
        />
        <MultiSelect
          label={f.productType.label}
          placeholder={f.productType.placeholder}
          data={Object.entries(f.productType.options ?? {}).map(([value, label]) => ({
            value,
            label,
          }))}
          clearable
          disabled={disabled}
          value={controlledArrays.product_type ?? []}
          onChange={(v) => onArrayChange("product_type", v)}
          error={errors.product_type}
          suppressHydrationWarning
        />
        <Radio.Group
          name="drawing_avail"
          label={f.drawingAvail.label}
          required
          value={controlledValues.drawing_avail || null}
          onChange={(v) => onValueChange("drawing_avail", v)}
          error={errors.drawing_avail}
        >
          <Group mt="xs">
            {Object.entries(f.drawingAvail.options ?? {}).map(([value, label]) => (
              <Radio
                key={value}
                value={value}
                label={label}
                disabled={disabled}
                suppressHydrationWarning
              />
            ))}
          </Group>
        </Radio.Group>
      </SimpleGrid>
    </Paper>
  );
}
