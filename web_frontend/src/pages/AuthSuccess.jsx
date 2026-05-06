import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const name = params.get("name") || "Google User";
    const email = params.get("email") || "googleuser@gmail.com";

    if (token) {
      login(token, { name, email });
      navigate("/", { replace: true });
    } else {
      navigate("/signin", { replace: true });
    }
  }, [login, navigate]);

  return <p>Logging you in...</p>;
}

export default AuthSuccess;
