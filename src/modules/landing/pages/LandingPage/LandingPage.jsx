import Icon from "../../../../shared/components/Icon/Icon.jsx";
import { Link } from "react-router-dom";

import "./LandingPage.css";

const LandingPage = () => {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <div className="landing-logo">
          <div className="landing-logo__icon">
            <Icon name="book" />
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
