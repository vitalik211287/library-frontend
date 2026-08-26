import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import "./RegisterPage.css";
import { useAuth } from "../../context/AuthContext.jsx";

const API_URL =
  "https://library-backend-production-5d60.up.railway.app";

function RegisterPage() {
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
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.message || "Не вдалося зареєструватися",
        );
        return;
      }

      login(data.user, data.token);

      toast.success("Реєстрація успішна");

      navigate("/");
    } catch (error) {
      console.error("Register error:", error);

      toast.error("Не вдалося з'єднатися із сервером");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="register-page">
      <form
        className="register-form"
        onSubmit={handleSubmit}
      >
        <h1>Реєстрація</h1>

        <label>
          Ім'я

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            autoComplete="name"
          />
        </label>

        <label>
          Email

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            autoComplete="email"
          />
        </label>

        <label>
          Пароль

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Реєстрація..."
            : "Зареєструватися"}
        </button>
      </form>
    </main>
  );
}

export default RegisterPage;