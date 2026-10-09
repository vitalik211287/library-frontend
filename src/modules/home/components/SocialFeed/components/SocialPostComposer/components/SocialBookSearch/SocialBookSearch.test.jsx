import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import SocialBookSearch from "./SocialBookSearch.jsx";
import { apiFetch } from "../../../../../../../../shared/api/apiClient.js";

vi.mock("../../../../../../../../shared/api/apiClient.js", () => ({
  apiFetch: vi.fn(),
}));

beforeEach(() => {
  vi.useFakeTimers();
  apiFetch.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("SocialBookSearch", () => {
  it("does not search for a one-character query", async () => {
    render(<SocialBookSearch onSelect={vi.fn()} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "A" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("searches after a 300ms debounce", async () => {
    render(<SocialBookSearch onSelect={vi.fn()} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "AB" },
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(299);
    });

    expect(apiFetch).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/books?q=AB",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("ignores an outdated search response", async () => {
    let resolveOldSearch;

    apiFetch.mockImplementation((url) => {
      if (url.includes("q=AB")) {
        return new Promise((resolve) => {
          resolveOldSearch = resolve;
        });
      }

      return Promise.resolve([
        { id: "new-book", title: "New book", author: "Author" },
      ]);
    });

    render(<SocialBookSearch onSelect={vi.fn()} />);

    const input = screen.getByRole("searchbox");

    fireEvent.change(input, { target: { value: "AB" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(typeof resolveOldSearch).toBe("function");

    fireEvent.change(input, { target: { value: "CD" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("New book")).toBeTruthy();

    await act(async () => {
      resolveOldSearch([
        { id: "old-book", title: "Old book", author: "Author" },
      ]);
      await Promise.resolve();
    });

    expect(screen.getByText("New book")).toBeTruthy();
    expect(screen.queryByText("Old book")).toBeNull();
  });


  it("handles an API error without showing stale results", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      apiFetch.mockRejectedValue(new Error("Server unavailable"));

      render(<SocialBookSearch onSelect={vi.fn()} />);

      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "AB" },
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("BOOK")).toBeNull();
      expect(screen.queryByRole("button")).toBeNull();
    } finally {
      errorSpy.mockRestore();
    }
  });

});
