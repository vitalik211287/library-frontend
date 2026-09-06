import GenreShelf from "../GenreShelf/GenreShelf.jsx";

import "./GenreShelves.css";

const GenreShelves = ({
  shelves,
  onSelect,
}) => {
  if (!shelves.length) {
    return null;
  }

  return (
    <section className="genre-shelves">
      <div className="genre-shelves__header">
        <h2>Полички</h2>
      </div>

      <div className="genre-shelves__grid">
        {shelves.map((shelf) => (
          <GenreShelf
            key={shelf.id}
            shelf={shelf}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
};

export default GenreShelves;