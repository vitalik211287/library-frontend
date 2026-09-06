import { useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../../../shared/api/apiClient.js";
import { useLibraryBooks } from "../../../../libraries/context/LibraryBooksContext.jsx";

import { createBookData, normalizeIsbn } from "../utils/bookHelpers.js";

const useAddBook = ({
  book,
  setBook,
  setIsbn,
  setManualMode,
  resetLastSearch,
  focusIsbnInput,
  activeLibraryId,
  activeLibraryName,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const { refreshBooks } = useLibraryBooks();

  const resetAfterAdd = () => {
    resetLastSearch();

    setIsbn("");
    setBook(null);

    focusIsbnInput();
  };

  const ensureActiveLibrary = () => {
    if (activeLibraryId) {
      return true;
    }

    toast.error("РЎРїРѕС‡Р°С‚РєСѓ СЃС‚РІРѕСЂС–С‚СЊ Р°Р±Рѕ РІРёР±РµСЂС–С‚СЊ Р±С–Р±Р»С–РѕС‚РµРєСѓ");

    return false;
  };

  const getSuccessMessage = () =>
    activeLibraryName
      ? `РљРЅРёРіСѓ РґРѕРґР°РЅРѕ: ${activeLibraryName}`
      : "РљРЅРёРіСѓ РґРѕРґР°РЅРѕ РІ Р±С–Р±Р»С–РѕС‚РµРєСѓ";

  const addFoundBook = async () => {
    if (!book || isAdding) {
      return;
    }

    if (!ensureActiveLibrary()) {
      return;
    }

    if (!book.author?.trim()) {
      toast.error("Р’РєР°Р¶С–С‚СЊ Р°РІС‚РѕСЂР°");

      return;
    }

    const bookData = createBookData(book);

    setIsAdding(true);

    try {
      await apiFetch(`/api/libraries/${activeLibraryId}/books`, {
        method: "POST",
        body: bookData,
      });

      await refreshBooks();

      toast.success(getSuccessMessage());

      resetAfterAdd();
    } catch (error) {
      console.error("РџРѕРјРёР»РєР° РґРѕРґР°РІР°РЅРЅСЏ:", error);

      toast.error(error.message || "РќРµ РІРґР°Р»РѕСЃСЏ Р·'С”РґРЅР°С‚РёСЃСЏ С–Р· СЃРµСЂРІРµСЂРѕРј");
    } finally {
      setIsAdding(false);
    }
  };

  const addManualBook = async (event) => {
    event.preventDefault();

    if (isAdding) {
      return;
    }

    if (!ensureActiveLibrary()) {
      return;
    }

    const form = event.currentTarget;

    const formData = new FormData(form);

    const requestData = new FormData();

    requestData.append("isbn", normalizeIsbn(formData.get("isbn")));

    requestData.append("title", String(formData.get("title") || ""));

    requestData.append("author", String(formData.get("author") || ""));

    const optionalFields = ["publisher", "language", "genre", "description"];

    optionalFields.forEach((field) => {
      const value = formData.get(field);

      if (typeof value === "string" && value.trim()) {
        requestData.append(field, value.trim());
      }
    });

    const year = formData.get("year");

    if (typeof year === "string" && year.trim()) {
      requestData.append("year", year.trim());
    }

    const pages = formData.get("pages");

    if (typeof pages === "string" && pages.trim()) {
      requestData.append("pages", pages.trim());
    }

    const cover = formData.get("cover");

    if (cover instanceof File && cover.size > 0) {
      requestData.append("cover", cover);
    }

    setIsAdding(true);

    try {
      await apiFetch(`/api/libraries/${activeLibraryId}/books`, {
        method: "POST",
        body: requestData,
      });

      await refreshBooks();

      toast.success(getSuccessMessage());

      setManualMode(false);

      resetAfterAdd();

      form.reset();
    } catch (error) {
      console.error("РџРѕРјРёР»РєР° СЂСѓС‡РЅРѕРіРѕ РґРѕРґР°РІР°РЅРЅСЏ:", error);

      toast.error(error.message || "РќРµ РІРґР°Р»РѕСЃСЏ Р·'С”РґРЅР°С‚РёСЃСЏ С–Р· СЃРµСЂРІРµСЂРѕРј");
    } finally {
      setIsAdding(false);
    }
  };

  return {
    isAdding,
    addFoundBook,
    addManualBook,
  };
};

export default useAddBook;





