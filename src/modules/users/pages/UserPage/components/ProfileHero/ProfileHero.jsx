import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../../auth/context/AuthContext.jsx";
import Icon from "../../../../../../shared/components/Icon/Icon.jsx";
import { apiFetch } from "../../../../../../shared/api/apiClient.js";

import "./ProfileHero.css";

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
            <img
              decoding="async"
              src={user.avatarUrl}
              alt={profileName}
            />
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
        <div className="profile-hero__social-stats">
          <button
            type="button"
            className="profile-hero__social-link"
            onClick={() => navigate("/users/followers")}
          >
            <strong>{followersCount}</strong>
            <span>підписників</span>
          </button>

          <span className="profile-hero__social-separator">·</span>

          <button
            type="button"
            className="profile-hero__social-link"
            onClick={() => navigate("/users/following")}
          >
            <strong>{followingCount}</strong>
            <span>підписок</span>
          </button>
        </div>

        <div className="profile-hero__actions">
          <button
            type="button"
            className="profile-hero__action"
            onClick={() => navigate("/settings")}
          >
            <Icon name="edit" />
            <span>Редагувати профіль</span>
          </button>

          <button
            type="button"
            className="profile-hero__action profile-hero__action--secondary"
            onClick={() => navigate("/users")}
          >
            <Icon name="search" />
            <span>Знайти читачів</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProfileHero;
