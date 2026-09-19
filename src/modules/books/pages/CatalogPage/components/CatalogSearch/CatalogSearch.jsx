import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import "./CatalogSearch.css";

const CatalogSearch = ({
  search,
  searchBy,
  searchInputRef,
  onSearchChange,
  onSearchByChange,
  onOpenScanner,
}) => {
  return (
    <div className="catalog-search">
      <div className="catalog-search__field">
        <div className="catalog-search__input">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Пошук..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />

          <Icon name="search" />
        </div>

        <button
          type="button"
          className="catalog-scan__button"
          onClick={onOpenScanner}
          aria-label="Сканувати ISBN"
          title="Сканувати ISBN"
        >
          <Icon name="scanner" size={24} />
        </button>
      </div>

      <select
        value={searchBy}
        onChange={(event) => onSearchByChange(event.target.value)}
      >
        <option value="all">По всьому каталогу</option>
        <option value="title">За назвою</option>

        <option value="author">За автором</option>

        <option value="year">За роком</option>

        <option value="genre">За жанром</option>

        <option value="isbn">За ISBN</option>
      </select>
    </div>
  );
};

export default CatalogSearch;
