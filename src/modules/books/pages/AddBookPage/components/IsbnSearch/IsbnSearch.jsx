import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import "./IsbnSearch.css";

const IsbnSearch = ({
  isbn,
  isSearching,
  isbnInputRef,
  onIsbnChange,
  onSubmit,
  onOpenScanner,
}) => {
  return (
    <form className="isbn-search" onSubmit={onSubmit}>
      <div className="isbn-search__field">
        <input
          ref={isbnInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          placeholder="Введіть ISBN"
          value={isbn}
          onChange={onIsbnChange}
        />

        <button
          type="submit"
          className="isbn-search__button"
          disabled={isSearching}
          aria-label="Знайти книгу"
          title="Знайти книгу"
        >
          {isSearching ? "…" : <Icon name="search" size={22} />}
        </button>
      </div>

      <button
        type="button"
        className="isbn-scan__button"
        onClick={onOpenScanner}
        aria-label="Сканувати ISBN"
        title="Сканувати ISBN"
      >
        <Icon name="scanner" size={24} />
      </button>
    </form>
  );
};

export default IsbnSearch;
