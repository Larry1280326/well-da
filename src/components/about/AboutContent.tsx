import Link from "next/link";
import {
  Button,
  Container,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { TrustLineSection } from "@/components/about/TrustLineSection";

interface AboutDict {
  profileTitle: string;
  profileDesc1: string;
  profileDesc2: string;
  workWithUs: string;
  sendDrawing: string;
  sendDrawingDesc: string;
  getQuote: string;
  coreTitle: string;
  coreDesc1: string;
  coreDesc2: string;
  trustTitle: string;
  trustDesc: string;
  trustEstablished: string;
  trustISO: string;
  trustCustom: string;
  trustPrecision: string;
}

export function AboutContent({
  dict,
  locale,
}: {
  dict: AboutDict;
  locale: string;
}) {
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
            {dict.profileTitle}
          </Title>
          <Text c="dimmed" maw={640} mb="md">
            {dict.profileDesc1}
          </Text>
          <Text c="dimmed" maw={640}>
            {dict.profileDesc2}
          </Text>
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
            {dict.coreTitle}
          </Title>
          <Text c="dimmed" maw={640} mb="md">
            {dict.coreDesc1}
          </Text>
          <Text c="dimmed" maw={640}>
            {dict.coreDesc2}
          </Text>
        </Container>
      </section>

      {/* CTA Section */}
      <section id="cta" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <Title order={2} mb="lg">
            {dict.workWithUs}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            <Paper p="xl" radius="md" withBorder>
              <Title order={3} size="h4" mb="sm">
                {dict.sendDrawing}
              </Title>
              <Text c="dimmed" mb="lg">
                {dict.sendDrawingDesc}
              </Text>
              <Link href={`/${locale}/quotation`}>
                <Button
                  color="green"
                  rightSection={<IconArrowRight size={18} stroke={2} />}
                >
                  {dict.getQuote}
                </Button>
              </Link>
            </Paper>
          </SimpleGrid>
        </Container>
      </section>

      {/* Trust Line Section + ISO Modal (client component) */}
      <TrustLineSection dict={dict} />
    </>
  );
}
