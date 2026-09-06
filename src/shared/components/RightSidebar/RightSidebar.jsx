import { useSearchParams } from "react-router-dom";

import useRightSidebarData from "./hooks/useRightSidebarData.js";

import CurrentReadingWidget from "./components/CurrentReadingWidget.jsx";
import ShelvesWidget from "./components/ShelvesWidget.jsx";
import ActivityWidget from "./components/ActivityWidget.jsx";
import ReminderWidget from "./components/ReminderWidget.jsx";


import "./RightSidebar.css";

/* =========================
   COMPONENT
========================= */

const RightSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { currentBooks, wishlistCount, finishedCount, isLoading } =
    useRightSidebarData();

  const mainCurrentBook = currentBooks[0] ?? null;

  const handleOpenReading = (bookId) => {
    if (!bookId) {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.set("reading", bookId);

    setSearchParams(params);
  };

  return (
    <aside className="right-sidebar">
      <CurrentReadingWidget
        currentBooks={currentBooks}
        isLoading={isLoading}
        onOpenReading={handleOpenReading}
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

