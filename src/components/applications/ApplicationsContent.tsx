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

interface ApplicationsSection {
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
}: {
  dict: ApplicationsDict;
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
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {dict.sections.map((section, index) => {
              const Icon = ICONS[index] || IconBox;
              const sectionId = section.title
                .toLowerCase()
                .replace(/\s+/g, "-");

              return (
                <Paper
                  key={section.title}
                  id={sectionId}
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
                  <Title order={3} size="h4" mt="md" mb="sm">
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
