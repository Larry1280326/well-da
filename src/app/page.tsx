// src/app/page.tsx
import { Button, Container, Title, Text, Group } from "@mantine/core";

export default function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="sm">
        Welcome to Mantine!
      </Title>
      <Text c="dimmed" mb="lg">
        This Next.js app is officially initialized with Mantine UI.
      </Text>
      <Group>
        <Button variant="filled" color="blue">
          Primary Button
        </Button>
        <Button variant="outline" color="gray">
          Secondary Button
        </Button>
      </Group>
    </Container>
  );
}
