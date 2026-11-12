import {
  Container,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAntenna,
  IconBolt,
  IconBox,
  IconBuildingWarehouse,
  IconShieldLock,
  IconTool,
} from "@tabler/icons-react";
import Link from "next/link";
import { productSlugs, type ProductSlug } from "@/config/products";

interface ApplicationsSection {
  slug: string;
  title: string;
  description: string;
}

interface ApplicationsDict {
  pageTitle: string;
  sections: ApplicationsSection[];
}

const ICONS = [
  IconBox,
  IconBolt,
  IconBuildingWarehouse,
  IconAntenna,
  IconShieldLock,
  IconTool,
];

export function ApplicationsContent({
  dict,
  locale,
  products,
}: {
  dict: ApplicationsDict;
  locale: string;
  products: Record<ProductSlug, { title: string; intro: string }>;
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

      {/* Product Cards Section */}
      <section style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
            {productSlugs.map(slug => <Paper key={slug} p="xl" radius="md" withBorder>
              <Title order={2} size="h3" mb="sm"><Link href={`/${locale}/applications/${slug}`}>{products[slug].title}</Link></Title>
              <Text>{products[slug].intro}</Text>
            </Paper>)}
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {dict.sections.map((section, index) => {
              const Icon = ICONS[index] || IconBox;

              return (
                <Paper
                  key={section.slug}
                  id={section.slug}
                  p="xl"
                  radius="md"
                  withBorder
                  h="100%"
                  style={{ scrollMarginTop: 80 }}
                >
                  <Icon
                    size={36}
                    stroke={1.5}
                    color="var(--mantine-color-green-6)"
                  />
                  <Title order={2} size="h4" mt="md" mb="sm">
                    {section.title}
                  </Title>
                  <Text c="dimmed">{section.description}</Text>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
}
