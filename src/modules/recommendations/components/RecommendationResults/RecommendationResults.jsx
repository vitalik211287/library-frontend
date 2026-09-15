import { useEffect, useRef } from "react";

import BookCard from "../../../books/pages/CatalogPage/components/BookCard/BookCard.jsx";

import "./RecommendationResults.css";

const TAG_LABELS = {
  dark: "🌑 Похмуре",
  cozy: "☕ Затишне",
  humorous: "😄 Веселе",
  emotional: "❤️ Емоційне",
  adventure: "🗺️ Пригоди",
  mystery: "🔎 Таємниця",
  space: "🚀 Космос",
  magic: "✨ Магія",
  psychological: "🧠 Психологічне",
  philosophical: "💭 Філософське",
};

const RecommendationResults = ({
  recommendations,
  selectedTags,
  onOpenReading,
}) => {
  const booksRef = useRef(null);

  useEffect(() => {
    if (!recommendations.length) {
      return;
    }

    booksRef.current?.scrollTo({
      left: 0,
      behavior: "smooth",
    });
  }, [recommendations]);

  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="recommendation-results">
      <div className="recommendation-results__header">
        <div>
          <span className="recommendation-results__kicker">Для тебе</span>
          <h3 className="recommendation-results__title">Найкращі збіги</h3>
        </div>

        <span className="recommendation-results__count">
          {recommendations.length} книг
        </span>
      </div>

      <div ref={booksRef} className="recommendation-results__books">
        {recommendations.map((recommendation) => (
          <BookCard
            key={recommendation.bookId}
            book={{
              ...recommendation,
              id: recommendation.bookId,
            }}
            variant="compact"
            recommendationMeta={{
              labels: recommendation.matchedTags.map(
                (tag) => TAG_LABELS[tag] ?? tag,
              ),
              matchedCount: recommendation.matchedTags.length,
              selectedCount: selectedTags.length,
            }}
            isAuthenticated={false}
            isAuthLoading={false}
            showWishlist={false}
            onRead={(book) => onOpenReading?.(book.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationResults;
