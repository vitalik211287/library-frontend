import "../LibraryManagementForm.css";

const AddLibraryMemberForm = ({
  memberEmail,
  isAddingMember,
  onMemberEmailChange,
  onSubmit,
}) => {
  return (
    <section className="library-management-card">
      <div className="library-management-card__header">
        <div>
          <h2>Додати учасника</h2>

          <p>Користувач повинен уже мати акаунт у бібліотеці.</p>
        </div>
      </div>

      <form
        className="library-management-add"
        onSubmit={onSubmit}
      >
        <input
          type="email"
          value={memberEmail}
          onChange={(event) =>
            onMemberEmailChange(event.target.value)
          }
          placeholder="email@example.com"
          autoComplete="email"
          disabled={isAddingMember}
          required
        />

        <button
          type="submit"
          disabled={isAddingMember}
        >
          {isAddingMember
            ? "Додаємо..."
            : "Додати учасника"}
        </button>
      </form>
    </section>
  );
};

export default AddLibraryMemberForm;
