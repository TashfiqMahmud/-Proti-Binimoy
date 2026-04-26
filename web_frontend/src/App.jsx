import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./components/home";
import AboutPage from "./about";
import SignInPage from "./components/login";
import RegisterPage from "./components/register";
import ForgotPasswordPage from "./components/forgot-password";
import MarketplacePage from "./components/marketplace";
import UserProfilePage from "./components/user-profile";
import ResetPasswordPage from "./components/reset-password";
import ProtectedRoute from "./components/ProtectedRoute";
import MouseEffects from "./components/mouse-effects";
import PostItemPage from "./components/post-item";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import PostListingPage from "./pages/PostListingPage";
import EditListingPage from "./pages/EditListingPage";
import DashboardPage from "./pages/DashboardPage";
import OffersPage from "./pages/OffersPage";
import MessageThreadPage from "./pages/MessageThreadPage";
import SavedListingsPage from "./pages/SavedListingsPage";

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
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/post-item" element={<PostItemPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/listings/new" element={<PostListingPage />} />
          <Route path="/listings/:id/edit" element={<EditListingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/messages/:offerId" element={<MessageThreadPage />} />
          <Route path="/saved" element={<SavedListingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
