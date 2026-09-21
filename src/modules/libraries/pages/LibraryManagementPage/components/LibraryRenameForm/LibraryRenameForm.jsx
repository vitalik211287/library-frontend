import { useState } from "react";

import LibraryManagementPanel from "../LibraryManagementPanel.jsx";

import "../LibraryManagementForm.css";

const LibraryRenameForm = ({
  activeLibraryName,
  isRenamingLibrary,
  onSubmit,
}) => {
  const [libraryName, setLibraryName] = useState(
    () => activeLibraryName ?? "",
  );

  const handleSubmit = (event) => {
    onSubmit(event, libraryName);
  };
  return (
    <LibraryManagementPanel>
      <div className="library-management-card__header">
        <div>
          <h2>Назва бібліотеки</h2>

          <p>Змініть назву цього бібліотечного простору.</p>
        </div>
      </div>

      <form className="library-management-add" onSubmit={handleSubmit}>
        <input
          type="text"
          value={libraryName}
          onChange={(event) => setLibraryName(event.target.value)}
          placeholder="Назва бібліотеки"
          disabled={isRenamingLibrary}
          required
        />

        <button
          type="submit"
          disabled={
            isRenamingLibrary ||
            libraryName.trim() === activeLibraryName?.trim()
          }
        >
          {isRenamingLibrary ? "Збереження..." : "Зберегти"}
        </button>
      </form>
    </LibraryManagementPanel>
  );
};

export default LibraryRenameForm;
