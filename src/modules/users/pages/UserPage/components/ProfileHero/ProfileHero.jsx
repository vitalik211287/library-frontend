import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../../../auth/context/AuthContext.jsx";
import AppPanel from "../../../../../../shared/components/AppPanel/AppPanel.jsx";
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
        <AppPanel
          as="button"
          variant="secondary"
          clickable
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users/following")}
        >
          <span className="profile-hero__social-icon">
            <Icon name="community" />
          </span>

          <span className="profile-hero__social-content">
            <strong>{followingCount}</strong>
            <span>Підписки</span>
          </span>

          <span className="profile-hero__chevron">
            <Icon name="chevron-right" />
          </span>
        </AppPanel>

        <AppPanel
          as="button"
          variant="secondary"
          clickable
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users/followers")}
        >
          <span className="profile-hero__social-icon">
            <Icon name="community" />
          </span>

          <span className="profile-hero__social-content">
            <strong>{followersCount}</strong>
            <span>Підписники</span>
          </span>

          <span className="profile-hero__chevron">
            <Icon name="chevron-right" />
          </span>
        </AppPanel>

        <AppPanel
          as="button"
          variant="secondary"
          clickable
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/users")}
        >
          <span className="profile-hero__social-icon">
            <Icon name="search" />
          </span>

          <span className="profile-hero__social-content">
            <strong className="profile-hero__social-title">Знайти</strong>
            <span>читачів</span>
          </span>

          <span className="profile-hero__chevron">
            <Icon name="chevron-right" />
          </span>
        </AppPanel>

        <AppPanel
          as="button"
          variant="secondary"
          clickable
          type="button"
          className="profile-hero__social-item"
          onClick={() => navigate("/settings")}
        >
          <span className="profile-hero__social-icon">
            <Icon name="edit" />
          </span>

          <span className="profile-hero__social-content">
            <strong className="profile-hero__social-title">Редагувати</strong>
            <span>профіль</span>
          </span>

          <span className="profile-hero__chevron">
            <Icon name="chevron-right" />
          </span>
        </AppPanel>
      </div>
    </section>
  );
};

export default ProfileHero;
