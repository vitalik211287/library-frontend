import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
import "./AchievementsHero.css";

const AchievementsHero = ({ summary }) => {
  const totalPercent =
    summary.total > 0
      ? Math.round((summary.unlocked / summary.total) * 100)
      : 0;

  return (
    <section className="achievements-hero">
      <AppPanel className="achievements-hero__content">
        <span className="achievements-hero__eyebrow">Колекція нагород</span>

        <h1>Досягнення</h1>

        <p>
          Читай книги, набирай сторінки, проводь більше часу за читанням і
          відкривай нові медалі.
        </p>
      </AppPanel>

      <AppPanel variant="secondary" className="achievements-summary">
        <div className="achievements-summary__medal">
          <span>🏅</span>
        </div>

        <div className="achievements-summary__content">
          <strong>
            {summary.unlocked} із {summary.total}
          </strong>

          <span>медалей відкрито</span>
        </div>

        <div className="achievements-summary__track">
          <div
            className="achievements-summary__bar"
            style={{
              width: `${totalPercent}%`,
            }}
          />
        </div>

        <small>{totalPercent}% колекції</small>
      </AppPanel>
    </section>
  );
};

export default AchievementsHero;
