import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import "./LoginPage.css";

import { useAuth } from "../../context/AuthContext.jsx";

// const API_URL = "https://library-backend-production-5d60.up.railway.app";
const API_URL = "http://localhost:4000";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Введіть email та пароль");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Помилка входу");

        return;
      }

      /*
       * AuthContext:
       * 1. збереже JWT у localStorage
       * 2. одразу запише user у state
       */
      login(data.user, data.token);

      toast.success("Вхід виконано");

      /*
       * Якщо користувач натиснув "Читати"
       * до авторизації, CatalogPage передав:
       *
       * state: {
       *   from: "/?reading=BOOK_ID"
       * }
       *
       * Після входу повертаємо його
       * прямо до потрібної книги.
       */

      const destination = location.state?.from || "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error("Не вдалося з'єднатися із сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Вхід</h1>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </label>

        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Вхід..." : "Увійти"}
        </button>
        <p className="login-form__register">
          Ще немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;
