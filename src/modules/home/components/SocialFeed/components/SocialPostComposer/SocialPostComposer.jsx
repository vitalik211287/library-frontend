import { useState } from "react";

import { apiFetch } from "../../../../../../shared/api/apiClient.js";

import "./SocialPostComposer.css";

const MAX_POST_LENGTH = 1000;

const SocialPostComposer = ({ onPostCreated }) => {
  const [text, setText] = useState("");
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
        },
      });

      setText("");
      onPostCreated?.(post);
    } catch (requestError) {
      console.error("Failed to create social post:", requestError);
      setError("Не вдалося опублікувати допис");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="social-post-composer" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Поділіться думками про книги…"
        maxLength={MAX_POST_LENGTH}
        rows={3}
        disabled={isSubmitting}
      />

      {error && <p className="social-post-composer__error">{error}</p>}

      <div className="social-post-composer__footer">
        <span>
          {text.length}/{MAX_POST_LENGTH}
        </span>

        <button type="submit" disabled={!text.trim() || isSubmitting}>
          {isSubmitting ? "Публікуємо…" : "Опублікувати"}
        </button>
      </div>
    </form>
  );
};

export default SocialPostComposer;
