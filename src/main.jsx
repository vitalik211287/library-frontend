import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { LibraryBooksProvider } from "./context/LibraryBooksContext.jsx";
import { UserBooksProvider } from "./context/UserBooksContext.jsx";

import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ReadingGoalProvider } from "./context/ReadingGoalContext.jsx";
import { ReadingStatsProvider } from "./context/ReadingStatsContext.jsx";
import { ReadingActivityProvider } from "./context/ReadingActivityContext.jsx";
import { AchievementsProvider } from "./context/AchievementsContext.jsx";

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
