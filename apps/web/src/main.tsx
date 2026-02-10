import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { QueryClientProvider } from "@tanstack/react-query";
import "dayjs/locale/fr";
import { RouterProvider } from "react-router/dom";
import { theme } from "./theme";
import { router } from "./router";
import { queryClient } from "./lib/query-client";
import { AuthProvider } from "./contexts/auth-context";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <DatesProvider settings={{ locale: "fr", firstDayOfWeek: 1 }}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </DatesProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
