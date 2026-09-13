import { useNavigate } from "react-router-dom";

import SocialFeed from "../../../home/components/SocialFeed/SocialFeed.jsx";

import "./CommunityPage.css";

const CommunityPage = () => {
  const navigate = useNavigate();

  return (
    <main className="community-page">
      <header className="community-page__header">
        <button
          type="button"
          className="community-page__back"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>

          <span>Спільнота</span>
        </button>

        <h1>Активність читачів</h1>

        <p>
          Що читають, завершують та оцінюють люди, на яких ти підписаний.
        </p>
      </header>

      <SocialFeed />
    </main>
  );
};

export default CommunityPage;