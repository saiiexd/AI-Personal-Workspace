import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore, Workspace } from "@/store/workspace-store";
import { useEffect } from "react";

export function useWorkspaces() {
  const queryClient = useQueryClient();
  const { currentWorkspace, setWorkspace } = useWorkspaceStore();

  const { data: workspaces = [], isLoading, error } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await api.get("/workspaces/");
      return res.data;
    },
  });

  // Automatically select the first workspace if none is selected
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      setWorkspace(workspaces[0]);
    } else if (workspaces.length > 0 && currentWorkspace) {
      // Refresh current workspace details if they changed
      const exists = workspaces.find((w) => w.id === currentWorkspace.id);
      if (exists && JSON.stringify(exists) !== JSON.stringify(currentWorkspace)) {
        setWorkspace(exists);
      } else if (!exists) {
        setWorkspace(workspaces[0]);
      }
    }
  }, [workspaces, currentWorkspace, setWorkspace]);

  const createWorkspace = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const res = await api.post("/workspaces/", data);
      return res.data;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setWorkspace(newWorkspace);
    },
  });

  const updateWorkspace = useMutation({
    mutationFn: async ({ id, name, slug }: { id: string; name: string; slug: string }) => {
      const res = await api.put(`/workspaces/${id}`, { name, slug });
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (currentWorkspace?.id === updated.id) {
        setWorkspace(updated);
      }
    },
  });

  const deleteWorkspace = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/workspaces/${id}`);
      return res.data;
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (currentWorkspace?.id === deletedId) {
        setWorkspace(null);
      }
    },
  });

  return {
    workspaces,
    currentWorkspace,
    selectWorkspace: setWorkspace,
    isLoading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
  };
}
