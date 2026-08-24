import { Routes, Route, NavLink } from "react-router-dom";
import "./App.css";
import CatalogPage from "./pages/CatalogPage/CatalogPage.jsx";
import AddBookPage from "./pages/AddBookPage/AddBookPage.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="container">
      <nav>
        <NavLink to="/">Каталог</NavLink>
        <NavLink to="/add">Додати книгу</NavLink>
      </nav>
      <>
        <Toaster position="top-right" />
        {/* твій Router / сторінки */}
      </>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/add" element={<AddBookPage />} />
      </Routes>
    </div>
  );
}

export default App;
