import { useNavigate } from "react-router-dom";

import "./UserPage.css";

import ProfileHero from "./components/ProfileHero/ProfileHero.jsx";
import ProfileStats from "./components/ProfileStats/ProfileStats.jsx";
import ReadingGoal from "../../../stats/components/ReadingGoal/ReadingGoal.jsx";
import LibraryGoal from "./components/LibraryGoal/LibraryGoal.jsx";
import AchievementsPreview from "./components/AchievementsPreview/AchievementsPreview.jsx";
import CurrentReading from "./components/CurrentReading/CurrentReading.jsx";
import WishlistSection from "./components/WishlistSection/WishlistSection.jsx";
import FinishedSection from "./components/FinishedSection/FinishedSection.jsx";
import ReadingActivity from "./components/ReadingActivity/ReadingActivity.jsx";

import { useUserBooks } from "../../../user-books/context/UserBooksContext.jsx";

const UserPage = ({ onOpenReading }) => {
  const navigate = useNavigate();

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

        <ProfileStats
          finishedCount={finishedTotal}
          wishlistCount={wishlistBooks.length}
          currentBooksCount={currentBooks.length}
        />

        <ReadingGoal />

        <LibraryGoal />

        <AchievementsPreview />

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

        <section className="profile-section profile-section--activity">
          <ReadingActivity onDetails={() => navigate("/stats")} />
        </section>
      </div>
    </main>
  );
};

export default UserPage;

