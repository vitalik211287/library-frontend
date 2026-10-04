import Icon from "../Icon/Icon.jsx";

export const HomeIcon = () => <Icon name="home" />;
export const CatalogIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 5.5h6.2c1.3 0 2.3 1 2.3 2.3V20c-.7-1-1.6-1.5-2.8-1.5H3.5v-13Z" />
    <path d="M12 7.8c0-1.3 1-2.3 2.3-2.3h6.2v13h-5.7c-1.2 0-2.1.5-2.8 1.5V7.8Z" />
  </svg>
);

export const LibraryBrandIcon = ({ className = "" }) => (
  <svg
    className={`library-brand-icon ${className}`.trim()}
    viewBox="0 0 64 76"
    fill="none"
    aria-hidden="true"
  >
    <circle
      className="library-brand-icon__head library-brand-icon__head--left"
      cx="17"
      cy="10"
      r="7"
    />
    <circle
      className="library-brand-icon__head library-brand-icon__head--right"
      cx="47"
      cy="10"
      r="7"
    />

    <path
      className="library-brand-icon__page library-brand-icon__page--left"
      d="M5 23.5C5 21.6 7 20.4 8.7 21.3L22.8 29C27.2 31.4 30 36 30 41V70L11.2 59.7C7.4 57.6 5 53.6 5 49.2V23.5Z"
    />

    <path
      className="library-brand-icon__page library-brand-icon__page--right"
      d="M59 23.5C59 21.6 57 20.4 55.3 21.3L41.2 29C36.8 31.4 34 36 34 41V70L52.8 59.7C56.6 57.6 59 53.6 59 49.2V23.5Z"
    />
  </svg>
);
export const AddIcon = () => <Icon name="add" />;
export const PumpkinAddIcon = () => <Icon name="pumpkin-add" />;
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


