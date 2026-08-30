import { useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";

import { apiFetch } from "../../utils/apiClient.js";

import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const { login } = useAuth();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    navigate("/");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Введіть email та пароль");

      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        auth: false,

        body: {
          email: email.trim(),

          password,
        },
      });

      login(data.user, data.token);

      toast.success("Вхід виконано");

      const destination = location.state?.from || "/";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Не вдалося з'єднатися із сервером",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <button
          type="button"
          className="login-form__close"
          onClick={handleClose}
          aria-label="Закрити"
        >
          ×
        </button>

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
};

export default LoginPage;
