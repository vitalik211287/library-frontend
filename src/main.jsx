import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { LibraryProvider } from "./context/LibraryContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ReadingGoalProvider } from "./context/ReadingGoalContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ReadingGoalProvider>
            <LibraryProvider>
              <App />
            </LibraryProvider>
          </ReadingGoalProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
