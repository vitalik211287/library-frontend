import { useEffect, useState } from "react";
import "./CatalogPage.css";
import EditBookModal from "../../components/EditBookModal/EditBookModal";

const API_URL = "https://library-backend-production-5d60.up.railway.app";

function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("title");
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/books`);

        const data = await response.json();

        if (!response.ok) {
          setMessage("Не вдалося завантажити книги");
          return;
        }

        setBooks(data);
      } catch (error) {
        console.error("Помилка завантаження книг:", error);

        setMessage("Помилка завантаження бібліотеки");
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const value = book[searchBy];

    if (value === null || value === undefined) {
      return false;
    }

    return String(value).toLowerCase().includes(query);
  });

  return (
    <div className="catalog-page">
      <h1>Каталог бібліотеки</h1>

      <p className="books-count">Книг у бібліотеці: {books.length}</p>

      {message && <p className="catalog-message">{message}</p>}

      <div className="catalog-search">
        <div className="catalog-search__input">
          <input
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.5 16.5" />
          </svg>
        </div>

        <select
          value={searchBy}
          onChange={(event) => setSearchBy(event.target.value)}
        >
          <option value="title">За назвою</option>
          <option value="author">За автором</option>
          <option value="year">За роком</option>
        </select>
      </div>

      <div className="books-grid">
        {filteredBooks.map((book) => (
          <div
            className="book-card"
            key={book.id}
            onClick={() => setSelectedBook(book)}
          >
            {book.coverUrl && (
              <img
                className="book-cover"
                src={book.coverUrl}
                alt={book.title}
              />
            )}

            <h2>{book.title}</h2>
            <p>{book.author}</p>

            {book.publisher && <p>Видавництво: {book.publisher}</p>}

            {book.year && <p>Рік: {book.year}</p>}

            {book.genre && <p>Жанр: {book.genre}</p>}
          </div>
        ))}
      </div>

      {/* ОСЬ СЮДИ — після books-grid */}
      {selectedBook && (
        <EditBookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onUpdated={(updatedBook) => {
            setBooks((currentBooks) =>
              currentBooks.map((book) =>
                book.id === updatedBook.id ? updatedBook : book,
              ),
            );

            setSelectedBook(null);
          }}
        />
      )}
    </div>
  );
}

export default CatalogPage;
