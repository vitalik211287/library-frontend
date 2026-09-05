import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import "./LibraryManagementPage.css";

import { useAuth } from "../../../auth/context/AuthContext.jsx";
import { useLibrary } from "../../context/LibraryContext.jsx";

import { apiFetch } from "../../../../shared/api/apiClient.js";
import ConfirmDeleteModal from "../../../../shared/components/ConfirmDeleteModal/ConfirmDeleteModal.jsx";
import {
  ROLE_OPTIONS,
  getInitials,
  getRoleLabel,
} from "./utils/libraryManagementHelpers.js";
import LibraryMembersList from "./components/LibraryMembersList/LibraryMembersList.jsx";
import LibraryRenameForm from "./components/LibraryRenameForm/LibraryRenameForm.jsx";
import AddLibraryMemberForm from "./components/AddLibraryMemberForm/AddLibraryMemberForm.jsx";
import LibraryDangerZone from "./components/LibraryDangerZone/LibraryDangerZone.jsx";

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
        <LibraryRenameForm
          libraryName={libraryName}
          activeLibraryName={activeLibrary?.name}
          isRenamingLibrary={isRenamingLibrary}
          onLibraryNameChange={setLibraryName}
          onSubmit={handleRenameLibrary}
        />
      )}

      {canManage && (
        <AddLibraryMemberForm
          memberEmail={memberEmail}
          isAddingMember={isAddingMember}
          onMemberEmailChange={setMemberEmail}
          onSubmit={handleAddMember}
        />
      )}

      <LibraryMembersList
        members={members}
        isLoading={isLoading}
        userId={user?.id}
        currentMembershipRole={currentMembership?.role}
        canManage={canManage}
        updatingMemberId={updatingMemberId}
        removingMemberId={removingMemberId}
        onRoleChange={handleRoleChange}
        onRemoveMemberRequest={handleRemoveMemberRequest}
      />
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



