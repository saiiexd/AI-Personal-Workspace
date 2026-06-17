import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "./utils";
import TasksPage from "../app/(app)/tasks/page";
import { useTasks } from "../hooks/use-tasks";

vi.mock("../hooks/use-tasks", () => ({
  useTasks: vi.fn(),
}));

describe("Tasks Page", () => {
  const mockCreateTask = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockDeleteTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTasks as any).mockReturnValue({
      tasks: [
        { id: "task-1", title: "Task Item One", status: "todo", priority: "medium", due_date: null },
      ],
      isLoading: false,
      createTask: { mutateAsync: mockCreateTask },
      updateTask: { mutateAsync: mockUpdateTask },
      deleteTask: { mutateAsync: mockDeleteTask },
    });
  });

  it("renders tasks list and supports status toggling", async () => {
    render(<TasksPage />);

    expect(screen.getByText("Task Item One")).toBeInTheDocument();

    // Find the toggle button specifically adjacent to the task title
    const taskTitle = screen.getByText("Task Item One");
    const checkbox = taskTitle.closest("div")?.previousSibling as HTMLButtonElement;
    fireEvent.click(checkbox);

    expect(mockUpdateTask).toHaveBeenCalledWith({
      id: "task-1",
      status: "done",
    });
  });
});
