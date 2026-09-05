import { BookIcon, ChevronIcon } from "../HomeIcons.jsx";

const LibrarySwitcher = ({
  libraries,
  activeLibrary,
  isOpen,
  onToggle,
  onSelect,
  onCreate,
  onAddMember,
  onManage,
}) => {
  return (
    <div className="library-switcher">
      <button
        type="button"
        className="library-switcher__button"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <BookIcon />

        <span>{activeLibrary?.name ?? "Бібліотека"}</span>

        <ChevronIcon />
      </button>

      {isOpen && (
        <div className="library-switcher__menu">
          {libraries.map((library) => (
            <button
              type="button"
              className={`library-switcher__item ${
                library.id === activeLibrary?.id
                  ? "library-switcher__item--active"
                  : ""
              }`}
              key={library.id}
              onClick={() => onSelect(library.id)}
            >
              {library.name}
            </button>
          ))}

          <div className="library-switcher__separator" />

          <button
            type="button"
            className="library-switcher__item"
            onClick={onCreate}
          >
            + Створити бібліотеку
          </button>

          <button
            type="button"
            className="library-switcher__item"
            disabled={!activeLibrary}
            onClick={onAddMember}
          >
            ?? Додати учасника
          </button>

          <button
            type="button"
            className="library-switcher__item"
            disabled={!activeLibrary}
            onClick={onManage}
          >
            ? Керування бібліотекою
          </button>
        </div>
      )}
    </div>
  );
};

export default LibrarySwitcher;
