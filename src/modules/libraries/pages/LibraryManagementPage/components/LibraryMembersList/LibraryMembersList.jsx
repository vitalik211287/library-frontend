import "./LibraryMembersList.css";

import {
  ROLE_OPTIONS,
  getInitials,
  getRoleLabel,
} from "../../utils/libraryManagementHelpers.js";

const LibraryMembersList = ({
  members,
  isLoading,
  userId,
  currentMembershipRole,
  canManage,
  updatingMemberId,
  removingMemberId,
  onRoleChange,
  onRemoveMemberRequest,
}) => {
  return (
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
            const isCurrentUser =
              String(member.userId) === String(userId);

            const isUpdating =
              updatingMemberId === member.userId;

            const isRemoving =
              removingMemberId === member.userId;

            const adminCannotManageOwner =
              currentMembershipRole === "ADMIN" &&
              member.role === "OWNER";

            const canEditThisMember =
              canManage && !adminCannotManageOwner;

            return (
              <article
                key={member.id}
                className="library-member"
              >
                <div className="library-member__identity">
                  <div className="library-member__avatar">
                    {member.user?.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt=""
                      />
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
                        <span className="library-member__you">
                          Ви
                        </span>
                      )}
                    </div>

                    {member.user?.name &&
                      member.user?.email && (
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
                        onRoleChange(
                          member,
                          event.target.value,
                        )
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

                  {canManage &&
                    !isCurrentUser &&
                    !adminCannotManageOwner && (
                      <button
                        type="button"
                        className="library-member__remove"
                        onClick={() =>
                          onRemoveMemberRequest(member)
                        }
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
  );
};

export default LibraryMembersList;
