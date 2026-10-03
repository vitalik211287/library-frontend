import { useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";
import { resolveAssetUrl } from "../../../../../../shared/utils/resolveAssetUrl.js";
import SocialBookSearch from "./components/SocialBookSearch/SocialBookSearch.jsx";

import "./SocialPostComposer.css";

const MAX_POST_LENGTH = 1000;

const SocialPostComposer = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedText = text.trim();

    if (!normalizedText || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const post = await apiFetch("/api/social/posts", {
        method: "POST",
        body: {
          text: normalizedText,
          ...(selectedBook && { bookId: selectedBook.id }),
        },
      });

      setText("");
      setSelectedBook(null);
      setIsBookSearchOpen(false);
      onPostCreated?.(post);
    } catch (requestError) {
      console.error("Failed to create social post:", requestError);
      setError("\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u043e\u043f\u0443\u0431\u043b\u0456\u043a\u0443\u0432\u0430\u0442\u0438 \u0434\u043e\u043f\u0438\u0441");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="social-post-composer" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={"\u041f\u043e\u0434\u0456\u043b\u0456\u0442\u044c\u0441\u044f \u0434\u0443\u043c\u043a\u0430\u043c\u0438 \u043f\u0440\u043e \u043a\u043d\u0438\u0433\u0438\u2026"}
        maxLength={MAX_POST_LENGTH}
        rows={3}
        disabled={isSubmitting}
      />

      <div className="social-post-composer__book">
        {selectedBook ? (
          <div className="social-post-composer__selected-book">
            {selectedBook.coverUrl && (
              <img src={resolveAssetUrl(selectedBook.coverUrl)} alt="" />
            )}

            <div>
              <strong>{selectedBook.title}</strong>
              <span>{selectedBook.author}</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBook(null)}
              aria-label={"\u041f\u0440\u0438\u0431\u0440\u0430\u0442\u0438 \u043a\u043d\u0438\u0433\u0443"}
            >
              ×
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="social-post-composer__add-book"
              onClick={() => setIsBookSearchOpen((current) => !current)}
            >
              {"\ud83d\udcd6 \u0414\u043e\u0434\u0430\u0442\u0438 \u043a\u043d\u0438\u0433\u0443"}
            </button>

            {isBookSearchOpen && (
              <SocialBookSearch
                onSelect={(book) => {
                  setSelectedBook(book);
                  setIsBookSearchOpen(false);
                }}
              />
            )}
          </>
        )}
      </div>
      {error && <p className="social-post-composer__error">{error}</p>}

      <div className="social-post-composer__footer">
        <span>
          {text.length}/{MAX_POST_LENGTH}
        </span>

        <button type="submit" disabled={!text.trim() || isSubmitting}>
          {isSubmitting ? "\u041f\u0443\u0431\u043b\u0456\u043a\u0443\u0454\u043c\u043e\u2026" : "\u041e\u043f\u0443\u0431\u043b\u0456\u043a\u0443\u0432\u0430\u0442\u0438"}
        </button>
      </div>
    </form>
  );
};

export default SocialPostComposer;
