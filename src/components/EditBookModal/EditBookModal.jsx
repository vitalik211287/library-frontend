import { useState } from "react";
import toast from "react-hot-toast";
import "./EditBookModal.css";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

function EditBookModal({ book, onClose, onUpdated }) {
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

    setCover(file);

    const previewUrl = URL.createObjectURL(file);

    setCoverPreview(previewUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      const response = await fetch(
        `${API_URL}/api/books/${book.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
          }),
        },
      );

      const updatedBook = await response.json();

      if (!response.ok) {
        toast.error(
          updatedBook.message ||
            "Не вдалося оновити книгу",
        );
        return;
      }

      let finalBook = updatedBook;

      if (cover) {
        const coverData = new FormData();

        coverData.append("cover", cover);

        const coverResponse = await fetch(
          `${API_URL}/api/books/${book.id}/cover`,
          {
            method: "POST",
            body: coverData,
          },
        );

        const coverResult =
          await coverResponse.json();

        if (!coverResponse.ok) {
          toast.error(
            coverResult.message ||
              "Дані оновлено, але обкладинку змінити не вдалося",
          );

          onUpdated(updatedBook);
          return;
        }

        finalBook = coverResult;
      }

      toast.success("Книгу оновлено");

      onUpdated(finalBook);
    } catch (error) {
      console.error(
        "Помилка редагування книги:",
        error,
      );

      toast.error(
        "Не вдалося з'єднатися із сервером",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
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
    <div
      className="edit-modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="edit-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="edit-modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ×
        </button>

        <div className="edit-modal__header">
          <h2>Редагувати книгу</h2>

          <p className="edit-modal__subtitle">
            {book.title}
          </p>
        </div>

        <form
          className="edit-modal__form"
          onSubmit={handleSubmit}
        >
          <div className="edit-modal__layout">
            <div className="edit-modal__top">
              <div className="edit-modal__cover">
                <div className="edit-modal__cover-wrapper">
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                    />
                  ) : (
                    <div className="edit-modal__no-cover">
                      Немає обкладинки
                    </div>
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
              {isSaving
                ? "Збереження..."
                : "Зберегти"}
            </button>

            <button
              type="button"
              className="edit-modal__cancel"
              onClick={onClose}
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookModal;