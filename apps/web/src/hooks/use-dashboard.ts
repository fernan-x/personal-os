import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../lib/api-client";
import type {
  DashboardWidgetDto,
  CreateDashboardWidgetInput,
  UpdateDashboardWidgetInput,
  SetDashboardInput,
} from "@personal-os/domain";

const dashboardKeys = {
  widgets: ["dashboard", "widgets"] as const,
};

export function useDashboardWidgets() {
  return useQuery({
    queryKey: dashboardKeys.widgets,
    queryFn: () => apiGet<DashboardWidgetDto[]>("dashboard/widgets"),
  });
}

export function useSetDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SetDashboardInput) =>
      apiPut<DashboardWidgetDto[]>("dashboard", input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: dashboardKeys.widgets }),
  });
}

export function useAddDashboardWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDashboardWidgetInput) =>
      apiPost<DashboardWidgetDto>("dashboard/widgets", input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: dashboardKeys.widgets }),
  });
}

export function useRemoveDashboardWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete("dashboard/widgets/" + id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: dashboardKeys.widgets }),
  });
}

export function useUpdateDashboardWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...input
    }: UpdateDashboardWidgetInput & { id: string }) =>
      apiPatch<DashboardWidgetDto>("dashboard/widgets/" + id, input),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: dashboardKeys.widgets }),
  });
}
