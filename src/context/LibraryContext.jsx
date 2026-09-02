import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiFetch } from "../utils/apiClient.js";

import { useAuth } from "./AuthContext.jsx";

const LibraryContext = createContext(null);

const LibraryProvider = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const [libraries, setLibraries] = useState([]);

  const [activeLibraryId, setActiveLibraryIdState] = useState(
    () => localStorage.getItem("activeLibraryId") || "",
  );

  const [isLibrariesLoading, setIsLibrariesLoading] = useState(false);

  const [librariesError, setLibrariesError] = useState("");

  /* =========================
     APPLY LIBRARIES
  ========================= */

  const applyLibraries = useCallback((loadedLibraries) => {
    setLibraries(loadedLibraries);

    setActiveLibraryIdState((currentLibraryId) => {
      const existingLibrary = loadedLibraries.find(
        (library) => library.id === currentLibraryId,
      );

      if (existingLibrary) {
        localStorage.setItem("activeLibraryId", existingLibrary.id);

        return existingLibrary.id;
      }

      const firstLibrary = loadedLibraries[0];

      if (!firstLibrary) {
        localStorage.removeItem("activeLibraryId");

        return "";
      }

      localStorage.setItem("activeLibraryId", firstLibrary.id);

      return firstLibrary.id;
    });
  }, []);

  /* =========================
     INITIAL LOAD
  ========================= */

  useEffect(() => {
    const loadLibraries = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        setLibraries([]);

        setActiveLibraryIdState("");

        setLibrariesError("");

        localStorage.removeItem("activeLibraryId");

        return;
      }

      try {
        setIsLibrariesLoading(true);

        setLibrariesError("");

        const data = await apiFetch("/api/libraries");

        const loadedLibraries = Array.isArray(data) ? data : [];

        applyLibraries(loadedLibraries);
      } catch (error) {
        console.error("Load libraries error:", error);

        setLibraries([]);

        setLibrariesError(
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити бібліотеки",
        );
      } finally {
        setIsLibrariesLoading(false);
      }
    };

    loadLibraries();
  }, [isAuthenticated, isAuthLoading, applyLibraries]);

  /* =========================
     ACTIVE LIBRARY
  ========================= */

  const activeLibrary = useMemo(
    () =>
      libraries.find((library) => library.id === activeLibraryId) ??
      libraries[0] ??
      null,
    [libraries, activeLibraryId],
  );

  const setActiveLibraryId = useCallback(
    (libraryId) => {
      const library = libraries.find((item) => item.id === libraryId);

      if (!library) {
        return;
      }

      setActiveLibraryIdState(libraryId);

      localStorage.setItem("activeLibraryId", libraryId);
    },
    [libraries],
  );

  /* =========================
     REFRESH
  ========================= */

  const refreshLibraries = useCallback(async () => {
    if (!isAuthenticated) {
      return [];
    }

    const data = await apiFetch("/api/libraries");

    const loadedLibraries = Array.isArray(data) ? data : [];

    applyLibraries(loadedLibraries);

    return loadedLibraries;
  }, [isAuthenticated, applyLibraries]);

  /* =========================
     CREATE
  ========================= */

  const createLibrary = useCallback(
    async (name) => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        throw new Error("Введіть назву бібліотеки");
      }

      const library = await apiFetch("/api/libraries", {
        method: "POST",

        body: {
          name: trimmedName,
        },
      });

      const loadedLibraries = await refreshLibraries();

      const createdLibrary =
        loadedLibraries.find((item) => item.id === library.id) ?? library;

      setActiveLibraryIdState(createdLibrary.id);

      localStorage.setItem("activeLibraryId", createdLibrary.id);

      return createdLibrary;
    },
    [refreshLibraries],
  );

  /* =========================
     RENAME
  ========================= */

  const renameLibrary = useCallback(async (libraryId, name) => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error("Введіть назву бібліотеки");
    }

    if (!libraryId) {
      throw new Error("Бібліотеку не вибрано");
    }

    const library = await apiFetch(`/api/libraries/${libraryId}`, {
      method: "PATCH",

      body: {
        name: trimmedName,
      },
    });

    setLibraries((currentLibraries) =>
      currentLibraries.map((item) =>
        item.id === libraryId
          ? {
              ...item,
              ...library,
            }
          : item,
      ),
    );

    return library;
  }, []);

  /* =========================
     DELETE
  ========================= */

  const deleteLibrary = useCallback(
    async (libraryId) => {
      if (!libraryId) {
        throw new Error("Бібліотеку не вибрано");
      }

      await apiFetch(`/api/libraries/${libraryId}`, {
        method: "DELETE",
      });

      return refreshLibraries();
    },
    [refreshLibraries],
  );

  /* =========================
     ADD MEMBER
  ========================= */

  const addLibraryMember = useCallback(
    async (libraryId, email) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail) {
        throw new Error("Введіть email");
      }

      if (!libraryId) {
        throw new Error("Бібліотеку не вибрано");
      }

      const member = await apiFetch(`/api/libraries/${libraryId}/members`, {
        method: "POST",

        body: {
          email: normalizedEmail,
        },
      });

      await refreshLibraries();

      return member;
    },
    [refreshLibraries],
  );

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value = useMemo(
    () => ({
      libraries,

      activeLibrary,

      activeLibraryId: activeLibrary?.id ?? "",

      setActiveLibraryId,

      isLibrariesLoading,

      librariesError,

      refreshLibraries,

      createLibrary,

      renameLibrary,

      deleteLibrary,

      addLibraryMember,
    }),
    [
      libraries,
      activeLibrary,
      setActiveLibraryId,
      isLibrariesLoading,
      librariesError,
      refreshLibraries,
      createLibrary,
      renameLibrary,
      deleteLibrary,
      addLibraryMember,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
};

const useLibrary = () => {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error("useLibrary must be used inside LibraryProvider");
  }

  return context;
};

export { LibraryProvider, useLibrary };
