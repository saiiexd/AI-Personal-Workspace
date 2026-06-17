import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "./utils";
import AIPage from "../app/(app)/ai/page";
import { useAI } from "../hooks/use-ai";

vi.mock("../hooks/use-ai", () => ({
  useAI: vi.fn(),
}));

describe("AI Page", () => {
  const mockCreateConversation = vi.fn();
  const mockDeleteConversation = vi.fn();
  const mockSendMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAI as any).mockReturnValue({
      conversations: [
        { id: "conv-1", title: "General Discussion" },
      ],
      messages: [
        { id: "m1", conversation_id: "conv-1", role: "assistant", content: "Hello", context_sources: null, created_at: "2026-06-17T12:00:00Z" },
        { id: "m2", conversation_id: "conv-1", role: "user", content: "Tell me about my architecture doc", context_sources: null, created_at: "2026-06-17T12:01:00Z" },
        { id: "m3", conversation_id: "conv-1", role: "assistant", content: "It is standard.", context_sources: { "1": { title: "Architecture Guidelines" } }, created_at: "2026-06-17T12:02:00Z" },
      ],
      isConversationsLoading: false,
      isMessagesLoading: false,
      createConversation: { mutateAsync: mockCreateConversation },
      deleteConversation: { mutateAsync: mockDeleteConversation },
      sendMessage: { mutateAsync: mockSendMessage, isPending: false },
    });
  });

  it("renders active conversation messages with metadata and citations", () => {
    render(<AIPage />);

    expect(screen.getAllByText("General Discussion").length).toBeGreaterThan(0);
    expect(screen.getByText("It is standard.")).toBeInTheDocument();
    expect(screen.getByText("Source: Architecture Guidelines")).toBeInTheDocument();
  });
});
