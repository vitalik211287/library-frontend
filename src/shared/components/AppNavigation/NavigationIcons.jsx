import Icon from "../Icon/Icon.jsx";

export const HomeIcon = () => <Icon name="home" />;
export const CatalogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 5.5h6.2c1.3 0 2.3 1 2.3 2.3V20c-.7-1-1.6-1.5-2.8-1.5H3.5v-13Z" />
    <path d="M12 7.8c0-1.3 1-2.3 2.3-2.3h6.2v13h-5.7c-1.2 0-2.1.5-2.8 1.5V7.8Z" />
  </svg>
);
export const AddIcon = () => <Icon name="add" />;
export const CalendarIcon = () => <Icon name="calendar" />;
export const ReaderIcon = () => <Icon name="reading" />;
export const StatsIcon = () => <Icon name="stats" />;
export const AchievementsIcon = () => <Icon name="achievements" />;
export const CommunityIcon = () => <Icon name="community" />;
export const BellIcon = () => (
  <svg className="navigation-bell-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path
      className="navigation-bell-icon__highlight"
      d="M8.4 5.1c-.8 1-.9 2.1-.9 3.4"
    />
    <path
      className="navigation-bell-icon__body"
      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
    />
    <path
      className="navigation-bell-icon__highlight"
      d="M15.6 5.1c.8 1 .9 2.1 .9 3.4"
    />
    <path className="navigation-bell-icon__clapper" d="M10 21h4" />
  </svg>
);
export const ProfileIcon = () => <Icon name="profile" />;
export const SettingsIcon = () => <Icon name="settings" />;
export const SystemIcon = () => <Icon name="system" />;
export const SunIcon = () => <Icon name="sun" />;
export const MoonIcon = () => <Icon name="moon" />;
