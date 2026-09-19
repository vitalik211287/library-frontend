import { useEffect, useState } from "react";
import Icon from "../Icon/Icon.jsx";
import "./ThemeToggle.css";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((currentTheme) => !currentTheme);
  };

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Змінити тему"
    >
      {isDark ? <Icon name="sun" size={22} /> : <Icon name="moon" size={22} />}
    </button>
  );
}

export default ThemeToggle;
