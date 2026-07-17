import Link from "next/link";
import {
  Button,
  Container,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconAward,
  IconCalendar,
  IconRulerMeasure,
  IconSettings,
  IconUpload,
} from "@tabler/icons-react";

const trustItems = [
  { icon: IconCalendar, label: "Established in 1992" },
  { icon: IconAward, label: "ISO 9001" },
  { icon: IconSettings, label: "Custom Manufacturing" },
  { icon: IconRulerMeasure, label: "Precision up to ±0.2 mm" },
];

export function AboutContent() {
  return (
    <>
      {/* Profile Section */}
      <section
        id="profile"
        style={{
          background: "linear-gradient(180deg, #f9fbf9 0%, #ffffff 100%)",
          borderBottom: "1px solid #ececec",
          scrollMarginTop: 80,
        }}
      >
        <Container size="xl" py={60}>
          <Title order={2} mb="md">
            Trusted Sheet Metal Manufacturing Since 1992
          </Title>
          <Text c="dimmed" maw={640} mb="md">
            Custom metal enclosures and sheet metal products made with specified
            materials, proven workmanship and careful quality control.
          </Text>
          <Text c="dimmed" maw={640}>
            From electrical boxes and equipment cabinets to non-standard metal
            components, we manufacture according to your confirmed drawings and
            project requirements.
          </Text>
        </Container>
      </section>

      {/* CTA Section */}
      <section id="cta" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <Title order={2} mb="lg">
            Work With Us
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Paper p="xl" radius="md" withBorder>
              <Title order={3} size="h4" mb="sm">
                Send Us Your Drawing
              </Title>
              <Text c="dimmed" mb="lg">
                Share your CAD files, blueprints, or sketches — our engineering
                team will review your specifications and provide feedback.
              </Text>
              <Link href="/quotation">
                <Button
                  color="green"
                  variant="outline"
                  rightSection={<IconUpload size={18} stroke={2} />}
                >
                  Upload Drawing
                </Button>
              </Link>
            </Paper>
            <Paper p="xl" radius="md" withBorder>
              <Title order={3} size="h4" mb="sm">
                Request a Quotation
              </Title>
              <Text c="dimmed" mb="lg">
                Get a competitive quote for your manufacturing project. Provide
                your requirements and we&apos;ll respond with pricing and lead
                times.
              </Text>
              <Link href="/quotation">
                <Button
                  color="green"
                  rightSection={<IconArrowRight size={18} stroke={2} />}
                >
                  Get a Quote
                </Button>
              </Link>
            </Paper>
          </SimpleGrid>
        </Container>
      </section>

      {/* Core Value Proposition Section */}
      <section
        id="core-value"
        style={{
          background: "linear-gradient(180deg, #f9fbf9 0%, #ffffff 100%)",
          borderBottom: "1px solid #ececec",
          scrollMarginTop: 80,
        }}
      >
        <Container size="xl" py={60}>
          <Title order={2} mb="md">
            Flexible Manufacturing for Custom and Non-Standard Projects
          </Title>
          <Text c="dimmed" maw={640} mb="md">
            We support prototype, low-volume and production orders with flexible
            manufacturing, practical engineering communication and a complete
            range of sheet metal processes.
          </Text>
          <Text c="dimmed" maw={640}>
            Whether you have a finished drawing, a sample or an initial product
            concept, our team can help evaluate the manufacturing requirements
            and recommend a suitable production approach.
          </Text>
        </Container>
      </section>

      {/* Trust Line Section */}
      <section
        id="trust-line"
        style={{
          background: "#f7f7f7",
          borderTop: "1px solid #ececec",
          scrollMarginTop: 80,
        }}
      >
        <Container size="xl" py={60}>
          <Title order={2} mb="md">
            Trust Line
          </Title>
          <Text c="dimmed" maw={640} mb="xl">
            Our credentials and capabilities reflect decades of dedication to
            quality and precision in metal manufacturing.
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            {trustItems.map((item) => (
              <Paper key={item.label} p="lg" radius="md" withBorder h="100%">
                <item.icon
                  size={32}
                  stroke={1.5}
                  color="var(--mantine-color-green-6)"
                />
                <Text fw={600} mt="sm">
                  {item.label}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Container>
      </section>
    </>
  );
}
