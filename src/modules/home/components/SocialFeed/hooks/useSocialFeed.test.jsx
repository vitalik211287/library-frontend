import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import useSocialFeed from "./useSocialFeed.js";
import { apiFetch } from "../../../../../shared/api/apiClient.js";

vi.mock("../../../../../shared/api/apiClient.js", () => ({
  apiFetch: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useSocialFeed", () => {
  it("ignores an outdated response after changing scope", async () => {
    let resolveOldRequest;

    apiFetch.mockImplementation((url) => {
      const scope = new URL(url, "http://localhost").searchParams.get("scope");

      if (scope === "all") {
        return new Promise((resolve) => {
          resolveOldRequest = resolve;
        });
      }

      return Promise.resolve({
        activities: [{ id: "following-1" }],
        hasMore: false,
      });
    });

    const { result, rerender } = renderHook(
      ({ scope }) => useSocialFeed({ scope, userId: null }),
      { initialProps: { scope: "all" } },
    );

    await waitFor(() => {
      expect(typeof resolveOldRequest).toBe("function");
    });

    rerender({ scope: "following" });

    await waitFor(() => {
      expect(result.current.activities).toEqual([
        { id: "following-1" },
      ]);
    });

    await act(async () => {
      resolveOldRequest({
        activities: [{ id: "outdated-1" }],
        hasMore: false,
      });
    });

    expect(result.current.activities).toEqual([
      { id: "following-1" },
    ]);
  });

  it("ignores pagination from an unmounted feed", async () => {
    let resolveOldPage;

    apiFetch.mockImplementation((url) => {
      const params = new URL(url, "http://localhost").searchParams;
      const scope = params.get("scope");
      const page = Number(params.get("page"));

      if (scope === "all" && page === 1) {
        return Promise.resolve({
          activities: [{ id: "all-1" }],
          hasMore: true,
        });
      }

      if (scope === "all" && page === 2) {
        return new Promise((resolve) => {
          resolveOldPage = resolve;
        });
      }

      return Promise.resolve({
        activities: [{ id: "following-1" }],
        hasMore: false,
      });
    });

    const oldFeed = renderHook(() =>
      useSocialFeed({ scope: "all", userId: null }),
    );

    await waitFor(() => {
      expect(oldFeed.result.current.activities).toEqual([{ id: "all-1" }]);
      expect(oldFeed.result.current.hasMore).toBe(true);
    });

    let pendingPage;

    act(() => {
      pendingPage = oldFeed.result.current.handleLoadMore();
    });

    expect(typeof resolveOldPage).toBe("function");

    oldFeed.unmount();

    const newFeed = renderHook(() =>
      useSocialFeed({ scope: "following", userId: null }),
    );

    await waitFor(() => {
      expect(newFeed.result.current.activities).toEqual([
        { id: "following-1" },
      ]);
    });

    await act(async () => {
      resolveOldPage({
        activities: [{ id: "outdated-page-2" }],
        hasMore: false,
      });
      await pendingPage;
    });

    expect(newFeed.result.current.activities).toEqual([
      { id: "following-1" },
    ]);
    expect(newFeed.result.current.isLoadingMore).toBe(false);
  });


  it("starts with a clean feed after remounting for a new scope", async () => {
    let resolveFollowing;

    apiFetch.mockImplementation((url) => {
      const scope = new URL(url, "http://localhost").searchParams.get("scope");

      if (scope === "all") {
        return Promise.resolve({
          activities: [{ id: "all-1" }],
          hasMore: true,
        });
      }

      return new Promise((resolve) => {
        resolveFollowing = resolve;
      });
    });

    const first = renderHook(() =>
      useSocialFeed({ scope: "all", userId: null }),
    );

    await waitFor(() => {
      expect(first.result.current.activities).toEqual([{ id: "all-1" }]);
    });

    first.unmount();

    const second = renderHook(() =>
      useSocialFeed({ scope: "following", userId: null }),
    );

    expect(second.result.current.activities).toEqual([]);
    expect(second.result.current.hasMore).toBe(false);

    await waitFor(() => {
      expect(typeof resolveFollowing).toBe("function");
    });

    await act(async () => {
      resolveFollowing({
        activities: [{ id: "following-1" }],
        hasMore: false,
      });
    });

    expect(second.result.current.activities).toEqual([
      { id: "following-1" },
    ]);
  });

});
