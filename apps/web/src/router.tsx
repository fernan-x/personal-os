import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/root-layout";
import { AuthLayout } from "./layouts/auth-layout";
import { ProtectedRoute } from "./components/auth/protected-route";
import { HomePage } from "./pages/home";
import { HabitsPage } from "./pages/habits";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";
import { BudgetPage } from "./pages/budget/index";
import { BudgetGroupPage } from "./pages/budget/group";
import { BudgetPlanPage } from "./pages/budget/plan";
import { BudgetTrackingPage } from "./pages/budget/tracking";
import { PuppyPage } from "./pages/puppy/index";
import { HouseholdPage } from "./pages/puppy/household";
import { PetPage } from "./pages/puppy/pet";
import { TodayPage } from "./pages/puppy/today";

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
      { path: "budget", element: <BudgetPage /> },
      { path: "budget/:groupId", element: <BudgetGroupPage /> },
      { path: "budget/:groupId/plans/:planId", element: <BudgetPlanPage /> },
      { path: "budget/:groupId/plans/:planId/tracking", element: <BudgetTrackingPage /> },
      { path: "puppy", element: <PuppyPage /> },
      { path: "puppy/:householdId", element: <HouseholdPage /> },
      { path: "puppy/:householdId/today", element: <TodayPage /> },
      { path: "puppy/:householdId/pets/:petId", element: <PetPage /> },
    ],
  },
]);
