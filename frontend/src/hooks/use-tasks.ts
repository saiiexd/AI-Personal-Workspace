import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useWorkspaceStore } from "@/store/workspace-store";

export type TaskStatus = "todo" | "in_progress" | "done" | "archived";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  category_id: string | null;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  workspace_id: string;
}

export function useTasks(filters?: { status?: TaskStatus; priority?: TaskPriority; category_id?: string }) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useWorkspaceStore();
  const workspaceId = currentWorkspace?.id;

  const { data: tasksData = { items: [], total: 0 }, isLoading, error } = useQuery<{ items: Task[]; total: number }>({
    queryKey: ["tasks", workspaceId, filters],
    queryFn: async () => {
      if (!workspaceId) return { items: [], total: 0 };
      const res = await api.get(`/workspaces/${workspaceId}/tasks`, {
        params: {
          task_status: filters?.status || undefined,
          priority: filters?.priority || undefined,
          category_id: filters?.category_id || undefined,
        },
      });
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const { data: categories = [] } = useQuery<TaskCategory[]>({
    queryKey: ["task-categories", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get(`/workspaces/${workspaceId}/categories`);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const createTask = useMutation({
    mutationFn: async (data: { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; due_date?: string | null; category_id?: string | null }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/workspaces/${workspaceId}/tasks`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; title?: string; description?: string | null; status?: TaskStatus; priority?: TaskPriority; due_date?: string | null; category_id?: string | null }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.put(`/workspaces/${workspaceId}/tasks/${id}`, updates);
      return res.data;
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previousTasks = queryClient.getQueryData<{ items: Task[]; total: number }>(["tasks", workspaceId, filters]);

      if (previousTasks) {
        queryClient.setQueryData(
          ["tasks", workspaceId, filters],
          {
            ...previousTasks,
            items: previousTasks.items.map((task) =>
              task.id === updatedTask.id ? { ...task, ...updatedTask } : task
            ),
          }
        );
      }

      return { previousTasks };
    },
    onError: (err, newTodo, context: { previousTasks?: { items: Task[]; total: number } }) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", workspaceId, filters], context.previousTasks);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.delete(`/workspaces/${workspaceId}/tasks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      if (!workspaceId) throw new Error("No active workspace");
      const res = await api.post(`/workspaces/${workspaceId}/categories`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-categories", workspaceId] });
    },
  });

  return {
    tasks: tasksData.items,
    total: tasksData.total,
    categories,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    createCategory,
  };
}
