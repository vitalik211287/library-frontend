import { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../../utils/apiError";
import BarcodeScanner from "../../components/BarcodeScanner/BarcodeScanner";
import "./AddBookPage.css";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

function AddBookPage() {
  const [isbn, setIsbn] = useState("");
  const [book, setBook] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Пошук книги за ISBN
  const lookupBook = async (isbnValue) => {
    const cleanIsbn = isbnValue.trim();

    if (!cleanIsbn) {
      toast.error("Введіть ISBN");
      return;
    }

    setBook(null);

    try {
      const response = await fetch(
        `${API_URL}/api/books/lookup/${cleanIsbn}`,
      );

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          toast.error("Книгу з таким ISBN не знайдено");
          return;
        }

        const errorMessage = await getApiErrorMessage(response);

        toast.error(errorMessage);
        return;
      }

      const data = await response.json();

      setBook(data);
    } catch (error) {
      console.error("Помилка пошуку книги:", error);

      toast.error("Не вдалося з'єднатися із сервером");
    }
  };

  // Ручний пошук через форму
  const handleSubmit = async (event) => {
    event.preventDefault();

    await lookupBook(isbn);
  };

  // ISBN отриманий зі сканера
  const handleScan = async (scannedIsbn) => {
    setIsbn(scannedIsbn);
    setScannerOpen(false);

    await lookupBook(scannedIsbn);
  };

  // Додавання знайденої книги
  const handleAddBook = async () => {
    if (!book) {
      return;
    }

    if (!book.author?.trim()) {
      toast.error("Вкажіть автора");
      return;
    }

    const bookData = {
      isbn: book.isbn,
      title: book.title,
      author: book.author,

      ...(book.publisher && {
        publisher: book.publisher,
      }),

      ...(book.year && {
        year: book.year,
      }),

      ...(book.pages && {
        pages: book.pages,
      }),

      ...(book.language && {
        language: book.language,
      }),

      ...(book.genre && {
        genre: book.genre,
      }),

      ...(book.description && {
        description: book.description,
      }),

      ...(book.coverUrl && {
        coverUrl: book.coverUrl,
      }),
    };

    try {
      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorMessage = await getApiErrorMessage(response);

        toast.error(errorMessage);
        return;
      }

      await response.json();

      toast.success("Книгу додано в бібліотеку");

      setIsbn("");
      setBook(null);
    } catch (error) {
      console.error("Помилка додавання:", error);

      toast.error("Не вдалося з'єднатися із сервером");
    }
  };

  // Ручне додавання
  const handleManualAdd = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const cover = formData.get("cover");

    const bookData = {
      isbn: formData.get("isbn"),
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

    try {
      // Спочатку створюємо книгу
      const response = await fetch(`${API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorMessage = await getApiErrorMessage(response);

        toast.error(errorMessage);
        return;
      }

      const createdBook = await response.json();

      // Якщо обрана локальна обкладинка
      if (cover instanceof File && cover.size > 0) {
        const coverData = new FormData();

        coverData.append("cover", cover);

        const coverResponse = await fetch(
          `${API_URL}/api/books/${createdBook.id}/cover`,
          {
            method: "POST",
            body: coverData,
          },
        );

        if (!coverResponse.ok) {
          const errorMessage =
            await getApiErrorMessage(coverResponse);

          toast.error(
            `Книгу додано, але обкладинку не завантажено: ${errorMessage}`,
          );

          return;
        }
      }

      toast.success("Книгу додано в бібліотеку");

      setManualMode(false);
      setIsbn("");
      setBook(null);

      form.reset();
    } catch (error) {
      console.error("Помилка ручного додавання:", error);

      toast.error("Не вдалося з'єднатися із сервером");
    }
  };

  return (
    <div className="add-book-page">
      <h1>Додати книгу</h1>

      <form className="isbn-search" onSubmit={handleSubmit}>
        <div className="isbn-search__field">
          <input
            type="text"
            placeholder="Введіть ISBN"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
          />

          <button
            type="submit"
            className="isbn-search__button"
            aria-label="Знайти книгу"
            title="Знайти книгу"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              aria-hidden="true"
            >
              <path
                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <button
          type="button"
          className="isbn-scan__button"
          onClick={() => setScannerOpen(true)}
          aria-label="Сканувати ISBN"
          title="Сканувати ISBN"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
          >
            <path
              d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <rect
              x="7"
              y="8"
              width="10"
              height="8"
              rx="1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />

            <path
              d="M9 10v4M11 10v4M13 10v4M15 10v4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </button>
      </form>

      {book && (
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
                      year: event.target.value
                        ? Number(event.target.value)
                        : null,
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
                      pages: event.target.value
                        ? Number(event.target.value)
                        : null,
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
              <button
                type="button"
                onClick={handleAddBook}
              >
                Додати в бібліотеку
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="manual-toggle"
        type="button"
        onClick={() =>
          setManualMode((current) => !current)
        }
      >
        {manualMode
          ? "Закрити ручне додавання"
          : "Додати вручну"}
      </button>

      {manualMode && (
        <form
          className="manual-form"
          onSubmit={handleManualAdd}
        >
          <input
            type="text"
            name="isbn"
            placeholder="ISBN"
            value={isbn}
            onChange={(event) =>
              setIsbn(event.target.value)
            }
          />

          <input
            type="text"
            name="title"
            placeholder="Назва книги"
          />

          <input
            type="text"
            name="author"
            placeholder="Автор"
          />

          <input
            type="text"
            name="publisher"
            placeholder="Видавництво"
          />

          <input
            type="number"
            name="year"
            placeholder="Рік"
          />

          <input
            type="number"
            name="pages"
            placeholder="Кількість сторінок"
          />

          <input
            type="text"
            name="language"
            placeholder="Мова"
            defaultValue="Українська"
          />

          <input
            type="text"
            name="genre"
            placeholder="Жанр"
          />

          <textarea
            name="description"
            placeholder="Опис"
          />

          <label className="cover-input">
            <span>Обкладинка</span>

            <input
              type="file"
              name="cover"
              accept="image/jpeg,image/png,image/webp"
            />
          </label>

          <button type="submit">
            Зберегти книгу
          </button>
        </form>
      )}

      {scannerOpen && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </div>
  );
}

export default AddBookPage;