import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AchievementsProvider } from "./context/AchievementsContext.jsx";
import "./index.css";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ReadingGoalProvider } from "./context/ReadingGoalContext.jsx";
import { ReadingStatsProvider } from "./context/ReadingStatsContext.jsx";
import { ReadingActivityProvider } from "./context/ReadingActivityContext.jsx";

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
                    <App />
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
