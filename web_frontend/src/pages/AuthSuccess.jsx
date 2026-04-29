import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const name = params.get("name") || "Google User";
    const email = params.get("email") || "googleuser@gmail.com";

    if (token) {
      localStorage.setItem("token", token);

      localStorage.setItem(
        "pb_mock_session",
        JSON.stringify({
          name,
          email,
          verified: true,
          loginType: "google",
          joinDate: new Date().toISOString(),
          phone: "",
          location: "",
          bio: "",
          avatar: null
        })
      );

      navigate("/", { replace: true });
    } else {
      navigate("/signin", { replace: true });
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}

export default AuthSuccess;