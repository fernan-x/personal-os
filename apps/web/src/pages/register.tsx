import { useState } from "react";
import { Link } from "react-router";
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
} from "@mantine/core";
import { useAuth } from "../contexts/auth-context";
import { ApiError } from "../lib/api-client";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const result = await register({
        email,
        password,
        name: name || undefined,
      });
      setSuccess(result.message);
      setEmail("");
      setPassword("");
      setName("");
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { message?: string };
        setError(data?.message || "L'inscription a échoué");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Paper p="xl" maw={400} mx="auto" mt={100}>
      <Title order={2} ta="center" mb="lg">
        Créer un compte
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack>
          {error && (
            <Alert color="red" variant="light">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" variant="light">
              {success}
            </Alert>
          )}

          <TextInput
            label="Nom"
            placeholder="Votre nom (optionnel)"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <TextInput
            label="Email"
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />

          <PasswordInput
            label="Mot de passe"
            placeholder="Au moins 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />

          <Button type="submit" loading={isLoading} fullWidth>
            S'inscrire
          </Button>

          <Text ta="center" size="sm">
            Déjà un compte ?{" "}
            <Anchor component={Link} to="/login">
              Se connecter
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
