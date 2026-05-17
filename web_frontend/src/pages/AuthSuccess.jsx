import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../config/api";

function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const name = params.get("name") || "Google User";
    const email = params.get("email") || "googleuser@gmail.com";

    const finishLogin = async () => {
      if (!token) {
        navigate("/signin", { replace: true });
        return;
      }

      login(token, { name, email });

      try {
        const { response, data } = await apiFetch(`/api/auth/me`);
        if (response.ok && data.user) {
          login(token, data.user);
        }
      } catch (err) {
        console.warn('Failed to load full user profile', err);
      }

      navigate("/", { replace: true });
    };

    finishLogin();
  }, [login, navigate]);

  return <p>Logging you in...</p>;
}

export default AuthSuccess;
