import { Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import { Toaster } from "react-hot-toast";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";

function App() {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <NavLink to="/">Каталог</NavLink>
          <NavLink to="/add">Додати книгу</NavLink>
        </nav>

        <ThemeToggle />
      </header>

      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/add" element={<AddBookPage />} />
      </Routes>
    </>
  );
}

export default App;