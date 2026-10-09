import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import useSocialThread from "./useSocialThread.js";
import { apiFetch } from "../../../../../../../shared/api/apiClient.js";

vi.mock("../../../../../../../shared/api/apiClient.js", () => ({
  apiFetch: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useSocialThread", () => {
  it("prevents duplicate reply requests and allows another after completion", async () => {
    let finishPost;
    let postCount = 0;

    apiFetch.mockImplementation((url, options) => {
      if (url === "/api/social/posts" && options?.method === "POST") {
        postCount += 1;

        if (postCount === 1) {
          return new Promise((resolve) => {
            finishPost = resolve;
          });
        }

        return Promise.resolve({ id: "reply-2" });
      }

      return Promise.resolve({ replies: [] });
    });

    const onThreadCountChange = vi.fn();

    const { result } = renderHook(() =>
      useSocialThread({
        postId: "post-1",
        activityId: null,
        onThreadCountChange,
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let firstRequest;
    let secondRequest;

    act(() => {
      firstRequest = result.current.createReply({
        text: "First reply",
        parentId: "post-1",
      });

      secondRequest = result.current.createReply({
        text: "Duplicate reply",
        parentId: "post-1",
      });
    });

    expect(await secondRequest).toBe(false);
    expect(postCount).toBe(1);
    expect(typeof finishPost).toBe("function");

    await act(async () => {
      finishPost({ id: "reply-1" });
      expect(await firstRequest).toBe(true);
    });

    expect(result.current.isSending).toBe(false);

    await act(async () => {
      expect(
        await result.current.createReply({
          text: "Second reply",
          parentId: "post-1",
        }),
      ).toBe(true);
    });

    expect(postCount).toBe(2);
  });
});
