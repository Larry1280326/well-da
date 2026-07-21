"use client";

import {
  Container,
  Modal,
  Paper,
  SimpleGrid,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAward,
  IconCalendar,
  IconRulerMeasure,
  IconSettings,
} from "@tabler/icons-react";

interface TrustLineDict {
  trustTitle: string;
  trustDesc: string;
  trustEstablished: string;
  trustISO: string;
  trustCustom: string;
  trustPrecision: string;
}

export function TrustLineSection({ dict }: { dict: TrustLineDict }) {
  const [isoModalOpened, { open: openIsoModal, close: closeIsoModal }] =
    useDisclosure(false);

  const trustItems = [
    { icon: IconCalendar, label: dict.trustEstablished },
    { icon: IconAward, label: dict.trustISO, onClick: openIsoModal },
    { icon: IconSettings, label: dict.trustCustom },
    { icon: IconRulerMeasure, label: dict.trustPrecision },
  ];

  return (
    <>
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
            {dict.trustTitle}
          </Title>
          <Text c="dimmed" maw={640} mb="xl">
            {dict.trustDesc}
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
            {trustItems.map((item) => (
              <Paper
                key={item.label}
                p="lg"
                radius="md"
                withBorder
                h="100%"
                onClick={item.onClick}
                style={{ cursor: item.onClick ? "pointer" : undefined }}
              >
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

      {/* ISO 9001 Certificate Modal */}
      <Modal
        opened={isoModalOpened}
        onClose={closeIsoModal}
        title={dict.trustISO}
        size="xl"
        fullScreen
        zIndex={300}
        closeOnClickOutside
      >
        <object
          data="/docs/iso9001.pdf"
          type="application/pdf"
          style={{ width: "100%", height: "80vh" }}
        >
          <p style={{ textAlign: "center", padding: "2rem" }}>
            Unable to display the PDF.{" "}
            <a href="/docs/iso9001.pdf" download>
              Click here to download
            </a>
            .
          </p>
        </object>
      </Modal>
    </>
  );
}
