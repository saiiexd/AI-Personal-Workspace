import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface Note {
  id: string;
  title: string;
  content: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export function useNotes(searchQuery: string = "") {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;

  const { data: notes = [], isLoading, error } = useQuery<Note[]>({
    queryKey: ["notes", workspaceId, searchQuery],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get(`/notes/workspaces/${workspaceId}/notes`, {
        params: searchQuery ? { query: searchQuery } : undefined,
      });
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const createNote = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/notes/workspaces/${workspaceId}/notes`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title?: string; content?: string }) => {
      const res = await api.put(`/notes/notes/${id}`, { title, content });
      return res.data;
    },
    onMutate: async (updatedNote) => {
      await queryClient.cancelQueries({ queryKey: ["notes", workspaceId] });
      const previousNotes = queryClient.getQueryData<Note[]>(["notes", workspaceId, searchQuery]);

      if (previousNotes) {
        queryClient.setQueryData<Note[]>(
          ["notes", workspaceId, searchQuery],
          previousNotes.map((note) =>
            note.id === updatedNote.id ? { ...note, ...updatedNote } : note
          )
        );
      }

      return { previousNotes };
    },
    onError: (err, newTodo, context: any) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["notes", workspaceId, searchQuery], context.previousNotes);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["note", data.id] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/notes/notes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", workspaceId] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
  };
}

export function useNote(noteId: string | null) {
  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ["note", noteId],
    queryFn: async () => {
      if (!noteId) return null;
      const res = await api.get(`/notes/notes/${noteId}`);
      return res.data;
    },
    enabled: !!noteId,
  });

  return {
    note,
    isLoading,
    error,
  };
}
