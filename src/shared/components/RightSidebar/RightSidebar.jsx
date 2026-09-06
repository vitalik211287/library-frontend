import useRightSidebarData from "./hooks/useRightSidebarData.js";

import CurrentReadingWidget from "./components/CurrentReadingWidget.jsx";
import ShelvesWidget from "./components/ShelvesWidget.jsx";
import ActivityWidget from "./components/ActivityWidget.jsx";
import ReminderWidget from "./components/ReminderWidget.jsx";


import "./RightSidebar.css";

/* =========================
   COMPONENT
========================= */

const RightSidebar = ({ onOpenReading }) => {
  const { currentBooks, wishlistCount, finishedCount, isLoading } =
    useRightSidebarData();

  const mainCurrentBook = currentBooks[0] ?? null;

  return (
    <aside className="right-sidebar">
      <CurrentReadingWidget
        currentBooks={currentBooks}
        isLoading={isLoading}
        onOpenReading={onOpenReading}
      />
      <ShelvesWidget
        currentBooksCount={currentBooks.length}
        wishlistCount={wishlistCount}
        finishedCount={finishedCount}
        isLoading={isLoading}
      />
      <ActivityWidget
        currentBooksCount={currentBooks.length}
        finishedCount={finishedCount}
        isLoading={isLoading}
      />
      <ReminderWidget mainCurrentBook={mainCurrentBook} />
    </aside>
  );
};

export default RightSidebar;

