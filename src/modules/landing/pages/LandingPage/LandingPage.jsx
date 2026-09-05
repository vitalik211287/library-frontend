import { Link } from "react-router-dom";

import "./LandingPage.css";

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />

    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v18a2 2 0 0 1 2-2h2.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
  </svg>
);

const LandingPage = () => {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <div className="landing-logo">
          <div className="landing-logo__icon">
            <BookIcon />
          </div>

          <span>Бібліотека</span>
        </div>

        <div className="landing-content">
          <h1>
            Твоя домашня
            <br />
            бібліотека
          </h1>

          <p>
            Зберігай книги, відстежуй читання, став цілі та дивись свою
            активність.
          </p>
        </div>

        <div className="landing-actions">
          <Link to="/login" className="landing-button landing-button--primary">
            Увійти
          </Link>

          <Link
            to="/register"
            className="landing-button landing-button--secondary"
          >
            Зареєструватися
          </Link>
        </div>

        <p className="landing-footer">Особиста бібліотека та трекер читання</p>
      </section>
    </main>
  );
};

export default LandingPage;

