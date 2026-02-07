import { Navigate, Outlet } from "react-router";
import { Box, Center, Loader } from "@mantine/core";
import { useAuth } from "../contexts/auth-context";

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFDF8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Outlet />
    </Box>
  );
}
