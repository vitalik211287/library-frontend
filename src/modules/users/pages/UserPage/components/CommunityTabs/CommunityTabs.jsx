import "./CommunityTabs.css";

const CommunityTabs = ({ activeTab, onChange }) => (
  <div className="profile-community-tabs">
    <button
      type="button"
      className={activeTab === "posts" ? "is-active" : ""}
      onClick={() => onChange("posts")}
    >
      Дописи
    </button>

    <button
      type="button"
      className={activeTab === "activity" ? "is-active" : ""}
      onClick={() => onChange("activity")}
    >
      Активність
    </button>
  </div>
);

export default CommunityTabs;
