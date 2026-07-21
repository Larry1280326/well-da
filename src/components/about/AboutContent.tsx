import Link from "next/link";
import Image from "next/image";
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
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Left: Text content */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Title order={2} mb="md">
                {dict.profileTitle}
              </Title>
              <Text c="dimmed" maw={640} mb="md">
                {dict.profileDesc1}
              </Text>
              <Text c="dimmed" maw={640}>
                {dict.profileDesc2}
              </Text>
            </div>

            {/* Right: Image */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Image
                src="/images/cool-photo.jpg"
                alt="Sheet metal manufacturing workshop and production facility"
                width={640}
                height={480}
                sizes="(max-width: 768px) 100vw, 480px"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "var(--mantine-radius-md)",
                }}
              />
            </div>
          </div>
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
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Left: Text content */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Title order={2} mb="md">
                {dict.coreTitle}
              </Title>
              <Text c="dimmed" maw={640} mb="md">
                {dict.coreDesc1}
              </Text>
              <Text c="dimmed" maw={640}>
                {dict.coreDesc2}
              </Text>
            </div>

            {/* Right: Image */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Image
                src="/images/cool-photo2.jpg"
                alt="Custom sheet metal enclosures and fabricated metal components"
                width={640}
                height={480}
                sizes="(max-width: 768px) 100vw, 480px"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "var(--mantine-radius-md)",
                }}
              />
            </div>
          </div>
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
            <Image
              src="/images/cool-photo3.jpg"
              alt="Completed metal fabrication project and finished sheet metal products"
              width={640}
              height={480}
              sizes="(max-width: 768px) 100vw, 480px"
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "var(--mantine-radius-md)",
              }}
            />
          </SimpleGrid>
        </Container>
      </section>

      {/* Trust Line Section + ISO Modal (client component) */}
      <TrustLineSection dict={dict} />
    </>
  );
}
