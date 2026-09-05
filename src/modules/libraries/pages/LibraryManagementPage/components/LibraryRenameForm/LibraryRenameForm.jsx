const LibraryRenameForm = ({
  libraryName,
  activeLibraryName,
  isRenamingLibrary,
  onLibraryNameChange,
  onSubmit,
}) => {
  return (
    <section className="library-management-card">
      <div className="library-management-card__header">
        <div>
          <h2>Назва бібліотеки</h2>

          <p>Змініть назву цього бібліотечного простору.</p>
        </div>
      </div>

      <form
        className="library-management-add"
        onSubmit={onSubmit}
      >
        <input
          type="text"
          value={libraryName}
          onChange={(event) =>
            onLibraryNameChange(event.target.value)
          }
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
          {isRenamingLibrary
            ? "Збереження..."
            : "Зберегти"}
        </button>
      </form>
    </section>
  );
};

export default LibraryRenameForm;
