import { Routes, Route, NavLink } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./App.css";

import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import LoginPage from "./pages/LoginPage/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage/RegisterPage.jsx";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";

function App() {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <NavLink to="/">Каталог</NavLink>

          <NavLink to="/add">Додати книгу</NavLink>

          <NavLink to="/login">Увійти</NavLink>
        </nav>

        <ThemeToggle />
      </header>

      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<CatalogPage />} />

        <Route path="/add" element={<AddBookPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
}

export default App;
