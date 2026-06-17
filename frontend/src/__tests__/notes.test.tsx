import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "./utils";
import NotesPage from "../app/(app)/notes/page";
import { useNotes, useNote } from "../hooks/use-notes";

vi.mock("../hooks/use-notes", () => ({
  useNotes: vi.fn(),
  useNote: vi.fn(),
}));

describe("Notes Page", () => {
  const mockCreateNote = vi.fn();
  const mockUpdateNote = vi.fn();
  const mockDeleteNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNotes as any).mockReturnValue({
      notes: [
        { id: "note-1", title: "Note One", content: "Original content", updated_at: "2026-06-17T12:00:00Z" },
      ],
      isLoading: false,
      createNote: { mutateAsync: mockCreateNote },
      updateNote: { mutate: mockUpdateNote },
      deleteNote: { mutateAsync: mockDeleteNote },
    });

    (useNote as any).mockReturnValue({
      note: { id: "note-1", title: "Note One", content: "Original content", updated_at: "2026-06-17T12:00:00Z" },
      isLoading: false,
    });
  });

  it("renders note list and displays note content on selection", () => {
    render(<NotesPage />);

    expect(screen.getByText("Note One")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Note One")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original content")).toBeInTheDocument();
  });

  it("triggers update mutation on input changes (autosave)", async () => {
    render(<NotesPage />);

    const titleInput = screen.getByDisplayValue("Note One");
    fireEvent.change(titleInput, { target: { value: "Updated Title" } });

    await waitFor(() => {
      expect(mockUpdateNote).toHaveBeenCalledWith({
        id: "note-1",
        title: "Updated Title",
        content: "Original content",
      });
    }, { timeout: 1500 }); // Wait for debounce timer (800ms)
  });
});
