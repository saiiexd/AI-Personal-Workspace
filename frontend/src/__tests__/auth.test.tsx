import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "./utils";
import LoginPage from "../app/(auth)/login/page";
import RegisterPage from "../app/(auth)/register/page";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth-store";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
      prefetch: () => null,
    };
  },
}));

// Mock api client
vi.mock("../lib/api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("Authentication Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it("renders login form and authenticates successfully", async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access_token: "test-token", refresh_token: "test-refresh" },
    });
    (api.get as any).mockResolvedValueOnce({
      data: { id: "1", email: "user@example.com", firstName: "John", lastName: "Doe" },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/auth/login",
        expect.any(URLSearchParams),
        expect.any(Object)
      );
      expect(useAuthStore.getState().token).toBe("test-token");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(mockPush).toHaveBeenCalledWith("/workspaces");
    });
  });

  it("renders register form and registers user successfully", async () => {
    (api.post as any)
      .mockResolvedValueOnce({ data: { id: "1", email: "user@example.com" } }) // register
      .mockResolvedValueOnce({ data: { access_token: "test-token" } }); // auto-login
    (api.get as any).mockResolvedValueOnce({
      data: { id: "1", email: "user@example.com", firstName: "John", lastName: "Doe" },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/register", expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith("/workspaces");
    });
  });
});
