import { NavLink } from "react-router-dom";

import {
  AddIcon,
  CatalogIcon,
  ProfileIcon,
  StatsIcon,
  HomeIcon,
} from "../AppNavigation/NavigationIcons.jsx";

import "./MobileBottomNavigation.css";

const MobileBottomNavigation = () => {
  return (
    <nav className="mobile-bottom-nav" aria-label="Основна мобільна навігація">
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
