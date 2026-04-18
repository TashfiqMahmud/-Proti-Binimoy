import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/home";
import AboutPage from "./about";
import SignInPage from "./components/login";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
