"use client";

import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Container,
  List,
  Text,
  Title,
} from "@mantine/core";

interface FaqQuestion {
  question: string;
  answer: string[];
}

interface FaqSection {
  slug: string;
  title: string;
  questions: FaqQuestion[];
}

interface FaqDict {
  pageTitle: string;
  sections: FaqSection[];
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

function renderAnswer(answer: string[]) {
  const elements: React.ReactNode[] = [];
  let bulletItems: string[] = [];
  let key = 0;

  function flushBullets() {
    if (bulletItems.length > 0) {
      elements.push(
        <List key={`ul-${key++}`} mb="md">
          {bulletItems.map((item, j) => (
            <List.Item key={j}>{renderParagraph(item)}</List.Item>
          ))}
        </List>
      );
      bulletItems = [];
    }
  }

  for (const text of answer) {
    if (text.startsWith("- ")) {
      bulletItems.push(text.slice(2));
    } else {
      flushBullets();
      elements.push(
        <Text key={`p-${key++}`} mb="md" maw={720}>
          {renderParagraph(text)}
        </Text>
      );
    }
  }
  flushBullets();

  return <>{elements}</>;
}

export function FaqContent({ dict }: { dict: FaqDict }) {
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

      {/* FAQ Sections */}
      {dict.sections.map((section) => (
        <section
          key={section.slug}
          id={section.slug}
          style={{ scrollMarginTop: 80 }}
        >
          <Container size="xl" py={60}>
            <Title order={2} mb="xl">
              {section.title}
            </Title>
            <Accordion chevronPosition="right" variant="separated">
              {section.questions.map((q, i) => (
                <AccordionItem key={i} value={`${section.slug}-${i}`}>
                  <AccordionControl>
                    <Text fw={500}>{q.question}</Text>
                  </AccordionControl>
                  <AccordionPanel>{renderAnswer(q.answer)}</AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Container>
        </section>
      ))}
    </>
  );
}
