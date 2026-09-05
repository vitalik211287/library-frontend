const GoalProgress = ({
  label,
  current,
  target,
  percent,
  formatter = (value) => String(value ?? 0),
}) => {
  const safePercent = Math.min(Math.max(Number(percent) || 0, 0), 100);

  const hasTarget = target !== null && target !== undefined;

  return (
    <div className="reading-goal">
      <div className="reading-goal__top">
        <span>{label}</span>

        <strong>
          {hasTarget
            ? `${formatter(current)} / ${formatter(target)}`
            : "Не задано"}
        </strong>
      </div>

      <div className="reading-goal__track">
        <div
          className="reading-goal__bar"
          style={{
            width: `${hasTarget ? safePercent : 0}%`,
          }}
        />
      </div>

      <div className="reading-goal__bottom">
        <span>
          {hasTarget ? `${safePercent}% виконано` : "Ціль ще не встановлена"}
        </span>
      </div>
    </div>
  );
};

export default GoalProgress;

