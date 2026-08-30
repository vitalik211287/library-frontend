import { useMemo } from "react";

import "./GenreStats.css";

const GenreStats = ({ genres = [] }) => {
  const maxGenreBooks = useMemo(() => {
    if (!genres.length) {
      return 1;
    }

    return Math.max(...genres.map((genre) => genre.books || 0), 1);
  }, [genres]);

  return (
    <article className="stats-card">
      <div className="stats-card__header">
        <div>
          <h2>Жанри</h2>

          <p>Розподіл прочитаних книг</p>
        </div>
      </div>

      {genres.length === 0 ? (
        <div className="stats-empty">Поки немає даних</div>
      ) : (
        <div className="genre-list">
          {genres.map((genre) => {
            const width = (genre.books / maxGenreBooks) * 100;

            return (
              <div className="genre-item" key={genre.name}>
                <div className="genre-item__top">
                  <strong>{genre.name}</strong>

                  <span>
                    {genre.books} · {genre.percent}%
                  </span>
                </div>

                <div className="genre-item__track">
                  <div
                    className="genre-item__bar"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
};

export default GenreStats;
