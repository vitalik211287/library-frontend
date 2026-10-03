import "./LoadMoreButton.css";

const LoadMoreButton = ({
  onClick,
  isLoading = false,
  disabled = false,
  children = "Завантажити ще",
}) => {
  return (
    <button
      type="button"
      className="load-more-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? "Завантажуємо…" : children}
    </button>
  );
};

export default LoadMoreButton;
