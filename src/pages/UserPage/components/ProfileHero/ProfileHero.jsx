import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext.jsx";
import { apiFetch } from "../../../../utils/apiClient.js";

import "./ProfileHero.css";

const FollowingIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="8" cy="8" r="3.5" />
    <circle cx="16" cy="8" r="3.5" />
    <path d="M2.5 20c.6-4 2.8-6 5.5-6s4.9 2 5.5 6" />
    <path d="M10.5 20c.5-3.2 2.4-5 5.5-5 2.7 0 4.7 1.7 5.5 5" />
  </svg>
);

const FollowersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="8" r="4" />
    <path d="M2.5 21c.6-4.5 3-7 6.5-7s5.9 2.5 6.5 7" />
    <path d="M18 8v6" />
    <path d="M15 11h6" />
  </svg>
);

const FindUsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.7-4 3-6 6.5-6 2 0 3.7.7 4.8 2" />
    <circle cx="17" cy="16" r="3" />
    <path d="m19.2 18.2 2.3 2.3" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 20 4.3-1 10-10-3.3-3.3-10 10L4 20Z" />
    <path d="m13.8 6.9 3.3 3.3" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

const ProfileHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const profileName = user?.name || "Користувач";

  useEffect(() => {
    const loadSocialStats = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const data = await apiFetch(`/api/users/${user.id}/profile`);

        setFollowersCount(data?.followersCount ?? 0);
        setFollowingCount(data?.followingCount ?? 0);
      } catch (error) {
        console.error("Load social profile stats error:", error);
      }
    };

    loadSocialStats();
  }, [user?.id]);

  return (
    <section className="profile-hero">
      <div className="profile-hero__identity">
        <div className="profile-hero__avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={profileName} />
          ) : (
            <span>{profileName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="profile-hero__info">
          <h1>{profileName}</h1>

          <p className="profile-hero__quote">
            «Читання — це подорож, яка ніколи не закінчується.»
          </p>
        </div>
      </div>

      <div className="profile-hero__social">
        <button
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users/following")}
        >
          <span className="profile-hero__social-icon">
            <FollowingIcon />
          </span>

          <span className="profile-hero__social-content">
            <strong>{followingCount}</strong>
            <span>Підписки</span>
          </span>

          <span className="profile-hero__chevron">
            <ChevronIcon />
          </span>
        </button>

        <button
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users/followers")}
        >
          <span className="profile-hero__social-icon">
            <FollowersIcon />
          </span>

          <span className="profile-hero__social-content">
            <strong>{followersCount}</strong>
            <span>Підписники</span>
          </span>

          <span className="profile-hero__chevron">
            <ChevronIcon />
          </span>
        </button>

        <button
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users")}
        >
          <span className="profile-hero__social-icon">
            <FindUsersIcon />
          </span>

          <span className="profile-hero__social-content">
            <strong className="profile-hero__social-title">Знайти</strong>
            <span>читачів</span>
          </span>

          <span className="profile-hero__chevron">
            <ChevronIcon />
          </span>
        </button>

        <button
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/settings")}
        >
          <span className="profile-hero__social-icon">
            <EditIcon />
          </span>

          <span className="profile-hero__social-content">
            <strong className="profile-hero__social-title">Редагувати</strong>
            <span>профіль</span>
          </span>

          <span className="profile-hero__chevron">
            <ChevronIcon />
          </span>
        </button>
      </div>
    </section>
  );
};

export default ProfileHero;
