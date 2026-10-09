import Icon from "../../../../../../shared/components/Icon/Icon.jsx";

const KudosAction = ({
  item,
  onKudos,
  onOpenKudosUsers,
  isOwn = false,
  openOnOwnClick = false,
  iconWrapper = false,
}) => {
  const handleClick = () => {
    if (isOwn) {
      if (openOnOwnClick) {
        onOpenKudosUsers?.(item);
      }
      return;
    }

    onKudos?.(item);
  };

  return (
    <div
      className={
        item.hasKudos
          ? "social-feed-card__action social-feed-card__action--active"
          : "social-feed-card__action"
      }
    >
      <button
        type="button"
        disabled={isOwn && !openOnOwnClick}
        onClick={handleClick}
        aria-label={
          isOwn && openOnOwnClick
            ? "??????????? ?????????"
            : "??????????"
        }
      >
        {iconWrapper ? (
          <span className="social-feed-card__clap">
            <Icon name="clap" />
          </span>
        ) : (
          <Icon name="clap" />
        )}
      </button>

      <button
        type="button"
        disabled={(item.kudosCount ?? 0) === 0}
        onClick={() => onOpenKudosUsers?.(item)}
        aria-label="??? ?????????"
      >
        {item.kudosCount ?? 0}
      </button>
    </div>
  );
};

export default KudosAction;
