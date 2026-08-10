"use client";

import {
  Input,
  Paper,
  Select,
  SimpleGrid,
  TextInput,
  Title,
  Radio,
  Group,
} from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  errors: Record<string, string | undefined>;
  controlledValues: Record<string, string>;
  onValueChange: (key: string, value: string) => void;
}

export function DeliverySection({
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
        {dict.sections.delivery.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Input.Wrapper label={f.requiredDate.label} error={errors.required_date}>
          <Input
            component="input"
            type="date"
            name="required_date"
            disabled={disabled}
            suppressHydrationWarning
          />
        </Input.Wrapper>
        <Radio.Group
          name="required_date_type"
          label={f.requiredDateType.label}
          value={controlledValues.required_date_type || null}
          onChange={(v) => onValueChange("required_date_type", v)}
        >
          <Group mt="xs">
            {Object.entries(f.requiredDateType.options ?? {}).map(([value, label]) => (
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
          label={f.deliveryRegion.label}
          placeholder={f.deliveryRegion.placeholder}
          data={dict.countryList}
          searchable
          clearable
          required
          disabled={disabled}
          value={controlledValues.delivery_region || null}
          onChange={(v) => onValueChange("delivery_region", v ?? "")}
          error={errors.delivery_region}
          suppressHydrationWarning
        />
        <TextInput
          name="postal_code"
          label={f.postalCode.label}
          placeholder={f.postalCode.placeholder}
          disabled={disabled}
          error={errors.postal_code}
          suppressHydrationWarning
        />
        <Radio.Group
          name="shipping_quote_required"
          label={f.shippingQuoteRequired.label}
          value={controlledValues.shipping_quote_required || null}
          onChange={(v) => onValueChange("shipping_quote_required", v)}
        >
          <Group mt="xs">
            {Object.entries(f.shippingQuoteRequired.options ?? {}).map(
              ([value, label]) => (
                <Radio
                  key={value}
                  value={value}
                  label={label}
                  disabled={disabled}
                  suppressHydrationWarning
                />
              ),
            )}
          </Group>
        </Radio.Group>
      </SimpleGrid>
    </Paper>
  );
}
