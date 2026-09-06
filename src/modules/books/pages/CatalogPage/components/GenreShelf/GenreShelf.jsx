import "./GenreShelf.css";

const GenreShelf = ({
  shelf,
  onSelect,
}) => {
  const previewBooks = shelf.books.slice(0, 4);

  return (
    <button
      type="button"
      className="genre-shelf"
      onClick={() => onSelect(shelf.id)}
    >
      <div className="genre-shelf__header">
        <h2>{shelf.title}</h2>

        <span className="genre-shelf__count">
          {shelf.books.length}
        </span>
      </div>

      <div className="genre-shelf__covers">
        {previewBooks.map((book) => (
          <div
            key={book.id}
            className="genre-shelf__cover"
          >
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt=""
                loading="lazy"
              />
            ) : (
              <span aria-hidden="true">📖</span>
            )}
          </div>
        ))}
      </div>
    </button>
  );
};

export default GenreShelf;