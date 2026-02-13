import { useMutation } from "@tanstack/react-query";
import { apiPatch, apiPut } from "../lib/api-client";
import { useAuth } from "../contexts/auth-context";
import type {
  AuthenticatedUser,
  UpdateProfileInput,
  UpdateModulesInput,
} from "@personal-os/domain";

export function useUpdateProfile() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      apiPatch<AuthenticatedUser>("users/me", input),
    onSuccess: (user) => {
      setUser(user);
    },
  });
}

export function useUpdateModules() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (input: UpdateModulesInput) =>
      apiPut<AuthenticatedUser>("users/me/modules", input),
    onSuccess: (user) => {
      setUser(user);
    },
  });
}
