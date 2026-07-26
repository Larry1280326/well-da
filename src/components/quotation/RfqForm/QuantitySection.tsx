"use client";

import {
  Paper,
  SimpleGrid,
  TextInput,
  Title,
} from "@mantine/core";
import type { RfqFormDict } from "@/lib/types/rfq";

interface Props {
  dict: RfqFormDict;
  disabled: boolean;
  errors: Record<string, string | undefined>;
}

export function QuantitySection({ dict, disabled, errors }: Props) {
  const f = dict.fields;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Title order={3} mb="lg">
        {dict.sections.quantity.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <TextInput
          name="prototype_quantity"
          label={f.prototypeQuantity.label}
          placeholder={f.prototypeQuantity.placeholder}
          disabled={disabled}
          error={errors.prototype_quantity}
          suppressHydrationWarning
        />
        <TextInput
          name="production_quantity"
          label={f.productionQuantity.label}
          placeholder={f.productionQuantity.placeholder}
          required
          disabled={disabled}
          error={errors.production_quantity}
          suppressHydrationWarning
        />
        <TextInput
          name="est_annual_vol"
          label={f.estAnnualVol.label}
          placeholder={f.estAnnualVol.placeholder}
          disabled={disabled}
          error={errors.est_annual_vol}
          suppressHydrationWarning
        />
      </SimpleGrid>
    </Paper>
  );
}
