import "./Loader.css";

const Loader = ({
  text = "",
  size = "medium",
  overlay = false,
  className = "",
}) => {
  const classes = [
    "loader",
    `loader--${size}`,
    overlay ? "loader--overlay" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="status"
      aria-live="polite"
      aria-label={text || "Завантаження"}
    >
      <div className="loader__book" aria-hidden="true">
        <span className="loader__cover loader__cover--left" />
        <span className="loader__cover loader__cover--right" />

        <span className="loader__page loader__page--1" />
        <span className="loader__page loader__page--2" />
        <span className="loader__page loader__page--3" />

        <span className="loader__spine" />
      </div>

      {text && <span className="loader__text">{text}</span>}
    </div>
  );
};

export default Loader;
