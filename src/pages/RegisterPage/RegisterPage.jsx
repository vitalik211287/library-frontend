import { useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext.jsx";

import { apiFetch } from "../../utils/apiClient.js";

import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Заповніть усі поля");

      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        auth: false,

        body: {
          name: name.trim(),

          email: email.trim(),

          password,
        },
      });

      login(data.user, data.token);

      toast.success("Реєстрація успішна");

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Register error:", error);

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
    <main className="register-page">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1>Реєстрація</h1>

        <label>
          Ім&apos;я
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
          />
        </label>

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
            autoComplete="new-password"
          />
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Реєстрація..." : "Зареєструватися"}
        </button>
      </form>
    </main>
  );
};

export default RegisterPage;
