// src/app/layout.tsx
import "@mantine/core/styles.css";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { theme } from "@/theme/mantine-theme";
import "./globals.css";

export const metadata = {
  title: "Well Da Metal Factory | 滙達五金廠",
  description:
    "Well Da Metal Factory — precision metal manufacturing, CNC machining, and custom fabrication in Hong Kong.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <SiteHeader />
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
