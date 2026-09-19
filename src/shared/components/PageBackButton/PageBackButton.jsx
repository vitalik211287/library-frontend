import { useNavigate } from "react-router-dom";

import Icon from "../Icon/Icon.jsx";

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
      <Icon name="arrow-left" />

      <span>{label}</span>
    </button>
  );
};

export default PageBackButton;
