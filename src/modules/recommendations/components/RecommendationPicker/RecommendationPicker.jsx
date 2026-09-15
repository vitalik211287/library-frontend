import HomePanel from "../../../home/components/HomePanel/HomePanel.jsx";

import "./RecommendationPicker.css";

const RECOMMENDATION_OPTIONS = [
  { tag: "dark", label: "Похмуре", emoji: "🌑" },
  { tag: "cozy", label: "Затишне", emoji: "☕" },
  { tag: "humorous", label: "Веселе", emoji: "😄" },
  { tag: "emotional", label: "Емоційне", emoji: "❤️" },
  { tag: "adventure", label: "Пригоди", emoji: "🗺️" },
  { tag: "mystery", label: "Таємниця", emoji: "🔎" },
  { tag: "space", label: "Космос", emoji: "🚀" },
  { tag: "magic", label: "Магія", emoji: "✨" },
  { tag: "psychological", label: "Психологічне", emoji: "🧠" },
  { tag: "philosophical", label: "Філософське", emoji: "💭" },
];

const RecommendationPicker = ({
  selectedTags,
  onChange,
  onSubmit,
  isLoading = false,
}) => {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((item) => item !== tag));
      return;
    }

    if (selectedTags.length < 3) {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <HomePanel className="recommendation-picker">
      <div className="home-panel__header">
        <div>
          <h2>Що почитати?</h2>
        </div>
      </div>

      <p className="recommendation-picker__description">
        Обери до трьох варіантів — підберемо книги з твоєї бібліотеки.
      </p>

      <div className="recommendation-picker__options">
        {RECOMMENDATION_OPTIONS.map(({ tag, label, emoji }) => {
          const isSelected = selectedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              className={`recommendation-picker__option ${
                isSelected ? "is-selected" : ""
              }`}
              onClick={() => toggleTag(tag)}
              aria-pressed={isSelected}
            >
              <span aria-hidden="true">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="home-primary-button recommendation-picker__submit"
        onClick={onSubmit}
        disabled={selectedTags.length === 0 || isLoading}
      >
        {isLoading ? "Підбираємо…" : "Підібрати книги"}
      </button>
    </HomePanel>
  );
};

export default RecommendationPicker;
