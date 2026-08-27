import { useNavigate } from "react-router-dom";
import "./UserPage.css";

function UserPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login", { replace: true });
  };

  return (
    <main className="user-page">
      <section className="user-page__card">
        <button
          type="button"
          className="user-page__close"
          onClick={handleClose}
          aria-label="Закрити"
        >
          ×
        </button>
        <div className="user-page__icon">
          <svg
            viewBox="0 0 24 24"
            className="user-page__icon-svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        </div>

        <h1>Ви авторизовані</h1>

        <p>Ви вже увійшли до свого акаунта.</p>

        <button
          type="button"
          className="user-page__logout"
          onClick={handleLogout}
        >
          Вийти з акаунта
        </button>
      </section>
    </main>
  );
}

export default UserPage;
