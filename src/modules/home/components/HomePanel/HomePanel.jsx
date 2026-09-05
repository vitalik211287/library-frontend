import "./HomePanel.css";

const HomePanel = ({
  children,
  className = "",
  clickable = false,
  onClick,
  onKeyDown,
  role,
  tabIndex,
}) => {
  const classes = [
    "home-panel",
    clickable ? "home-panel--clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={classes}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
    >
      {children}
    </section>
  );
};

export default HomePanel;
