import { useEffect } from "react";
import { Center, Loader } from "@mantine/core";
import { setToken } from "../lib/api-client";

export function SsoCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      window.location.href = "/login?error=sso_failed";
      return;
    }

    setToken(token);
    window.location.href = "/";
  }, []);

  return (
    <Center h="100vh">
      <Loader size="lg" />
    </Center>
  );
}
