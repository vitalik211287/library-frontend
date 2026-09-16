import "./AppPanel.css";

const AppPanel = ({
  children,
  className = "",
  variant = "primary",
  clickable = false,
  ...props
}) => {
  const classes = [
    "app-panel",
    `app-panel--${variant}`,
    clickable ? "app-panel--clickable" : "",
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

export default AppPanel;
