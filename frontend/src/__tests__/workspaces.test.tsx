import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "./utils";
import WorkspacesPage from "../app/(app)/workspaces/page";
import { useNotes } from "../hooks/use-notes";
import { useTasks } from "../hooks/use-tasks";
import { useDocuments } from "../hooks/use-documents";
import { useAI } from "../hooks/use-ai";

vi.mock("../hooks/use-notes", () => ({
  useNotes: vi.fn(),
}));

vi.mock("../hooks/use-tasks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("../hooks/use-documents", () => ({
  useDocuments: vi.fn(),
}));

vi.mock("../hooks/use-ai", () => ({
  useAI: vi.fn(),
}));

describe("Workspaces Dashboard Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates and displays workspace metrics and dynamic statistics correctly", () => {
    (useNotes as any).mockReturnValue({
      notes: [
        { id: "n1", title: "Note 1", content: "hello", updated_at: "2026-06-17T12:00:00Z" },
        { id: "n2", title: "Note 2", content: "world", updated_at: "2026-06-17T12:00:00Z" },
      ],
      isLoading: false,
    });

    (useTasks as any).mockReturnValue({
      tasks: [
        { id: "t1", title: "Task 1", status: "todo", priority: "high", due_date: null },
        { id: "t2", title: "Task 2", status: "done", priority: "low", due_date: null },
      ],
      isLoading: false,
    });

    (useDocuments as any).mockReturnValue({
      documents: [
        { id: "d1", title: "Doc 1", file_type: "pdf", size_bytes: 1048576, processing_status: "completed", created_at: "2026-06-17T12:00:00Z" },
      ],
      isLoading: false,
    });

    (useAI as any).mockReturnValue({
      conversations: [
        { id: "c1", title: "Conversation 1" },
      ],
    });

    render(<WorkspacesPage />);

    expect(screen.getByText("Total Notes")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // 2 notes

    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("AI Chats")).toBeInTheDocument();

    // Verify the value of "1" is rendered three times (Active Tasks = 1, Documents = 1, AI Chats = 1)
    const statCards = screen.getAllByText("1");
    expect(statCards.length).toBe(3);
  });
});
