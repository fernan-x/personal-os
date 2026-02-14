import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPut } from "../lib/api-client";
import { useAuth } from "../contexts/auth-context";
import type {
  AuthenticatedUser,
  UpdateProfileInput,
  UpdateModulesInput,
  NutritionalProfileResponse,
  UpdateNutritionalProfileInput,
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

export const nutritionKeys = {
  profile: ["users", "me", "nutrition"] as const,
};

export function useNutritionalProfile() {
  return useQuery({
    queryKey: nutritionKeys.profile,
    queryFn: () => apiGet<NutritionalProfileResponse>("users/me/nutrition"),
  });
}

export function useUpdateNutrition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateNutritionalProfileInput) =>
      apiPatch<NutritionalProfileResponse>("users/me/nutrition", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nutritionKeys.profile });
    },
  });
}
