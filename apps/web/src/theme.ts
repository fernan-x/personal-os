import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Warm teal primary
const teal: MantineColorsTuple = [
  "#f0fdf9",
  "#ccfbef",
  "#99f6de",
  "#5ceac8",
  "#2dd4ad",
  "#14b894",
  "#0d9478",
  "#0a7561",
  "#085c4d",
  "#064c40",
];

// Cream palette for backgrounds
const cream: MantineColorsTuple = [
  "#FFFDF8",
  "#FFF8F0",
  "#FFF1E3",
  "#FFE8D1",
  "#FFDCBA",
  "#FFD0A3",
  "#FFC48C",
  "#E8A66A",
  "#CC8A4F",
  "#A86E3A",
];

export const theme = createTheme({
  primaryColor: "teal",
  primaryShade: 5,
  colors: {
    teal,
    cream,
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
    fontWeight: "700",
  },
  defaultRadius: "lg",
  components: {
    Card: {
      defaultProps: {
        shadow: "sm",
        padding: "lg",
        radius: "lg",
        withBorder: true,
      },
      styles: () => ({
        root: {
          borderColor: "var(--mantine-color-cream-2)",
        },
      }),
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
      styles: () => ({
        root: {
          fontWeight: 600,
        },
      }),
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        centered: true,
        overlayProps: { backgroundOpacity: 0.4, blur: 4 },
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        shadow: "sm",
      },
    },
    NavLink: {
      defaultProps: {
        variant: "light",
      },
      styles: () => ({
        root: {
          borderRadius: "var(--mantine-radius-md)",
          marginBottom: 4,
        },
      }),
    },
    TextInput: {
      defaultProps: { radius: "md" },
    },
    PasswordInput: {
      defaultProps: { radius: "md" },
    },
    Select: {
      defaultProps: { radius: "md" },
    },
    NumberInput: {
      defaultProps: { radius: "md" },
    },
    Textarea: {
      defaultProps: { radius: "md" },
    },
    Badge: {
      defaultProps: { radius: "md" },
    },
    Alert: {
      defaultProps: { radius: "md" },
    },
    Tabs: {
      styles: () => ({
        tab: {
          fontWeight: 600,
        },
      }),
    },
    AppShell: {
      styles: () => ({
        main: {
          backgroundColor: "var(--mantine-color-cream-0)",
        },
      }),
    },
  },
});
