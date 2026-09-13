import { NavLink } from "react-router-dom";

import {
  AddIcon,
  CatalogIcon,
  ProfileIcon,
  StatsIcon,
} from "../AppNavigation/NavigationIcons.jsx";

import "./MobileBottomNavigation.css";

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10.5V21h13V10.5" />
    <path d="M9.5 21v-6h5v6" />
  </svg>
);

const MobileBottomNavigation = () => {
  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Основна мобільна навігація"
    >
      <NavLink to="/home" className="mobile-bottom-nav__item">
        <HomeIcon />
        <span>Головна</span>
      </NavLink>

      <NavLink to="/catalog" className="mobile-bottom-nav__item">
        <CatalogIcon />
        <span>Каталог</span>
      </NavLink>

      <NavLink
        to="/add"
        className="mobile-bottom-nav__item mobile-bottom-nav__item--add"
        aria-label="Додати книгу"
      >
        <span className="mobile-bottom-nav__add-button">
          <AddIcon />
        </span>
        <span>Додати</span>
      </NavLink>

      <NavLink to="/stats" className="mobile-bottom-nav__item">
        <StatsIcon />
        <span>Статистика</span>
      </NavLink>

      <NavLink to="/account" className="mobile-bottom-nav__item">
        <ProfileIcon />
        <span>Профіль</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNavigation;