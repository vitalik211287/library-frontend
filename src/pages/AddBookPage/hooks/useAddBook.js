import { useState } from "react";

import toast from "react-hot-toast";

import { apiFetch } from "../../../utils/apiClient.js";

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

    toast.error("Спочатку створіть або виберіть бібліотеку");

    return false;
  };

  const getSuccessMessage = () =>
    activeLibraryName
      ? `Книгу додано: ${activeLibraryName}`
      : "Книгу додано в бібліотеку";

  const addFoundBook = async () => {
    if (!book || isAdding) {
      return;
    }

    if (!ensureActiveLibrary()) {
      return;
    }

    if (!book.author?.trim()) {
      toast.error("Вкажіть автора");
      return;
    }

    const bookData = createBookData(book);

    setIsAdding(true);

    try {
      await apiFetch(`/api/libraries/${activeLibraryId}/books`, {
        method: "POST",
        body: bookData,
      });

      toast.success(getSuccessMessage());

      resetAfterAdd();
    } catch (error) {
      console.error("Помилка додавання:", error);

      toast.error(error.message || "Не вдалося з'єднатися із сервером");
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
    const cover = formData.get("cover");

    const bookData = {
      isbn: normalizeIsbn(formData.get("isbn")),
      title: formData.get("title"),
      author: formData.get("author"),

      ...(formData.get("publisher") && {
        publisher: formData.get("publisher"),
      }),

      ...(formData.get("year") && {
        year: Number(formData.get("year")),
      }),

      ...(formData.get("pages") && {
        pages: Number(formData.get("pages")),
      }),

      ...(formData.get("language") && {
        language: formData.get("language"),
      }),

      ...(formData.get("genre") && {
        genre: formData.get("genre"),
      }),

      ...(formData.get("description") && {
        description: formData.get("description"),
      }),
    };

    setIsAdding(true);

    try {
      const createdBook = await apiFetch(
        `/api/libraries/${activeLibraryId}/books`,
        {
          method: "POST",
          body: bookData,
        },
      );

      if (cover instanceof File && cover.size > 0) {
        const coverData = new FormData();

        coverData.append("cover", cover);

        try {
          await apiFetch(`/api/books/${createdBook.id}/cover`, {
            method: "POST",
            body: coverData,
          });
        } catch (error) {
          console.error("Помилка завантаження обкладинки:", error);

          toast.error(
            `Книгу додано, але обкладинку не завантажено: ${
              error.message || "невідома помилка"
            }`,
          );

          return;
        }
      }

      toast.success(getSuccessMessage());

      setManualMode(false);

      resetAfterAdd();

      form.reset();
    } catch (error) {
      console.error("Помилка ручного додавання:", error);

      toast.error(error.message || "Не вдалося з'єднатися із сервером");
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
