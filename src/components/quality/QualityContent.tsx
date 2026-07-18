import { Container, Text, Title } from "@mantine/core";

interface QualityDict {
  pageTitle: string;
  sectionTitle: string;
  paragraphs: string[];
}

function renderParagraph(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i}>{part}</strong>
    ) : (
      <Text key={i} component="span" c="dimmed">
        {part}
      </Text>
    )
  );
}

export function QualityContent({ dict }: { dict: QualityDict }) {
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

      {/* Quality Section */}
      <section id="control" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <Title order={2} mb="xl">
            {dict.sectionTitle}
          </Title>

          {dict.paragraphs.map((text, i) => (
            <Text key={i} mb="md" maw={720}>
              {renderParagraph(text)}
            </Text>
          ))}
        </Container>
      </section>
    </>
  );
}
