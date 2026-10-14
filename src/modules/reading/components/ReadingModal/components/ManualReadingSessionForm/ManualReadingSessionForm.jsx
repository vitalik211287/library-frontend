import { useState } from "react";

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ManualReadingSessionForm = ({
  totalPages,
  initialPage = 0,
  onSubmit,
  onCancel,
  saving = false,
}) => {
  const [date, setDate] = useState(getLocalDate);
  const [time, setTime] = useState("08:00");
  const [minutes, setMinutes] = useState("30");
  const [startPage, setStartPage] = useState(String(initialPage));
  const [endPage, setEndPage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const start = Number(startPage);
    const end = Number(endPage);
    const duration = Number(minutes);

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      (totalPages != null && end > totalPages)
    ) {
      setError("Перевір початкову та кінцеву сторінки.");
      return;
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      setError("Тривалість має бути додатним числом хвилин.");
      return;
    }

    const startedAt = new Date(`${date}T${time}:00`);

    if (Number.isNaN(startedAt.getTime())) {
      setError("Вкажи правильну дату та час.");
      return;
    }

    const finishedAt = new Date(
      startedAt.getTime() + duration * 60000
    );

    if (finishedAt.getTime() > Date.now()) {
      setError("Сесія не може завершуватися в майбутньому.");
      return;
    }

    setError("");

    try {
      await onSubmit({
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        startPage: start,
        endPage: end,
        durationSeconds: duration * 60,
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не вдалося зберегти сесію."
      );
    }
  };

  return (
    <form className="reading-sessions-edit manual-reading-session-form" onSubmit={handleSubmit}>
      {[
        ["Дата читання", "date", date, setDate],
        ["Час початку", "time", time, setTime],
        ["Тривалість (хв)", "number", minutes, setMinutes],
        ["Початкова сторінка", "number", startPage, setStartPage],
        ["Кінцева сторінка", "number", endPage, setEndPage],
      ].map(([label, type, value, setValue]) => (
        <label className="reading-sessions-edit__label" key={label}>
          <span>{label}</span>
          <div className="reading-sessions-edit__input-wrap">
            <input
              type={type}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
              disabled={saving}
              {...(type === "number"
                ? { min: label.startsWith("Тривалість") ? 1 : 0, step: 1 }
                : {})}
            />
          </div>
        </label>
      ))}

      {error && (
        <p className="reading-sessions-modal__message" role="alert">
          {error}
        </p>
      )}

      <div className="reading-sessions-edit__actions">
        <button type="button" onClick={onCancel} disabled={saving}>
          Скасувати
        </button>
        <button
          type="submit"
          className="reading-sessions-edit__save"
          disabled={saving}
        >
          {saving ? "Збереження..." : "Додати сесію"}
        </button>
      </div>
    </form>
  );
};

export default ManualReadingSessionForm;
