const Icon = ({ name, size, className, "aria-label": ariaLabel, ...props }) => (
  <svg
    className={className}
    width={size}
    height={size}
    aria-hidden={ariaLabel ? undefined : true}
    aria-label={ariaLabel}
    {...props}
  >
    <use href={`/icons.svg#icon-${name}`} />
  </svg>
);

export default Icon;
