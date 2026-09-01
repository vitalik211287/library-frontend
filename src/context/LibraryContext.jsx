import { createContext, useContext, useEffect, useMemo, useState } from "react";

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
     LOAD LIBRARIES
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

        return;
      }

      try {
        setIsLibrariesLoading(true);

        setLibrariesError("");

        const data = await apiFetch("/api/libraries");

        const loadedLibraries = Array.isArray(data) ? data : [];

        setLibraries(loadedLibraries);

        setActiveLibraryIdState((currentLibraryId) => {
          const existingLibrary = loadedLibraries.find(
            (library) => library.id === currentLibraryId,
          );

          if (existingLibrary) {
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
  }, [isAuthenticated, isAuthLoading]);

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

  const setActiveLibraryId = (libraryId) => {
    const library = libraries.find((item) => item.id === libraryId);

    if (!library) {
      return;
    }

    setActiveLibraryIdState(libraryId);

    localStorage.setItem("activeLibraryId", libraryId);
  };

  /* =========================
     REFRESH
  ========================= */

  const refreshLibraries = async () => {
    if (!isAuthenticated) {
      return [];
    }

    const data = await apiFetch("/api/libraries");

    const loadedLibraries = Array.isArray(data) ? data : [];

    setLibraries(loadedLibraries);

    return loadedLibraries;
  };

  /* =========================
     CREATE LIBRARY
  ========================= */

  const createLibrary = async (name) => {
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

    setLibraries((currentLibraries) => [...currentLibraries, library]);

    setActiveLibraryIdState(library.id);

    localStorage.setItem("activeLibraryId", library.id);

    return library;
  };

  /* =========================
     ADD MEMBER
  ========================= */

  const addLibraryMember = async (libraryId, email) => {
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
  };

  /* =========================
     VALUE
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

      addLibraryMember,
    }),
    [libraries, activeLibrary, isLibrariesLoading, librariesError],
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
