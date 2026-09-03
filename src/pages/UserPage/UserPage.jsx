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

import useCurrentBooks from "./hooks/useCurrentBooks.js";
import useWishlist from "./hooks/useWishlist.js";
import useFinishedBooks from "./hooks/useFinishedBooks.js";

const UserPage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const readingBookId = searchParams.get("reading");

  const {
    currentBooks,
    isLoading: isCurrentBooksLoading,
    error: currentBooksError,
  } = useCurrentBooks({
    readingBookId,
  });

  const {
    books: wishlistBooks,
    isLoading: isWishlistLoading,
    error: wishlistError,
    removeFromWishlist,
  } = useWishlist();

  const {
    books: finishedBooks,
    total: finishedCount,
    isLoading: isFinishedLoading,
    error: finishedError,
  } = useFinishedBooks({
    readingBookId,
  });

  return (
    <main className="user-page">
      <div className="user-profile">
        <ProfileHero />

        <ProfileStats
          finishedCount={finishedCount}
          wishlistCount={wishlistBooks.length}
          currentBooksCount={currentBooks.length}
        />

        <ReadingGoal />

        <AchievementsPreview />

        <CurrentReading
          currentBooks={currentBooks}
          isLoading={isCurrentBooksLoading}
          error={currentBooksError}
        />

        <WishlistSection
          books={wishlistBooks}
          isLoading={isWishlistLoading}
          error={wishlistError}
          removeFromWishlist={removeFromWishlist}
        />

        <FinishedSection
          books={finishedBooks}
          isLoading={isFinishedLoading}
          error={finishedError}
        />

        <section className="profile-section profile-section--activity">
          <ReadingActivity onDetails={() => navigate("/stats")} />
        </section>
      </div>
    </main>
  );
};

export default UserPage;
