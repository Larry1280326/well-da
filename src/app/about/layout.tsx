import { Container, Title } from "@mantine/core";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* <Container size="xl" py={60}>
        <Title order={1} mb="xl">
          About Us
        </Title>
      </Container> */}
      {children}
    </section>
  );
}
