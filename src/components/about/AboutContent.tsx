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
import { productSlugs, type ProductSlug } from "@/config/products";

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
  isHomepage = false,
  homepage,
  products,
}: {
  dict: AboutDict;
  locale: string;
  isHomepage?: boolean;
  homepage?: { title: string; intro: string; processes: string };
  products?: Record<ProductSlug, { title: string; intro: string }>;
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
              <Title order={1} mb="md">
                {isHomepage && homepage ? homepage.title : dict.profileTitle}
              </Title>
              <Text c="dimmed" maw={640} mb="md">
                {isHomepage && homepage ? homepage.intro : dict.profileDesc1}
              </Text>
              <Text c="dimmed" maw={640}>
                {isHomepage && homepage ? homepage.processes : dict.profileDesc2}
              </Text>
              {isHomepage && <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1.5rem" }}>
                <Button component="a" href={`/${locale}/quotation?source=/${locale}`}>{dict.getQuote}</Button>
                <Link href={`/${locale}/manufacturing`}>{locale === "zh" ? "製造能力" : "Manufacturing Capabilities"}</Link>
                <Link href={`/${locale}/applications`}>{locale === "zh" ? "產品與應用" : "Products & Applications"}</Link>
              </div>}
            </div>

            {/* Right: Image */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Image
                src="/images/cool-photo.jpg"
                alt={locale === "zh" ? "現有金屬加工照片" : "Existing metal fabrication photograph"}
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

      {isHomepage && products && <section>
        <Container size="xl" py={40}>
          <Title order={2} mb="lg">{locale === "zh" ? "產品與應用" : "Products & Applications"}</Title>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            {productSlugs.map(slug => <Paper key={slug} p="lg" withBorder radius="md">
              <Title order={3} size="h4" mb="sm"><Link href={`/${locale}/applications/${slug}`}>{products[slug].title}</Link></Title>
              <Text>{products[slug].intro}</Text>
            </Paper>)}
          </SimpleGrid>
        </Container>
      </section>}

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
                alt={locale === "zh" ? "帶開孔的金屬面板" : "Flat metal panels with cut-outs"}
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
                <Button component="a" href={`/${locale}/quotation?source=/${locale}${isHomepage ? "" : "/about"}`}
                  color="green"
                  rightSection={<IconArrowRight size={18} stroke={2} />}
                >
                  {dict.getQuote}
                </Button>
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
