import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  API_URL,
  apiFetch,
} from "../../../../../shared/api/apiClient.js";

const useEditBookForm = ({
  book,
  activeLibraryId,
  onClose,
  onUpdated,
}) => {
  const [formData, setFormData] = useState({
    title: book.title || "",
    author: book.author || "",
    publisher: book.publisher || "",
    year: book.year || "",
    pages: book.pages || "",
    language: book.language || "",
    genre: book.genre || "",
    description: book.description || "",
  });

  const [cover, setCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleClose = () => {
    if (isSaving) {
      return;
    }

    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    setCover(file);

    const previewUrl = URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!activeLibraryId) {
      toast.error("Бібліотеку не вибрано");

      return;
    }

    if (!formData.title.trim()) {
      toast.error("Вкажіть назву книги");

      return;
    }

    if (!formData.author.trim()) {
      toast.error("Вкажіть автора");

      return;
    }

    setIsSaving(true);

    try {
      const updatedBook = await apiFetch(
        `/api/libraries/${activeLibraryId}/books/${book.id}`,
        {
          method: "PATCH",

          body: {
            title: formData.title.trim(),
            author: formData.author.trim(),

            ...(formData.publisher.trim() && {
              publisher: formData.publisher.trim(),
            }),

            ...(formData.year && {
              year: Number(formData.year),
            }),

            ...(formData.pages && {
              pages: Number(formData.pages),
            }),

            ...(formData.language.trim() && {
              language: formData.language.trim(),
            }),

            ...(formData.genre.trim() && {
              genre: formData.genre.trim(),
            }),

            ...(formData.description.trim() && {
              description: formData.description.trim(),
            }),
          },
        },
      );

      let finalBook = updatedBook;

      if (cover) {
        const coverData = new FormData();

        coverData.append("cover", cover);

        try {
          finalBook = await apiFetch(
            `/api/libraries/${activeLibraryId}/books/${book.id}/cover`,
            {
              method: "POST",
              body: coverData,
            },
          );
        } catch (coverError) {
          console.error(
            "Помилка оновлення обкладинки:",
            coverError,
          );

          toast.error(
            coverError.message ||
              "Дані оновлено, але обкладинку змінити не вдалося",
          );

          onUpdated(updatedBook);

          return;
        }
      }

      toast.success("Книгу оновлено");

      onUpdated(finalBook);
    } catch (error) {
      console.error(
        "Помилка редагування книги:",
        error,
      );

      toast.error(
        error.message ||
          "Не вдалося з'єднатися із сервером",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const coverSrc =
    coverPreview ||
    (book.coverUrl
      ? book.coverUrl.startsWith("/uploads")
        ? `${API_URL}${book.coverUrl}`
        : book.coverUrl
      : null);

  return {
    formData,
    isSaving,
    coverSrc,
    handleClose,
    handleChange,
    handleCoverChange,
    handleSubmit,
  };
};

export default useEditBookForm;
