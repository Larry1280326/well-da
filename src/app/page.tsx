import Link from "next/link";
import {
  Button,
  Container,
  Grid,
  GridCol,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

const highlights = [
  {
    title: "Precision Manufacturing",
    description:
      "CNC machining, sheet metal fabrication, and die casting with tight tolerances for demanding applications.",
  },
  {
    title: "Quality Assurance",
    description:
      "Rigorous inspection and testing processes to meet international quality standards across every production run.",
  },
  {
    title: "End-to-End Support",
    description:
      "From prototype to mass production, our engineering team partners with you through design, tooling, and delivery.",
  },
];

export default function HomePage() {
  return (
    <>
      <section
        style={{
          background: "linear-gradient(180deg, #f9fbf9 0%, #ffffff 100%)",
          borderBottom: "1px solid #ececec",
        }}
      >
        <Container size="xl" py={60}>
          <Title order={1} mb="md" maw={640}>
            Precision Metal Manufacturing You Can Rely On
          </Title>
          <Text size="lg" c="dimmed" maw={560} mb="xl">
            Well Da Metal Factory delivers high-quality metal components and
            assemblies for electronics, automotive, medical, and industrial
            customers worldwide.
          </Text>
          <Link href="/quotation">
            <Button
              color="green"
              size="md"
              rightSection={<IconArrowRight size={18} stroke={2} />}
            >
              Request for Quotation
            </Button>
          </Link>
        </Container>
      </section>

      <Container size="xl" py={50}>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {highlights.map((item) => (
            <Paper key={item.title} p="lg" radius="md" withBorder>
              <Title order={3} size="h4" mb="sm">
                {item.title}
              </Title>
              <Text c="dimmed">{item.description}</Text>
            </Paper>
          ))}
        </SimpleGrid>
      </Container>

      <section style={{ background: "#f7f7f7", borderTop: "1px solid #ececec" }}>
        <Container size="xl" py={50}>
          <Grid gap="xl" align="center">
            <GridCol span={{ base: 12, md: 7 }}>
              <Title order={2} mb="sm">
                Trusted Manufacturing Partner Since 1985
              </Title>
              <Text c="dimmed" mb="md">
                Based in Hong Kong, Well Da Metal Factory combines decades of
                experience with modern equipment to produce reliable metal parts
                at scale. Explore our capabilities, quality systems, and case
                studies to learn how we can support your next project.
              </Text>
              <Link href="/about">
                <Button variant="outline" color="gray">
                  Learn About Us
                </Button>
              </Link>
            </GridCol>
            <GridCol span={{ base: 12, md: 5 }}>
              <Paper p="xl" radius="md" withBorder bg="white">
                <Text fw={600} mb="xs">
                  Ready to start your project?
                </Text>
                <Text size="sm" c="dimmed" mb="md">
                  Contact our engineering team at eng@wellda.com or call (+852)
                  2790 5008 for a consultation and quotation.
                </Text>
                <Link href="/quotation">
                  <Button color="green" fullWidth>
                    Get a Quote
                  </Button>
                </Link>
              </Paper>
            </GridCol>
          </Grid>
        </Container>
      </section>
    </>
  );
}
