"use client";

import {
  Paper,
  Select,
  SimpleGrid,
  TextInput,
  Title,
  Radio,
  Group,
  Checkbox,
  NumberInput,
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

export function MaterialSection({
  dict,
  disabled,
  errors,
  controlledValues,
  controlledArrays,
  onValueChange,
  onArrayChange,
}: Props) {
  const f = dict.fields;
  const showSurfaceOther = controlledValues.surface_finish === "Other";

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        {dict.sections.material.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Select
          label={f.material.label}
          placeholder={f.material.placeholder}
          data={Object.entries(f.material.options ?? {}).map(([value, label]) => ({
            value,
            label,
          }))}
          required
          disabled={disabled}
          value={controlledValues.material || null}
          onChange={(v) => onValueChange("material", v ?? "")}
          error={errors.material}
          suppressHydrationWarning
        />
        <TextInput
          name="material_grade"
          label={f.materialGrade.label}
          placeholder={f.materialGrade.placeholder}
          disabled={disabled}
          error={errors.material_grade}
          suppressHydrationWarning
        />
        <NumberInput
          name="thickness"
          label={f.thickness.label}
          placeholder={f.thickness.placeholder}
          min={0}
          step={0.1}
          disabled={disabled}
          error={errors.thickness}
          suppressHydrationWarning
        />
        <Radio.Group
          name="thickness_unit"
          label={f.thicknessUnit.label}
          value={controlledValues.thickness_unit || null}
          onChange={(v) => onValueChange("thickness_unit", v)}
        >
          <Group mt="xs">
            {Object.entries(f.thicknessUnit.options ?? {}).map(([value, label]) => (
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
        <Select
          label={f.surfaceFinish.label}
          placeholder={f.surfaceFinish.placeholder}
          data={Object.entries(f.surfaceFinish.options ?? {}).map(([value, label]) => ({
            value,
            label,
          }))}
          clearable
          disabled={disabled}
          value={controlledValues.surface_finish || null}
          onChange={(v) => onValueChange("surface_finish", v ?? "")}
          error={errors.surface_finish}
          suppressHydrationWarning
        />
        {showSurfaceOther && (
          <TextInput
            name="surface_finish_other"
            label={f.surfaceFinishOther.label}
            placeholder={f.surfaceFinishOther.placeholder}
            disabled={disabled}
            error={errors.surface_finish_other}
            suppressHydrationWarning
          />
        )}
        {!showSurfaceOther && <div />}
        <TextInput
          name="finish_color"
          label={f.finishColour.label}
          placeholder={f.finishColour.placeholder}
          disabled={disabled}
          error={errors.finish_color}
          suppressHydrationWarning
        />
        <TextInput
          name="critical_tolerance_req"
          label={f.criticalToleranceReq.label}
          placeholder={f.criticalToleranceReq.placeholder}
          disabled={disabled}
          error={errors.critical_tolerance_req}
          suppressHydrationWarning
        />
        <Radio.Group
          name="assembly_required"
          label={f.assemblyRequired.label}
          value={controlledValues.assembly_required || null}
          onChange={(v) => onValueChange("assembly_required", v)}
        >
          <Group mt="xs">
            {Object.entries(f.assemblyRequired.options ?? {}).map(([value, label]) => (
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
        <TextInput
          name="hardware_inserts"
          label={f.hardwareInserts.label}
          placeholder={f.hardwareInserts.placeholder}
          disabled={disabled}
          error={errors.hardware_inserts}
          suppressHydrationWarning
        />
        <Checkbox.Group
          label={f.printingMarking.label}
          value={controlledArrays.printing_marking ?? []}
          onChange={(v) => onArrayChange("printing_marking", v)}
        >
          <Group mt="xs">
            {Object.entries(f.printingMarking.options ?? {}).map(([value, label]) => (
              <Checkbox
                key={value}
                value={value}
                label={label}
                disabled={disabled}
                suppressHydrationWarning
              />
            ))}
          </Group>
        </Checkbox.Group>
      </SimpleGrid>
    </Paper>
  );
}
