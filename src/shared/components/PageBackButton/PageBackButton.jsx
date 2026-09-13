import { useNavigate } from "react-router-dom";

import "./PageBackButton.css";

const PageBackButton = ({ label, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
      return;
    }

    navigate(-1);
  };

  return (
    <button
      type="button"
      className="page-back-button"
      onClick={handleClick}
      aria-label={`Назад: ${label}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>

      <span>{label}</span>
    </button>
  );
};

export default PageBackButton;
