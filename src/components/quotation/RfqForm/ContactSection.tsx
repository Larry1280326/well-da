"use client";

import { Paper, Select, SimpleGrid, TextInput, Title, Radio, Group } from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  errors: Record<string, string | undefined>;
  controlledValues: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

export function ContactSection({
  dict,
  disabled,
  errors,
  controlledValues,
  onValueChange,
}: Props) {
  const f = dict.fields;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        {dict.sections.contact.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          name="company_name"
          label={f.companyName.label}
          placeholder={f.companyName.placeholder}
          required
          disabled={disabled}
          error={errors.company_name}
          suppressHydrationWarning
        />
        <TextInput
          name="contact_name"
          label={f.contactName.label}
          placeholder={f.contactName.placeholder}
          required
          disabled={disabled}
          error={errors.contact_name}
          suppressHydrationWarning
        />
        <TextInput
          name="email"
          type="email"
          label={f.email.label}
          placeholder={f.email.placeholder}
          required
          disabled={disabled}
          error={errors.email}
          suppressHydrationWarning
        />
        <TextInput
          name="phone"
          type="tel"
          label={f.phone.label}
          placeholder={f.phone.placeholder}
          disabled={disabled}
          error={errors.phone}
          suppressHydrationWarning
        />
        <Select
          label={f.countryRegion.label}
          placeholder={f.countryRegion.placeholder}
          data={dict.countryList}
          searchable
          clearable
          required
          disabled={disabled}
          value={controlledValues.country_region || null}
          onChange={(v) => onValueChange("country_region", v ?? "")}
          error={errors.country_region}
          suppressHydrationWarning
        />
        <Radio.Group
          name="preferred_method"
          label={f.preferredMethod.label}
          value={controlledValues.preferred_method || null}
          onChange={(v) => onValueChange("preferred_method", v)}
        >
          <Group mt="xs">
            {Object.entries(f.preferredMethod.options ?? {}).map(([value, label]) => (
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
