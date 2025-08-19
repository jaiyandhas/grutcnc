import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { CriticalSpare, UpdateSpare, MaintenanceLog, InsertMaintenanceLog } from "@shared/schema";

export function useSpares() {
  return useQuery<CriticalSpare[]>({
    queryKey: ["/api/spares"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live updates
  });
}

export function useSpare(id: string) {
  return useQuery<CriticalSpare>({
    queryKey: ["/api/spares", id],
  });
}

export function useUpdateSpare() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSpare }) => {
      return apiRequest(`/api/spares/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spares"] });
    },
  });
}

export function useSimulateSpareWear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiRequest("/api/spares/simulate", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });
}

export function useLoadSparesFromCSV() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiRequest("/api/spares/load-csv", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/spares"] });
    },
  });
}

export function useMaintenanceLogs(spareId?: string) {
  return useQuery<MaintenanceLog[]>({
    queryKey: ["/api/maintenance-logs", spareId],
    queryFn: () => {
      const url = spareId ? `/api/maintenance-logs?spareId=${spareId}` : "/api/maintenance-logs";
      return apiRequest(url);
    },
  });
}

export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertMaintenanceLog) => {
      return apiRequest("/api/maintenance-logs", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/spares"] });
    },
  });
}