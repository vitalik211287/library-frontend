import "./UsersHeader.css";

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21a7 7 0 0 1 14 0" />

    <circle cx="17" cy="8" r="3" />
    <path d="M17 14a6 6 0 0 1 5 2.7" />
  </svg>
);

const UsersHeader = () => {
  return (
    <header className="users-header">
      <div className="users-header__icon">
        <UsersIcon />
      </div>

      <div className="users-header__content">
        <h2>Читачі</h2>

        <p>
          Знаходьте інших читачів і підписуйтеся на них.
        </p>
      </div>
    </header>
  );
};

export default UsersHeader;
