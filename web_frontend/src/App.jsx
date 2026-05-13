import AuthSuccess from "./pages/AuthSuccess";
import React from "react";
import { Link, Navigate, Route, Routes, useSearchParams } from "react-router-dom";
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
import ProtectedRoute from "./components/ProtectedRoute";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import PostListingPage from "./pages/PostListingPage";
import EditListingPage from "./pages/EditListingPage";
import DashboardPage from "./pages/DashboardPage";
import OffersPage from "./pages/OffersPage";
import MessageThreadPage from "./pages/MessageThreadPage";
import SavedListingsPage from "./pages/SavedListingsPage";
import CheckoutPage from "./components/checkout_page";

const PaymentResultPage = ({ type }) => {
  const [searchParams] = useSearchParams();
  const tranId = searchParams.get("tran_id");
  const content = {
    success: {
      eyebrow: "Payment Complete",
      title: "Your payment was successful.",
      message: "The transaction has been recorded and your trade can move forward.",
      color: "#2ec97e",
    },
    failed: {
      eyebrow: "Payment Failed",
      title: "The payment could not be completed.",
      message: "No successful payment was recorded for this transaction.",
      color: "#ef4444",
    },
    cancelled: {
      eyebrow: "Payment Cancelled",
      title: "You cancelled the payment.",
      message: "The checkout session was closed before payment completion.",
      color: "#f59e0b",
    },
  }[type];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif", background: "linear-gradient(135deg,#08231a 0%,#0f3d28 56%,#1b7d52 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "96px 24px" }}>
      <div style={{ width: "100%", maxWidth: 560, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 22, padding: 6, backdropFilter: "blur(22px)" }}>
        <div style={{ background: "#fff", color: "#0d1f16", borderRadius: 17, padding: "34px 30px", textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: content.color, marginBottom: 10 }}>{content.eyebrow}</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.08, marginBottom: 12 }}>{content.title}</h1>
          <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: tranId ? 16 : 26 }}>{content.message}</p>
          {tranId && (
            <p style={{ display: "inline-block", fontFamily: "monospace", fontSize: 12, color: "#1b7d52", background: "rgba(46,201,126,0.08)", border: "1px solid rgba(46,201,126,0.22)", borderRadius: 10, padding: "8px 12px", marginBottom: 26 }}>
              Transaction: {tranId}
            </p>
          )}
          <div>
            <Link to="/marketplace" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff", borderRadius: 13, padding: "12px 20px", fontSize: 14, fontWeight: 800 }}>
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


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
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/success" element={<PaymentResultPage type="success" />} />
        <Route path="/payment/failed" element={<PaymentResultPage type="failed" />} />
        <Route path="/payment/cancelled" element={<PaymentResultPage type="cancelled" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
    </>
  );
};

export default App;
