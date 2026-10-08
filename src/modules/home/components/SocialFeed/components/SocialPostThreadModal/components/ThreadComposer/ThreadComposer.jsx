const ThreadComposer = ({
  replyTarget,
  replyText,
  isSending,
  isActivityThread,
  onReplyTextChange,
  onCancelReply,
  onSubmit,
}) => (
  <form className="social-post-thread__composer" onSubmit={onSubmit}>
    <div
      className={`social-post-thread__replying-to ${
        replyTarget
          ? "social-post-thread__replying-to--visible"
          : "social-post-thread__replying-to--empty"
      }`}
    >
      {replyTarget ? (
        <>
          <span>
            {"\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c \u0434\u043b\u044f "}
            {replyTarget.author?.name ||
              "\u041a\u043e\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447"}
          </span>

          <button
            type="button"
            onClick={onCancelReply}
            aria-label={"\u0421\u043a\u0430\u0441\u0443\u0432\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c"}
          >
            ×
          </button>
        </>
      ) : (
        <span aria-hidden="true">&nbsp;</span>
      )}
    </div>

    <textarea
      value={replyText}
      onChange={(event) => onReplyTextChange(event.target.value)}
      placeholder={
        isActivityThread && !replyTarget
          ? "\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u0438 \u043a\u043e\u043c\u0435\u043d\u0442\u0430\u0440\u2026"
          : "\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u0438 \u0432\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u044c\u2026"
      }
      maxLength={1000}
      rows={2}
      disabled={isSending}
    />

    <button type="submit" disabled={!replyText.trim() || isSending}>
      {isSending
        ? "\u041d\u0430\u0434\u0441\u0438\u043b\u0430\u0454\u043c\u043e\u2026"
        : isActivityThread && !replyTarget
          ? "\u041a\u043e\u043c\u0435\u043d\u0442\u0443\u0432\u0430\u0442\u0438"
          : "\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0441\u0442\u0438"}
    </button>
  </form>
);

export default ThreadComposer;
