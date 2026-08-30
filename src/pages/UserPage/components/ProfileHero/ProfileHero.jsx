import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext.jsx";

import "./ProfileHero.css";

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.4-1 9.8-9.8-3.4-3.4L5 15.6 4 20Z" />
    <path d="m13.8 6.8 3.4 3.4" />
  </svg>
);

const ProfileHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const profileName = user?.name || "Користувач";

  return (
    <section className="profile-hero">
      <div className="profile-hero__avatar-wrap">
        <div className="profile-hero__avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={profileName} />
          ) : (
            <span>{profileName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <button
          type="button"
          className="profile-hero__edit"
          onClick={() => navigate("/settings")}
          aria-label="Редагувати профіль"
        >
          <EditIcon />
        </button>
      </div>

      <div className="profile-hero__content">
        <h1>{profileName}</h1>

        {user?.email && <p className="profile-hero__email">{user.email}</p>}

        <p className="profile-hero__quote">
          «Читання — це подорож,
          <br />
          яка ніколи не закінчується.»
        </p>
      </div>
    </section>
  );
};

export default ProfileHero;
