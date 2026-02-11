import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Alert,
  Anchor,
  Center,
  Divider,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconMail,
  IconLock,
  IconLogin,
  IconKey,
} from "@tabler/icons-react";
import { useAuth } from "../contexts/auth-context";
import { ApiError, apiGet } from "../lib/api-client";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

  useEffect(() => {
    const ssoError = searchParams.get("error");
    if (ssoError === "sso_failed") {
      setError("La connexion SSO a échoué. Veuillez réessayer.");
    } else if (ssoError === "sso_unavailable") {
      setError("La connexion SSO n'est pas disponible.");
    }
  }, [searchParams]);

  useEffect(() => {
    apiGet<{ enabled: boolean }>("auth/oidc/status")
      .then((data) => setSsoEnabled(data.enabled))
      .catch(() => setSsoEnabled(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message || "Identifiants invalides");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Paper p="xl" maw={420} w="100%" shadow="lg">
      <Stack>
        <Center>
          <Stack align="center" gap={4}>
            <IconLayoutDashboard
              size={40}
              stroke={1.5}
              color="var(--mantine-color-teal-5)"
            />
            <Title order={3} fw={700}>
              Personal OS
            </Title>
          </Stack>
        </Center>

        <Title order={2} ta="center">
          Connexion
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack>
            {error && (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            )}

            <TextInput
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              leftSection={<IconMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />

            <PasswordInput
              label="Mot de passe"
              placeholder="Votre mot de passe"
              leftSection={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              leftSection={<IconLogin size={16} />}
            >
              Se connecter
            </Button>

            <Text ta="center" size="sm">
              Pas encore de compte ?{" "}
              <Anchor component={Link} to="/register">
                S'inscrire
              </Anchor>
            </Text>
          </Stack>
        </form>

        {ssoEnabled && (
          <>
            <Divider label="ou" labelPosition="center" />
            <Button
              component="a"
              href="/api/auth/oidc/login"
              variant="outline"
              fullWidth
              leftSection={<IconKey size={16} />}
            >
              Se connecter avec Datsite
            </Button>
          </>
        )}
      </Stack>
    </Paper>
  );
}
