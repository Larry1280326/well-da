import "@mantine/core/styles.css";
import { MantineProvider, mantineHtmlProps } from "@mantine/core";
import { theme } from "@/theme/mantine-theme";
import "../../globals.css";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
