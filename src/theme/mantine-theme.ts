import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "green",
  fontFamily:
    'Arial, Helvetica, "Microsoft JhengHei", "PingFang TC", sans-serif',
  headings: {
    fontFamily:
      'Arial, Helvetica, "Microsoft JhengHei", "PingFang TC", sans-serif',
  },
  colors: {
    green: [
      "#eef8ee",
      "#dceddc",
      "#b8dbb8",
      "#91c991",
      "#6bb86b",
      "#52ad52",
      "#45a145",
      "#388c38",
      "#2d782d",
      "#236323",
    ],
  },
  primaryShade: { light: 6, dark: 6 },
});
