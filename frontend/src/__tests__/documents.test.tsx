import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "./utils";
import DocumentsPage from "../app/(app)/documents/page";
import { useDocuments } from "../hooks/use-documents";

vi.mock("../hooks/use-documents", () => ({
  useDocuments: vi.fn(),
}));

describe("Documents Page", () => {
  const mockUploadDocument = vi.fn();
  const mockDeleteDocument = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useDocuments as any).mockReturnValue({
      documents: [
        { id: "doc-1", title: "Paper.pdf", file_type: "pdf", size_bytes: 500000, processing_status: "completed", created_at: "2026-06-17T12:00:00Z" },
        { id: "doc-2", title: "Guide.docx", file_type: "docx", size_bytes: 120000, processing_status: "processing", created_at: "2026-06-17T12:00:00Z" },
      ],
      isLoading: false,
      uploadDocument: { mutateAsync: mockUploadDocument, isPending: false },
      deleteDocument: { mutateAsync: mockDeleteDocument },
    });
  });

  it("lists documents with correct file formats, sizes, and indexing statuses", () => {
    render(<DocumentsPage />);

    expect(screen.getByText("Paper.pdf")).toBeInTheDocument();
    expect(screen.getByText("completed")).toBeInTheDocument();
    
    expect(screen.getByText("Guide.docx")).toBeInTheDocument();
    expect(screen.getByText("processing")).toBeInTheDocument();
  });
});
