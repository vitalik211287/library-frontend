const ThreadBranchView = ({
  branchPath,
  branchReplies,
  getDirectRepliesCount,
  onOpenBranch,
  renderComment,
}) => (
  <>
    {branchPath.reduceRight(
      (children, comment, index) => (
        <div
          key={comment.id}
          className={
            index === 0
              ? "social-post-thread__nested-root"
              : "social-post-thread__nested-level"
          }
        >
          {renderComment(comment, index)}

          {children && (
            <div className="social-post-thread__nested-children">
              {children}
            </div>
          )}
        </div>
      ),
      <div className="social-post-thread__nested-tail">
        {branchReplies.map((reply) => {
          const repliesCount = getDirectRepliesCount(reply.id);

          return (
            <div
              key={reply.id}
              className="social-post-thread__nested-tail-node"
            >
              {renderComment(reply, branchPath.length)}

              {repliesCount > 0 && (
                <button
                  type="button"
                  className="social-post-thread__branch-toggle"
                  onClick={() => onOpenBranch(reply)}
                >
                  {`${repliesCount} ${
                    repliesCount === 1
                      ? "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"
                      : "\u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"
                  }`}
                </button>
              )}
            </div>
          );
        })}
      </div>,
    )}

    {branchReplies.length === 0 && (
      <p className="social-post-thread__empty">
        {"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0435\u0439 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454."}
      </p>
    )}
  </>
);

export default ThreadBranchView;
