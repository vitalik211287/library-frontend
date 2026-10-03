import "./ProfileTabs.css";

const tabs = [
  { id: "profile", label: "Профіль" },
  { id: "books", label: "Книги" },
  { id: "stats", label: "Статистика" },
  { id: "community", label: "Спільнота" },
];

const ProfileTabs = ({ activeTab, onChange }) => {
  return (
    <nav className="profile-tabs" aria-label="Розділи профілю">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`profile-tabs__button ${
            activeTab === tab.id ? "profile-tabs__button--active" : ""
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default ProfileTabs;
