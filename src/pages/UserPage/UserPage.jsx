import { useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import "./UserPage.css";

import ProfileHero from "./components/ProfileHero/ProfileHero.jsx";
import ProfileStats from "./components/ProfileStats/ProfileStats.jsx";
import ReadingGoal from "./components/ReadingGoal/ReadingGoal.jsx";
import AchievementsPreview from "./components/AchievementsPreview/AchievementsPreview.jsx";
import CurrentReading from "./components/CurrentReading/CurrentReading.jsx";
import WishlistSection from "./components/WishlistSection/WishlistSection.jsx";
import FinishedSection from "./components/FinishedSection/FinishedSection.jsx";
import ReadingActivity from "./components/ReadingActivity/ReadingActivity.jsx";

const UserPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const readingBookId = searchParams.get("reading");

  const [currentBooksCount, setCurrentBooksCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [finishedCount, setFinishedCount] = useState(0);

  return (
    <main className="user-page">
      <div className="user-profile">
        <ProfileHero />

        <ProfileStats
          finishedCount={finishedCount}
          wishlistCount={wishlistCount}
          currentBooksCount={currentBooksCount}
          readingBookId={readingBookId}
        />

        <ReadingGoal />

        <AchievementsPreview readingBookId={readingBookId} />

        <CurrentReading
          readingBookId={readingBookId}
          onBooksChange={setCurrentBooksCount}
        />

        <WishlistSection onCountChange={setWishlistCount} />

        <FinishedSection
          readingBookId={readingBookId}
          onCountChange={setFinishedCount}
        />

        <section className="profile-section profile-section--activity">
          <ReadingActivity
            readingBookId={readingBookId}
            onDetails={() => navigate("/stats")}
          />
        </section>
      </div>
    </main>
  );
};

export default UserPage;
