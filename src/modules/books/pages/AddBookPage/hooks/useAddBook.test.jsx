import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

import useAddBook from "./useAddBook.js";
import { apiFetch } from "../../../../../shared/api/apiClient.js";
import { useLibraryBooks } from "../../../../libraries/context/LibraryBooksContext.jsx";

vi.mock("../../../../../shared/api/apiClient.js", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../../../../libraries/context/LibraryBooksContext.jsx", () => ({
  useLibraryBooks: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("useAddBook", () => {
  it("prevents duplicate POST requests", async () => {
    let finishPost;

    apiFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishPost = resolve;
        }),
    );

    useLibraryBooks.mockReturnValue({
      refreshBooks: vi.fn().mockResolvedValue(undefined),
    });

    const { result } = renderHook(() =>
      useAddBook({
        book: {
          isbn: "9786170000000",
          title: "Test Book",
          author: "Test Author",
        },
        setBook: vi.fn(),
        coverFile: null,
        setCoverFile: vi.fn(),
        setIsbn: vi.fn(),
        setManualMode: vi.fn(),
        resetLastSearch: vi.fn(),
        focusIsbnInput: vi.fn(),
        activeLibraryId: "library-1",
      }),
    );

    let firstRequest;
    let secondRequest;

    act(() => {
      firstRequest = result.current.addFoundBook();
      secondRequest = result.current.addFoundBook();
    });

    expect(apiFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishPost({});
      await Promise.all([firstRequest, secondRequest]);
    });
  });

  it("prevents duplicate manual book submissions", async () => {
    let finishPost;

    apiFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishPost = resolve;
        }),
    );

    useLibraryBooks.mockReturnValue({
      refreshBooks: vi.fn().mockResolvedValue(undefined),
    });

    const { result } = renderHook(() =>
      useAddBook({
        book: null,
        setBook: vi.fn(),
        coverFile: null,
        setCoverFile: vi.fn(),
        setIsbn: vi.fn(),
        setManualMode: vi.fn(),
        resetLastSearch: vi.fn(),
        focusIsbnInput: vi.fn(),
        activeLibraryId: "library-1",
      }),
    );

    const form = document.createElement("form");

    const title = document.createElement("input");
    title.name = "title";
    title.value = "Test Book";
    form.appendChild(title);

    const author = document.createElement("input");
    author.name = "author";
    author.value = "Test Author";
    form.appendChild(author);

    const isbn = document.createElement("input");
    isbn.name = "isbn";
    isbn.value = "9786170000000";
    form.appendChild(isbn);

    const event = {
      preventDefault: vi.fn(),
      currentTarget: form,
    };

    let firstRequest;
    let secondRequest;

    act(() => {
      firstRequest = result.current.addManualBook(event);
      secondRequest = result.current.addManualBook(event);
    });

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/libraries/library-1/books",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );

    await act(async () => {
      finishPost({});
      await Promise.all([firstRequest, secondRequest]);
    });
  });

  it("allows retry after an API error", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      apiFetch
        .mockRejectedValueOnce(new Error("Server unavailable"))
        .mockResolvedValueOnce({});

      useLibraryBooks.mockReturnValue({
        refreshBooks: vi.fn().mockResolvedValue(undefined),
      });

      const { result } = renderHook(() =>
        useAddBook({
          book: {
            isbn: "9786170000000",
            title: "Test Book",
            author: "Test Author",
          },
          setBook: vi.fn(),
          coverFile: null,
          setCoverFile: vi.fn(),
          setIsbn: vi.fn(),
          setManualMode: vi.fn(),
          resetLastSearch: vi.fn(),
          focusIsbnInput: vi.fn(),
          activeLibraryId: "library-1",
        }),
      );

      await act(async () => {
        await result.current.addFoundBook();
      });

      expect(apiFetch).toHaveBeenCalledTimes(1);
      expect(result.current.isAdding).toBe(false);

      await act(async () => {
        await result.current.addFoundBook();
      });

      expect(apiFetch).toHaveBeenCalledTimes(2);
      expect(result.current.isAdding).toBe(false);
    } finally {
      errorSpy.mockRestore();
    }
  });

});
