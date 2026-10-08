const ThreadRootList = ({
  displayReplies,
  repliesCount,
  isActivityThread,
  onOpenBranch,
  renderComment,
}) => (
  <>
    {displayReplies.map((group) => (
      <div
        key={group.root.id}
        className="social-post-thread__tree-group"
      >
        <div className="social-post-thread__tree-root">
          {renderComment(group.root, 0)}
        </div>

        {group.repliesCount > 0 && (
          <button
            type="button"
            className="social-post-thread__branch-toggle"
            onClick={() => onOpenBranch(group.root)}
          >
            {`${group.repliesCount} ${
              group.repliesCount === 1
                ? "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"
                : "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"
            }`}
          </button>
        )}
      </div>
    ))}

    {repliesCount === 0 && (
      <p className="social-post-thread__empty">
        {isActivityThread
          ? "\u041a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u0456\u0432 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454. \u0411\u0443\u0434\u044c\u0442\u0435 \u043f\u0435\u0440\u0448\u0438\u043c."
          : "\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0435\u0439 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454. \u0411\u0443\u0434\u044c \u043f\u0435\u0440\u0448\u0438\u043c."}
      </p>
    )}
  </>
);

export default ThreadRootList;
