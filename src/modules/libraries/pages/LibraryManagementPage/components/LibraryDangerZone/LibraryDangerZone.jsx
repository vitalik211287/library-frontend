import LibraryManagementPanel from "../LibraryManagementPanel.jsx";

import "./LibraryDangerZone.css";

const LibraryDangerZone = ({ isDeletingLibrary, onDeleteRequest }) => {
  return (
    <LibraryManagementPanel className="library-management-danger">
      <div className="library-management-card__header">
        <div>
          <h2>Небезпечна зона</h2>

          <p>
            Видалення бібліотеки незворотне. Книги та читацькі дані користувачів
            не видаляються, але сам простір бібліотеки та його учасники буде
            видалено.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="library-management-danger__button"
        onClick={onDeleteRequest}
        disabled={isDeletingLibrary}
      >
        {isDeletingLibrary ? "Видалення..." : "Видалити бібліотеку"}
      </button>
    </LibraryManagementPanel>
  );
};

export default LibraryDangerZone;
