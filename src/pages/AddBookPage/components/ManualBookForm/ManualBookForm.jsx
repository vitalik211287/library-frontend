import "./ManualBookForm.css";

const ManualBookForm = ({ isbn, onIsbnChange, onSubmit }) => {
  return (
    <form className="manual-form" onSubmit={onSubmit}>
      <input
        type="text"
        name="isbn"
        placeholder="ISBN"
        value={isbn}
        onChange={onIsbnChange}
      />

      <input type="text" name="title" placeholder="Назва книги" />

      <input type="text" name="author" placeholder="Автор" />

      <input type="text" name="publisher" placeholder="Видавництво" />

      <input type="number" name="year" placeholder="Рік" />

      <input type="number" name="pages" placeholder="Кількість сторінок" />

      <input
        type="text"
        name="language"
        placeholder="Мова"
        defaultValue="Українська"
      />

      <input type="text" name="genre" placeholder="Жанр" />

      <textarea name="description" placeholder="Опис" />

      <label className="cover-input">
        <span>Обкладинка</span>

        <input
          type="file"
          name="cover"
          accept="image/jpeg,image/png,image/webp"
        />
      </label>

      <button type="submit">Зберегти книгу</button>
    </form>
  );
};

export default ManualBookForm;
