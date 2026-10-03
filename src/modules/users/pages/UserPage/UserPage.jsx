import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import "./UserPage.css";

import ProfileHero from "./components/ProfileHero/ProfileHero.jsx";
import ProfileStats from "./components/ProfileStats/ProfileStats.jsx";
import ProfileTabs from "./components/ProfileTabs/ProfileTabs.jsx";
import CommunityTabs from "./components/CommunityTabs/CommunityTabs.jsx";
import ReadingGoal from "../../../stats/components/ReadingGoal/ReadingGoal.jsx";
import LibraryGoal from "./components/LibraryGoal/LibraryGoal.jsx";
import AchievementsPreview from "./components/AchievementsPreview/AchievementsPreview.jsx";
import CurrentReading from "./components/CurrentReading/CurrentReading.jsx";
import WishlistSection from "./components/WishlistSection/WishlistSection.jsx";
import FinishedSection from "./components/FinishedSection/FinishedSection.jsx";
import ReadingActivity from "./components/ReadingActivity/ReadingActivity.jsx";
import SocialFeed from "../../../home/components/SocialFeed/SocialFeed.jsx";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useUserBooks } from "../../../user-books/context/UserBooksContext.jsx";

const UserPage = ({ onOpenReading }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const requestedTab = searchParams.get("tab");
  const activeTab = ["profile", "books", "stats", "community"].includes(
    requestedTab,
  )
    ? requestedTab
    : "profile";

  const [communityTab, setCommunityTab] = useState("posts");

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams);

    if (tab === "profile") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }

    setSearchParams(nextParams);
  };

  const {
    currentBooks,
    wishlistBooks,
    finishedBooks,
    finishedTotal,

    isCurrentBooksLoading,
    isWishlistLoading,
    isFinishedBooksLoading,

    currentBooksError,
    wishlistError,
    finishedBooksError,

    removeFromWishlist,
  } = useUserBooks();

  return (
    <main className="user-page">
      <div className="user-profile">
        <ProfileHero />

        <ProfileTabs activeTab={activeTab} onChange={handleTabChange} />

        {activeTab === "profile" && (
          <>
            <ProfileStats
              finishedCount={finishedTotal}
              wishlistCount={wishlistBooks.length}
              currentBooksCount={currentBooks.length}
            />

            <CurrentReading
              currentBooks={currentBooks}
              isLoading={isCurrentBooksLoading}
              error={currentBooksError}
              onOpenReading={onOpenReading}
              onOpenCatalog={() => navigate("/catalog")}
            />

            <AchievementsPreview />
          </>
        )}

        {activeTab === "books" && (
          <>
            <CurrentReading
              currentBooks={currentBooks}
              isLoading={isCurrentBooksLoading}
              error={currentBooksError}
              onOpenReading={onOpenReading}
              onOpenCatalog={() => navigate("/catalog")}
            />

            <WishlistSection
              books={wishlistBooks}
              isLoading={isWishlistLoading}
              error={wishlistError}
              removeFromWishlist={removeFromWishlist}
              onOpenReading={onOpenReading}
            />

            <FinishedSection
              books={finishedBooks}
              isLoading={isFinishedBooksLoading}
              error={finishedBooksError}
              onOpenReading={onOpenReading}
            />
          </>
        )}

        {activeTab === "stats" && (
          <>
            <ReadingGoal />

            <LibraryGoal />

            <section className="profile-section profile-section--activity">
              <ReadingActivity onDetails={() => navigate("/stats")} />
            </section>
          </>
        )}

        {activeTab === "community" && user?.id && (
          <>
            <CommunityTabs
              activeTab={communityTab}
              onChange={setCommunityTab}
            />

            <SocialFeed
              userId={user.id}
              showComposer={false}
              showHeader={false}
              contentFilter={communityTab}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default UserPage;



