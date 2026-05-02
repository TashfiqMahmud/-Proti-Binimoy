import AuthSuccess from "./pages/AuthSuccess";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/home";
import AboutPage from "./components/about_page";
import SignInPage from "./components/login";
import RegisterPage from "./components/register";
import ForgotPasswordPage from "./components/forgot-password";
import ResetPasswordPage from "./components/reset-password";
import MarketplacePage from "./components/marketplace";
import UserProfilePage from "./components/user-profile";
import PostItemPage from "./components/post-item";
import MouseEffects from "./components/mouse-effects";

const App = () => {
  return (
    <>
      <MouseEffects />
      <Routes>
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/post-item" element={<PostItemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;