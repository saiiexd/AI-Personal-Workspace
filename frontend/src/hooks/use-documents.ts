import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";

export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

export interface Document {
  id: string;
  title: string;
  file_type: string;
  size_bytes: number;
  processing_status: ProcessingStatus;
  error_message: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export function useDocuments() {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;

  const { data: documentsData = { items: [], total: 0 }, isLoading, error } = useQuery<{ items: Document[]; total: number }>({
    queryKey: ["documents", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { items: [], total: 0 };
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      return res.data;
    },
    enabled: !!workspaceId,
    // Poll for status updates if any document is processing or pending
    refetchInterval: (query) => {
      const docs = query.state.data as { items: Document[] } | undefined;
      const hasProcessing = docs?.items.some(
        (doc) => doc.processing_status === "pending" || doc.processing_status === "processing"
      );
      return hasProcessing ? 3000 : false;
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, title }: { file: File; title?: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const formData = new FormData();
      formData.append("file", file);
      if (title) {
        formData.append("title", title);
      } else {
        formData.append("title", file.name);
      }

      const res = await api.post(`/workspaces/${workspaceId}/documents`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.put(`/workspaces/${workspaceId}/documents/${id}`, { title });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.delete(`/workspaces/${workspaceId}/documents/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", workspaceId] });
    },
  });

  return {
    documents: documentsData.items,
    total: documentsData.total,
    isLoading,
    error,
    uploadDocument,
    updateDocument,
    deleteDocument,
  };
}
