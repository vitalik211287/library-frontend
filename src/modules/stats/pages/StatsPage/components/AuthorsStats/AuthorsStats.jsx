import "./AuthorsStats.css";

const AuthorsStats = ({ authors = [] }) => {
  return (
    <article className="stats-card">
      <div className="stats-card__header">
        <div>
          <h2>Улюблені автори</h2>

          <p>За кількістю прочитаних книг</p>
        </div>
      </div>

      {authors.length === 0 ? (
        <div className="stats-empty">Поки немає даних</div>
      ) : (
        <div className="authors-list">
          {authors.map((author, index) => (
            <div className="author-item" key={author.name}>
              <span className="author-item__position">{index + 1}</span>

              <div className="author-item__content">
                <strong>{author.name}</strong>

                <span>
                  {author.books} {author.books === 1 ? "книга" : "книги"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default AuthorsStats;

