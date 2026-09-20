import Icon from "../../../../shared/components/Icon/Icon.jsx";

import "./CoverUploadButton.css";

const CoverUploadButton = ({
  onChange,
  label = "Змінити обкладинку",
  className = "",
}) => {
  const classes = ["cover-upload-button", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      className={classes}
      aria-label={label}
      title={label}
    >
      <Icon name="add" className="cover-upload-button__icon" />

      <input
        type="file"
        accept="image/*"
        onChange={onChange}
      />
    </label>
  );
};

export default CoverUploadButton;
