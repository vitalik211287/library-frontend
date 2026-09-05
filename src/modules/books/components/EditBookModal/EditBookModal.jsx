import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import Modal from "../../../../shared/components/Modal/Modal.jsx";

import { API_URL, apiFetch } from "../../../../shared/api/apiClient.js";

import "./EditBookModal.css";

const EditBookModal = ({ book, activeLibraryId, onClose, onUpdated }) => {
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
          console.error("Помилка оновлення обкладинки:", coverError);

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
      console.error("Помилка редагування книги:", error);

      toast.error(error.message || "Не вдалося з'єднатися із сервером");
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

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title="Редагувати книгу"
      subtitle={book.title}
      className="edit-modal"
      closeOnEscape={!isSaving}
      closeOnBackdrop={!isSaving}
    >
      <form className="edit-modal__form" onSubmit={handleSubmit}>
        <div className="edit-modal__layout">
          <div className="edit-modal__top">
            <div className="edit-modal__cover">
              <div className="edit-modal__cover-wrapper">
                {coverSrc ? (
                  <img src={coverSrc} alt={book.title} />
                ) : (
                  <div className="edit-modal__no-cover">Немає обкладинки</div>
                )}

                <label
                  className="edit-modal__cover-plus"
                  aria-label="Змінити обкладинку"
                  title="Змінити обкладинку"
                >
                  <span>+</span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                  />
                </label>
              </div>
            </div>

            <div className="edit-modal__main-fields">
              <label>
                Назва
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>

              <label>
                Автор
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="edit-modal__fields">
            <div className="edit-modal__row">
              <label>
                Видавництво
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                />
              </label>

              <label>
                Рік
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="edit-modal__row">
              <label>
                Сторінок
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                />
              </label>

              <label>
                Мова
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Жанр
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
              />
            </label>

            <label>
              Опис
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <div className="edit-modal__actions">
          <button
            type="submit"
            className="edit-modal__save"
            disabled={isSaving}
          >
            {isSaving ? "Збереження..." : "Зберегти"}
          </button>

          <button
            type="button"
            className="edit-modal__cancel"
            onClick={handleClose}
            disabled={isSaving}
          >
            Скасувати
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditBookModal;



