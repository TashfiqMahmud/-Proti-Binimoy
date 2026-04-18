import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/home";
import AboutPage from "./about";
import SignInPage from "./components/login";
import RegisterPage from "./components/register";
import ForgotPasswordPage from "./components/forgot-password";
import MouseEffects from "./components/mouse-effects";

const App = () => {
  return (
    <>
      <MouseEffects />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
