import { Container, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { IconAssembly } from "@tabler/icons-react";

interface CaseStudySection {
  slug: string;
  title: string;
  description: string;
}

interface CaseStudiesDict {
  pageTitle: string;
  sections: CaseStudySection[];
}

export function CaseStudiesContent({ dict }: { dict: CaseStudiesDict }) {
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

      {/* Case Study Cards Section */}
      <section id="overview" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {dict.sections.map((section) => (
              <Paper
                key={section.slug}
                id={section.slug}
                p="xl"
                radius="md"
                withBorder
                h="100%"
                style={{ scrollMarginTop: 80 }}
              >
                <IconAssembly
                  size={36}
                  stroke={1.5}
                  color="var(--mantine-color-green-6)"
                />
                <Title order={3} size="h4" mt="md" mb="sm">
                  {section.title}
                </Title>
                {section.description.split("\n\n").map((para, i) => (
                  <Text key={i} c="dimmed" mb={i === 0 ? "sm" : undefined}>
                    {para}
                  </Text>
                ))}
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
}
