import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Machine, InsertMachine, UpdateMachine, Alert } from "@shared/schema";

export function useMachines() {
  return useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live updates
  });
}

export function useCreateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (machine: InsertMachine): Promise<Machine> => {
      const response = await apiRequest("POST", "/api/machines", machine);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });
}

export function useUpdateMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMachine }): Promise<Machine> => {
      const response = await apiRequest("PUT", `/api/machines/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
    },
  });
}

export function useDeleteMachine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiRequest("DELETE", `/api/machines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
    },
  });
}

export function useSimulateWear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<Machine[]> => {
      const response = await apiRequest("POST", "/api/simulate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });
}

export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });
}
