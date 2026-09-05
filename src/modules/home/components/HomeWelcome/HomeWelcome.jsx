const HomeWelcome = ({ greeting, firstName }) => {
  return (
    <section className="home-welcome">
      <span className="home-welcome__eyebrow">Твій читацький простір</span>

      <h1>
        {greeting}
        {firstName ? `, ${firstName}` : ""}

        <span aria-hidden="true"> 👋</span>
      </h1>

      <p>Продовжуємо читати?</p>
    </section>
  );
};

export default HomeWelcome;
