import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import "./LibraryManagementPage.css";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";

const ROLE_OPTIONS = [
  {
    value: "OWNER",
    label: "Власник",
  },
  {
    value: "ADMIN",
    label: "Адміністратор",
  },
  {
    value: "MEMBER",
    label: "Учасник",
  },
];

const getRoleLabel = (role) =>
  ROLE_OPTIONS.find((item) => item.value === role)?.label ?? role;

const getInitials = (member) => {
  const name = member?.user?.name?.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  const email = member?.user?.email?.trim();

  return email?.[0]?.toUpperCase() ?? "?";
};

const LibraryManagementPage = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    activeLibrary,
    activeLibraryId,
    addLibraryMember,
    renameLibrary,
    deleteLibrary,
    refreshLibraries,
    isLibrariesLoading,
  } = useLibrary();

  const [members, setMembers] = useState([]);

  const [memberEmail, setMemberEmail] = useState("");

  const [libraryName, setLibraryName] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isAddingMember, setIsAddingMember] = useState(false);

  const [isRenamingLibrary, setIsRenamingLibrary] = useState(false);

  const [isDeletingLibrary, setIsDeletingLibrary] = useState(false);

  const [updatingMemberId, setUpdatingMemberId] = useState("");

  const [removingMemberId, setRemovingMemberId] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState(null);

  useEffect(() => {
    setLibraryName(activeLibrary?.name ?? "");
  }, [activeLibrary?.id, activeLibrary?.name]);

  const currentMembership = useMemo(
    () =>
      members.find((member) => String(member.userId) === String(user?.id)) ??
      null,
    [members, user?.id],
  );

  const canManage =
    currentMembership?.role === "OWNER" || currentMembership?.role === "ADMIN";

  const isOwner = currentMembership?.role === "OWNER";

  const loadMembers = async () => {
    if (!activeLibraryId) {
      setMembers([]);
      setIsLoading(false);

      return;
    }

    try {
      setIsLoading(true);

      const data = await apiFetch(`/api/libraries/${activeLibraryId}/members`);

      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Load library members error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити учасників",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLibrariesLoading) {
      return;
    }

    loadMembers();
  }, [activeLibraryId, isLibrariesLoading]);

  const handleRenameLibrary = async (event) => {
    event.preventDefault();

    if (!activeLibraryId) {
      toast.error("Бібліотеку не вибрано");

      return;
    }

    try {
      setIsRenamingLibrary(true);

      await renameLibrary(activeLibraryId, libraryName);

      await refreshLibraries();

      toast.success("Назву бібліотеки змінено");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося перейменувати бібліотеку",
      );
    } finally {
      setIsRenamingLibrary(false);
    }
  };

  const handleDeleteLibraryRequest = () => {
    if (!activeLibraryId || !activeLibrary) {
      return;
    }

    setIsDeleteModalOpen(true);
  };

  const handleDeleteLibrary = async () => {
    if (!activeLibraryId || !activeLibrary) {
      return;
    }

    try {
      setIsDeletingLibrary(true);

      await deleteLibrary(activeLibraryId);

      setIsDeleteModalOpen(false);

      toast.success("Бібліотеку видалено");

      navigate("/home", {
        replace: true,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося видалити бібліотеку",
      );
    } finally {
      setIsDeletingLibrary(false);
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!activeLibraryId) {
      toast.error("Бібліотеку не вибрано");

      return;
    }

    try {
      setIsAddingMember(true);

      await addLibraryMember(activeLibraryId, memberEmail);

      setMemberEmail("");

      await loadMembers();

      toast.success("Учасника додано");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося додати учасника",
      );
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRoleChange = async (member, role) => {
    if (member.role === role) {
      return;
    }

    try {
      setUpdatingMemberId(member.userId);

      const updatedMember = await apiFetch(
        `/api/libraries/${activeLibraryId}/members/${member.userId}`,
        {
          method: "PATCH",
          body: {
            role,
          },
        },
      );

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember.userId === member.userId
            ? updatedMember
            : currentMember,
        ),
      );

      await refreshLibraries();

      toast.success("Роль змінено");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося змінити роль",
      );
    } finally {
      setUpdatingMemberId("");
    }
  };

  const handleRemoveMemberRequest = (member) => {
    setMemberToRemove(member);
  };

  const handleCancelRemoveMember = () => {
    if (removingMemberId) {
      return;
    }

    setMemberToRemove(null);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !activeLibraryId) {
      return;
    }

    try {
      setRemovingMemberId(memberToRemove.userId);

      await apiFetch(
        `/api/libraries/${activeLibraryId}/members/${memberToRemove.userId}`,
        {
          method: "DELETE",
        },
      );

      setMembers((currentMembers) =>
        currentMembers.filter(
          (currentMember) => currentMember.userId !== memberToRemove.userId,
        ),
      );

      setMemberToRemove(null);

      await refreshLibraries();

      toast.success("Учасника видалено");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося видалити учасника",
      );
    } finally {
      setRemovingMemberId("");
    }
  };

  if (!activeLibraryId && !isLibrariesLoading) {
    return (
      <main className="library-management-page">
        <button
          type="button"
          className="library-management-page__back"
          onClick={() => navigate("/home")}
        >
          ← Назад
        </button>

        <section className="library-management-card library-management-card--empty">
          <h1>Керування бібліотекою</h1>

          <p>Спочатку створіть або виберіть бібліотеку.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="library-management-page">
      <header className="library-management-page__header">
        <button
          type="button"
          className="library-management-page__back"
          onClick={() => navigate("/home")}
        >
          ← Назад
        </button>

        <div>
          <p className="library-management-page__eyebrow">БІБЛІОТЕКА</p>

          <h1>Керування бібліотекою</h1>

          <p className="library-management-page__subtitle">
            {activeLibrary?.name ?? "Бібліотека"}
          </p>
        </div>
      </header>

      {canManage && (
        <section className="library-management-card">
          <div className="library-management-card__header">
            <div>
              <h2>Назва бібліотеки</h2>

              <p>Змініть назву цього бібліотечного простору.</p>
            </div>
          </div>

          <form
            className="library-management-add"
            onSubmit={handleRenameLibrary}
          >
            <input
              type="text"
              value={libraryName}
              onChange={(event) => setLibraryName(event.target.value)}
              placeholder="Назва бібліотеки"
              disabled={isRenamingLibrary}
              required
            />

            <button
              type="submit"
              disabled={
                isRenamingLibrary ||
                libraryName.trim() === activeLibrary?.name?.trim()
              }
            >
              {isRenamingLibrary ? "Збереження..." : "Зберегти"}
            </button>
          </form>
        </section>
      )}

      {canManage && (
        <section className="library-management-card">
          <div className="library-management-card__header">
            <div>
              <h2>Додати учасника</h2>

              <p>Користувач повинен уже мати акаунт у бібліотеці.</p>
            </div>
          </div>

          <form className="library-management-add" onSubmit={handleAddMember}>
            <input
              type="email"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              disabled={isAddingMember}
              required
            />

            <button type="submit" disabled={isAddingMember}>
              {isAddingMember ? "Додаємо..." : "Додати учасника"}
            </button>
          </form>
        </section>
      )}

      <section className="library-management-card">
        <div className="library-management-card__header">
          <div>
            <h2>Учасники</h2>

            <p>
              {members.length} {members.length === 1 ? "учасник" : "учасники"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="library-management-status">Завантаження...</p>
        ) : members.length === 0 ? (
          <p className="library-management-status">Учасників не знайдено.</p>
        ) : (
          <div className="library-members-list">
            {members.map((member) => {
              const isCurrentUser = String(member.userId) === String(user?.id);

              const isUpdating = updatingMemberId === member.userId;

              const isRemoving = removingMemberId === member.userId;

              const adminCannotManageOwner =
                currentMembership?.role === "ADMIN" && member.role === "OWNER";

              const canEditThisMember = canManage && !adminCannotManageOwner;

              return (
                <article key={member.id} className="library-member">
                  <div className="library-member__identity">
                    <div className="library-member__avatar">
                      {member.user?.avatarUrl ? (
                        <img src={member.user.avatarUrl} alt="" />
                      ) : (
                        <span>{getInitials(member)}</span>
                      )}
                    </div>

                    <div className="library-member__info">
                      <div className="library-member__name-row">
                        <strong>
                          {member.user?.name ||
                            member.user?.email ||
                            "Користувач"}
                        </strong>

                        {isCurrentUser && (
                          <span className="library-member__you">Ви</span>
                        )}
                      </div>

                      {member.user?.name && member.user?.email && (
                        <span className="library-member__email">
                          {member.user.email}
                        </span>
                      )}

                      <span className="library-member__role-mobile">
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </div>

                  <div className="library-member__actions">
                    {canEditThisMember ? (
                      <select
                        value={member.role}
                        onChange={(event) =>
                          handleRoleChange(member, event.target.value)
                        }
                        disabled={isUpdating || isRemoving}
                      >
                        {ROLE_OPTIONS.map((roleOption) => (
                          <option
                            key={roleOption.value}
                            value={roleOption.value}
                          >
                            {roleOption.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="library-member__role">
                        {getRoleLabel(member.role)}
                      </span>
                    )}

                    {canManage && !isCurrentUser && !adminCannotManageOwner && (
                      <button
                        type="button"
                        className="library-member__remove"
                        onClick={() => handleRemoveMemberRequest(member)}
                        disabled={isUpdating || isRemoving}
                      >
                        {isRemoving ? "..." : "Видалити"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {isOwner && (
        <section className="library-management-card library-management-danger">
          <div className="library-management-card__header">
            <div>
              <h2>Небезпечна зона</h2>

              <p>
                Видалення бібліотеки незворотне. Книги та читацькі дані
                користувачів не видаляються, але сам простір бібліотеки та його
                учасники буде видалено.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="library-management-danger__button"
            onClick={handleDeleteLibraryRequest}
            disabled={isDeletingLibrary}
          >
            {isDeletingLibrary ? "Видалення..." : "Видалити бібліотеку"}
          </button>
        </section>
      )}

      {!canManage && !isLoading && (
        <p className="library-management-note">
          Ви можете переглядати учасників, але керувати ними можуть лише власник
          або адміністратор бібліотеки.
        </p>
      )}
      <ConfirmDeleteModal
        isOpen={Boolean(memberToRemove)}
        title="Видалити учасника?"
        description={`${
          memberToRemove?.user?.name?.trim() ||
          memberToRemove?.user?.email ||
          "Цей учасник"
        } буде видалений з бібліотеки.`}
        confirmText="Видалити"
        isLoading={Boolean(removingMemberId)}
        onCancel={handleCancelRemoveMember}
        onConfirm={handleRemoveMember}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Видалити бібліотеку?"
        description={`Бібліотека "${activeLibrary?.name ?? ""}" буде видалена. Цю дію неможливо скасувати.`}
        confirmText="Видалити"
        isLoading={isDeletingLibrary}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteLibrary}
      />
    </main>
  );
};

export default LibraryManagementPage;



