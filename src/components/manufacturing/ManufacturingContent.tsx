import { Container, Text, Title } from "@mantine/core";

interface ManufacturingDict {
  pageTitle: string;
  sectionTitle: string;
  intro: string;
  capabilities: string[];
  materials: string;
}

export function ManufacturingContent({
  dict,
}: {
  dict: ManufacturingDict;
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

      {/* Capabilities Section */}
      <section id="integrated_sheet_metal" style={{ scrollMarginTop: 80 }}>
        <Container size="xl" py={60}>
          <Title order={2} mb="md">
            {dict.sectionTitle}
          </Title>
          <Text c="dimmed" maw={720} mb="xl">
            {dict.intro}
          </Text>

          <ul
            style={{
              paddingLeft: 0,
            listStyleType: "none",
              marginBottom: "var(--mantine-spacing-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--mantine-spacing-sm)",
            }}
          >
            {dict.capabilities.map((item) => (
              <li key={item}>
                <span
                  style={{
                    color: "var(--mantine-color-green-6)",
                    marginRight: "0.5rem",
                  }}
                >
                  &#10003;
                </span>
                <Text component="span">{item}</Text>
              </li>
            ))}
          </ul>

          <Text c="dimmed" maw={720}>
            {dict.materials}
          </Text>
        </Container>
      </section>
    </>
  );
}
