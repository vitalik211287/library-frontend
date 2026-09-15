import "./HomePanel.css";

const HomePanel = ({
  children,
  className = "",
  clickable = false,
  ...props
}) => {
  const classes = [
    "home-panel",
    clickable ? "home-panel--clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {children}
    </section>
  );
};

export default HomePanel;
