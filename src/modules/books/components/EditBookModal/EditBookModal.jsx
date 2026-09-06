import Modal from "../../../../shared/components/Modal/Modal.jsx";

import useEditBookForm from "./hooks/useEditBookForm.js";

import "./EditBookModal.css";

const EditBookModal = ({
  book,
  activeLibraryId,
  onClose,
  onUpdated,
}) => {
  const {
    formData,
    isSaving,
    coverSrc,
    handleClose,
    handleChange,
    handleCoverChange,
    handleSubmit,
  } = useEditBookForm({
    book,
    activeLibraryId,
    onClose,
    onUpdated,
  });

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
