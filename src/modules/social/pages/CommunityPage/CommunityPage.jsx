import { useNavigate } from "react-router-dom";
import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";

import SocialFeed from "../../../home/components/SocialFeed/SocialFeed.jsx";

import "./CommunityPage.css";

const CommunityPage = () => {
  const navigate = useNavigate();

  return (
    <main className="community-page">
      <header className="community-page__header">
        <PageBackButton label="Спільнота" />

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