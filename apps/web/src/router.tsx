import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { AuthLayout } from "./layouts/auth-layout";
import { ProtectedRoute } from "./components/auth/protected-route";
import { HomePage } from "./pages/home";
import { HabitsPage } from "./pages/habits";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "habits", element: <HabitsPage /> },
    ],
  },
]);
