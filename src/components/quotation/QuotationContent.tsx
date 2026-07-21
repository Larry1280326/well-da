import {
  Anchor,
  Container,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import {
  IconMail,
  IconMessageCircle,
  IconPhone,
} from "@tabler/icons-react";
import type { TablerIcon } from "@tabler/icons-react";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";

interface QuotationContact {
  label: string;
  value: string;
  href: string | null;
}

interface QuotationDict {
  pageTitle: string;
  heading: string;
  intro: string;
  contactIntro: string;
  contacts: QuotationContact[];
  youtubeVideoId: string;
}

const CONTACT_ICONS: Record<string, TablerIcon> = {
  Phone: IconPhone,
  WhatsApp: IconMessageCircle,
  WeChat: IconMessageCircle,
  Email: IconMail,
  電話: IconPhone,
  微信: IconMessageCircle,
  電郵: IconMail,
};

export function QuotationContent({ dict }: { dict: QuotationDict }) {
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

      {/* Main Content */}
      <section style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <div
            style={{
              display: "flex",
              gap: "2.5rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* Left: Text content */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <Title order={2} mb="md">
                {dict.heading}
              </Title>
              <Text c="dimmed" mb="xl">
                {dict.intro}
              </Text>

              <Text fw={600} mb="lg">
                {dict.contactIntro}
              </Text>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {dict.contacts.map((contact) => {
                  const Icon = CONTACT_ICONS[contact.label] || IconMail;
                  const content = (
                    <Paper
                      key={contact.label}
                      p="xl"
                      radius="md"
                      withBorder
                      h="100%"
                    >
                      <Icon
                        size={28}
                        stroke={1.5}
                        color="var(--mantine-color-green-6)"
                      />
                      <Text fw={600} mt="sm" mb={4}>
                        {contact.label}
                      </Text>
                      <Text c="dimmed">{contact.value}</Text>
                    </Paper>
                  );

                  if (contact.href) {
                    return (
                      <Anchor
                        key={contact.label}
                        href={contact.href}
                        underline="never"
                      >
                        {content}
                      </Anchor>
                    );
                  }

                  return content;
                })}
              </SimpleGrid>
            </div>

            {/* Right: YouTube Video */}
            <div style={{ flex: "1 1 360px", minWidth: 0 }}>
              <YouTubeEmbed videoId={dict.youtubeVideoId} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
