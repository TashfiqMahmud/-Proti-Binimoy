/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "../config/api";

export const AuthContext = createContext(null);

const isMockToken = (value) => typeof value === "string" && value.startsWith("mock_");

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const userRef = useRef(null);

  const login = useCallback((nextToken, nextUser) => {
    setToken(nextToken || null);
    setUser(nextUser || null);
    userRef.current = nextUser || null;

    if (nextToken) {
      localStorage.setItem("authToken", nextToken);
    } else {
      localStorage.removeItem("authToken");
    }

    if (nextUser) {
      localStorage.setItem("authUser", JSON.stringify(nextUser));
    } else {
      localStorage.removeItem("authUser");
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    userRef.current = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("authUser");

    if (!storedToken) {
      return;
    }

    if (!storedUser) {
      setToken(storedToken);
      userRef.current = null;
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      userRef.current = parsedUser;
    } catch {
      localStorage.removeItem("authUser");
      setToken(storedToken);
      setUser(null);
      userRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    if (isMockToken(token)) {
      return undefined;
    }

    let timerId;
    let isCancelled = false;

    const refreshToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.token) {
          throw new Error("Token refresh failed");
        }

        if (!isCancelled) {
          login(data.token, userRef.current);
        }
      } catch {
        if (!isCancelled) {
          logout();
        }
      }
    };

    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      logout();
      return undefined;
    }

    const expiresInMs = payload.exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      logout();
      return undefined;
    }

    const refreshInMs = expiresInMs - 5 * 60 * 1000;
    if (refreshInMs <= 0) {
      refreshToken();
      return () => {
        isCancelled = true;
      };
    }

    timerId = setTimeout(refreshToken, refreshInMs);

    return () => {
      isCancelled = true;
      clearTimeout(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
