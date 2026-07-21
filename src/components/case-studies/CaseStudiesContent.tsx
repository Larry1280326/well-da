import { Container, Text, Title } from "@mantine/core";
import Image from "next/image";

interface CaseStudyImage {
  src: string;
  alt: string;
}

interface CaseStudySection {
  slug: string;
  title: string;
  description: string;
  images?: CaseStudyImage[];
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

      {/* Individual Case Study Sections */}
      {dict.sections.map((section) => (
        <section
          key={section.slug}
          id={section.slug}
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
                  {section.title}
                </Title>
                {section.description.split("\n\n").map((para, i) => (
                  <Text key={i} c="dimmed" mb="md" maw={640}>
                    {para}
                  </Text>
                ))}
              </div>

              {/* Right: Images */}
              {section.images && section.images.length > 0 && (
                <div
                  style={{
                    flex: "1 1 360px",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {section.images.map((img, i) => (
                    <Image
                      key={i}
                      src={img.src}
                      alt={img.alt}
                      width={640}
                      height={480}
                      sizes="(max-width: 768px) 100vw, 640px"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "var(--mantine-radius-md)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </Container>
        </section>
      ))}
    </>
  );
}
