import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import useReadingRouter from "./useReadingRouter.js";
import { getBookFiles } from "../../modules/books/api/bookFilesApi.js";
import { getOfflineEpubsForBook } from "../../modules/books/offline/offlineEpubStorage.js";

const routing = vi.hoisted(() => ({
  navigate: vi.fn(),
  setSearchParams: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => routing.navigate,
  useLocation: () => ({
    pathname: "/account",
    search: "?tab=books",
    state: null,
  }),
  useSearchParams: () => [
    new URLSearchParams("tab=books"),
    routing.setSearchParams,
  ],
}));

vi.mock("../../modules/auth/context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    isAuthenticated: true,
    isAuthLoading: false,
  }),
}));

vi.mock("../../modules/libraries/context/LibraryContext.jsx", () => ({
  useLibrary: () => ({ activeLibraryId: "library-1" }),
}));

vi.mock("../../modules/libraries/context/LibraryBooksContext.jsx", () => ({
  useLibraryBooks: () => ({
    books: [],
    isBooksLoading: false,
    refreshBooks: vi.fn(),
    updateBook: vi.fn(),
  }),
}));

vi.mock("../../modules/user-books/context/UserBooksContext.jsx", () => ({
  useUserBooks: () => ({
    currentBooks: [],
    refreshCurrentBooks: vi.fn(),
  }),
}));

vi.mock("../../modules/reading/hooks/useRefreshReadingData.js", () => ({
  default: () => vi.fn(),
}));

vi.mock("../../modules/reading/offline/offlineReadingQueue.js", () => ({
  listOfflineManualSessions: vi.fn(),
}));

vi.mock("../../modules/books/api/bookFilesApi.js", () => ({
  getBookFiles: vi.fn(),
}));

vi.mock("../../modules/books/offline/offlineEpubStorage.js", () => ({
  getOfflineEpubsForBook: vi.fn(),
}));

vi.mock("../../shared/api/apiClient.js", () => ({
  apiFetch: vi.fn(),
  hasToken: vi.fn(() => true),
}));

vi.mock("react-hot-toast", () => ({
  toast: { error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("unified reading routing", () => {
  it("opens EPUB by default when continuing a book", async () => {
    getBookFiles.mockResolvedValue([
      { id: "file-1", format: "EPUB" },
    ]);

    const { result } = renderHook(() =>
      useReadingRouter({ closeMobileMenu: vi.fn() }),
    );

    await act(async () => {
      await result.current.handleOpenReadingBook("book-1");
    });

    expect(getBookFiles).toHaveBeenCalledWith("library-1", "book-1");
    expect(routing.navigate).toHaveBeenCalledWith(
      "/reader/library-1/book-1/file-1",
      expect.objectContaining({
        state: { ebookFrom: "/account?tab=books" },
      }),
    );
    expect(routing.setSearchParams).not.toHaveBeenCalled();
  });

  it("preserves explicit manual reading", async () => {
    const { result } = renderHook(() =>
      useReadingRouter({ closeMobileMenu: vi.fn() }),
    );

    await act(async () => {
      await result.current.handleOpenReadingBook(
        "book-1",
        "library-1",
        { intent: "manual" },
      );
    });

    expect(getBookFiles).not.toHaveBeenCalled();
    expect(routing.setSearchParams).toHaveBeenCalled();

    const params = routing.setSearchParams.mock.calls[0][0];
    expect(params.get("reading")).toBe("book-1");
    expect(params.get("readingLibrary")).toBe("library-1");
    expect(routing.navigate).not.toHaveBeenCalled();
  });

  it("falls back to manual reading when EPUB is absent", async () => {
    getBookFiles.mockResolvedValue([]);

    const { result } = renderHook(() =>
      useReadingRouter({ closeMobileMenu: vi.fn() }),
    );

    await act(async () => {
      await result.current.handleOpenReadingBook("book-1");
    });

    expect(getBookFiles).toHaveBeenCalledWith("library-1", "book-1");
    const params = routing.setSearchParams.mock.calls[0][0];
    expect(params.get("reading")).toBe("book-1");
    expect(routing.navigate).not.toHaveBeenCalled();
  });
});

describe("EPUB routing edge cases", () => {
  it("offers a picker when a book has multiple EPUBs", async () => {
    getBookFiles.mockResolvedValue([
      { id: "file-1", format: "EPUB" },
      { id: "file-2", format: "EPUB" },
      { id: "file-3", format: "PDF" },
    ]);

    const { result } = renderHook(() =>
      useReadingRouter({ closeMobileMenu: vi.fn() }),
    );

    await act(async () => {
      await result.current.handleOpenReadingBook("book-1");
    });

    expect(result.current.readerFilePicker).toMatchObject({
      book: { id: "book-1" },
      libraryId: "library-1",
      returnToPicker: false,
    });

    expect(routing.navigate).not.toHaveBeenCalled();

    act(() => {
      result.current.handleSelectReaderFile({
        id: "file-2",
        format: "EPUB",
      });
    });

    expect(routing.navigate).toHaveBeenCalledWith(
      "/reader/library-1/book-1/file-2",
      expect.any(Object),
    );
  });

  it("opens a cached EPUB while offline", async () => {
    const original = Object.getOwnPropertyDescriptor(
      window.navigator,
      "onLine",
    );

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    try {
      getOfflineEpubsForBook.mockResolvedValue([
        {
          fileId: "cached-file",
          file: { fileName: "cached.epub" },
          blob: { size: 256 },
        },
      ]);

      const { result } = renderHook(() =>
        useReadingRouter({ closeMobileMenu: vi.fn() }),
      );

      await act(async () => {
        await result.current.handleOpenReadingBook("book-1");
      });

      expect(getBookFiles).not.toHaveBeenCalled();
      expect(getOfflineEpubsForBook).toHaveBeenCalledWith({
        userId: "user-1",
        libraryId: "library-1",
        bookId: "book-1",
      });

      expect(routing.navigate).toHaveBeenCalledWith(
        "/reader/library-1/book-1/cached-file",
        expect.any(Object),
      );
    } finally {
      if (original) {
        Object.defineProperty(window.navigator, "onLine", original);
      } else {
        delete window.navigator.onLine;
      }
    }
  });
});
