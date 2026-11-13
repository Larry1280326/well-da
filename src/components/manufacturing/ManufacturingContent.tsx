import { Container, Text, Title } from "@mantine/core";
import { CapabilityItem, type Capability } from "./CapabilityItem";
import Link from "next/link";
import { Button } from "@mantine/core";
import { productSlugs, type ProductSlug } from "@/config/products";

export interface ManufacturingDict {
  pageTitle: string;
  sectionTitle: string;
  intro: string;
  capabilities: Capability[];
  materials: string;
}

export function ManufacturingContent({
  dict,
  locale, guide, products, quoteLabel,
}: {
  dict: ManufacturingDict;
  locale: string;
  guide: { title: string; text: string };
  products: Record<ProductSlug, { title: string }>;
  quoteLabel: string;
}) {
  return (
    <>
      {/* Page Title Section */}
      <section
        style={{
          background: "linear-gradient(180deg, #f9fbf9 0%, #ffffff 100%)",
          borderBottom: "1px solid #ececec",
          scrollMarginTop: 80,
        }}
      >
        <Container size="xl" py={60}>
          <Title order={1}>{dict.pageTitle}</Title>
        </Container>
      </section>

      {/* Capabilities Section */}
      <section id="integrated_sheet_metal" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <Title order={2} mb="md">
            {dict.sectionTitle}
          </Title>
          <Text c="dimmed" maw={720} mb="xl">
            {dict.intro}
          </Text>

          <ul
            style={{
              paddingLeft: 0,
            listStyleType: "none",
              marginBottom: "var(--mantine-spacing-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--mantine-spacing-sm)",
            }}
          >
            {dict.capabilities.map((capability) => (
              <CapabilityItem
                key={capability.label}
                capability={capability}
              />
            ))}
          </ul>

          <Text c="dimmed" maw={720}>
            {dict.materials}
          </Text>
          <Title order={2} mt="xl" mb="md">{guide.title}</Title>
          <Text maw={850} mb="lg">{guide.text}</Text>
          <ul>{productSlugs.map(slug => <li key={slug}><Link href={`/${locale}/applications/${slug}`}>{products[slug].title}</Link></li>)}</ul>
          <Button component="a" href={`/${locale}/quotation?source=/${locale}/manufacturing`}>{quoteLabel}</Button>
        </Container>
      </section>
    </>
  );
}
