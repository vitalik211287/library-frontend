import { useState } from "react";

function App() {
  const [isbn, setIsbn] = useState("");
  const [book, setBook] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/books/lookup/${isbn}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setBook(null);
        setMessage("Книгу не знайдено");
        return;
      }

      setBook(data);
    } catch (error) {
      console.error("Помилка fetch:", error);
      setMessage("Помилка пошуку книги");
    }
  };

  const handleAddBook = async () => {
    if (!book) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch("http://localhost:4000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          year: book.year,
          pages: book.pages,
          language: book.language,
          genre: book.genre,
          description: book.description,
          coverUrl: book.coverUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Помилка сервера:", data);
        setMessage("Не вдалося додати книгу");
        return;
      }

      console.log("Додано:", data);

      setMessage("Книгу додано в бібліотеку");
    } catch (error) {
      console.error("Помилка додавання:", error);
      setMessage("Помилка додавання книги");
    }
  };

  return (
    <div>
      <h1>Моя бібліотека</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Введіть ISBN"
          value={isbn}
          onChange={(event) => setIsbn(event.target.value)}
        />

        <button type="submit">Знайти книгу</button>
      </form>

      {message && <p>{message}</p>}

      {book && (
        <div>
          {book.coverUrl && (
            <img
              src={book.coverUrl}
              alt={book.title}
              width="200"
            />
          )}

          <h2>{book.title}</h2>

          <p>Автор: {book.author}</p>
          <p>Видавництво: {book.publisher}</p>
          <p>Рік: {book.year}</p>
          <p>Сторінок: {book.pages}</p>
          <p>Мова: {book.language}</p>
          <p>Жанр: {book.genre}</p>

          <button onClick={handleAddBook}>
            Додати в бібліотеку
          </button>
        </div>
      )}
    </div>
  );
}

export default App;