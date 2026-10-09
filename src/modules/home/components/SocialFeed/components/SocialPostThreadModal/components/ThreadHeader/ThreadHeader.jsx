const ThreadHeader = ({
  isBranchView,
  onBack,
  onClose,
}) => (
  <header className="social-post-thread__header">
    <div className="social-post-thread__title">
      {isBranchView && (
        <button
          type="button"
          className="social-post-thread__back"
          onClick={onBack}
          aria-label={"\u041d\u0430\u0437\u0430\u0434 \u0434\u043e \u043e\u0431\u0433\u043e\u0432\u043e\u0440\u0435\u043d\u043d\u044f"}
        >
          {"\u2190"}
        </button>
      )}

      <h2>
        {isBranchView
          ? "\u0412\u0456\u0434\u043f\u043e\u0432\u0456\u0434\u0456"
          : "\u041e\u0431\u0433\u043e\u0432\u043e\u0440\u0435\u043d\u043d\u044f"}
      </h2>
    </div>

    <button
      type="button"
      className="social-post-thread__close"
      onClick={onClose}
      aria-label={"\u0417\u0430\u043a\u0440\u0438\u0442\u0438"}
    >
      ×
    </button>
  </header>
);

export default ThreadHeader;
