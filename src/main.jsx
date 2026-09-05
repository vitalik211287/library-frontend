import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./app/App.jsx";

import { AuthProvider } from "./modules/auth/context/AuthContext.jsx";
import { LibraryProvider } from "./modules/libraries/context/LibraryContext.jsx";
import { LibraryBooksProvider } from "./modules/libraries/context/LibraryBooksContext.jsx";
import { UserBooksProvider } from "./modules/user-books/context/UserBooksContext.jsx";

import { ThemeProvider } from "./shared/context/ThemeContext.jsx";
import { ReadingGoalProvider } from "./modules/stats/context/ReadingGoalContext.jsx";
import { ReadingStatsProvider } from "./modules/stats/context/ReadingStatsContext.jsx";
import { ReadingActivityProvider } from "./modules/reading/context/ReadingActivityContext.jsx";
import { AchievementsProvider } from "./modules/stats/context/AchievementsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ReadingGoalProvider>
            <ReadingStatsProvider>
              <ReadingActivityProvider>
                <AchievementsProvider>
                  <LibraryProvider>
                    <LibraryBooksProvider>
                      <UserBooksProvider>
                        <App />
                      </UserBooksProvider>
                    </LibraryBooksProvider>
                  </LibraryProvider>
                </AchievementsProvider>
              </ReadingActivityProvider>
            </ReadingStatsProvider>
          </ReadingGoalProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);








