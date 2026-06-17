import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";

export interface AIConversation {
  id: string;
  title: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  context_sources: any | null;
  created_at: string;
}

export interface SearchResultItem {
  id: string;
  content: string;
  source_type: string;
  source_id: string;
  title: string | null;
  score: number;
}

export function useAI(conversationId: string | null = null) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;

  const { data: conversationsData = { items: [], total: 0 }, isLoading: isConversationsLoading } = useQuery<{ items: AIConversation[]; total: number }>({
    queryKey: ["ai-conversations", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { items: [], total: 0 };
      const res = await api.get(`/workspaces/${workspaceId}/ai/conversations`);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery<AIMessage[]>({
    queryKey: ["ai-messages", workspaceId, conversationId],
    queryFn: async () => {
      if (!workspaceId || !conversationId) return [];
      const res = await api.get(`/workspaces/${workspaceId}/ai/conversations/${conversationId}/messages`);
      return res.data;
    },
    enabled: !!workspaceId && !!conversationId,
  });

  const createConversation = useMutation({
    mutationFn: async (title: string) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/workspaces/${workspaceId}/ai/conversations`, { title });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", workspaceId] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) throw new Error("No active workspace");
      await api.delete(`/workspaces/${workspaceId}/ai/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", workspaceId] });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ content, role = "user" }: { content: string; role?: "user" | "assistant" | "system" }) => {
      if (!workspaceId || !conversationId) throw new Error("Missing workspace or conversation ID");
      const res = await api.post(`/workspaces/${workspaceId}/ai/conversations/${conversationId}/messages`, {
        content,
        role,
      });
      return res.data; // Returns list containing [user_msg, assistant_msg]
    },
    onMutate: async (newMsg) => {
      await queryClient.cancelQueries({ queryKey: ["ai-messages", workspaceId, conversationId] });
      const previousMessages = queryClient.getQueryData<AIMessage[]>(["ai-messages", workspaceId, conversationId]) || [];

      // Optimistically append user message & temporary thinking message
      const tempUserMsg: AIMessage = {
        id: "temp-user",
        conversation_id: conversationId!,
        role: newMsg.role || "user",
        content: newMsg.content,
        context_sources: null,
        created_at: new Date().toISOString(),
      };
      const tempAssistantMsg: AIMessage = {
        id: "temp-assistant",
        conversation_id: conversationId!,
        role: "assistant",
        content: "...",
        context_sources: null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["ai-messages", workspaceId, conversationId],
        [...previousMessages, tempUserMsg, tempAssistantMsg]
      );

      return { previousMessages };
    },
    onError: (err, newMsg, context: any) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["ai-messages", workspaceId, conversationId], context.previousMessages);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-messages", workspaceId, conversationId] });
    },
  });

  const semanticSearch = useMutation({
    mutationFn: async (query: string): Promise<SearchResultItem[]> => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/workspaces/${workspaceId}/ai/search`, { query, limit: 10 });
      return res.data.results;
    },
  });

  const summarizeDocument = useMutation({
    mutationFn: async (documentId: string): Promise<string> => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/workspaces/${workspaceId}/ai/summarize`, { document_id: documentId });
      return res.data.summary;
    },
  });

  return {
    conversations: conversationsData.items,
    messages,
    isConversationsLoading,
    isMessagesLoading,
    createConversation,
    deleteConversation,
    sendMessage,
    semanticSearch,
    summarizeDocument,
  };
}
