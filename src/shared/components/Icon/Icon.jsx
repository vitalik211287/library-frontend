const ICON_VIEWBOXES = {
  "book-finished": "0 0 32 32",
};

const Icon = ({
  name,
  size,
  className,
  "aria-label": ariaLabel,
  ...props
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox={ICON_VIEWBOXES[name] ?? "0 0 24 24"}
    aria-hidden={ariaLabel ? undefined : true}
    aria-label={ariaLabel}
    {...props}
  >
    <use href={`/icons.svg#icon-${name}`} />
  </svg>
);

export default Icon;
