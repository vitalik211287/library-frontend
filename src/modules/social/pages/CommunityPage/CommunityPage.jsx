import { useState } from "react";

import PageBackButton from "../../../../shared/components/PageBackButton/PageBackButton.jsx";
import AppPanel from "../../../../shared/components/AppPanel/AppPanel.jsx";

import SocialFeed from "../../../home/components/SocialFeed/SocialFeed.jsx";

import "./CommunityPage.css";

const CommunityPage = () => {
  const [feedScope, setFeedScope] = useState("all");

  return (
    <main className="community-page">
      <AppPanel as="header" className="community-page__header">
        <PageBackButton label="Спільнота" />

        <h1>Спільнота</h1>

        <p>Знайомся з читачами, ділись книгами та обговорюй прочитане.</p>
      </AppPanel>

      <AppPanel className="community-page__tabs">
        <button
          type="button"
          className={`community-page__tab${
            feedScope === "all" ? " community-page__tab--active" : ""
          }`}
          onClick={() => setFeedScope("all")}
        >
          Для вас
        </button>

        <button
          type="button"
          className={`community-page__tab${
            feedScope === "following" ? " community-page__tab--active" : ""
          }`}
          onClick={() => setFeedScope("following")}
        >
          Підписки
        </button>
      </AppPanel>

      <SocialFeed scope={feedScope} showHeader={false} />
    </main>
  );
};

export default CommunityPage;