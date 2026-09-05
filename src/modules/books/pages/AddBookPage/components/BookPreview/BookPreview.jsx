import "./BookPreview.css";

const BookPreview = ({ book, setBook, onAddBook }) => {
  if (!book) {
    return null;
  }

  return (
    <div className="book-preview">
      <div className="book-preview__cover">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} />
        ) : (
          <div className="no-cover">Обкладинки немає</div>
        )}
      </div>

      <div className="book-preview__content">
        <h2>{book.title}</h2>

        <div className="book-fields">
          <label>
            <span>Автор</span>

            <input
              type="text"
              value={book.author || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  author: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Видавництво</span>

            <input
              type="text"
              value={book.publisher || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  publisher: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Рік</span>

            <input
              type="number"
              value={book.year || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  year: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>

          <label>
            <span>Сторінок</span>

            <input
              type="number"
              value={book.pages || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  pages: event.target.value ? Number(event.target.value) : null,
                })
              }
            />
          </label>

          <label>
            <span>Мова</span>

            <input
              type="text"
              value={book.language || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  language: event.target.value,
                })
              }
            />
          </label>

          <label>
            <span>Жанр</span>

            <input
              type="text"
              value={book.genre || ""}
              onChange={(event) =>
                setBook({
                  ...book,
                  genre: event.target.value,
                })
              }
            />
          </label>
        </div>

        <label className="description-field">
          <span>Опис</span>

          <textarea
            value={book.description || ""}
            onChange={(event) =>
              setBook({
                ...book,
                description: event.target.value,
              })
            }
          />
        </label>

        <div className="book-actions">
          <button type="button" onClick={onAddBook}>
            Додати в бібліотеку
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookPreview;

