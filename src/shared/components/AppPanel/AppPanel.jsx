import "./AppPanel.css";

const AppPanel = ({
  as: Component = "div",
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
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

export default AppPanel;
