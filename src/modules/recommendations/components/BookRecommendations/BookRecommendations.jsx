import { useState } from "react";

import { useLibrary } from "../../../libraries/context/LibraryContext.jsx";
import { getBookRecommendations } from "../../api/recommendationsApi.js";
import RecommendationPicker from "../RecommendationPicker/RecommendationPicker.jsx";
import RecommendationResults from "../RecommendationResults/RecommendationResults.jsx";

const BookRecommendations = ({ onOpenReading }) => {
  const { activeLibraryId } = useLibrary();

  const [selectedTags, setSelectedTags] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!activeLibraryId || selectedTags.length === 0) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getBookRecommendations(
        activeLibraryId,
        selectedTags,
        5,
      );

      setRecommendations(data?.recommendations ?? []);
    } catch (requestError) {
      console.error("Failed to load book recommendations:", requestError);
      setRecommendations([]);
      setError("Не вдалося підібрати книги. Спробуй ще раз.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeLibraryId) {
    return null;
  }

  return (
    <section>
      <RecommendationPicker
        selectedTags={selectedTags}
        onChange={setSelectedTags}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {error && <p>{error}</p>}

      {!isLoading &&
        !error &&
        selectedTags.length > 0 &&
        recommendations.length === 0 && (
          <p>Обери варіанти та натисни «Підібрати книги».</p>
        )}

      <RecommendationResults
        recommendations={recommendations}
        selectedTags={selectedTags}
        onOpenReading={onOpenReading}
      />
    </section>
  );
};

export default BookRecommendations;
