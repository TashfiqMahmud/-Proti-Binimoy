import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import webBg from "../assets/web_bg.png";
import { BD_LOCATIONS } from "../config/locations";
import PageFooter from "./page-footer";
import BuyerProfileView from "./buyer-profile";
import SellerProfileView from "./seller-profile";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const getLocationText = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location;
  return location.city || "";
};

const mapListingForProfile = (listing) => ({
  id: listing._id,
  emoji: Array.isArray(listing.images) && listing.images[0] ? listing.images[0] : "Item",
  title: listing.title || "Untitled listing",
  price: `BDT ${new Intl.NumberFormat("en-BD").format(Number(listing.price) || 0)}`,
  status: listing.status || "active",
  cat: listing.category || "Other",
  views: 0,
  saves: 0,
  image: Array.isArray(listing.images) ? listing.images.find(Boolean) || "" : ""
});

const mapProfileUser = (profile = {}, listings = [], fallback = {}) => ({
  id: profile.id || profile._id || fallback.id || fallback._id || "",
  email: profile.email || fallback.email || "",
  name: profile.name || fallback.name || "User",
  phone: profile.phone || "",
  joinDate: profile.joinDate || profile.createdAt || "",
  location: getLocationText(profile.location),
  locationData: typeof profile.location === "object" && profile.location ? profile.location : {},
  bio: profile.bio || "",
  idType: profile.idType || "",
  idValue: profile.idValue || profile.nid || profile.passportNumber || "",
  avatar: profile.avatar || profile.profilePicture || "",
  profilePicture: profile.profilePicture || profile.avatar || "",
  rating: Number(profile.rating) || 0,
  reviews: Number(profile.reviews || profile.totalReviews) || 0,
  totalReviews: Number(profile.totalReviews || profile.reviews) || 0,
  totalListings: Number(profile.totalListings) || listings.length,
  soldItems: Number(profile.soldItems) || listings.filter(listing => listing.status === "sold").length,
  savedItems: Number(profile.savedItems) || 0,
  verified: Boolean(profile.verified || profile.isVerified),
  memberTier: profile.memberTier || (profile.verified || profile.isVerified ? "Verified" : "Member"),
  role: profile.role || fallback.role || "",
});

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; scroll-behavior: smooth; }

    @keyframes up-fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes up-shimmer   { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes up-spin      { to{transform:rotate(360deg)} }
    @keyframes up-pop       { 0%{transform:scale(0.82);opacity:0} 65%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
    @keyframes up-slideIn   { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes up-slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes up-pulse     { 0%,100%{box-shadow:0 0 0 0 rgba(46,201,126,0.4)} 50%{box-shadow:0 0 0 12px rgba(46,201,126,0)} }
    @keyframes up-bar       { from{width:0%} to{width:100%} }
    @keyframes up-ping      { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.9);opacity:0} }

    /* Auth full-page overlay animations */
    @keyframes auth-fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes auth-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes auth-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes auth-spin    { to{transform:rotate(360deg)} }
    @keyframes auth-slideIn { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes auth-pop     { 0%{transform:scale(0.82);opacity:0} 65%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
    @keyframes auth-bar     { from{width:0%} to{width:100%} }
    @keyframes auth-pulse2  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes auth-checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.25)} 100%{transform:scale(1)} }

    .auth-fade  { opacity:0; animation:auth-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .auth-d1{animation-delay:0.08s} .auth-d2{animation-delay:0.18s} .auth-d3{animation-delay:0.28s}
    .auth-d4{animation-delay:0.38s} .auth-d5{animation-delay:0.48s}
    .auth-slide { opacity:0; animation:auth-slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards; }
    .auth-pop   { animation:auth-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* Full-page auth overlay */
    .auth-overlay {
      position:fixed; inset:0; z-index:600;
      overflow-y:auto; overflow-x:hidden;
    }
    .auth-close-btn {
      position:fixed; top:18px; right:20px; z-index:700;
      width:42px; height:42px; border-radius:50%;
      background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
      color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
      backdrop-filter:blur(12px); transition:background 0.2s;
    }
    .auth-close-btn:hover { background:rgba(255,255,255,0.2); }

    /* NAV inside overlay */
    .auth-nav {
      position:sticky; top:0; z-index:200;
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 48px;
      background:rgba(8,35,26,0.7); backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(255,255,255,0.08);
    }
    .auth-nav-links { display:flex; align-items:center; gap:28px; }
    .auth-nav-link  { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .auth-nav-link:hover { color:#2ec97e; }
    .auth-nav-cta   { text-decoration:none; color:#fff; font-size:14px; font-weight:600; background:rgba(46,201,126,0.18); border:1px solid rgba(46,201,126,0.45); padding:8px 20px; border-radius:100px; transition:background 0.2s; }
    .auth-nav-cta:hover { background:rgba(46,201,126,0.3); }

    /* LAYOUT GRIDS */
    .auth-login-grid {
      display:grid; grid-template-columns:1fr 1fr; gap:64px;
      align-items:center; max-width:1280px; margin:0 auto;
      padding:80px 48px 80px; min-height:calc(100vh - 61px); width:100%;
    }
    .auth-register-center {
      position:relative; zIndex:10; max-width:640px;
      margin:0 auto; padding:60px 24px 60px; width:100%;
    }

    /* TRUST ITEMS */
    .auth-trust-item { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:14px 18px; backdrop-filter:blur(8px); transition:border-color 0.2s, background 0.2s; }
    .auth-trust-item:hover { border-color:rgba(46,201,126,0.3); background:rgba(46,201,126,0.06); }
    .auth-trust-icon { width:36px; height:36px; flex-shrink:0; border-radius:10px; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; }
    .auth-trust-row  { display:flex; gap:10px; flex-wrap:wrap; margin-top:24px; }
    .auth-trust-item-sm { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:11px 14px; backdrop-filter:blur(8px); flex:1; min-width:160px; }
    .auth-trust-icon-sm  { width:32px; height:32px; flex-shrink:0; border-radius:9px; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; }

    /* CARD */
    .auth-card-outer { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); border-radius:28px; padding:6px; box-shadow:0 32px 96px rgba(0,0,0,0.4); backdrop-filter:blur(24px); }
    .auth-card { background:#fff; border-radius:22px; padding:34px 38px; color:#0d1f16; }

    /* METHOD TOGGLE */
    .auth-toggle { display:grid; grid-template-columns:1fr 1fr; gap:4px; background:#f3f4f6; border-radius:14px; padding:4px; margin-bottom:26px; }
    .auth-toggle-btn { padding:10px 8px; border-radius:10px; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; transition:all 0.22s; background:none; color:#6b7280; display:flex; align-items:center; justify-content:center; gap:6px; }
    .auth-toggle-btn.active { background:#fff; color:#0d1f16; box-shadow:0 2px 8px rgba(0,0,0,0.09); }

    /* INPUTS */
    .auth-label { display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:7px; letter-spacing:0.02em; text-transform:uppercase; }
    .auth-input { width:100%; border:1.5px solid #e5e7eb; background:#f9fafb; border-radius:13px; padding:13px 16px; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; color:#111827; }
    .auth-input::placeholder { color:#9ca3af; }
    .auth-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.11); }
    .auth-input.error { border-color:#ef4444; box-shadow:0 0 0 4px rgba(239,68,68,0.09); }
    .auth-input.valid { border-color:#1b7d52; background:#f0fdf4; }
    .auth-input-wrap { position:relative; }
    .auth-icon-left  { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
    .auth-pl { padding-left:44px; }
    .auth-pr { padding-right:44px; }
    .auth-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px; display:flex; }
    .auth-eye:hover { color:#374151; }
    .auth-phone-pre { position:absolute; left:0; top:0; bottom:0; display:flex; align-items:center; padding:0 11px 0 13px; border-right:1.5px solid #e5e7eb; font-size:13px; font-weight:700; color:#374151; gap:4px; pointer-events:none; white-space:nowrap; }
    .auth-phl { padding-left:76px; }
    .auth-field-note { font-size:11px; color:#9ca3af; margin-top:5px; line-height:1.5; }

    /* OTP */
    .auth-otp-row { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; }
    .auth-otp-box { width:100%; aspect-ratio:1; border:1.5px solid #e5e7eb; background:#f9fafb; border-radius:11px; text-align:center; font-size:19px; font-weight:700; font-family:inherit; outline:none; color:#0d1f16; transition:all 0.2s; }
    .auth-otp-box:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.11); }
    .auth-otp-box.filled { border-color:#1b7d52; background:#f0fdf4; }

    /* ID TABS */
    .auth-id-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
    .auth-id-tab { flex:1; min-width:80px; padding:9px 6px; border-radius:11px; border:1.5px solid #e5e7eb; font-size:11px; font-weight:700; cursor:pointer; font-family:inherit; background:#f9fafb; color:#6b7280; transition:all 0.22s; text-align:center; white-space:nowrap; }
    .auth-id-tab.active { border-color:#2ec97e; background:#f0fdf4; color:#1b7d52; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .auth-id-tab:hover:not(.active) { border-color:#9ca3af; color:#374151; }

    /* PASSWORD STRENGTH */
    .auth-pw-bars { display:flex; gap:4px; margin-top:8px; }
    .auth-pw-bar  { flex:1; height:3px; border-radius:100px; transition:background 0.3s; }
    .auth-pw-hints { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    .auth-pw-hint { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; padding:3px 8px; border-radius:100px; transition:all 0.2s; }
    .auth-pw-hint.met   { background:#f0fdf4; color:#1b7d52; }
    .auth-pw-hint.unmet { background:#f3f4f6; color:#9ca3af; }

    /* PROGRESS */
    .auth-prog { display:flex; gap:5px; margin-bottom:22px; }
    .auth-prog-step { flex:1; }
    .auth-prog-bar { height:3px; border-radius:100px; margin-bottom:4px; transition:background 0.4s; }
    .auth-prog-lbl { font-size:9px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; transition:color 0.3s; }

    /* TERMS */
    .auth-terms-box { border:1.5px solid #e5e7eb; border-radius:13px; overflow:hidden; }
    .auth-terms-scroll { max-height:140px; overflow-y:auto; padding:14px 16px; font-size:12px; color:#374151; line-height:1.7; background:#f9fafb; scrollbar-width:thin; scrollbar-color:#d1d5db #f9fafb; }
    .auth-terms-scroll::-webkit-scrollbar { width:4px; }
    .auth-terms-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }
    .auth-terms-footer { padding:12px 16px; border-top:1.5px solid #e5e7eb; background:#fff; display:flex; align-items:center; gap:10px; cursor:pointer; }
    .auth-checkbox { width:18px; height:18px; border-radius:5px; border:2px solid #d1d5db; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
    .auth-checkbox.checked { background:linear-gradient(135deg,#2ec97e,#1b7d52); border-color:#1b7d52; }
    .auth-checkbox.checked svg { animation:auth-checkPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* BUTTONS */
    .auth-btn-submit { width:100%; padding:14px; border-radius:13px; border:none; cursor:pointer; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-size:15px; font-weight:600; font-family:inherit; transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 5px 20px rgba(13,51,34,0.3); display:flex; align-items:center; justify-content:center; gap:8px; }
    .auth-btn-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); box-shadow:0 9px 28px rgba(13,51,34,0.4); }
    .auth-btn-submit:disabled { opacity:0.52; cursor:not-allowed; transform:none; }
    .auth-btn-back { background:none; border:1.5px solid #e5e7eb; border-radius:100px; padding:9px 18px; font-family:inherit; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s; }
    .auth-btn-back:hover { border-color:#9ca3af; color:#374151; }
    .auth-btn-link { background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:#1b7d52; padding:0; }
    .auth-btn-link:hover { color:#0d3322; }

    /* ALERTS */
    .auth-err  { background:#fef2f2; border:1px solid #fecaca; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#dc2626; display:flex; align-items:center; gap:7px; }
    .auth-info { background:rgba(46,201,126,0.07); border:1px solid rgba(46,201,126,0.22); border-radius:11px; padding:10px 14px; font-size:12px; color:#374151; display:flex; align-items:flex-start; gap:7px; }
    .auth-hint { background:#fffbeb; border:1px solid #fde68a; border-radius:11px; padding:10px 13px; font-size:11px; color:#92400e; display:flex; align-items:flex-start; gap:7px; line-height:1.55; }
    .auth-success { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#15803d; display:flex; align-items:center; gap:7px; }
    .auth-info-box { background:rgba(46,201,126,0.07); border:1px solid rgba(46,201,126,0.2); border-radius:11px; padding:10px 14px; display:flex; gap:9px; align-items:flex-start; }

    /* DIVIDER */
    .auth-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
    .auth-div-line { flex:1; height:1px; background:#e5e7eb; }
    .auth-div-txt  { font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#9ca3af; }

    /* RESEND */
    .auth-resend { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:13px; font-size:12px; color:#6b7280; }

    /* SPINNER */
    .auth-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:auth-spin 0.7s linear infinite; }

    /* DECO BUBBLES */
    .auth-deco { position:absolute; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }

    @keyframes up-bellShake { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(12deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
    @keyframes up-notifSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

    /* -- NOTIFICATION BELL -- */
    .up-bell-btn {
      position:relative; width:40px; height:40px; border-radius:12px;
      background:#f7f8f6; border:1.5px solid #e9eceb;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; transition:background 0.2s, border-color 0.2s; color:#374151; flex-shrink:0;
    }
    .up-bell-btn:hover { background:#eff1ee; border-color:#c8d0cb; }
    .up-bell-btn.has-unread svg { animation:up-bellShake 1.4s ease-in-out; }
    .up-bell-dot {
      position:absolute; top:7px; right:7px; width:9px; height:9px;
      border-radius:50%; background:#ef4444; border:2px solid #fff;
    }
    .up-notif-panel {
      position:fixed; top:80px; right:48px; width:min(340px, calc(100vw - 32px));
      background:#fff; border-radius:18px; box-shadow:0 16px 48px rgba(0,0,0,0.16);
      border:1px solid rgba(0,0,0,0.07); overflow:hidden; z-index:1000;
      animation:up-notifSlide 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .up-notif-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 18px 12px; border-bottom:1px solid #f0f2f0;
    }
    .up-notif-item {
      display:flex; align-items:flex-start; gap:12px; padding:13px 18px;
      border-bottom:1px solid #f8f9f8; cursor:pointer; transition:background 0.15s;
    }
    .up-notif-item:last-child { border-bottom:none; }
    .up-notif-item:hover { background:#f8faf9; }
    .up-notif-item.unread { background:rgba(46,201,126,0.04); }
    .up-notif-avatar {
      width:36px; height:36px; border-radius:11px; flex-shrink:0;
      background:linear-gradient(135deg,#2ec97e,#1b7d52);
      display:flex; align-items:center; justify-content:center;
      font-size:14px; font-weight:700; color:#fff;
    }
    .up-reply-box {
      margin-top:10px; padding:10px; border-radius:12px;
      background:#fff; border:1px solid #e9eceb;
    }
    .up-reply-input {
      width:100%; min-height:58px; resize:vertical; border:none; outline:none;
      font-family:inherit; font-size:12px; line-height:1.45; color:#0d1f16;
      background:transparent;
    }
    .up-reply-actions { display:flex; align-items:center; justify-content:flex-end; gap:8px; margin-top:8px; }
    .up-reply-cancel,
    .up-reply-send {
      border:none; border-radius:999px; padding:6px 12px;
      font-family:inherit; font-size:11px; font-weight:700; cursor:pointer;
    }
    .up-reply-cancel { background:#f3f4f6; color:#6b7280; }
    .up-reply-send { background:#1b7d52; color:#fff; }
    .up-reply-send:disabled { opacity:0.45; cursor:not-allowed; }
    .up-sent-reply {
      margin-top:8px; padding:8px 10px; border-radius:10px;
      background:rgba(46,201,126,0.08); color:#1b7d52;
      font-size:11px; line-height:1.45; font-weight:600;
    }
    .up-messages-backdrop {
      position:fixed; inset:0; z-index:1200; padding:72px 20px 24px;
      background:rgba(13,31,22,0.48); backdrop-filter:blur(8px);
      display:flex; align-items:flex-start; justify-content:center;
    }
    .up-messages-modal {
      width:min(720px, 100%); max-height:calc(100vh - 96px);
      background:#fff; border-radius:20px; overflow:hidden;
      border:1px solid rgba(0,0,0,0.08);
      box-shadow:0 24px 80px rgba(0,0,0,0.28);
      animation:up-notifSlide 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
    }
    .up-messages-titlebar {
      display:flex; align-items:center; justify-content:space-between; gap:16px;
      padding:18px 22px; border-bottom:1px solid #f0f2f0;
    }
    .up-messages-list { max-height:calc(100vh - 190px); overflow-y:auto; }
    .up-messages-close {
      width:34px; height:34px; border-radius:50%; border:1px solid #e9eceb;
      background:#fff; color:#374151; cursor:pointer; font-size:20px; line-height:1;
    }
    .up-login-toast {
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
      z-index:900; display:flex; align-items:center; gap:12px;
      background:#08231a; border:1px solid rgba(46,201,126,0.4);
      border-radius:100px; padding:12px 20px 12px 14px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5);
      animation:up-toastIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards;
      white-space:nowrap;
    }

    /* -- PROFILE NAV -- */
    .up-nav {
      position:fixed; top:0; left:0; right:0; z-index:300;
      display:flex; align-items:center; justify-content:space-between;
      padding:14px 48px;
      background:rgba(8,35,26,0.72); backdrop-filter:blur(22px);
      border-bottom:1px solid rgba(255,255,255,0.08);
    }
    .up-nav-links { display:flex; align-items:center; gap:28px; }
    .up-nav-link  { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .up-nav-link:hover { color:#2ec97e; }
    .up-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .up-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .up-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:299; background:rgba(8,35,26,0.98); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; }
    .up-mobile-menu.open { display:flex; }
    .up-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }

    /* -- PROFILE LAYOUT -- */
    .up-page {
      min-height:100vh; padding-top:61px;
      background:#f7f8f6;
    }
    .up-cover {
      height:200px; position:relative; overflow:hidden;
      background:linear-gradient(135deg,#08231a 0%,#0f3d28 55%,#1a6644 100%);
    }
    .up-cover-pattern {
      position:absolute; inset:0;
      background-image:radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
      background-size:28px 28px;
    }
    .up-main { max-width:1380px; margin:0 auto; padding:0 24px 80px; }
    .up-header-row {
      display:flex; align-items:flex-end; justify-content:space-between;
      gap:20px; margin-bottom:32px; flex-wrap:wrap;
    }

    /* -- AVATAR -- */
    .up-avatar-wrap { position:relative; margin-top:-52px; }
    .up-avatar {
      width:104px; height:104px; border-radius:26px;
      border:3px solid #fff;
      background:linear-gradient(135deg,#2ec97e,#0d3322);
      display:flex; align-items:center; justify-content:center;
      font-family:'Sora',sans-serif; font-size:36px; font-weight:700; color:#fff;
      box-shadow:0 8px 28px rgba(0,0,0,0.18);
      overflow:hidden; cursor:pointer; transition:opacity 0.2s, transform 0.2s;
    }
    .up-avatar:hover { opacity:0.9; transform:scale(1.03); }
    .up-avatar-badge {
      position:absolute; bottom:-4px; right:-4px;
      width:28px; height:28px; border-radius:9px;
      background:linear-gradient(135deg,#2ec97e,#1b7d52);
      border:2.5px solid #f7f8f6;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 2px 8px rgba(46,201,126,0.4);
    }
    .up-verify-ring {
      position:absolute; inset:-3px; border-radius:29px;
      border:2px solid rgba(46,201,126,0.5);
      animation:up-ping 2.8s ease-out infinite;
    }

    /* -- BODY GRID -- */
    .up-grid { position:relative; z-index:1; display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }

    /* -- CARD -- */
    .up-card { background:#fff; border-radius:20px; padding:28px; box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06); }
    .up-card-sm { background:#fff; border-radius:16px; padding:20px 24px; box-shadow:0 1px 8px rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.06); }

    /* -- TABS -- */
    .up-tabs { display:flex; gap:2px; background:#eff1ee; border-radius:14px; padding:4px; margin-bottom:26px; overflow-x:auto; }
    .up-tab { flex:1; min-width:max-content; padding:10px 18px; border-radius:11px; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; transition:all 0.22s; background:none; color:#7a8c82; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:6px; }
    .up-tab.active { background:#fff; color:#0d3322; box-shadow:0 1px 6px rgba(0,0,0,0.09); }
    .up-tab:hover:not(.active) { color:#374151; }

    /* -- INPUTS -- */
    .up-label { display:block; font-size:11px; font-weight:700; color:#9ca3af; margin-bottom:7px; letter-spacing:0.06em; text-transform:uppercase; }
    .up-input { width:100%; border:1.5px solid #e9eceb; background:#fafbfa; border-radius:12px; padding:12px 16px; font-size:14px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; color:#111827; }
    .up-input::placeholder { color:#b0b9b5; }
    .up-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .up-input:disabled { background:#f3f4f6; color:#9ca3af; cursor:not-allowed; }
    .up-textarea { resize:vertical; min-height:90px; line-height:1.6; }
    .up-input-wrap { position:relative; }
    .up-input-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
    .up-pl { padding-left:40px; }
    .up-select { width:100%; border:1.5px solid #e9eceb; background:#fafbfa; border-radius:12px; padding:12px 16px; font-size:14px; font-family:inherit; outline:none; color:#111827; cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-size:16px; }
    .up-select:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }

    /* -- BUTTONS -- */
    .up-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#0d3322; color:#fff; border:none; border-radius:11px; padding:11px 22px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:background 0.2s, transform 0.15s; }
    .up-btn-primary:hover:not(:disabled) { background:#1a5c3a; transform:translateY(-1px); }
    .up-btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .up-btn-ghost { display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #e9eceb; border-radius:11px; padding:10px 18px; font-size:13px; font-weight:600; font-family:inherit; color:#374151; cursor:pointer; transition:all 0.2s; }
    .up-btn-ghost:hover { border-color:#b0b9b5; background:#fafbfa; }
    .up-btn-danger { display:inline-flex; align-items:center; gap:6px; background:none; border:1.5px solid #fecaca; border-radius:11px; padding:10px 18px; font-size:13px; font-weight:600; font-family:inherit; color:#dc2626; cursor:pointer; transition:all 0.2s; }
    .up-btn-danger:hover { background:#fef2f2; border-color:#ef4444; }
    .up-btn-sm { display:inline-flex; align-items:center; gap:5px; background:rgba(46,201,126,0.1); border:1px solid rgba(46,201,126,0.22); border-radius:100px; padding:6px 14px; font-size:12px; font-weight:600; font-family:inherit; color:#1b7d52; cursor:pointer; transition:all 0.2s; }
    .up-btn-sm:hover { background:rgba(46,201,126,0.2); }

    /* -- ALERTS -- */
    .up-err  { background:#fef2f2; border:1px solid #fecaca; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#dc2626; display:flex; align-items:center; gap:7px; }
    .up-ok   { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#15803d; display:flex; align-items:center; gap:7px; }
    .up-warn { background:#fffbeb; border:1px solid #fde68a; border-radius:11px; padding:10px 14px; font-size:12px; color:#92400e; display:flex; align-items:flex-start; gap:7px; }

    /* -- STAT CHIP -- */
    .up-stat-chip { display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f7f8f6; border:1px solid #e9eceb; border-radius:16px; padding:18px 12px; flex:1; min-width:80px; transition:border-color 0.2s, background 0.2s, transform 0.15s; font-family:inherit; cursor:default; }
    .up-stat-chip.clickable { cursor:pointer; }
    .up-stat-chip.clickable:hover { border-color:rgba(46,201,126,0.4); transform:translateY(-1px); }
    .up-stat-chip.active { background:rgba(46,201,126,0.08); border-color:rgba(46,201,126,0.45); }

    /* -- ACTIVITY ITEM -- */
    .up-activity-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid #f0f2f0; }
    .up-activity-item:last-child { border-bottom:none; }
    .up-activity-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:18px; }

    /* -- LISTING CARD -- */
    .up-listing-card { display:flex; gap:14px; padding:14px; border-radius:14px; border:1.5px solid #f0f2f0; transition:border-color 0.2s, box-shadow 0.2s; margin-bottom:10px; align-items:center; }
    .up-listing-card:hover { border-color:rgba(46,201,126,0.3); box-shadow:0 3px 12px rgba(0,0,0,0.05); }
    .up-listing-img { width:52px; height:52px; border-radius:10px; background:#f3f5f2; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }

    /* -- TIER BADGE -- */
    .up-tier { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:700; letter-spacing:0.04em; }

    /* -- PROGRESS -- */
    .up-progress-bar { height:5px; background:#e9eceb; border-radius:100px; overflow:hidden; }
    .up-progress-fill { height:100%; border-radius:100px; background:linear-gradient(to right,#2ec97e,#1b7d52); transition:width 0.8s cubic-bezier(0.22,1,0.36,1); }

    /* -- SPINNER -- */
    .up-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:up-spin 0.7s linear infinite; }
    .up-spinner-dark { border-color:rgba(13,51,34,0.2); border-top-color:#0d3322; }

    /* -- SECTION TITLE -- */
    .up-section-title { font-size:11px; font-weight:700; color:#b0b9b5; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
    .up-section-title::after { content:''; flex:1; height:1px; background:#f0f2f0; }

    /* -- SLIDE ANIMATION -- */
    .up-fade  { opacity:0; animation:up-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .up-d1{animation-delay:0.06s} .up-d2{animation-delay:0.14s} .up-d3{animation-delay:0.22s}
    .up-d4{animation-delay:0.30s} .up-d5{animation-delay:0.38s} .up-d6{animation-delay:0.46s}
    .up-slide { opacity:0; animation:up-slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards; }

    /* -- PROFILE IDENTITY BAR -- */
    .up-identity-bar {
      position:relative; z-index:20; overflow:visible;
      background:#fff; border-radius:20px; padding:24px 28px;
      box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06);
      margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;
      animation:up-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; opacity:0;
    }

    /* -- SELLER HUB LAYOUT -- */
    .sh-wrap { display:grid; grid-template-columns:240px 1fr; gap:20px; align-items:start; }
    .sh-sidebar { background:#fff; border-radius:20px; padding:8px; box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06); position:sticky; top:80px; }
    .sh-sb-header { padding:14px 16px 10px; }
    .sh-sb-title { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#b0b9b5; margin-bottom:12px; }
    .sh-sb-nav { display:flex; flex-direction:column; gap:2px; }
    .sh-sb-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:12px; border:none; background:none; cursor:pointer; font-family:inherit; text-align:left; transition:all 0.18s; width:100%; position:relative; }
    .sh-sb-item:hover { background:#f7f8f6; }
    .sh-sb-item.active { background:linear-gradient(135deg,rgba(46,201,126,0.1),rgba(27,125,82,0.06)); }
    .sh-sb-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px; transition:all 0.18s; }
    .sh-sb-item.active .sh-sb-icon { background:linear-gradient(135deg,#0d3322,#1b7d52); }
    .sh-sb-item:not(.active) .sh-sb-icon { background:#f3f5f2; }
    .sh-sb-label { font-size:13px; font-weight:600; color:#374151; transition:color 0.18s; }
    .sh-sb-item.active .sh-sb-label { color:#0d3322; }
    .sh-sb-badge { margin-left:auto; min-width:20px; height:20px; border-radius:100px; padding:0 6px; background:#ef4444; color:#fff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; }
    .sh-sb-divider { height:1px; background:#f0f2f0; margin:8px 6px; }
    .sh-sb-stats { padding:12px 14px; border-radius:12px; background:#f7f8f6; margin:6px 0; }

    /* -- BUYER HUB LAYOUT -- */
    .bh-wrap { display:grid; grid-template-columns:236px 1fr; gap:20px; align-items:start; }
    .bh-sidebar { background:#fff; border-radius:20px; padding:8px; box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06); position:sticky; top:80px; }
    .bh-sb-header { padding:14px 16px 10px; }
    .bh-sb-title { font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#b0b9b5; margin-bottom:12px; }
    .bh-sb-nav { display:flex; flex-direction:column; gap:2px; }
    .bh-sb-item { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:12px; border:none; background:none; cursor:pointer; font-family:inherit; text-align:left; transition:all 0.18s; width:100%; position:relative; }
    .bh-sb-item:hover { background:#f7f8f6; }
    .bh-sb-item.active { background:linear-gradient(135deg,rgba(46,201,126,0.1),rgba(27,125,82,0.06)); }
    .bh-sb-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:16px; transition:all 0.18s; }
    .bh-sb-item.active .bh-sb-icon { background:linear-gradient(135deg,#0d3322,#1b7d52); }
    .bh-sb-item:not(.active) .bh-sb-icon { background:#f3f5f2; }
    .bh-sb-label { font-size:13px; font-weight:600; color:#374151; transition:color 0.18s; }
    .bh-sb-item.active .bh-sb-label { color:#0d3322; }
    .bh-sb-badge { margin-left:auto; min-width:20px; height:20px; border-radius:100px; padding:0 6px; background:#ef4444; color:#fff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; }
    .bh-sb-divider { height:1px; background:#f0f2f0; margin:8px 6px; }
    .bh-sb-coming { padding:10px 14px; border-radius:12px; background:#fafbfa; margin:4px 0; display:flex; align-items:center; gap:10px; }
    .bh-sb-coming-icon { width:36px; height:36px; border-radius:10px; background:#f3f5f2; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:15px; }
    .bh-sb-coming-label { font-size:13px; color:#c4ccc7; font-weight:600; }
    .bh-sb-coming-tag { font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#b0b9b5; background:#f0f2f0; border-radius:100px; padding:2px 7px; margin-top:2px; display:inline-block; }

    /* -- BUYER ORDERS PAGE -- */
    @keyframes bord-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes bord-ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }

    .bord-wrap { animation:bord-in 0.38s cubic-bezier(0.22,1,0.36,1) both; color:#0d1f16; }
    .bord-hero { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:stretch; gap:16px; margin-bottom:18px; }
    .bord-hero-main { border:1px solid #edf1ed; border-radius:22px; padding:22px; background:radial-gradient(circle at 88% 18%,rgba(46,201,126,.13),transparent 34%),linear-gradient(135deg,#fff,#fbfcfb); position:relative; overflow:hidden; }
    .bord-hero-main::after { content:''; position:absolute; right:-60px; bottom:-70px; width:190px; height:190px; border-radius:50%; border:32px solid rgba(46,201,126,.07); }
    .bord-hero-kicker { font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.12em; color:#1b7d52; margin-bottom:7px; }
    .bord-hero-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,34px); font-weight:900; line-height:1.05; color:#0d1f16; }
    .bord-hero-sub { margin-top:9px; color:#7a8c82; font-size:13px; line-height:1.65; max-width:620px; }
    .bord-shop-btn { display:inline-flex; align-items:center; gap:8px; justify-content:center; align-self:stretch; min-width:168px; border:none; border-radius:22px; padding:16px 20px; background:radial-gradient(circle at top right,rgba(255,255,255,.18),transparent 42%),linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-family:inherit; font-size:13px; font-weight:900; cursor:pointer; box-shadow:0 16px 38px rgba(13,51,34,.2); transition:opacity .2s,transform .15s; }
    .bord-shop-btn:hover { opacity:.9; transform:translateY(-1px); }
    .bord-summary-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:22px; }
    .bord-summary-card { background:linear-gradient(180deg,#fff,#fcfefd); border:1px solid #eef2ee; border-radius:18px; padding:16px 18px; transition:all 0.2s; cursor:default; position:relative; overflow:hidden; box-shadow:0 8px 22px rgba(13,51,34,.035); }
    .bord-summary-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; border-radius:16px 16px 0 0; }
    .bord-summary-card.c-total::before  { background:linear-gradient(to right,#6b7280,#9ca3af); }
    .bord-summary-card.c-active::before { background:linear-gradient(to right,#3b82f6,#6366f1); }
    .bord-summary-card.c-transit::before{ background:linear-gradient(to right,#8b5cf6,#a78bfa); }
    .bord-summary-card.c-done::before   { background:linear-gradient(to right,#2ec97e,#1b7d52); }
    .bord-summary-card:hover { border-color:rgba(46,201,126,0.28); box-shadow:0 4px 16px rgba(0,0,0,0.06); transform:translateY(-1px); }
    .bord-sum-val { font-size:28px; font-weight:800; color:#0d1f16; letter-spacing:-0.04em; line-height:1; margin-bottom:4px; }
    .bord-sum-lbl { font-size:10.5px; color:#9ca3af; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; }
    .bord-sum-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; margin-bottom:10px; }

    .bord-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; padding:12px; border:1px solid #edf1ed; border-radius:18px; background:#fbfcfb; }
    .bord-search-wrap { flex:1; min-width:180px; position:relative; }
    .bord-search { width:100%; padding:10px 14px 10px 38px; border:1.5px solid #e9eceb; border-radius:12px; background:#fafbfa; font-family:inherit; font-size:13px; outline:none; color:#111827; transition:border-color 0.2s,box-shadow 0.2s; }
    .bord-search:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,0.1); background:#fff; }
    .bord-search-ic { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#b0b9b5; pointer-events:none; }
    .bord-filter-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 14px; border-radius:12px; border:1.5px solid #e9eceb; background:#fafbfa; font-family:inherit; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
    .bord-filter-btn.active { border-color:rgba(46,201,126,0.45); background:rgba(46,201,126,0.07); color:#1b7d52; }
    .bord-filter-btn:hover:not(.active) { border-color:#b0b9b5; color:#374151; }

    .bord-list { display:flex; flex-direction:column; gap:12px; }
    .bord-card { background:linear-gradient(180deg,#fff,#fcfefd); border:1.5px solid #eef2ee; border-radius:20px; overflow:hidden; cursor:pointer; transition:all 0.22s; position:relative; }
    .bord-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(to bottom,#2ec97e,#1b7d52); opacity:0; transition:opacity .2s; }
    .bord-card:hover { border-color:rgba(46,201,126,0.35); box-shadow:0 6px 22px rgba(0,0,0,0.07); transform:translateY(-1px); }
    .bord-card.selected { border-color:rgba(46,201,126,0.5); box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .bord-card.selected::before,.bord-card:hover::before { opacity:1; }
    .bord-card-top { display:flex; align-items:center; gap:14px; padding:16px 18px 10px; }
    .bord-card-img { width:56px; height:56px; border-radius:12px; background:#f3f5f2; border:1px solid #e9eceb; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; overflow:hidden; }
    .bord-card-img img { width:100%; height:100%; object-fit:cover; }
    .bord-card-meta { flex:1; min-width:0; }
    .bord-card-title { font-size:14px; font-weight:700; color:#0d1f16; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:4px; }
    .bord-card-sub { font-size:11.5px; color:#9ca3af; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    .bord-card-right { text-align:right; flex-shrink:0; }
    .bord-card-price { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#0d1f16; margin-bottom:5px; }

    .bord-mini-stepper { display:flex; align-items:center; padding:6px 18px 14px; gap:0; }
    .bord-mini-step { display:flex; flex-direction:column; align-items:center; gap:3px; flex:1; position:relative; }
    .bord-mini-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; z-index:2; position:relative; transition:all 0.35s cubic-bezier(0.22,1,0.36,1); }
    .bord-mini-dot.done { background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; box-shadow:0 3px 10px rgba(46,201,126,0.35); }
    .bord-mini-dot.active { background:#fff; border:2.5px solid #2ec97e; color:#1b7d52; }
    .bord-mini-dot.active::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:1.5px solid rgba(46,201,126,0.3); animation:bord-ping 1.8s ease-out infinite; }
    .bord-mini-dot.waiting { background:#f3f5f2; border:2px solid #e9eceb; color:#c4ccc7; }
    .bord-mini-line { flex:1; height:2px; background:#e9eceb; position:relative; top:-13px; z-index:1; transition:background 0.4s; margin:0 -2px; }
    .bord-mini-line.filled { background:linear-gradient(to right,#2ec97e,#1b7d52); }
    .bord-mini-lbl { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; text-align:center; color:#b0b9b5; line-height:1.2; }
    .bord-mini-lbl.active { color:#1b7d52; }
    .bord-mini-lbl.done { color:#2ec97e; }

    .bord-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700; white-space:nowrap; }
    .bord-pay { display:inline-flex; align-items:center; gap:5px; padding:3px 9px; border-radius:100px; font-size:11px; font-weight:600; }

    .bord-detail-wrap { background:linear-gradient(180deg,#fff,#fbfcfb); border:1.5px solid #eef2ee; border-radius:22px; overflow:hidden; animation:bord-in 0.3s cubic-bezier(0.22,1,0.36,1) both; box-shadow:0 18px 48px rgba(13,51,34,.08); }
    .bord-detail-hdr { padding:20px 22px; border-bottom:1px solid #f0f2f0; background:radial-gradient(circle at top right,rgba(46,201,126,.16),transparent 36%),linear-gradient(135deg,#0d3322,#1b7d52); display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .bord-detail-stepper { display:flex; align-items:flex-start; padding:18px 20px; gap:0; background:#fafbfa; border-bottom:1px solid #f0f2f0; }
    .bord-detail-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; position:relative; }
    .bord-detail-dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; z-index:2; position:relative; transition:all 0.4s cubic-bezier(0.22,1,0.36,1); }
    .bord-detail-dot.done { background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; box-shadow:0 4px 14px rgba(46,201,126,0.38); }
    .bord-detail-dot.active { background:#fff; border:2.5px solid #2ec97e; color:#1b7d52; box-shadow:0 0 0 6px rgba(46,201,126,0.08); }
    .bord-detail-dot.active::after { content:''; position:absolute; inset:-4px; border-radius:50%; border:2px solid rgba(46,201,126,0.25); animation:bord-ping 1.6s ease-out infinite; }
    .bord-detail-dot.waiting { background:#f3f5f2; border:2px solid #e9eceb; color:#c4ccc7; }
    .bord-detail-line { flex:1; height:2px; background:#e9eceb; position:relative; top:-17px; z-index:1; margin:0 -2px; transition:background 0.4s; }
    .bord-detail-line.filled { background:linear-gradient(to right,#2ec97e,#1b7d52); }
    .bord-detail-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; text-align:center; line-height:1.3; max-width:64px; }
    .bord-detail-body { padding:20px 22px; display:flex; flex-direction:column; gap:16px; max-height:calc(100vh - 300px); overflow-y:auto; }
    .bord-seller-row { display:flex; align-items:center; gap:12px; padding:12px 14px; background:#fafbfa; border-radius:12px; border:1px solid #f0f2f0; }

    @media(max-width:900px) {
      .bh-wrap { grid-template-columns:1fr; }
      .bh-sidebar { position:static; }
      .bh-sb-nav { flex-direction:row; gap:4px; overflow-x:auto; padding-bottom:2px; }
      .bh-sb-item { flex-direction:column; gap:4px; padding:8px 10px; min-width:88px; justify-content:center; align-items:center; }
      .bh-sb-label { font-size:11px; }
      .bord-summary-row { grid-template-columns:repeat(2,1fr); }
      .bord-hero { grid-template-columns:1fr; }
      .bord-shop-btn { min-height:56px; }
    }
    @media(max-width:640px) {
      .bord-card-top { gap:10px; }
    }

    /* -- ORDERS PAGE -- */
    @keyframes ord-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ord-slide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    @keyframes ord-ping { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.2);opacity:0} }
    @keyframes ord-pop { 0%{transform:scale(0.8);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }

    .ord-wrap { animation:ord-in 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    .ord-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:22px; }
    .ord-kpi { background:#fff; border:1px solid #f0f2f0; border-radius:16px; padding:16px; transition:all 0.2s; cursor:default; }
    .ord-kpi:hover { border-color:rgba(46,201,126,0.3); box-shadow:0 4px 14px rgba(0,0,0,0.06); transform:translateY(-1px); }
    .ord-kpi-val { font-size:26px; font-weight:800; color:#0d1f16; letter-spacing:-0.03em; line-height:1; margin-bottom:4px; }
    .ord-kpi-lbl { font-size:11px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; }
    .ord-kpi-dot { width:8px; height:8px; border-radius:50%; margin-bottom:10px; }

    .ord-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
    .ord-search-wrap { flex:1; min-width:180px; position:relative; }
    .ord-search { width:100%; padding:10px 14px 10px 38px; border:1.5px solid #e9eceb; border-radius:12px; background:#fafbfa; font-family:inherit; font-size:13px; outline:none; color:#111827; transition:border-color 0.2s,box-shadow 0.2s; }
    .ord-search:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,0.1); background:#fff; }
    .ord-search-ic { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#b0b9b5; pointer-events:none; }
    .ord-filter-btn { display:inline-flex; align-items:center; gap:6px; padding:10px 16px; border-radius:12px; border:1.5px solid #e9eceb; background:#fafbfa; font-family:inherit; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
    .ord-filter-btn.active { border-color:rgba(46,201,126,0.45); background:rgba(46,201,126,0.07); color:#1b7d52; }
    .ord-filter-btn:hover:not(.active) { border-color:#b0b9b5; color:#374151; }

    .ord-table-wrap { border-radius:16px; border:1px solid #f0f2f0; overflow:hidden; background:#fff; }
    .ord-table { width:100%; border-collapse:collapse; }
    .ord-th { padding:11px 16px; text-align:left; font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#b0b9b5; border-bottom:1px solid #f0f2f0; background:#fafbfa; white-space:nowrap; }
    .ord-tr { border-bottom:1px solid #f5f6f5; transition:background 0.15s; cursor:pointer; }
    .ord-tr:last-child { border-bottom:none; }
    .ord-tr:hover { background:#f9faf9; }
    .ord-tr.selected { background:rgba(46,201,126,0.04); }
    .ord-td { padding:14px 16px; font-size:13px; color:#374151; vertical-align:middle; }

    /* Order detail panel */
    .ord-detail { background:#fff; border-radius:20px; border:1px solid #f0f2f0; overflow:hidden; animation:ord-in 0.35s cubic-bezier(0.22,1,0.36,1) both; }
    .ord-detail-hdr { padding:20px 24px; border-bottom:1px solid #f0f2f0; display:flex; align-items:center; justify-content:space-between; gap:12px; background:linear-gradient(135deg,#fafbfa,#f7f9f7); }
    .ord-detail-body { padding:24px; display:flex; flex-direction:column; gap:18px; }

    /* Stepper */
    .ord-stepper { display:flex; align-items:flex-start; padding:20px 24px; gap:0; border-bottom:1px solid #f0f2f0; background:#fafbfa; }
    .ord-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex:1; position:relative; }
    .ord-step-dot { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; z-index:2; transition:all 0.4s cubic-bezier(0.22,1,0.36,1); position:relative; }
    .ord-step-dot.done { background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; box-shadow:0 4px 14px rgba(46,201,126,0.38); }
    .ord-step-dot.active { background:#fff; border:2.5px solid #2ec97e; color:#1b7d52; box-shadow:0 0 0 6px rgba(46,201,126,0.08); }
    .ord-step-dot.waiting { background:#f3f5f2; border:2px solid #e9eceb; color:#c4ccc7; }
    .ord-step-dot.active::after { content:''; position:absolute; inset:-4px; border-radius:50%; border:2px solid rgba(46,201,126,0.25); animation:ord-ping 1.6s ease-out infinite; }
    .ord-step-lbl { font-size:10px; font-weight:700; letter-spacing:0.07em; text-transform:uppercase; text-align:center; line-height:1.3; }
    .ord-step-line { flex:1; height:2px; background:#e9eceb; position:relative; top:-17px; z-index:1; transition:background 0.4s; margin:0 -2px; }
    .ord-step-line.filled { background:linear-gradient(to right,#2ec97e,#1b7d52); }

    /* status pill */
    .ord-status { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700; white-space:nowrap; }

    /* payment pill */
    .ord-pay { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:100px; font-size:11px; font-weight:700; }

    /* update btn */
    .ord-update-btn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px; border-radius:11px; border:none; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(13,51,34,0.2); }
    .ord-update-btn:hover { opacity:0.88; transform:translateY(-1px); }
    .ord-update-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

    /* mobile overlay */
    @keyframes ord-mo { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
    .ord-mobile-overlay { position:fixed; inset:0; z-index:500; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); }
    .ord-mobile-sheet { position:absolute; bottom:0; left:0; right:0; background:#fff; border-radius:24px 24px 0 0; max-height:92vh; overflow-y:auto; animation:ord-mo 0.35s cubic-bezier(0.22,1,0.36,1) both; }

    /* -- RESPONSIVE -- */
    @media(max-width:1280px) {
      .sh-wrap { grid-template-columns:200px 1fr; }
      .ord-kpi-row { grid-template-columns:repeat(2,1fr); }
    }
    @media(max-width:900px) {
      .up-nav { padding:14px 24px; }
      .up-cover { height:160px; }
      .up-avatar { width:88px; height:88px; font-size:28px; }
      .auth-login-grid { grid-template-columns:1fr; padding:60px 24px 60px; gap:32px; }
      .auth-nav { padding:14px 28px; }
      .sh-wrap { grid-template-columns:1fr; }
      .sh-sidebar { position:static; }
      .sh-sb-nav { flex-direction:row; gap:4px; overflow-x:auto; padding-bottom:2px; }
      .sh-sb-item { flex-direction:column; gap:4px; padding:8px 10px; min-width:80px; justify-content:center; align-items:center; }
      .sh-sb-label { font-size:11px; }
      .sh-sb-stats { display:none; }
    }
    @media(max-width:640px) {
      .up-nav { padding:14px 16px; }
      .up-nav-links { display:none; }
      .up-hamburger { display:flex; }
      .up-main { padding:0 16px 60px; }
      .up-card { padding:20px 18px; }
      .up-header-row { flex-direction:column; align-items:flex-start; }
      .up-identity-bar { flex-direction:column; align-items:flex-start; }
      .up-notif-panel { right:16px; }
      .up-tabs { gap:2px; }
      .up-tab { padding:9px 12px; font-size:12px; }
      .auth-nav { padding:14px 20px; }
      .auth-nav-links { display:none; }
      .auth-card { padding:20px 16px; border-radius:16px; }
      .auth-card-outer { border-radius:20px; padding:4px; }
      .auth-deco { display:none; }
      .auth-otp-box { font-size:16px; border-radius:9px; }
    }
  `}</style>
);

/* --------------------------------------
   AUTH ATOMS
-------------------------------------- */
const AuthSpinner = () => <div className="auth-spinner" />;
const AuthArr = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const AuthArrL = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const AuthErrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const AuthOkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M7 12.5l3.2 3.2L17.5 8.5" />
  </svg>
);
const AuthInfoSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const AuthEyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const AuthEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

/* -- Progress Bar -- */
const AuthPBar = ({ steps, cur }) => (
  <div className="auth-prog">
    {steps.map((s, i) => (
      <div key={s} className="auth-prog-step">
        <div className="auth-prog-bar" style={{ background: i <= cur ? "linear-gradient(to right,#2ec97e,#1b7d52)" : "#e5e7eb" }} />
        <span className="auth-prog-lbl" style={{ color: i <= cur ? "#1b7d52" : "#9ca3af" }}>{s}</span>
      </div>
    ))}
  </div>
);

/* -- Password Strength -- */
const pwChecks = [
  { key: "len",   label: "8+ chars",  test: p => p.length >= 8 },
  { key: "upper", label: "Uppercase", test: p => /[A-Z]/.test(p) },
  { key: "digit", label: "Number",    test: p => /\d/.test(p) },
  { key: "spcl",  label: "Symbol",    test: p => /[^A-Za-z0-9]/.test(p) },
];
const getPwStrength = p => !p ? 0 : pwChecks.filter(c => c.test(p)).length;
const strengthColors = ["#e5e7eb", "#ef4444", "#f59e0b", "#3b82f6", "#1b7d52"];
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

const AuthPwStrength = ({ password }) => {
  const s = getPwStrength(password);
  if (!password) return null;
  return (
    <div>
      <div className="auth-pw-bars">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="auth-pw-bar" style={{ background: i <= s ? strengthColors[s] : "#e5e7eb" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <div className="auth-pw-hints">
          {pwChecks.map(c => (
            <span key={c.key} className={`auth-pw-hint ${c.test(password) ? "met" : "unmet"}`}>
              {c.test(password) ? "OK" : " - "} {c.label}
            </span>
          ))}
        </div>
        {s > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: strengthColors[s], flexShrink: 0, marginLeft: 8 }}>{strengthLabels[s]}</span>}
      </div>
    </div>
  );
};

/* -- OTP Input -- */
const AuthOtpInput = ({ value, onChange }) => {
  const refs = useRef([]);
  const cells = value.split("");
  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (cells[i]) { const n = [...cells]; n[i] = ""; onChange(n.join("")); }
      else if (i > 0) { refs.current[i - 1]?.focus(); const n = [...cells]; n[i - 1] = ""; onChange(n.join("")); }
      return;
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };
  const handleChange = (i, e) => {
    const d = e.target.value.replace(/\D/, "").slice(-1);
    if (!d) return;
    const n = [...cells]; n[i] = d; onChange(n.join(""));
    if (i < 5) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p.padEnd(6, "").slice(0, 6));
    refs.current[Math.min(p.length, 5)]?.focus();
  };
  return (
    <div className="auth-otp-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={cells[i] || ""} className={`auth-otp-box ${cells[i] ? "filled" : ""}`}
          onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste} autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

/* -- Terms Text -- */
const TermsText = () => (
  <>
    <p style={{ fontWeight: 700, marginBottom: 8, color: "#0d1f16" }}>Terms & Conditions - Proti-Binimoy</p>
    <p style={{ marginBottom: 8 }}><strong>1. Eligibility.</strong> You must be 18+ years old and a resident of Bangladesh.</p>
    <p style={{ marginBottom: 8 }}><strong>2. Account Responsibility.</strong> You are solely responsible for your credentials and all activity under your account.</p>
    <p style={{ marginBottom: 8 }}><strong>3. Verified Listings.</strong> All listings must be accurate. Fraudulent or misleading listings will result in immediate suspension.</p>
    <p style={{ marginBottom: 8 }}><strong>4. Sustainable Commerce.</strong> Users agree not to list prohibited, counterfeit, or environmentally harmful items.</p>
    <p style={{ marginBottom: 8 }}><strong>5. Privacy.</strong> Personal information is collected for verification only and will never be sold to third parties.</p>
    <p style={{ marginBottom: 8 }}><strong>6. Identity Verification.</strong> NID / DOB / Passport details are end-to-end encrypted.</p>
    <p style={{ marginBottom: 8 }}><strong>7. Conduct.</strong> Harassment, discrimination, or abuse will result in a permanent ban.</p>
    <p><strong>8. Dispute Resolution.</strong> Proti-Binimoy assists in disputes but bears no liability for transaction outcomes.</p>
  </>
);

/* --------------------------------------
   FULL-PAGE LOGIN OVERLAY
-------------------------------------- */
const Spinner = ({ dark }) => <div className={`up-spinner${dark ? " up-spinner-dark" : ""}`} />;
const ErrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const OkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M7 12.5l3.2 3.2L17.5 8.5" />
  </svg>
);
const EditIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M12 3l6 2.5v5.8c0 4.1-2.5 7.9-6 9.7-3.5-1.8-6-5.6-6-9.7V5.5L12 3z" />
    <path d="M9.5 12.2l1.7 1.7 3.6-3.9" />
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
  </svg>
);

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} filled={i <= Math.round(rating)} />)}
  </div>
);

const TierBadge = ({ tier }) => {
  const map = {
    Bronze:  { bg: "rgba(205,127,50,0.12)",  text: "#b8762a", border: "rgba(205,127,50,0.3)",  icon: "Bronze" },
    Silver:  { bg: "rgba(160,160,160,0.12)", text: "#707070", border: "rgba(160,160,160,0.3)", icon: "Silver" },
    Gold:    { bg: "rgba(245,158,11,0.12)",  text: "#b45309", border: "rgba(245,158,11,0.3)",  icon: "Gold" },
    Platinum:{ bg: "rgba(46,201,126,0.12)",  text: "#1b7d52", border: "rgba(46,201,126,0.3)",  icon: "Platinum" },
  };
  const c = map[tier] || map.Bronze;
  return (
    <span className="up-tier" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {c.icon} {tier}
    </span>
  );
};

/* --------------------------------------
   PROFILE STAT STRIP (replaces sidebar)
-------------------------------------- */
const ProfileSidebar = ({ user, activeView, onViewChange }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, animation: "up-fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both" }}>
    {[
      { key: "all", value: user.totalListings, label: "Listings", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
      )},
      { key: "sold", value: user.soldItems, label: "Sold", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>
      )},
      { value: user.rating > 0 ? user.rating.toFixed(1) : "-", label: "Rating", icon: (
        <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
      )},
      { key: "saved", value: user.savedItems || 0, label: "Saved", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      )},
    ].map(s => (
      <button
        type="button"
        key={s.label}
        className={`up-stat-chip${s.key ? " clickable" : ""}${s.key && activeView === s.key ? " active" : ""}`}
        onClick={() => s.key && onViewChange(s.key)}
        disabled={!s.key}
        title={s.key ? `Show ${s.label.toLowerCase()} items` : undefined}
      >
        <div style={{ marginBottom: 6 }}>{s.icon}</div>
        <span style={{ fontSize: 20, fontWeight: 700, color: "#0d1f16", lineHeight: 1, letterSpacing: "-0.01em" }}>{s.value}</span>
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 3 }}>{s.label}</span>
      </button>
    ))}
  </div>
);

/* --------------------------------------
   EDIT PROFILE TAB
-------------------------------------- */
const EditProfileTab = ({ user, onSave }) => {
  const [form, setForm] = useState({
    name: user.name || "",
    phone: user.phone || "",
    location: user.location || "",
    bio: user.bio || "",
    email: user.email || "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setMsg(null);
    if (!form.name.trim()) { setMsg({ type: "err", text: "Name is required." }); return; }
    setLoading(true);
    try {
      await onSave({
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        location: { city: form.location }
      });
      setMsg({ type: "ok", text: "Profile updated successfully!" });
    } catch (err) {
      setMsg({ type: "err", text: err.message || "Unable to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <p className="up-section-title">Basic Information</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="up-label">Full Name</label>
          <div className="up-input-wrap">
            <div className="up-input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </div>
            <input type="text" className="up-input up-pl" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" />
          </div>
        </div>
        <div>
          <label className="up-label">Phone</label>
          <input type="tel" className="up-input" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} placeholder="01XXXXXXXXX" />
        </div>
      </div>
      <div>
        <label className="up-label">Email</label>
        <input type="email" className="up-input" value={form.email} disabled style={{ cursor: "not-allowed" }} />
        <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Email cannot be changed.</p>
      </div>
      <div>
        <label className="up-label">Location</label>
        <div className="up-input-wrap">
          <div className="up-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <select
            className="up-input up-pl"
            value={form.location}
            onChange={e => set("location", e.target.value)}
          >
            <option value="" disabled>Select district / area</option>
            {BD_LOCATIONS.map(locationOption => (
              <option key={locationOption} value={locationOption}>{locationOption}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="up-label">Bio</label>
        <textarea className="up-input up-textarea" value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Tell others about yourself..." rows={3} />
      </div>
      {msg && (msg.type === "ok"
        ? <div className="up-ok"><OkIcon />{msg.text}</div>
        : <div className="up-err"><ErrIcon />{msg.text}</div>
      )}
      <button type="submit" disabled={loading} className="up-btn-primary" style={{ alignSelf: "flex-start" }}>
        {loading ? <><Spinner /> Saving...</> : <><SaveIcon /> Save Changes</>}
      </button>
    </form>
  );
};

/* --------------------------------------
   SECURITY TAB
-------------------------------------- */
const SecurityTab = () => {
  const [form, setForm] = useState({ cur: "", next: "", conf: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showCur, setShowCur] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleChange = async (e) => {
    e.preventDefault(); setMsg(null);
    if (!form.cur || !form.next || !form.conf) { setMsg({ type: "err", text: "All fields are required." }); return; }
    if (form.next.length < 8) { setMsg({ type: "err", text: "New password must be at least 8 characters." }); return; }
    if (form.next !== form.conf) { setMsg({ type: "err", text: "New passwords don't match." }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    setLoading(false);
    setMsg({ type: "err", text: "Password changes are not connected to the API yet." });
  };

  const eye = (show, toggle, val, onChange, ph) => (
    <div className="up-input-wrap">
      <input type={show ? "text" : "password"} className="up-input" value={val} onChange={onChange} placeholder={ph} style={{ paddingRight: 40 }} />
      <button type="button" onClick={() => toggle(!show)}
        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}>
        {show
          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
        }
      </button>
    </div>
  );

  return (
    <div>
      <p className="up-section-title">Change Password</p>
      <form onSubmit={handleChange} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
        <div>
          <label className="up-label">Current Password</label>
          {eye(showCur, setShowCur, form.cur, e => set("cur", e.target.value), "Current password")}
        </div>
        <div>
          <label className="up-label">New Password</label>
          {eye(showNext, setShowNext, form.next, e => set("next", e.target.value), "New password (min 8 chars)")}
        </div>
        <div>
          <label className="up-label">Confirm New Password</label>
          <input type="password" className="up-input" value={form.conf} onChange={e => set("conf", e.target.value)} placeholder="Re-enter new password" />
        </div>
        {msg && (msg.type === "ok"
          ? <div className="up-ok"><OkIcon />{msg.text}</div>
          : <div className="up-err"><ErrIcon />{msg.text}</div>
        )}
        <button type="submit" disabled={loading} className="up-btn-primary" style={{ alignSelf: "flex-start" }}>
          {loading ? <><Spinner /> Updating...</> : "Update Password"}
        </button>
      </form>
    </div>
  );
};

/* --------------------------------------
   TRADE REQUESTS TAB
-------------------------------------- */
const LegacyTradeStatusBadge = ({ status }) => {
  const map = {
    pending:  { bg: "rgba(245,158,11,0.12)",  color: "#b45309", border: "rgba(245,158,11,0.3)",  label: "Pending",  dot: "#f59e0b" },
    accepted: { bg: "rgba(46,201,126,0.12)",  color: "#1b7d52", border: "rgba(46,201,126,0.3)",  label: "Accepted", dot: "#2ec97e" },
    rejected: { bg: "rgba(239,68,68,0.1)",    color: "#dc2626", border: "rgba(239,68,68,0.25)",  label: "Rejected", dot: "#ef4444" },
    declined: { bg: "rgba(239,68,68,0.1)",    color: "#dc2626", border: "rgba(239,68,68,0.25)",  label: "Declined", dot: "#ef4444" },
    cancelled:{ bg: "rgba(239,68,68,0.1)",    color: "#dc2626", border: "rgba(239,68,68,0.25)",  label: "Cancelled", dot: "#ef4444" },
    completed:{ bg: "rgba(15,118,110,0.1)",   color: "#0f766e", border: "rgba(15,118,110,0.26)", label: "Completed", dot: "#14b8a6" },
  };
  const c = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0, display: "inline-block" }} />
      {c.label}
    </span>
  );
};

const getEntityId = (entity) => {
  if (!entity) return "";
  if (typeof entity === "string") return entity;
  return entity._id || entity.id || "";
};

const mapIncomingOfferToTrade = (offer) => {
  const listing = offer.listing || {};
  const buyer = offer.fromUser || {};
  const cashAmount = Number(offer.cashAmount) || 0;
  const offeredTitle = offer.offerType === "cash"
    ? `Cash offer ${fmtBDT2(cashAmount)}`
    : offer.barterItem || "Barter item";

  return {
    _id: offer._id,
    id: offer._id,
    rawOffer: offer,
    status: offer.status || "pending",
    createdAt: offer.createdAt || new Date().toISOString(),
    buyer: {
      name: buyer.name || "Buyer",
      phone: buyer.phone || "",
      location: buyer.location?.city || buyer.location || "Bangladesh",
      avatar: buyer.profilePicture || "",
      rating: Number(buyer.rating) || 0,
      totalTrades: Number(buyer.totalReviews) || 0,
    },
    sellerItem: {
      title: listing.title || "Your listed item",
      category: listing.category || "Other",
      condition: listing.condition || "Used",
      value: Number(listing.price) || 0,
      image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
    },
    requestedItem: {
      title: listing.title || "Your listed item",
      category: listing.category || "Other",
      condition: listing.condition || "Used",
      value: Number(listing.price) || 0,
      image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
    },
    offeredItem: {
      title: offeredTitle,
      category: offer.offerType || "barter",
      condition: "Used",
      value: cashAmount,
      image: "",
    },
    offeredProduct: {
      title: offeredTitle,
      category: offer.offerType || "barter",
      condition: "Used",
      price: cashAmount,
      image: "",
    },
    requestedProduct: {
      title: listing.title || "Your listed item",
      category: listing.category || "Other",
      condition: listing.condition || "Used",
      price: Number(listing.price) || 0,
      image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
    },
    message: offer.message || "",
    cashAdjustment: cashAmount,
    cashDirection: cashAmount > 0 ? "buyer_pays" : null,
  };
};

const TradeRequestsTab = ({ token, sellerUser }) => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [acting, setActing]       = useState({}); // { [tradeId]: "accepting"|"rejecting" }
  const [toast, setToast]         = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    setError("");
    let cancelled = false;

    fetch(`${API_BASE_URL}/api/offers/received`, {
      headers: { "x-auth-token": token },
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setRequests(data.map(mapIncomingOfferToTrade));
        } else {
          setRequests([]);
        }
      })
      .catch(() => setError("Could not load trade requests. Please try again."))
      .finally(() => setLoading(false));

    return () => { cancelled = true; };
  }, [sellerUser, token]);

  const handleAction = async (tradeId, action) => {
    setActing(a => ({ ...a, [tradeId]: action === "accepted" ? "accepting" : "rejecting" }));
    try {
      const res = await fetch(`${API_BASE_URL}/api/offers/${tradeId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || `Failed to ${action} trade.`);
      setRequests(prev =>
        prev.map(r => (r._id === tradeId || r.id === tradeId) ? { ...r, status: action } : r)
      );
      showToast(action === "accepted" ? "Trade accepted! Done" : "Trade declined.", action === "accepted");
    } catch (err) {
      showToast(err.message || "Something went wrong.", false);
    } finally {
      setActing(a => { const n = { ...a }; delete n[tradeId]; return n; });
    }
  };

  const pending  = requests.filter(r => r.status === "pending");
  const resolved = requests.filter(r => r.status !== "pending");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 10, color: "#7a8c82" }}>
      <Spinner dark /> <span style={{ fontSize: 14 }}>Loading trade requests...</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: "32px 0" }}>
      <div className="up-err" style={{ marginBottom: 0 }}><ErrIcon /> {error}</div>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          zIndex: 9999, background: toast.ok ? "#0d3322" : "#dc2626",
          color: "#fff", padding: "12px 22px", borderRadius: 100,
          fontSize: 13, fontWeight: 600, boxShadow: "0 6px 28px rgba(0,0,0,0.2)",
          animation: "up-fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both",
          display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap",
        }}>
          {toast.ok
            ? <OkIcon />
            : <ErrIcon />}
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <p className="up-section-title" style={{ margin: 0 }}>
          Barter / Trade Requests
          {pending.length > 0 && (
            <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", color: "#fff", fontSize: 10, fontWeight: 800 }}>
              {pending.length}
            </span>
          )}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            fetch(`${API_BASE_URL}/api/offers/received`, { headers: { "x-auth-token": token } })
              .then(r => r.json())
              .then(d => setRequests(Array.isArray(d) ? d.map(mapIncomingOfferToTrade) : []))
              .catch(() => setError("Refresh failed."))
              .finally(() => setLoading(false));
          }}
          style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "6px 13px", fontSize: 12, fontWeight: 600, color: "#6b7280", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, transition: "border-color 0.2s, color 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#2ec97e"; e.currentTarget.style.color = "#1b7d52"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "52px 24px" }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>Trade</div>
          <p style={{ fontWeight: 700, fontSize: 15, color: "#0d1f16", marginBottom: 6 }}>No trade requests yet</p>
          <p style={{ fontSize: 13, color: "#7a8c82", lineHeight: 1.65 }}>When buyers propose barters on your listings, they'll appear here.</p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 12 }}>
                Awaiting your response  -  {pending.length}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {pending.map(req => (
                  <TradeRequestCard key={req._id || req.id} req={req} acting={acting} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: 12 }}>
                Past requests  -  {resolved.length}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {resolved.map(req => (
                  <TradeRequestCard key={req._id || req.id} req={req} acting={acting} onAction={handleAction} resolved />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TradeRequestCard = ({ req, acting, onAction, resolved = false }) => {
  const id = req._id || req.id;
  const isActing = !!acting[id];

  const offeredProduct  = req.offeredProduct  || req.offeredItem  || {};
  const requestedProduct = req.requestedProduct || req.requestedItem || {};
  const buyer = req.buyer || req.buyerInfo || {};

  const buyerName   = buyer.name  || req.buyerName  || "Unknown Buyer";
  const buyerEmail  = buyer.email || req.buyerEmail  || "";
  const buyerPhone  = buyer.phone || req.buyerPhone  || "";
  const buyerAvatar = buyer.profilePicture || buyer.avatar || "";

  const offeredTitle = offeredProduct.title || req.offeredProductTitle || "Offered Item";
  const offeredImg   = Array.isArray(offeredProduct.images) ? offeredProduct.images[0] : (offeredProduct.image || "");
  const offeredPrice = offeredProduct.price != null ? `BDT ${new Intl.NumberFormat("en-BD").format(Number(offeredProduct.price))}` : "";

  const requestedTitle = requestedProduct.title || req.requestedProductTitle || "Your Listed Item";
  const requestedImg   = Array.isArray(requestedProduct.images) ? requestedProduct.images[0] : (requestedProduct.image || "");
  const requestedPrice = requestedProduct.price != null ? `BDT ${new Intl.NumberFormat("en-BD").format(Number(requestedProduct.price))}` : "";

  const note = req.note || req.message || "";
  const createdAt = req.createdAt ? new Date(req.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div style={{
      border: resolved ? "1px solid #f0f2f0" : "1px solid rgba(245,158,11,0.3)",
      borderRadius: 16,
      background: resolved ? "#fafafa" : "#fff",
      padding: "18px 20px",
      animation: "up-fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both",
      opacity: resolved ? 0.85 : 1,
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => !resolved && (e.currentTarget.style.boxShadow = "0 4px 20px rgba(245,158,11,0.12)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Buyer avatar */}
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>
            {buyerAvatar
              ? <img src={buyerAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : buyerName[0]?.toUpperCase()
            }
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1f16", lineHeight: 1.2 }}>{buyerName}</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>
              {buyerEmail || buyerPhone || "Buyer"}
              {createdAt && <span>  -  {createdAt}</span>}
            </p>
          </div>
        </div>
        <TradeStatusBadge status={req.status} />
      </div>

      {/* Trade items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 14 }}>
        {/* Offered (buyer's item) */}
        <div style={{ background: "rgba(46,201,126,0.05)", border: "1px solid rgba(46,201,126,0.18)", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#2ec97e", marginBottom: 8 }}>Buyer Offers</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, fontSize: 22 }}>
              {offeredImg
                ? <img src={offeredImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                : "Item"
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{offeredTitle}</p>
              {offeredPrice && <p style={{ fontSize: 12, color: "#1b7d52", fontWeight: 700, marginTop: 2 }}>{offeredPrice}</p>}
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#c4ccc7", letterSpacing: "0.05em", textTransform: "uppercase" }}>Trade</span>
        </div>

        {/* Requested (your listing) */}
        <div style={{ background: "rgba(13,51,34,0.04)", border: "1px solid rgba(13,51,34,0.1)", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b7280", marginBottom: 8 }}>Wants Your</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, fontSize: 22 }}>
              {requestedImg
                ? <img src={requestedImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
                : " - "
              }
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{requestedTitle}</p>
              {requestedPrice && <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 700, marginTop: 2 }}>{requestedPrice}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      {note && (
        <div style={{ background: "#f7f8f6", borderRadius: 10, padding: "10px 14px", marginBottom: 14, borderLeft: "3px solid #e5e7eb" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Note</p>
          <p style={{ fontSize: 12, color: "#4b5563", lineHeight: 1.6 }}>{note}</p>
        </div>
      )}

      {/* Actions - only for pending */}
      {req.status === "pending" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            disabled={isActing}
            onClick={() => onAction(id, "accepted")}
            style={{
              flex: 1, minWidth: 120, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: isActing ? "#e5e7eb" : "linear-gradient(135deg,#0d3322,#1b7d52)", color: isActing ? "#9ca3af" : "#fff",
              border: "none", borderRadius: 11, padding: "11px 18px", fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", cursor: isActing ? "not-allowed" : "pointer",
              transition: "opacity 0.2s, transform 0.15s",
              boxShadow: isActing ? "none" : "0 4px 16px rgba(27,125,82,0.25)",
            }}
            onMouseEnter={e => { if (!isActing) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
          >
            {acting[id] === "accepting"
              ? <><Spinner /> Accepting...</>
              : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12"/></svg> Accept Trade</>
            }
          </button>
          <button
            disabled={isActing}
            onClick={() => onAction(id, "declined")}
            style={{
              flex: 1, minWidth: 100, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
              background: isActing ? "#f9fafb" : "#fff", color: isActing ? "#9ca3af" : "#dc2626",
              border: `1.5px solid ${isActing ? "#e5e7eb" : "rgba(239,68,68,0.35)"}`,
              borderRadius: 11, padding: "10px 18px", fontSize: 13, fontWeight: 700,
              fontFamily: "inherit", cursor: isActing ? "not-allowed" : "pointer",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { if (!isActing) { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)"; }}}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)"; }}
          >
            {acting[id] === "rejecting"
              ? <><Spinner /> Declining...</>
              : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Decline</>
            }
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------
   MOCK ORDER DATA
-------------------------------------- */
/* --------------------------------------
   BUYER MOCK ORDERS DATA
-------------------------------------- */
const BUYER_MOCK_ORDERS = [
  {
    id: "BYR-2025-001",
    product: {
      title: "Apple MacBook Air M2",
      image: "",
      emoji: "Laptop",
      category: "Electronics",
      qty: 1,
    },
    seller: { name: "Nasrin Electronics", avatar: "N", location: "Gulshan, Dhaka", rating: 4.8, phone: "01711-234567" },
    price: 145000,
    payment: { method: "bKash", status: "paid" },
    deliveryStatus: "shipping",
    orderedAt: "2025-05-01T10:22:00Z",
    estimatedDelivery: "2025-05-10",
    trackingId: "BD-SHIP-2025-88412",
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    note: "",
  },
  {
    id: "BYR-2025-002",
    product: {
      title: "Sony WH-1000XM5 Headphones",
      image: "",
      emoji: "Headphones",
      category: "Electronics",
      qty: 1,
    },
    seller: { name: "Sound Zone BD", avatar: "S", location: "Banani, Dhaka", rating: 4.6, phone: "01812-345678" },
    price: 32500,
    payment: { method: "Card", status: "paid" },
    deliveryStatus: "delivered",
    orderedAt: "2025-04-20T09:00:00Z",
    estimatedDelivery: "2025-04-28",
    trackingId: "BD-SHIP-2025-77301",
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    note: "Leave at reception.",
  },
  {
    id: "BYR-2025-003",
    product: {
      title: "Otobi Study Desk & Chair Set",
      image: "",
      emoji: "Chair",
      category: "Furniture",
      qty: 1,
    },
    seller: { name: "Home Decor Hub", avatar: "H", location: "Mirpur, Dhaka", rating: 4.3, phone: "01613-456789" },
    price: 22000,
    payment: { method: "Cash on Delivery", status: "unpaid" },
    deliveryStatus: "processing",
    orderedAt: "2025-05-05T14:30:00Z",
    estimatedDelivery: "2025-05-12",
    trackingId: null,
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    note: "Call before delivery.",
  },
  {
    id: "BYR-2025-004",
    product: {
      title: "Canon EOS R10 Camera Kit",
      image: "",
      emoji: " - ",
      category: "Electronics",
      qty: 1,
    },
    seller: { name: "Camera World BD", avatar: "C", location: "Motijheel, Dhaka", rating: 4.9, phone: "01914-567890" },
    price: 82000,
    payment: { method: "Bank Transfer", status: "paid" },
    deliveryStatus: "pending",
    orderedAt: "2025-05-07T08:15:00Z",
    estimatedDelivery: "2025-05-14",
    trackingId: null,
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    note: "",
  },
  {
    id: "BYR-2025-005",
    product: {
      title: "Nike Air Force 1 Sneakers",
      image: "",
      emoji: "Shoes",
      category: "Clothing",
      qty: 2,
    },
    seller: { name: "Kicks & Style", avatar: "K", location: "Uttara, Dhaka", rating: 4.5, phone: "01517-678901" },
    price: 15600,
    payment: { method: "Nagad", status: "paid" },
    deliveryStatus: "delivered",
    orderedAt: "2025-04-10T11:00:00Z",
    estimatedDelivery: "2025-04-16",
    trackingId: "BD-SHIP-2025-66102",
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    note: "Size 42 x2.",
  },
];

const BUYER_DELIVERY_STATUSES = [
  { key: "pending",    label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  icon: "Pending", step: 0 },
  { key: "processing", label: "Processing", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", icon: "Processing", step: 1 },
  { key: "shipping",   label: "Shipping",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", icon: "Shipping", step: 2 },
  { key: "delivered",  label: "Delivered",  color: "#2ec97e", bg: "rgba(46,201,126,0.1)", border: "rgba(46,201,126,0.3)", icon: "...", step: 3 },
];
const bdsInfo = key => BUYER_DELIVERY_STATUSES.find(s => s.key === key) || BUYER_DELIVERY_STATUSES[0];
const fmtD2 = d => new Date(d).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });

/* --------------------------------------
   BUYER HUB SIDEBAR
-------------------------------------- */
const BuyerHubSidebar = ({ activePanel, onSelect }) => {
  const BUYER_NAV = [
    {
      key: "orders",
      label: "My Orders",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "trade-requests",
      label: "My Trade Requests",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h18"/>
          <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "trade-tracking",
      label: "Trade Tracking",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      ),
      badge: 0,
    },
  ];

  const ACCOUNT_NAV = [
    {
      key: "saved",
      label: "Saved Items",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "profile",
      label: "My Profile",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "settings",
      label: "Settings",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
      badge: 0,
    },
  ];

  const renderNav = (items) => items.map(item => {
    const active = activePanel === item.key;
    return (
      <button key={item.key} className={`bh-sb-item${active ? " active" : ""}`} onClick={() => onSelect(item.key)}>
        <div className="bh-sb-icon">{item.icon(active)}</div>
        <span className="bh-sb-label">{item.label}</span>
        {item.badge > 0 && <span className="bh-sb-badge">{item.badge}</span>}
      </button>
    );
  });

  return (
    <div className="bh-sidebar">
      <div className="bh-sb-header">
        <p className="bh-sb-title">Buyer Hub</p>
      </div>
      <nav className="bh-sb-nav">
        {renderNav(BUYER_NAV)}
      </nav>
      <div className="bh-sb-divider" />
      <div className="bh-sb-header" style={{ paddingTop: 8, paddingBottom: 6 }}>
        <p className="bh-sb-title">My Account</p>
      </div>
      <nav className="bh-sb-nav">
        {renderNav(ACCOUNT_NAV)}
      </nav>
    </div>
  );
};

/* --------------------------------------
   BUYER MY ORDERS PAGE
-------------------------------------- */
const BuyerMyOrdersPage = ({ onBrowse }) => {
  const [orders] = useState(BUYER_MOCK_ORDERS);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.deliveryStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.product.title.toLowerCase().includes(q) ||
      o.seller.name.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const kpi = {
    total:    orders.length,
    active:   orders.filter(o => ["pending","processing"].includes(o.deliveryStatus)).length,
    transit:  orders.filter(o => o.deliveryStatus === "shipping").length,
    done:     orders.filter(o => o.deliveryStatus === "delivered").length,
  };

  const BordStatusBadge = ({ status }) => {
    const d = bdsInfo(status);
    return (
      <span className="bord-status" style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, display: "inline-block" }} />
        {d.label}
      </span>
    );
  };

  const BordPayBadge = ({ status, method }) => (
    <span className="bord-pay" style={{
      background: status === "paid" ? "rgba(46,201,126,0.1)" : "rgba(245,158,11,0.1)",
      color: status === "paid" ? "#1b7d52" : "#92400e",
      border: `1px solid ${status === "paid" ? "rgba(46,201,126,0.3)" : "rgba(245,158,11,0.3)"}`,
    }}>
      {status === "paid" ? "OK " : "Pending "}{method}
    </span>
  );

  const MiniStepper = ({ status }) => {
    const curStep = bdsInfo(status).step;
    return (
      <div className="bord-mini-stepper">
        {BUYER_DELIVERY_STATUSES.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <div className={`bord-mini-line${i <= curStep ? " filled" : ""}`} />}
            <div className="bord-mini-step">
              <div className={`bord-mini-dot${i < curStep ? " done" : i === curStep ? " active" : " waiting"}`}>
                {i < curStep ? "OK" : s.icon}
              </div>
              <span className={`bord-mini-lbl${i < curStep ? " done" : i === curStep ? " active" : ""}`} style={{ maxWidth: 50 }}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const DetailStepper = ({ status }) => {
    const curStep = bdsInfo(status).step;
    return (
      <div className="bord-detail-stepper">
        {BUYER_DELIVERY_STATUSES.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <div className={`bord-detail-line${i <= curStep ? " filled" : ""}`} />}
            <div className="bord-detail-step">
              <div className={`bord-detail-dot${i < curStep ? " done" : i === curStep ? " active" : " waiting"}`}>
                {i < curStep ? "OK" : s.icon}
              </div>
              <span className="bord-detail-lbl" style={{ color: i <= curStep ? (i === curStep ? "#1b7d52" : "#2ec97e") : "#b0b9b5" }}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const InfoRow2 = ({ icon, label, value, mono }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f3f5f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#b0b9b5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", lineHeight: 1.4, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>{value || "-"}</p>
      </div>
    </div>
  );

  const FILTER_TABS = [
    { key: "all",        label: "All" },
    { key: "pending",    label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "shipping",   label: "Shipping" },
    { key: "delivered",  label: "Delivered" },
  ];

  /* -- No orders empty state -- */
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(46,201,126,0.07)", border: "1.5px dashed rgba(46,201,126,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>Cart</div>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0d1f16", marginBottom: 8 }}>No orders yet</p>
        <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.7, maxWidth: 280, margin: "0 auto 24px" }}>Your purchases will appear here after you buy something from the marketplace.</p>
        <button onClick={onBrowse} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
          Browse Marketplace {"->"}
        </button>
      </div>
    );
  }

  return (
    <div className="bord-wrap">

      {/* -- Page header -- */}
      <div className="bord-hero">
        <div className="bord-hero-main">
          <p className="bord-hero-kicker">Purchase Center</p>
          <h2 className="bord-hero-title">My Orders</h2>
          <p className="bord-hero-sub">Track purchases, delivery progress, seller details, payment status, and expected arrival from one focused order workspace.</p>
        </div>
        <button onClick={onBrowse} className="bord-shop-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/></svg>
          Browse More
        </button>
      </div>

      {/* -- KPI Summary Row -- */}
      <div className="bord-summary-row">
        {[
          { cls: "c-total",  icon: "Orders", val: kpi.total,   lbl: "Total Orders" },
          { cls: "c-active", icon: "Processing", val: kpi.active,  lbl: "In Progress" },
          { cls: "c-transit",icon: "Shipping", val: kpi.transit, lbl: "In Transit" },
          { cls: "c-done",   icon: "...", val: kpi.done,    lbl: "Delivered" },
        ].map(({ cls, icon, val, lbl }) => (
          <div key={lbl} className={`bord-summary-card ${cls}`}>
            <div className="bord-sum-icon" style={{ background: cls === "c-done" ? "rgba(46,201,126,0.1)" : cls === "c-transit" ? "rgba(139,92,246,0.1)" : cls === "c-active" ? "rgba(59,130,246,0.1)" : "rgba(107,114,128,0.1)" }}>{icon}</div>
            <div className="bord-sum-val">{val}</div>
            <div className="bord-sum-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {/* -- Toolbar -- */}
      <div className="bord-toolbar">
        <div className="bord-search-wrap">
          <svg className="bord-search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="bord-search" placeholder="Search orders, products, sellers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTER_TABS.map(f => (
            <button key={f.key} className={`bord-filter-btn${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* -- Main 2-col layout: list + detail -- */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 16, alignItems: "start", transition: "grid-template-columns 0.3s" }}>

        {/* ORDER LIST */}
        <div className="bord-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#fafbfa", borderRadius: 16, border: "1.5px dashed #e9eceb" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>Search</div>
              <p style={{ fontWeight: 700, color: "#0d1f16", fontSize: 14, marginBottom: 6 }}>No orders found</p>
              <p style={{ fontSize: 12, color: "#9ca3af" }}>Try adjusting your search or filter.</p>
            </div>
          ) : filtered.map(order => {
            const isSelected = selected?.id === order.id;
            return (
              <div key={order.id} className={`bord-card${isSelected ? " selected" : ""}`} onClick={() => setSelected(isSelected ? null : order)}>
                <div className="bord-card-top">
                  {/* Product image */}
                  <div className="bord-card-img">
                    {order.product.image
                      ? <img src={order.product.image} alt="" />
                      : <span style={{ fontSize: 26 }}>{order.product.emoji}</span>
                    }
                  </div>
                  {/* Meta */}
                  <div className="bord-card-meta">
                    <div className="bord-card-title">{order.product.title}</div>
                    <div className="bord-card-sub">
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {order.seller.name}
                      </span>
                      <span> - </span>
                      <span>{order.product.category}</span>
                      <span> - </span>
                      <span style={{ fontFamily: "monospace", fontSize: 11 }}>{order.id}</span>
                    </div>
                  </div>
                  {/* Price + status */}
                  <div className="bord-card-right">
                    <div className="bord-card-price">{fmtBDT(order.price)}</div>
                    <BordStatusBadge status={order.deliveryStatus} />
                  </div>
                </div>
                {/* Mini stepper */}
                <MiniStepper status={order.deliveryStatus} />
              </div>
            );
          })}
        </div>

        {/* ORDER DETAIL PANEL */}
        {selected && (() => {
          return (
            <div className="bord-detail-wrap" style={{ position: "sticky", top: 90 }}>
              {/* Header */}
              <div className="bord-detail-hdr">
                <div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>Order Details</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,.68)", marginTop: 2, fontFamily: "monospace" }}>{selected.id}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <BordStatusBadge status={selected.deliveryStatus} />
                  <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
                </div>
              </div>

              {/* Delivery stepper */}
              <DetailStepper status={selected.deliveryStatus} />

              {/* Body */}
              <div className="bord-detail-body">

                {/* Product card */}
                <div style={{ background: "rgba(46,201,126,0.04)", border: "1px solid rgba(46,201,126,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "#f3f5f2", border: "1px solid #e9eceb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {selected.product.image ? <img src={selected.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} /> : selected.product.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#2ec97e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Product Ordered</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.product.title}</p>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{selected.product.category}  -  Qty: {selected.product.qty}</p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#0d1f16", marginBottom: 5 }}>{fmtBDT(selected.price)}</p>
                    <span className="bord-pay" style={{
                      background: selected.payment.status === "paid" ? "rgba(46,201,126,0.1)" : "rgba(245,158,11,0.1)",
                      color: selected.payment.status === "paid" ? "#1b7d52" : "#92400e",
                      border: `1px solid ${selected.payment.status === "paid" ? "rgba(46,201,126,0.3)" : "rgba(245,158,11,0.3)"}`,
                    }}>
                      {selected.payment.status === "paid" ? "OK " : "Pending "}{selected.payment.method}
                    </span>
                  </div>
                </div>

                {/* Seller info */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#b0b9b5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />Seller<span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />
                  </p>
                  <div className="bord-seller-row">
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {selected.seller.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1f16" }}>{selected.seller.name}</p>
                      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        ... {selected.seller.rating}  -  {selected.seller.location}
                      </p>
                    </div>
                    <a href={`tel:${selected.seller.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, background: "rgba(46,201,126,0.1)", border: "1px solid rgba(46,201,126,0.22)", color: "#1b7d52", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(46,201,126,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(46,201,126,0.1)"}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                      Call
                    </a>
                  </div>
                </div>

                {/* Order details rows */}
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#b0b9b5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />Details<span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <InfoRow2 icon="-" label="Ordered On" value={fmtD2(selected.orderedAt)} />
                    <InfoRow2 icon="..." label="Est. Delivery" value={selected.estimatedDelivery ? fmtD2(selected.estimatedDelivery + "T00:00:00Z") : "TBD"} />
                    {selected.trackingId && <InfoRow2 icon="Location" label="Tracking ID" value={selected.trackingId} mono />}
                    <InfoRow2 icon="Home" label="Delivery Address" value={selected.address} />
                    {selected.note && <InfoRow2 icon="Note" label="Note" value={selected.note} />}
                  </div>
                </div>

                {/* Delivered congratulations banner */}
                {selected.deliveryStatus === "delivered" && (
                  <div style={{ background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.25)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>Done</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#1b7d52" }}>Delivered successfully!</p>
                      <p style={{ fontSize: 11, color: "#5a7a6a", marginTop: 2 }}>We hope you enjoy your purchase. Consider leaving a review for the seller.</p>
                    </div>
                  </div>
                )}

                {/* Pending payment notice */}
                {selected.payment.status !== "paid" && (
                  <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>!</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Payment pending</p>
                      <p style={{ fontSize: 11, color: "#78350f", marginTop: 2 }}>Please prepare {fmtBDT(selected.price)} for Cash on Delivery.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const MOCK_ORDERS = [
  {
    id: "ORD-2024-001",
    buyer: { name: "Rafiqul Islam", phone: "01711-234567", avatar: "" },
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205",
    product: { title: "Sony WH-1000XM5 Headphones", image: "", category: "Electronics", qty: 1 },
    price: 32500,
    payment: { method: "bKash", status: "paid" },
    deliveryStatus: "processing",
    createdAt: "2024-12-18T09:22:00Z",
    note: "Please pack carefully.",
  },
  {
    id: "ORD-2024-002",
    buyer: { name: "Sumaiya Akter", phone: "01812-345678", avatar: "" },
    address: "Flat 3B, Green Tower, Gulshan-2, Dhaka-1212",
    product: { title: "Samsung Galaxy Tab S9", image: "", category: "Electronics", qty: 1 },
    price: 68000,
    payment: { method: "Nagad", status: "paid" },
    deliveryStatus: "shipping",
    createdAt: "2024-12-17T14:05:00Z",
    note: "",
  },
  {
    id: "ORD-2024-003",
    buyer: { name: "Md. Karim Uddin", phone: "01612-456789", avatar: "" },
    address: "Village: Rajpara, Upazila: Savar, Dhaka",
    product: { title: "Leather Office Chair", image: "", category: "Furniture", qty: 2 },
    price: 18400,
    payment: { method: "Cash on Delivery", status: "unpaid" },
    deliveryStatus: "pending",
    createdAt: "2024-12-19T08:10:00Z",
    note: "Call before delivery.",
  },
  {
    id: "ORD-2024-004",
    buyer: { name: "Tania Begum", phone: "01914-567890", avatar: "" },
    address: "Road 12, Block C, Mirpur-10, Dhaka-1216",
    product: { title: "Canon EOS R10 Camera", image: "", category: "Electronics", qty: 1 },
    price: 82000,
    payment: { method: "Card", status: "paid" },
    deliveryStatus: "delivered",
    createdAt: "2024-12-14T11:30:00Z",
    note: "",
  },
  {
    id: "ORD-2024-005",
    buyer: { name: "Jahangir Alam", phone: "01517-678901", avatar: "" },
    address: "Holding 7, Agrabad C/A, Chattogram-4100",
    product: { title: "Nike Air Force 1 Sneakers", image: "", category: "Clothing", qty: 1 },
    price: 7800,
    payment: { method: "bKash", status: "paid" },
    deliveryStatus: "processing",
    createdAt: "2024-12-19T06:55:00Z",
    note: "Size 42.",
  },
  {
    id: "ORD-2024-006",
    buyer: { name: "Nasrin Sultana", phone: "01315-789012", avatar: "" },
    address: "Bahir Para, Sylhet City, Sylhet-3100",
    product: { title: "Apple MacBook Air M2", image: "", category: "Electronics", qty: 1 },
    price: 145000,
    payment: { method: "Bank Transfer", status: "paid" },
    deliveryStatus: "pending",
    createdAt: "2024-12-20T07:40:00Z",
    note: "Urgent order.",
  },
];

const DELIVERY_STATUSES = [
  { key: "pending",    label: "Pending",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  icon: "Pending", step: 0 },
  { key: "processing", label: "Processing", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)", icon: "Processing", step: 1 },
  { key: "shipping",   label: "Shipping",   color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)", icon: "Shipping", step: 2 },
  { key: "delivered",  label: "Delivered",  color: "#2ec97e", bg: "rgba(46,201,126,0.1)", border: "rgba(46,201,126,0.3)", icon: "...", step: 3 },
];

const fmtBDT = n => `BDT ${new Intl.NumberFormat("en-BD").format(n)}`;
const fmtDate = d => new Date(d).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const dsInfo = key => DELIVERY_STATUSES.find(s => s.key === key) || DELIVERY_STATUSES[0];

/* --------------------------------------
   INCOMING ORDERS PAGE
-------------------------------------- */
const IncomingOrdersPage = ({ token, authUser }) => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    if (!token) {
      setOrders([]);
      setSelected(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const sellerId = getEntityId(authUser);

    const mapPaymentToOrder = (payment) => {
      const listing = payment.listing || {};
      const buyer = payment.buyer || {};
      const paymentStatus = payment.status || "pending";
      const deliveryStatus = paymentStatus === "success" ? "processing" : "pending";

      return {
        id: payment.transactionId || payment._id,
        buyer: {
          name: buyer.name || "Buyer",
          phone: buyer.phone || buyer.email || "",
          avatar: buyer.profilePicture || "",
        },
        address: buyer.location?.address || "",
        product: {
          title: listing.title || "Listing",
          image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
          category: listing.category || "Marketplace",
          qty: 1,
        },
        price: Number(payment.amount) || 0,
        payment: { method: "SSLCommerz", status: paymentStatus === "success" ? "paid" : paymentStatus },
        deliveryStatus,
        createdAt: payment.createdAt || new Date().toISOString(),
        note: payment.transactionId || "",
      };
    };

    const fetchPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/payments/my`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data.msg || "Unable to load payments.");
        }
        const nextOrders = Array.isArray(data)
          ? data
              .filter(payment => !sellerId || getEntityId(payment.seller) === sellerId)
              .map(mapPaymentToOrder)
          : [];
        if (!cancelled) {
          setOrders(nextOrders);
          setSelected(nextOrders[0] || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load payments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPayments();
    return () => { cancelled = true; };
  }, [authUser, token]);

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.deliveryStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.buyer.name.toLowerCase().includes(q) || o.product.title.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // KPI counts
  const kpi = {
    total:      orders.length,
    pending:    orders.filter(o => o.deliveryStatus === "pending").length,
    shipping:   orders.filter(o => o.deliveryStatus === "shipping").length,
    delivered:  orders.filter(o => o.deliveryStatus === "delivered").length,
    revenue:    orders.filter(o => o.payment.status === "paid").reduce((s, o) => s + o.price, 0),
  };

  const handleSelect = (o) => {
    setSelected(o);
    if (window.innerWidth < 900) setMobileDetail(true);
  };

  const advanceStatus = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const cur = DELIVERY_STATUSES.findIndex(s => s.key === order.deliveryStatus);
    if (cur >= DELIVERY_STATUSES.length - 1) return;
    const next = DELIVERY_STATUSES[cur + 1];
    setUpdating(true);
    await new Promise(r => setTimeout(r, 700)); // simulate API
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: next.key } : o));
    setSelected(prev => prev?.id === orderId ? { ...prev, deliveryStatus: next.key } : prev);
    setUpdating(false);
    showToast(`Order ${orderId} updated to "${next.label}" OK`);
  };

  const OrderStatusBadge = ({ status }) => {
    const d = dsInfo(status);
    return (
      <span className="ord-status" style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, display: "inline-block" }} />
        {d.label}
      </span>
    );
  };

  const PayBadge = ({ status, method }) => (
    <span className="ord-pay" style={{
      background: status === "paid" ? "rgba(46,201,126,0.1)" : "rgba(239,68,68,0.08)",
      color: status === "paid" ? "#1b7d52" : "#dc2626",
      border: `1px solid ${status === "paid" ? "rgba(46,201,126,0.3)" : "rgba(239,68,68,0.25)"}`,
    }}>
      {status === "paid" ? "OK" : "!"} {method}
    </span>
  );

  const OrderStepper = ({ status }) => {
    const curStep = dsInfo(status).step;
    return (
      <div className="ord-stepper">
        {DELIVERY_STATUSES.map((s, i) => (
          <React.Fragment key={s.key}>
            {i > 0 && <div className={`ord-step-line${i <= curStep ? " filled" : ""}`} />}
            <div className="ord-step">
              <div className={`ord-step-dot${i < curStep ? " done" : i === curStep ? " active" : " waiting"}`}>
                {i < curStep ? "OK" : s.icon}
              </div>
              <span className="ord-step-lbl" style={{ color: i <= curStep ? (i === curStep ? "#1b7d52" : "#2ec97e") : "#b0b9b5", maxWidth: 60 }}>
                {s.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const InfoRow = ({ icon, label, value, mono }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "#f3f5f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#b0b9b5", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", lineHeight: 1.4, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>{value || "-"}</p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 10, color: "#7a8c82" }}>
      <Spinner dark /> <span style={{ fontSize: 14 }}>Loading payments...</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: "32px 0" }}>
      <div className="up-err" style={{ marginBottom: 0 }}><ErrIcon /> {error}</div>
    </div>
  );

  const renderOrderDetail = (order, onClose) => {
    if (!order) return null;
    const d = dsInfo(order.deliveryStatus);
    const isLast = d.step >= DELIVERY_STATUSES.length - 1;
    const nextStatus = !isLast ? DELIVERY_STATUSES[d.step + 1] : null;

    return (
      <div className="ord-detail">
        <div className="ord-detail-hdr">
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {onClose && (
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: "#f3f5f2", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              </button>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#0d1f16", lineHeight: 1.2 }}>Order Details</p>
              <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "monospace" }}>{order.id}</p>
            </div>
          </div>
          <div style={{ display: "flex", align: "center", gap: 8, flexShrink: 0 }}>
            <OrderStatusBadge status={order.deliveryStatus} />
          </div>
        </div>

        <OrderStepper status={order.deliveryStatus} />

        <div className="ord-detail-body">
          {/* Product */}
          <div style={{ background: "rgba(46,201,126,0.04)", border: "1px solid rgba(46,201,126,0.15)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: "#f3f5f2", border: "1px solid #e9eceb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, overflow: "hidden" }}>
              {order.product.image ? <img src={order.product.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "Item"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#2ec97e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>Product Ordered</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{order.product.title}</p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{order.product.category}  -  Qty: {order.product.qty}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#0d1f16" }}>{fmtBDT(order.price)}</p>
              <PayBadge status={order.payment.status} method={order.payment.method} />
            </div>
          </div>

          {/* Buyer info */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#b0b9b5", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />
              Buyer Information
              <span style={{ flex: 1, height: 1, background: "#f0f2f0", display: "inline-block" }} />
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#fafbfa", borderRadius: 12, border: "1px solid #f0f2f0" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {order.buyer.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16" }}>{order.buyer.name}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af" }}>Buyer</p>
                </div>
              </div>
              <InfoRow icon="Phone" label="Phone" value={order.buyer.phone} mono />
              <InfoRow icon="Location" label="Delivery Address" value={order.address} />
              {order.note && <InfoRow icon="Message" label="Buyer Note" value={order.note} />}
              <InfoRow icon="-" label="Order Placed" value={fmtDate(order.createdAt)} />
            </div>
          </div>

          {/* Action */}
          {!isLast ? (
            <div style={{ background: "#f7f8f6", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0f2f0" }}>
              <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, lineHeight: 1.6 }}>
                Current status: <strong style={{ color: d.color }}>{d.label}</strong>. Click below to advance this order to <strong style={{ color: nextStatus?.color }}>{nextStatus?.label}</strong>.
              </p>
              <button
                className="ord-update-btn"
                disabled={updating}
                onClick={() => advanceStatus(order.id)}
                style={{ width: "100%" }}
              >
                {updating
                  ? <><Spinner /> Updating...</>
                  : <>{nextStatus?.icon} Mark as {nextStatus?.label}</>
                }
              </button>
            </div>
          ) : (
            <div style={{ background: "rgba(46,201,126,0.06)", border: "1px solid rgba(46,201,126,0.25)", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>OK</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1b7d52" }}>Order Delivered!</p>
                <p style={{ fontSize: 12, color: "#7a8c82" }}>This order has been successfully completed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ord-wrap">
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: toast.ok ? "#0d3322" : "#dc2626", color: "#fff", padding: "12px 22px", borderRadius: 100, fontSize: 13, fontWeight: 600, boxShadow: "0 6px 28px rgba(0,0,0,0.18)", animation: "up-fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", pointerEvents: "none" }}>
          {toast.ok ? "OK" : "!"} {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div className="ord-kpi-row">
        {[
          { label: "Total Orders", val: kpi.total, color: "#0d1f16", dot: "#374151" },
          { label: "Pending",      val: kpi.pending,   color: "#b45309", dot: "#f59e0b" },
          { label: "In Shipping",  val: kpi.shipping,  color: "#6d28d9", dot: "#8b5cf6" },
          { label: "Delivered",    val: kpi.delivered, color: "#1b7d52", dot: "#2ec97e" },
        ].map(k => (
          <div key={k.label} className="ord-kpi">
            <div className="ord-kpi-dot" style={{ background: k.dot }} />
            <div className="ord-kpi-val" style={{ color: k.color }}>{k.val}</div>
            <div className="ord-kpi-lbl">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue strip */}
      <div style={{ background: "linear-gradient(135deg,#0d3322,#1b7d52)", borderRadius: 14, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Total Revenue (Paid)</p>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{fmtBDT(kpi.revenue)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DELIVERY_STATUSES.map(s => (
            <div key={s.key} style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", minWidth: 54 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{orders.filter(o => o.deliveryStatus === s.key).length}</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="ord-toolbar">
        <div className="ord-search-wrap">
          <svg className="ord-search-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="ord-search" placeholder="Search orders, buyers, products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {["all", ...DELIVERY_STATUSES.map(s => s.key)].map(f => (
          <button key={f} className={`ord-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All Orders" : dsInfo(f).icon + " " + dsInfo(f).label}
          </button>
        ))}
      </div>

      {/* Main split layout */}
      <div style={{ display: "grid", gridTemplateColumns: selected && window.innerWidth >= 900 ? "1fr 380px" : "1fr", gap: 16, alignItems: "start" }}>

        {/* Orders table */}
        <div className="ord-table-wrap">
          {filtered.length === 0 ? (
            <div style={{ padding: "52px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 42, marginBottom: 14 }}>Mail</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0d1f16", marginBottom: 6 }}>No orders found</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Try a different filter or search term.</p>
            </div>
          ) : (
            <table className="ord-table">
              <thead>
                <tr>
                  {["Order ID", "Buyer", "Product", "Amount", "Payment", "Status", "Date"].map(h => (
                    <th key={h} className="ord-th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, idx) => {
                  return (
                    <tr
                      key={o.id}
                      className={`ord-tr${selected?.id === o.id ? " selected" : ""}`}
                      onClick={() => handleSelect(o)}
                      style={{ animationDelay: `${idx * 0.04}s`, animation: "ord-in 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
                    >
                      <td className="ord-td">
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1b7d52", fontWeight: 700 }}>{o.id}</span>
                      </td>
                      <td className="ord-td">
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                            {o.buyer.name[0]}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.buyer.name}</p>
                            <p style={{ fontSize: 11, color: "#9ca3af" }}>{o.buyer.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="ord-td">
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.product.title}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af" }}>{o.product.category}</p>
                      </td>
                      <td className="ord-td">
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 14, fontWeight: 700, color: "#0d1f16" }}>{fmtBDT(o.price)}</span>
                      </td>
                      <td className="ord-td">
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                          background: o.payment.status === "paid" ? "rgba(46,201,126,0.1)" : "rgba(239,68,68,0.08)",
                          color: o.payment.status === "paid" ? "#1b7d52" : "#dc2626",
                          border: `1px solid ${o.payment.status === "paid" ? "rgba(46,201,126,0.28)" : "rgba(239,68,68,0.22)"}` }}>
                          {o.payment.status === "paid" ? "OK" : "!"} {o.payment.status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="ord-td">
                        <OrderStatusBadge status={o.deliveryStatus} />
                      </td>
                      <td className="ord-td">
                        <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                          {new Date(o.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Desktop detail panel */}
        {selected && (
          <div style={{ display: window.innerWidth >= 900 ? "block" : "none" }}>
            {renderOrderDetail(selected)}
          </div>
        )}
      </div>

      {/* Mobile detail sheet */}
      {mobileDetail && selected && (
        <div className="ord-mobile-overlay" onClick={() => setMobileDetail(false)}>
          <div className="ord-mobile-sheet" onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#e9eceb", margin: "12px auto" }} />
            {renderOrderDetail(selected, () => setMobileDetail(false))}
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------
   INCOMING TRADE REQUESTS PAGE
-------------------------------------- */
const MOCK_TRADE_REQUESTS = [
  {
    id: "TR-001",
    status: "pending",
    createdAt: "2025-05-01T10:30:00Z",
    buyer: { name: "Arif Hossain", phone: "+880 1712 345678", location: "Dhaka, Gulshan", avatar: "", rating: 4.6, totalTrades: 12 },
    sellerItem: { title: "iPhone 14 Pro Max 256GB", category: "Smartphones", condition: "Excellent", value: 95000, image: "" },
    offeredItem: { title: "Samsung Galaxy S23 Ultra 512GB", category: "Smartphones", condition: "Good", value: 85000, image: "" },
    message: "Hey! I'd love to trade my Samsung Galaxy S23 Ultra for your iPhone. The phone is in great condition, barely 3 months old. Open to some cash adjustment if needed. Let me know!",
    cashAdjustment: 5000,
    cashDirection: "buyer_pays",
  },
  {
    id: "TR-002",
    status: "pending",
    createdAt: "2025-05-03T14:15:00Z",
    buyer: { name: "Mitu Akter", phone: "+880 1855 987654", location: "Chittagong, Nasirabad", avatar: "", rating: 4.2, totalTrades: 7 },
    sellerItem: { title: "iPhone 14 Pro Max 256GB", category: "Smartphones", condition: "Excellent", value: 95000, image: "" },
    offeredItem: { title: "MacBook Air M1 8GB/256GB", category: "Laptops", condition: "Very Good", value: 92000, image: "" },
    message: "I want to swap my MacBook Air M1 for your iPhone. The MacBook is in excellent condition, no scratches. I think it's a fair trade. Hope we can make a deal!",
    cashAdjustment: 0,
    cashDirection: null,
  },
  {
    id: "TR-003",
    status: "accepted",
    createdAt: "2025-04-28T09:00:00Z",
    buyer: { name: "Rakibul Islam", phone: "+880 1933 112233", location: "Dhaka, Dhanmondi", avatar: "", rating: 4.9, totalTrades: 31 },
    sellerItem: { title: "iPhone 14 Pro Max 256GB", category: "Smartphones", condition: "Excellent", value: 95000, image: "" },
    offeredItem: { title: "iPad Pro 11\" M2 128GB WiFi", category: "Tablets", condition: "Like New", value: 78000, image: "" },
    message: "Interested in your iPhone, offering my iPad Pro M2. I'll add BDT 15,000 cash on top. Everything comes with original box and accessories.",
    cashAdjustment: 15000,
    cashDirection: "buyer_pays",
  },
  {
    id: "TR-004",
    status: "rejected",
    createdAt: "2025-04-25T16:45:00Z",
    buyer: { name: "Sumaiya Begum", phone: "+880 1611 445566", location: "Sylhet, Zindabazar", avatar: "", rating: 3.8, totalTrades: 4 },
    sellerItem: { title: "iPhone 14 Pro Max 256GB", category: "Smartphones", condition: "Excellent", value: 95000, image: "" },
    offeredItem: { title: "Xiaomi 13 Pro 256GB", category: "Smartphones", condition: "Good", value: 58000, image: "" },
    message: "Can we trade? I know the value difference is big, I can add cash later.",
    cashAdjustment: 0,
    cashDirection: null,
  },
];

const fmtBDT2 = (n) => `BDT ${new Intl.NumberFormat("en-BD").format(n)}`;
const fmtDate2 = (iso) => new Date(iso).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" });

const TradeStatusBadge = ({ status }) => {
  const map = {
    pending:  { label: "Pending Review", color: "#b45309", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
    accepted: { label: "Accepted",       color: "#1b7d52", bg: "rgba(46,201,126,0.1)", border: "rgba(46,201,126,0.3)", dot: "#2ec97e" },
    rejected: { label: "Rejected",       color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", dot: "#ef4444" },
    declined: { label: "Declined",       color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", dot: "#ef4444" },
    cancelled:{ label: "Cancelled",      color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", dot: "#ef4444" },
    completed:{ label: "Completed",      color: "#0f766e", bg: "rgba(15,118,110,0.1)", border: "rgba(15,118,110,0.28)", dot: "#14b8a6" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

const StarRating = ({ value }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, color: "#b45309", fontWeight: 700 }}>
    ... {value.toFixed(1)}
  </span>
);

const IncomingTradeRequestsPage = ({ token }) => {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { id, action }
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const handleAction = (id, action) => {
    setConfirmAction({ id, action });
  };

  useEffect(() => {
    if (!token) {
      setTrades([]);
      setSelected(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchReceivedOffers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/offers/received`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data.msg || "Unable to load incoming trade requests.");
        }
        const nextTrades = Array.isArray(data) ? data.map(mapIncomingOfferToTrade) : [];
        if (!cancelled) {
          setTrades(nextTrades);
          setSelected(nextTrades[0] || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load incoming trade requests.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReceivedOffers();
    return () => { cancelled = true; };
  }, [token]);

  const confirmDo = async () => {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    const status = action === "accept" ? "accepted" : "declined";

    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.msg || "Unable to update trade request.");
      }
      setTrades(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
      setConfirmAction(null);
      showToast(action === "accept" ? "Trade accepted! Buyer will be notified." : "Trade declined. Buyer will be notified.", action === "accept");
    } catch (err) {
      showToast(err.message || "Unable to update trade request.", false);
    }
  };

  const FILTERS = [
    { key: "all",      label: "All Trades" },
    { key: "pending",  label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
  ];

  const filtered = trades.filter(t => {
    const matchFilter = filter === "all" || t.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.buyer.name.toLowerCase().includes(q) || t.offeredItem.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const kpi = {
    total: trades.length,
    pending: trades.filter(t => t.status === "pending").length,
    accepted: trades.filter(t => t.status === "accepted").length,
    declined: trades.filter(t => t.status === "declined").length,
  };

  const openDetail = (trade) => setSelected(trade);
  const closeDetail = () => setSelected(null);

  const renderTradeItemCard = (item, label, accent) => (
    <div style={{ flex: 1, minWidth: 0, background: accent ? "linear-gradient(135deg,rgba(46,201,126,0.06),rgba(27,125,82,0.04))" : "rgba(59,130,246,0.04)", border: `1.5px solid ${accent ? "rgba(46,201,126,0.2)" : "rgba(59,130,246,0.2)"}`, borderRadius: 16, padding: "16px 18px" }}>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: accent ? "#1b7d52" : "#3b82f6", marginBottom: 12 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 52, height: 52, borderRadius: 13, background: accent ? "rgba(46,201,126,0.12)" : "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, border: `1px solid ${accent ? "rgba(46,201,126,0.2)" : "rgba(59,130,246,0.15)"}` }}>
          {accent ? "Phone" : "Item"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16", lineHeight: 1.3, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>{item.category}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: accent ? "rgba(46,201,126,0.1)" : "rgba(59,130,246,0.08)", color: accent ? "#1b7d52" : "#2563eb", border: `1px solid ${accent ? "rgba(46,201,126,0.25)" : "rgba(59,130,246,0.2)"}` }}>
          {item.condition}
        </span>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#0d1f16" }}>{fmtBDT2(item.value)}</p>
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", gap: 10, color: "#7a8c82" }}>
      <Spinner dark /> <span style={{ fontSize: 14 }}>Loading incoming trade requests...</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: "32px 0" }}>
      <div className="up-err" style={{ marginBottom: 0 }}><ErrIcon /> {error}</div>
    </div>
  );

  return (
    <div style={{ animation: "ord-in 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
      <style>{`
        @keyframes tr-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tr-pop { 0%{transform:scale(0.92);opacity:0} 70%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
        @keyframes tr-slide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes tr-overlay { from{opacity:0} to{opacity:1} }
        .tr-card { background:#fff; border:1.5px solid #f0f2f0; border-radius:18px; padding:18px 20px; cursor:pointer; transition:all 0.22s; position:relative; overflow:hidden; animation:tr-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .tr-card:hover { border-color:rgba(46,201,126,0.35); box-shadow:0 6px 24px rgba(46,201,126,0.08); transform:translateY(-2px); }
        .tr-card.selected { border-color:rgba(46,201,126,0.5); box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
        .tr-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; background:linear-gradient(to bottom,#2ec97e,#1b7d52); border-radius:3px 0 0 3px; opacity:0; transition:opacity 0.2s; }
        .tr-card.selected::before, .tr-card:hover::before { opacity:1; }
        .tr-search { width:100%; padding:10px 14px 10px 40px; border:1.5px solid #e9eceb; border-radius:13px; background:#fafbfa; font-family:inherit; font-size:13px; outline:none; color:#111827; transition:border-color 0.2s,box-shadow 0.2s; }
        .tr-search:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,0.1); background:#fff; }
        .tr-filter-pill { display:inline-flex; align-items:center; gap:5px; padding:8px 16px; border-radius:100px; border:1.5px solid #e9eceb; background:#fafbfa; font-family:inherit; font-size:12px; font-weight:700; color:#6b7280; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
        .tr-filter-pill.active { border-color:rgba(46,201,126,0.5); background:rgba(46,201,126,0.08); color:#1b7d52; }
        .tr-filter-pill:hover:not(.active) { border-color:#b0b9b5; color:#374151; }
        .tr-accept-btn { display:inline-flex; align-items:center; gap:7px; padding:11px 22px; border-radius:12px; border:none; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 14px rgba(13,51,34,0.22); }
        .tr-accept-btn:hover { opacity:0.88; transform:translateY(-1px); box-shadow:0 6px 20px rgba(13,51,34,0.3); }
        .tr-reject-btn { display:inline-flex; align-items:center; gap:7px; padding:11px 22px; border-radius:12px; border:1.5px solid #fecaca; background:rgba(239,68,68,0.06); color:#dc2626; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .tr-reject-btn:hover { background:rgba(239,68,68,0.12); border-color:#ef4444; }
        .tr-detail-panel { background:#fff; border-radius:20px; border:1px solid #f0f2f0; overflow:hidden; animation:tr-slide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .tr-exchange-arrow { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#0d3322,#1b7d52); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 4px 12px rgba(13,51,34,0.25); }
        .tr-value-diff { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:100px; font-size:12px; font-weight:700; }
        .tr-confirm-overlay { position:fixed; inset:0; z-index:800; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:24px; animation:tr-overlay 0.2s; }
        .tr-confirm-box { background:#fff; border-radius:24px; padding:36px 32px; max-width:400px; width:100%; text-align:center; box-shadow:0 24px 80px rgba(0,0,0,0.25); animation:tr-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: toast.ok ? "#0d3322" : "#dc2626", color: "#fff", padding: "12px 22px", borderRadius: 100, fontSize: 13, fontWeight: 600, boxShadow: "0 6px 28px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", pointerEvents: "none", animation: "tr-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
          {toast.ok ? "OK" : "X"} {toast.msg}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="tr-confirm-overlay" onClick={() => setConfirmAction(null)}>
          <div className="tr-confirm-box" onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
              background: confirmAction.action === "accept" ? "rgba(46,201,126,0.1)" : "rgba(239,68,68,0.08)",
              border: `2px solid ${confirmAction.action === "accept" ? "rgba(46,201,126,0.3)" : "rgba(239,68,68,0.2)"}` }}>
              {confirmAction.action === "accept" ? "..." : "X"}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0d1f16", marginBottom: 10 }}>
              {confirmAction.action === "accept" ? "Accept this trade?" : "Decline this trade?"}
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, marginBottom: 28 }}>
              {confirmAction.action === "accept"
                ? "The buyer will be notified that you've accepted their trade offer. You can coordinate item exchange details afterward."
                : "The buyer will be notified that their trade offer has been declined. This action cannot be undone."}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmAction(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e5e7eb", background: "none", color: "#6b7280", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={confirmDo} style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: confirmAction.action === "accept" ? "linear-gradient(135deg,#0d3322,#1b7d52)" : "#dc2626", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", boxShadow: confirmAction.action === "accept" ? "0 4px 16px rgba(13,51,34,0.28)" : "0 4px 16px rgba(220,38,38,0.28)" }}>
                {confirmAction.action === "accept" ? "Yes, Accept Trade" : "Yes, Decline Trade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0d1f16", lineHeight: 1.1 }}>Incoming Trade Requests</h2>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Review barter offers sent by buyers</p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total",    val: kpi.total,    color: "#0d1f16", bg: "#f7f8f6",              border: "#e9eceb",             dot: "#6b7280" },
          { label: "Pending",  val: kpi.pending,  color: "#b45309", bg: "rgba(245,158,11,0.07)",border: "rgba(245,158,11,0.25)",dot: "#f59e0b" },
          { label: "Accepted", val: kpi.accepted, color: "#1b7d52", bg: "rgba(46,201,126,0.07)",border: "rgba(46,201,126,0.25)",dot: "#2ec97e" },
          { label: "Declined", val: kpi.declined, color: "#dc2626", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", dot: "#ef4444" },
        ].map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.border}`, borderRadius: 14, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: k.dot, margin: "0 auto 8px" }} />
            <p style={{ fontSize: 24, fontWeight: 800, color: k.color, lineHeight: 1, marginBottom: 4 }}>{k.val}</p>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
          <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#b0b9b5", pointerEvents: "none" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input className="tr-search" placeholder="Search buyer, item, or trade ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button key={f.key} className={`tr-filter-pill${filter === f.key ? " active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
              {f.key !== "all" && <span style={{ background: filter === f.key ? "rgba(46,201,126,0.2)" : "#f0f2f0", color: filter === f.key ? "#1b7d52" : "#6b7280", borderRadius: 100, padding: "1px 6px", fontSize: 10, fontWeight: 800, minWidth: 18, textAlign: "center" }}>{kpi[f.key] ?? 0}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Split layout */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr", gap: 16, alignItems: "start" }}>

        {/* Trade Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 ? (
            <div style={{ background: "#fff", border: "1.5px solid #f0f2f0", borderRadius: 18, padding: "52px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>Trade</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#0d1f16", marginBottom: 6 }}>No trade requests found</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Try a different filter or search term.</p>
            </div>
          ) : filtered.map((trade, idx) => {
            const valueDiff = trade.offeredItem.value - trade.sellerItem.value;
            return (
              <div key={trade.id} className={`tr-card${selected?.id === trade.id ? " selected" : ""}`} style={{ animationDelay: `${idx * 0.06}s` }} onClick={() => openDetail(trade)}>
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {trade.buyer.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16" }}>{trade.buyer.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                        <StarRating value={trade.buyer.rating} />
                        <span style={{ fontSize: 11, color: "#b0b9b5" }}> - </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{trade.buyer.totalTrades} trades</span>
                        <span style={{ fontSize: 11, color: "#b0b9b5" }}> - </span>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{trade.buyer.location}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <LegacyTradeStatusBadge status={trade.status} />
                    <span style={{ fontSize: 10, color: "#b0b9b5", fontWeight: 600 }}>{fmtDate2(trade.createdAt)}</span>
                  </div>
                </div>

                {/* Exchange preview */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {/* Offered item */}
                  <div style={{ flex: 1, minWidth: 0, background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 13, padding: "11px 14px" }}>
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#3b82f6", marginBottom: 5 }}>Buyer Offers</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1f16", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3, marginBottom: 3 }}>{trade.offeredItem.title}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{trade.offeredItem.condition}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{fmtBDT2(trade.offeredItem.value)}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(13,51,34,0.22)" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={13} height={13}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>

                  {/* Your item */}
                  <div style={{ flex: 1, minWidth: 0, background: "rgba(46,201,126,0.05)", border: "1px solid rgba(46,201,126,0.2)", borderRadius: 13, padding: "11px 14px" }}>
                    <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1b7d52", marginBottom: 5 }}>Your Item</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0d1f16", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3, marginBottom: 3 }}>{trade.sellerItem.title}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{trade.sellerItem.condition}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{fmtBDT2(trade.sellerItem.value)}</span>
                    </div>
                  </div>
                </div>

                {/* Cash adjustment & quick actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {trade.cashAdjustment > 0 ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#b45309", border: "1px solid rgba(245,158,11,0.3)" }}>
                        Cash +{fmtBDT2(trade.cashAdjustment)} cash from buyer
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: "#f7f8f6", color: "#9ca3af", border: "1px solid #e9eceb" }}>
                        No cash adjustment
                      </span>
                    )}
                    {valueDiff !== 0 && (
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        (value diff: <strong style={{ color: valueDiff > 0 ? "#1b7d52" : "#dc2626" }}>{valueDiff > 0 ? "+" : ""}{fmtBDT2(Math.abs(valueDiff))}</strong>)
                      </span>
                    )}
                  </div>
                  {trade.status === "pending" && (
                    <div style={{ display: "flex", gap: 7 }} onClick={e => e.stopPropagation()}>
                      <button className="tr-reject-btn" style={{ padding: "7px 14px", fontSize: 12 }} onClick={() => handleAction(trade.id, "reject")}>X Decline</button>
                      <button className="tr-accept-btn" style={{ padding: "7px 16px", fontSize: 12 }} onClick={() => handleAction(trade.id, "accept")}>OK Accept</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="tr-detail-panel">
            {/* Panel header */}
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #f0f2f0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#fafbfa,#f7f9f7)" }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "#0d1f16" }}>Trade Details</p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, fontFamily: "monospace" }}>{selected.id}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <LegacyTradeStatusBadge status={selected.status} />
                <button onClick={closeDetail} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid #e9eceb", background: "#fff", color: "#374151", cursor: "pointer", fontSize: 18, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
              </div>
            </div>

            <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 20, maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
              {/* Buyer info */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b0b9b5", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />Buyer Profile<span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />
                </p>
                <div style={{ background: "#fafbfa", border: "1px solid #f0f2f0", borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#0d3322,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {selected.buyer.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0d1f16" }}>{selected.buyer.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        <StarRating value={selected.buyer.rating} />
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{selected.buyer.totalTrades} completed trades</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {[
                      { icon: "Phone", label: "Phone", val: selected.buyer.phone },
                      { icon: "Location", label: "Location", val: selected.buyer.location },
                      { icon: "-", label: "Requested", val: fmtDate2(selected.createdAt) },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 14 }}>{row.icon}</span>
                        <span style={{ fontSize: 11, color: "#9ca3af", minWidth: 70 }}>{row.label}</span>
                        <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trade items */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b0b9b5", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />Exchange Items<span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {renderTradeItemCard(selected.offeredItem, "Buyer Buyer Offers This", false)}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 1, background: "#f0f2f0" }} />
                    <div className="tr-exchange-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                    </div>
                    <div style={{ flex: 1, height: 1, background: "#f0f2f0" }} />
                  </div>
                  {renderTradeItemCard(selected.sellerItem, "Seller They Want This (Yours)", true)}
                </div>
              </div>

              {/* Value analysis */}
              <div style={{ background: "#f7f8f6", borderRadius: 14, padding: "14px 16px", border: "1px solid #e9eceb" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.07em" }}>Value Analysis</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Their offer value",  val: fmtBDT2(selected.offeredItem.value), color: "#374151" },
                    { label: "Your item value",     val: fmtBDT2(selected.sellerItem.value),  color: "#374151" },
                    ...(selected.cashAdjustment > 0 ? [{ label: "Cash from buyer", val: `+${fmtBDT2(selected.cashAdjustment)}`, color: "#1b7d52" }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.val}</span>
                    </div>
                  ))}
                  <div style={{ height: 1, background: "#e9eceb", margin: "4px 0" }} />
                  {(() => {
                    const net = selected.offeredItem.value + (selected.cashAdjustment || 0) - selected.sellerItem.value;
                    return (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Net gain / loss</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: net >= 0 ? "#1b7d52" : "#dc2626" }}>
                          {net >= 0 ? "+" : ""}{fmtBDT2(Math.abs(net))} {net >= 0 ? "gain" : "loss"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Message */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#b0b9b5", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />Buyer's Message<span style={{ flex: 1, height: 1, background: "#f0f2f0" }} />
                </p>
                <div style={{ background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 14, padding: "14px 16px", position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, left: -1, width: 3, height: 40, background: "linear-gradient(to bottom,#3b82f6,#6366f1)", borderRadius: "0 3px 3px 0" }} />
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, fontStyle: "italic" }}>"{selected.message}"</p>
                </div>
              </div>

              {/* Actions */}
              {selected.status === "pending" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="tr-reject-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleAction(selected.id, "reject")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Decline Trade
                  </button>
                  <button className="tr-accept-btn" style={{ flex: 1.4, justifyContent: "center" }} onClick={() => handleAction(selected.id, "accept")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="20 6 9 17 4 12"/></svg>
                    Accept Trade
                  </button>
                </div>
              )}

              {selected.status !== "pending" && (
                <div style={{ background: selected.status === "accepted" ? "rgba(46,201,126,0.07)" : "rgba(239,68,68,0.06)", border: `1px solid ${selected.status === "accepted" ? "rgba(46,201,126,0.3)" : "rgba(239,68,68,0.2)"}`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 24 }}>{selected.status === "accepted" ? "..." : "X"}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: selected.status === "accepted" ? "#1b7d52" : "#dc2626" }}>
                      Trade {selected.status === "accepted" ? "Accepted" : "Declined"}
                    </p>
                    <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {selected.status === "accepted" ? "Coordinate item exchange details with the buyer." : "This trade offer has been declined."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------
   TRADE TRACKING PAGE
-------------------------------------- */
const MOCK_TRACKED_TRADES = [
  {
    id: "TRK-001",
    tradeId: "TR-003",
    status: "seller_shipped",
    acceptedAt: "2025-05-01T10:00:00Z",
    estimatedCompletion: "2025-05-10T00:00:00Z",
    buyer: {
      name: "Rakibul Islam",
      phone: "+880 1933 112233",
      location: "Dhaka, Dhanmondi",
      avatar: "",
      rating: 4.9,
    },
    sellerItem: {
      title: "iPhone 14 Pro Max 256GB",
      category: "Smartphones",
      condition: "Excellent",
      value: 95000,
      trackingNumber: "BD-SA-7821034",
      courier: "Sundarban Courier",
    },
    buyerItem: {
      title: "iPad Pro 11\" M2 128GB WiFi",
      category: "Tablets",
      condition: "Like New",
      value: 78000,
      trackingNumber: null,
      courier: null,
    },
    cashAdjustment: 15000,
    cashDirection: "buyer_pays",
    timeline: [
      { key: "accepted",        label: "Trade Accepted",           icon: "Accepted", done: true,  ts: "2025-05-01T10:00:00Z", note: "Both parties agreed to the barter." },
      { key: "seller_shipped",  label: "Seller Shipped",           icon: "Item", done: true,  ts: "2025-05-02T14:30:00Z", note: "Sent via Sundarban Courier  -  TRK: BD-SA-7821034" },
      { key: "buyer_shipped",   label: "Buyer Shipped",            icon: "Shipping", done: false, ts: null,                   note: "Waiting for buyer to dispatch their item." },
      { key: "seller_received", label: "Seller Received",          icon: "Received", done: false, ts: null,                   note: "Confirm once buyer's item arrives." },
      { key: "buyer_received",  label: "Buyer Received",           icon: "...", done: false, ts: null,                   note: "Buyer will confirm receipt of your item." },
      { key: "completed",       label: "Trade Completed",          icon: "Done", done: false, ts: null,                   note: "Trade successfully closed." },
    ],
  },
  {
    id: "TRK-002",
    tradeId: "TR-007",
    status: "accepted",
    acceptedAt: "2025-05-05T09:15:00Z",
    estimatedCompletion: "2025-05-14T00:00:00Z",
    buyer: {
      name: "Arif Hossain",
      phone: "+880 1712 345678",
      location: "Dhaka, Gulshan",
      avatar: "",
      rating: 4.6,
    },
    sellerItem: {
      title: "Sony WH-1000XM5 Headphones",
      category: "Audio",
      condition: "Like New",
      value: 32000,
      trackingNumber: null,
      courier: null,
    },
    buyerItem: {
      title: "Apple Watch Series 9 45mm",
      category: "Wearables",
      condition: "Excellent",
      value: 38000,
      trackingNumber: null,
      courier: null,
    },
    cashAdjustment: 0,
    cashDirection: null,
    timeline: [
      { key: "accepted",        label: "Trade Accepted",           icon: "Accepted", done: true,  ts: "2025-05-05T09:15:00Z", note: "Both parties agreed to the barter." },
      { key: "seller_shipped",  label: "Seller Shipped",           icon: "Item", done: false, ts: null,                   note: "Ship your item to initiate the exchange." },
      { key: "buyer_shipped",   label: "Buyer Shipped",            icon: "Shipping", done: false, ts: null,                   note: "Buyer will ship their item." },
      { key: "seller_received", label: "Seller Received",          icon: "Received", done: false, ts: null,                   note: "Confirm once buyer's item arrives." },
      { key: "buyer_received",  label: "Buyer Received",           icon: "...", done: false, ts: null,                   note: "Buyer will confirm receipt of your item." },
      { key: "completed",       label: "Trade Completed",          icon: "Done", done: false, ts: null,                   note: "Trade successfully closed." },
    ],
  },
  {
    id: "TRK-003",
    tradeId: "TR-002",
    status: "completed",
    acceptedAt: "2025-04-20T08:00:00Z",
    estimatedCompletion: "2025-04-28T00:00:00Z",
    buyer: {
      name: "Mitu Akter",
      phone: "+880 1855 987654",
      location: "Chittagong, Nasirabad",
      avatar: "",
      rating: 4.2,
    },
    sellerItem: {
      title: "Canon EOS R50 Camera Body",
      category: "Cameras",
      condition: "Good",
      value: 55000,
      trackingNumber: "BD-JX-4401928",
      courier: "Janata Courier",
    },
    buyerItem: {
      title: "DJI Mini 3 Pro Drone",
      category: "Drones",
      condition: "Excellent",
      value: 58000,
      trackingNumber: "BD-SC-9923011",
      courier: "SA Paribahan",
    },
    cashAdjustment: 0,
    cashDirection: null,
    timeline: [
      { key: "accepted",        label: "Trade Accepted",           icon: "Accepted", done: true, ts: "2025-04-20T08:00:00Z", note: "Both parties agreed to the barter." },
      { key: "seller_shipped",  label: "Seller Shipped",           icon: "Item", done: true, ts: "2025-04-21T11:00:00Z", note: "Sent via Janata Courier  -  TRK: BD-JX-4401928" },
      { key: "buyer_shipped",   label: "Buyer Shipped",            icon: "Shipping", done: true, ts: "2025-04-22T09:30:00Z", note: "Buyer sent via SA Paribahan  -  TRK: BD-SC-9923011" },
      { key: "seller_received", label: "Seller Received",          icon: "Received", done: true, ts: "2025-04-25T15:00:00Z", note: "Drone received in perfect condition." },
      { key: "buyer_received",  label: "Buyer Received",           icon: "...", done: true, ts: "2025-04-26T12:00:00Z", note: "Buyer confirmed receipt of camera." },
      { key: "completed",       label: "Trade Completed",          icon: "Done", done: true, ts: "2025-04-26T12:05:00Z", note: "Trade successfully closed! Great exchange." },
    ],
  },
];

const TRACK_STATUS_ORDER = ["accepted", "seller_shipped", "buyer_shipped", "seller_received", "buyer_received", "completed"];

const TrkStatusBadge = ({ status }) => {
  const map = {
    accepted:        { label: "Awaiting Shipment", color: "#b45309", bg: "rgba(245,158,11,0.09)", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
    seller_shipped:  { label: "You Shipped",       color: "#6d28d9", bg: "rgba(109,40,217,0.08)", border: "rgba(109,40,217,0.25)",dot: "#8b5cf6" },
    buyer_shipped:   { label: "Buyer Shipped",     color: "#0369a1", bg: "rgba(3,105,161,0.08)",  border: "rgba(3,105,161,0.25)", dot: "#0ea5e9" },
    seller_received: { label: "Item Received",     color: "#0d7450", bg: "rgba(13,116,80,0.08)",  border: "rgba(13,116,80,0.25)", dot: "#059669" },
    buyer_received:  { label: "Buyer Confirmed",   color: "#1b7d52", bg: "rgba(46,201,126,0.09)", border: "rgba(46,201,126,0.28)",dot: "#2ec97e" },
    completed:       { label: "Completed Done",      color: "#1b7d52", bg: "rgba(46,201,126,0.12)", border: "rgba(46,201,126,0.35)",dot: "#2ec97e" },
  };
  const s = map[status] || map.accepted;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 11px", borderRadius:100, fontSize:11, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }} />{s.label}
    </span>
  );
};

const TradeTrackingPage = () => {
  const [trades, setTrades]       = useState(MOCK_TRACKED_TRADES);
  const [selected, setSelected]   = useState(MOCK_TRACKED_TRADES[0]);
  const [filter, setFilter]       = useState("all");
  const [shipModal, setShipModal] = useState(false);
  const [shipForm, setShipForm]   = useState({ courier: "", tracking: "" });
  const [toast, setToast]         = useState(null);
  const [confirmRecv, setConfirmRecv] = useState(false);

  const fmtD  = (iso) => iso ? new Date(iso).toLocaleDateString("en-BD", { day:"numeric", month:"short", year:"numeric" }) : "-";
  const fmtDT = (iso) => iso ? new Date(iso).toLocaleString("en-BD",  { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : null;
  const fmtBDT = (n)  => `BDT ${new Intl.NumberFormat("en-BD").format(n)}`;

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3400);
  };

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "active",    label: "Active" },
    { key: "completed", label: "Completed" },
  ];

  const filtered = trades.filter(t => {
    if (filter === "active")    return t.status !== "completed";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const progressPct = (status) => {
    const idx = TRACK_STATUS_ORDER.indexOf(status);
    return Math.round(((idx + 1) / TRACK_STATUS_ORDER.length) * 100);
  };

  // Seller marks their item as shipped
  const handleMarkShipped = () => {
    if (!shipForm.courier.trim() || !shipForm.tracking.trim()) return;
    const now = new Date().toISOString();
    setTrades(prev => prev.map(t => {
      if (t.id !== selected.id) return t;
      const updTimeline = t.timeline.map(step =>
        step.key === "seller_shipped"
          ? { ...step, done: true, ts: now, note: `Sent via ${shipForm.courier}  -  TRK: ${shipForm.tracking}` }
          : step
      );
      return { ...t, status: "seller_shipped", sellerItem: { ...t.sellerItem, courier: shipForm.courier, trackingNumber: shipForm.tracking }, timeline: updTimeline };
    }));
    const upd = { ...selected, status: "seller_shipped", sellerItem: { ...selected.sellerItem, courier: shipForm.courier, trackingNumber: shipForm.tracking },
      timeline: selected.timeline.map(s => s.key === "seller_shipped" ? { ...s, done: true, ts: now, note: `Sent via ${shipForm.courier}  -  TRK: ${shipForm.tracking}` } : s)
    };
    setSelected(upd);
    setShipModal(false);
    setShipForm({ courier: "", tracking: "" });
    showToast("Product marked as shipped! Buyer notified.");
  };

  // Seller confirms received buyer's item
  const handleMarkReceived = () => {
    const now = new Date().toISOString();
    const nextStatus = selected.status === "buyer_shipped" ? "seller_received" : selected.status;
    setTrades(prev => prev.map(t => {
      if (t.id !== selected.id) return t;
      const updTimeline = t.timeline.map(step =>
        step.key === "seller_received"
          ? { ...step, done: true, ts: now, note: "You confirmed receipt of the buyer's item." }
          : step
      );
      return { ...t, status: nextStatus, timeline: updTimeline };
    }));
    const updTimeline = selected.timeline.map(s =>
      s.key === "seller_received" ? { ...s, done: true, ts: now, note: "You confirmed receipt of the buyer's item." } : s
    );
    setSelected({ ...selected, status: nextStatus, timeline: updTimeline });
    setConfirmRecv(false);
    showToast("Receipt confirmed! Trade progress updated.");
  };

  // What action can seller take?
  const sellerAction = (trade) => {
    if (!trade) return null;
    if (trade.status === "accepted")        return "ship";
    if (trade.status === "buyer_shipped")   return "receive";
    return null;
  };

  const currentStepIdx = (trade) => TRACK_STATUS_ORDER.indexOf(trade.status);

  return (
    <div style={{ animation:"ord-in 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
      <style>{`
        @keyframes tt-in    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tt-slide { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes tt-pop   { 0%{transform:scale(0.9);opacity:0} 70%{transform:scale(1.04)} 100%{transform:scale(1);opacity:1} }
        @keyframes tt-ov    { from{opacity:0} to{opacity:1} }
        @keyframes tt-prog  { from{width:0} to{width:var(--w)} }
        @keyframes tt-pulse-dot { 0%,100%{box-shadow:0 0 0 0 rgba(46,201,126,0.45)} 50%{box-shadow:0 0 0 8px rgba(46,201,126,0)} }
        @keyframes tt-truck { 0%,100%{transform:translateX(0)} 50%{transform:translateX(4px)} }
        @keyframes tt-spin  { to{transform:rotate(360deg)} }

        .tt-card { background:#fff; border:1.5px solid #f0f2f0; border-radius:18px; padding:18px 20px; cursor:pointer; transition:all 0.22s; position:relative; overflow:hidden; animation:tt-in 0.38s cubic-bezier(0.22,1,0.36,1) both; }
        .tt-card:hover { border-color:rgba(46,201,126,0.38); box-shadow:0 6px 24px rgba(46,201,126,0.09); transform:translateY(-2px); }
        .tt-card.tt-active { border-color:rgba(46,201,126,0.55); box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
        .tt-card::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; border-radius:3px 0 0 3px; background:linear-gradient(to bottom,#2ec97e,#1b7d52); opacity:0; transition:opacity 0.2s; }
        .tt-card.tt-active::before, .tt-card:hover::before { opacity:1; }

        .tt-filter-pill { display:inline-flex; align-items:center; gap:5px; padding:8px 18px; border-radius:100px; border:1.5px solid #e9eceb; background:#fafbfa; font-family:inherit; font-size:12px; font-weight:700; color:#6b7280; cursor:pointer; transition:all 0.18s; white-space:nowrap; }
        .tt-filter-pill.tt-fp-active { border-color:rgba(46,201,126,0.5); background:rgba(46,201,126,0.08); color:#1b7d52; }
        .tt-filter-pill:hover:not(.tt-fp-active) { border-color:#b0b9b5; color:#374151; }

        .tt-prog-bar { height:6px; background:#f0f2f0; border-radius:100px; overflow:hidden; }
        .tt-prog-fill { height:100%; border-radius:100px; background:linear-gradient(to right,#2ec97e,#1b7d52); transition:width 1.2s cubic-bezier(0.22,1,0.36,1); }

        .tt-step { display:flex; align-items:flex-start; gap:16px; padding:14px 0; position:relative; }
        .tt-step:not(:last-child)::after { content:''; position:absolute; left:19px; top:46px; width:2px; bottom:-14px; background:#f0f2f0; z-index:0; }
        .tt-step:not(:last-child).tt-step-done::after { background:linear-gradient(to bottom,#2ec97e,#e9eceb); }
        .tt-step-dot { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; z-index:1; font-size:17px; transition:all 0.4s cubic-bezier(0.22,1,0.36,1); position:relative; }
        .tt-step-dot.tt-dot-done    { background:linear-gradient(135deg,#2ec97e,#1b7d52); box-shadow:0 4px 14px rgba(46,201,126,0.35); }
        .tt-step-dot.tt-dot-active  { background:#fff; border:2.5px solid #2ec97e; box-shadow:0 0 0 6px rgba(46,201,126,0.1); animation:tt-pulse-dot 2s ease-in-out infinite; }
        .tt-step-dot.tt-dot-waiting { background:#f3f5f2; border:2px solid #e9eceb; }
        .tt-step-dot.tt-dot-active::after { content:''; position:absolute; inset:-5px; border-radius:50%; border:2px solid rgba(46,201,126,0.22); }

        .tt-ship-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:13px; border:none; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow:0 4px 16px rgba(13,51,34,0.24); }
        .tt-ship-btn:hover { opacity:0.88; transform:translateY(-1px); box-shadow:0 6px 22px rgba(13,51,34,0.32); }
        .tt-recv-btn { display:inline-flex; align-items:center; gap:8px; padding:12px 24px; border-radius:13px; border:1.5px solid rgba(46,201,126,0.45); background:rgba(46,201,126,0.07); color:#1b7d52; font-family:inherit; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s; }
        .tt-recv-btn:hover { background:rgba(46,201,126,0.14); border-color:rgba(46,201,126,0.65); }

        .tt-input { width:100%; border:1.5px solid #e9eceb; background:#fafbfa; border-radius:12px; padding:12px 14px; font-family:inherit; font-size:14px; outline:none; color:#111827; transition:border-color 0.2s,box-shadow 0.2s; }
        .tt-input:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,0.1); background:#fff; }
        .tt-input::placeholder { color:#b0b9b5; }

        .tt-detail { background:#fff; border-radius:20px; border:1px solid #f0f2f0; overflow:hidden; animation:tt-slide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .tt-overlay { position:fixed; inset:0; z-index:800; background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; padding:24px; animation:tt-ov 0.2s; }
        .tt-modal { background:#fff; border-radius:24px; padding:36px 32px; max-width:440px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,0.22); animation:tt-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }

        .tt-trk-num { font-family:monospace; font-size:13px; background:#f3f5f2; border:1px solid #e9eceb; border-radius:8px; padding:3px 10px; color:#1b7d52; font-weight:700; letter-spacing:0.05em; }

        @media(max-width:900px) { .tt-layout { grid-template-columns:1fr !important; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:toast.ok?"#0d3322":"#dc2626", color:"#fff", padding:"12px 24px", borderRadius:100, fontSize:13, fontWeight:600, boxShadow:"0 6px 28px rgba(0,0,0,0.2)", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", pointerEvents:"none", animation:"tt-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
          {toast.ok ? "OK" : "X"} {toast.msg}
        </div>
      )}

      {/* Ship Modal */}
      {shipModal && (
        <div className="tt-overlay" onClick={() => setShipModal(false)}>
          <div className="tt-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
              <div style={{ width:52, height:52, borderRadius:15, background:"linear-gradient(135deg,#0d3322,#1b7d52)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>Item</div>
              <div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0d1f16" }}>Mark as Shipped</h3>
                <p style={{ fontSize:12, color:"#9ca3af", marginTop:3 }}>Enter courier and tracking details</p>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:7 }}>Courier Service</label>
                <select className="tt-input" value={shipForm.courier} onChange={e => setShipForm(f=>({...f,courier:e.target.value}))} style={{ appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", backgroundSize:"16px" }}>
                  <option value="">Select courier...</option>
                  {["Sundarban Courier","SA Paribahan","Janata Courier","Karnaphuli Courier","Redx","Pathao Courier","Paperfly","eCourier"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:"0.05em", display:"block", marginBottom:7 }}>Tracking Number</label>
                <input className="tt-input" value={shipForm.tracking} onChange={e => setShipForm(f=>({...f,tracking:e.target.value}))} placeholder="e.g. BD-SC-7821034" />
              </div>
              <div style={{ background:"rgba(46,201,126,0.06)", border:"1px solid rgba(46,201,126,0.2)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"flex-start", gap:10 }}>
                <span style={{ fontSize:16 }}>Info</span>
                <p style={{ fontSize:12, color:"#374151", lineHeight:1.65 }}>Once you mark as shipped, the buyer will be notified and can begin tracking. Make sure the details are accurate.</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShipModal(false)} style={{ flex:1, padding:"13px", borderRadius:12, border:"1.5px solid #e5e7eb", background:"none", color:"#6b7280", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Cancel</button>
              <button onClick={handleMarkShipped} disabled={!shipForm.courier||!shipForm.tracking} className="tt-ship-btn" style={{ flex:1.5, justifyContent:"center", opacity:(!shipForm.courier||!shipForm.tracking)?0.45:1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Confirm Shipped
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Received Modal */}
      {confirmRecv && (
        <div className="tt-overlay" onClick={() => setConfirmRecv(false)}>
          <div className="tt-modal" style={{ textAlign:"center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:68, height:68, borderRadius:"50%", background:"rgba(46,201,126,0.1)", border:"2px solid rgba(46,201,126,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 20px" }}>Received</div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0d1f16", marginBottom:10 }}>Confirm Item Received?</h3>
            <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, marginBottom:28, maxWidth:320, margin:"0 auto 28px" }}>
              Please confirm you've received <strong style={{ color:"#0d1f16" }}>{selected?.buyerItem.title}</strong> from the buyer. This will update the trade progress.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmRecv(false)} style={{ flex:1, padding:"13px", borderRadius:12, border:"1.5px solid #e5e7eb", background:"none", color:"#6b7280", fontSize:14, fontWeight:600, fontFamily:"inherit", cursor:"pointer" }}>Cancel</button>
              <button onClick={handleMarkReceived} className="tt-recv-btn" style={{ flex:1.4, justifyContent:"center" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="20 6 9 17 4 12"/></svg>
                Yes, Received!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom:22 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#0d3322,#1b7d52)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width:18, height:18, animation:"tt-truck 1.8s ease-in-out infinite" }}>
              <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0d1f16", lineHeight:1.1 }}>Trade Tracking</h2>
            <p style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Manage barter delivery and completion</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"Active Trades",    val:trades.filter(t=>t.status!=="completed").length, color:"#b45309", bg:"rgba(245,158,11,0.07)", border:"rgba(245,158,11,0.25)", dot:"#f59e0b" },
          { label:"Awaiting Receipt", val:trades.filter(t=>t.status==="buyer_shipped").length, color:"#0369a1", bg:"rgba(3,105,161,0.07)", border:"rgba(3,105,161,0.22)", dot:"#0ea5e9" },
          { label:"Completed",        val:trades.filter(t=>t.status==="completed").length, color:"#1b7d52", bg:"rgba(46,201,126,0.07)", border:"rgba(46,201,126,0.25)", dot:"#2ec97e" },
        ].map(k => (
          <div key={k.label} style={{ background:k.bg, border:`1px solid ${k.border}`, borderRadius:14, padding:"14px 16px", textAlign:"center" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:k.dot, margin:"0 auto 8px" }} />
            <p style={{ fontSize:24, fontWeight:800, color:k.color, lineHeight:1, marginBottom:4 }}>{k.val}</p>
            <p style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em" }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {FILTERS.map(f => (
          <button key={f.key} className={`tt-filter-pill${filter===f.key?" tt-fp-active":""}`} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      {/* Main split layout */}
      <div className="tt-layout" style={{ display:"grid", gridTemplateColumns:selected?"1fr 440px":"1fr", gap:16, alignItems:"start" }}>

        {/* Trade list */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {filtered.length === 0 ? (
            <div style={{ background:"#fff", border:"1.5px solid #f0f2f0", borderRadius:18, padding:"52px 24px", textAlign:"center" }}>
              <div style={{ fontSize:44, marginBottom:14 }}>Shipping</div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0d1f16", marginBottom:6 }}>No trades found</p>
              <p style={{ fontSize:13, color:"#9ca3af" }}>Accept trade requests to start tracking deliveries.</p>
            </div>
          ) : filtered.map((trade, idx) => {
            const pct = progressPct(trade.status);
            const act = sellerAction(trade);
            return (
              <div key={trade.id} className={`tt-card${selected?.id===trade.id?" tt-active":""}`} style={{ animationDelay:`${idx*0.07}s` }} onClick={() => setSelected(trade)}>
                {/* Top */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:14, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:"linear-gradient(135deg,#0d3322,#1b7d52)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>
                      {trade.buyer.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"#0d1f16" }}>{trade.buyer.name}</p>
                      <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{trade.buyer.location}  -  Accepted {fmtD(trade.acceptedAt)}</p>
                    </div>
                  </div>
                  <TrkStatusBadge status={trade.status} />
                </div>

                {/* Items mini */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={{ flex:1, background:"rgba(46,201,126,0.05)", border:"1px solid rgba(46,201,126,0.18)", borderRadius:11, padding:"9px 12px" }}>
                    <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:"#1b7d52", marginBottom:3 }}>Your Item</p>
                    <p style={{ fontSize:12, fontWeight:700, color:"#0d1f16", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{trade.sellerItem.title}</p>
                    <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{fmtBDT(trade.sellerItem.value)}</p>
                  </div>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#0d3322,#1b7d52)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={11} height={11}><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                  </div>
                  <div style={{ flex:1, background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:11, padding:"9px 12px" }}>
                    <p style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:"#3b82f6", marginBottom:3 }}>Buyer's Item</p>
                    <p style={{ fontSize:12, fontWeight:700, color:"#0d1f16", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{trade.buyerItem.title}</p>
                    <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{fmtBDT(trade.buyerItem.value)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.06em" }}>Trade Progress</span>
                    <span style={{ fontSize:11, fontWeight:800, color: pct===100?"#1b7d52":"#374151" }}>{pct}%</span>
                  </div>
                  <div className="tt-prog-bar">
                    <div className="tt-prog-fill" style={{ width:`${pct}%` }} />
                  </div>
                </div>

                {/* Quick action */}
                {act && (
                  <div style={{ marginTop:10 }} onClick={e => e.stopPropagation()}>
                    {act === "ship" ? (
                      <button className="tt-ship-btn" style={{ width:"100%", justifyContent:"center" }}
                        onClick={() => { setSelected(trade); setShipModal(true); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        Mark My Product Shipped
                      </button>
                    ) : (
                      <button className="tt-recv-btn" style={{ width:"100%", justifyContent:"center" }}
                        onClick={() => { setSelected(trade); setConfirmRecv(true); }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><polyline points="20 6 9 17 4 12"/></svg>
                        Confirm Item Received
                      </button>
                    )}
                  </div>
                )}

                {trade.status === "completed" && (
                  <div style={{ marginTop:10, background:"rgba(46,201,126,0.07)", border:"1px solid rgba(46,201,126,0.25)", borderRadius:10, padding:"9px 12px", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>Done</span>
                    <span style={{ fontSize:12, fontWeight:700, color:"#1b7d52" }}>Trade successfully completed!</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="tt-detail">
            {/* Header */}
            <div style={{ padding:"18px 22px", borderBottom:"1px solid #f0f2f0", display:"flex", alignItems:"center", justifyContent:"space-between", background:"linear-gradient(135deg,#fafbfa,#f7f9f7)" }}>
              <div>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, color:"#0d1f16" }}>Trade Details</p>
                <p style={{ fontSize:11, color:"#9ca3af", marginTop:2, fontFamily:"monospace" }}>{selected.id}  -  Trade #{selected.tradeId}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <TrkStatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} style={{ width:30, height:30, borderRadius:"50%", border:"1px solid #e9eceb", background:"#fff", color:"#374151", cursor:"pointer", fontSize:18, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>-</button>
              </div>
            </div>

            <div style={{ padding:22, display:"flex", flexDirection:"column", gap:22, maxHeight:"calc(100vh - 240px)", overflowY:"auto" }}>

              {/* Progress bar */}
              <div style={{ background:"rgba(46,201,126,0.05)", border:"1px solid rgba(46,201,126,0.18)", borderRadius:14, padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#374151" }}>Overall Progress</p>
                  <p style={{ fontSize:14, fontWeight:800, color: progressPct(selected.status)===100?"#1b7d52":"#0d1f16" }}>{progressPct(selected.status)}%</p>
                </div>
                <div className="tt-prog-bar" style={{ height:8 }}>
                  <div className="tt-prog-fill" style={{ width:`${progressPct(selected.status)}%` }} />
                </div>
                <p style={{ fontSize:11, color:"#9ca3af", marginTop:8 }}>
                  Step {Math.min(currentStepIdx(selected)+1, TRACK_STATUS_ORDER.length)} of {TRACK_STATUS_ORDER.length}  -  Est. completion: {fmtD(selected.estimatedCompletion)}
                </p>
              </div>

              {/* Buyer info */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#b0b9b5", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ flex:1, height:1, background:"#f0f2f0" }} />Buyer Info<span style={{ flex:1, height:1, background:"#f0f2f0" }} />
                </p>
                <div style={{ background:"#fafbfa", border:"1px solid #f0f2f0", borderRadius:14, padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                    <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#0d3322,#1b7d52)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, color:"#fff", flexShrink:0 }}>{selected.buyer.name[0]}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:"#0d1f16" }}>{selected.buyer.name}</p>
                      <p style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>... {selected.buyer.rating}  -  {selected.buyer.location}</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {[
                      { icon:"Phone", label:"Phone",    val:selected.buyer.phone },
                      { icon:"Location", label:"Location", val:selected.buyer.location },
                    ].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:13 }}>{r.icon}</span>
                        <span style={{ fontSize:11, color:"#9ca3af", minWidth:62 }}>{r.label}</span>
                        <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping info */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#b0b9b5", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ flex:1, height:1, background:"#f0f2f0" }} />Shipping Info<span style={{ flex:1, height:1, background:"#f0f2f0" }} />
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {/* Your shipment */}
                  <div style={{ background:"rgba(46,201,126,0.05)", border:"1px solid rgba(46,201,126,0.2)", borderRadius:13, padding:"13px 15px" }}>
                    <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:"#1b7d52", marginBottom:8 }}>Item Your Shipment</p>
                    <p style={{ fontSize:13, fontWeight:700, color:"#0d1f16", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.sellerItem.title}</p>
                    {selected.sellerItem.trackingNumber ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:11, color:"#9ca3af", minWidth:56 }}>Courier</span>
                          <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{selected.sellerItem.courier}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:11, color:"#9ca3af", minWidth:56 }}>Tracking</span>
                          <span className="tt-trk-num">{selected.sellerItem.trackingNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize:12, color:"#9ca3af", fontStyle:"italic" }}>Not yet shipped</p>
                    )}
                  </div>
                  {/* Buyer shipment */}
                  <div style={{ background:"rgba(59,130,246,0.05)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:13, padding:"13px 15px" }}>
                    <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.08em", color:"#3b82f6", marginBottom:8 }}>Shipping Buyer's Shipment</p>
                    <p style={{ fontSize:13, fontWeight:700, color:"#0d1f16", marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.buyerItem.title}</p>
                    {selected.buyerItem.trackingNumber ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:11, color:"#9ca3af", minWidth:56 }}>Courier</span>
                          <span style={{ fontSize:12, fontWeight:600, color:"#374151" }}>{selected.buyerItem.courier}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:11, color:"#9ca3af", minWidth:56 }}>Tracking</span>
                          <span className="tt-trk-num">{selected.buyerItem.trackingNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize:12, color:"#9ca3af", fontStyle:"italic" }}>Buyer has not shipped yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#b0b9b5", marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ flex:1, height:1, background:"#f0f2f0" }} />Delivery Timeline<span style={{ flex:1, height:1, background:"#f0f2f0" }} />
                </p>
                <div style={{ paddingTop:10 }}>
                  {selected.timeline.map((step, i) => {
                    const isActive = TRACK_STATUS_ORDER.indexOf(selected.status) === i;
                    const dotCls   = step.done ? "tt-dot-done" : isActive ? "tt-dot-active" : "tt-dot-waiting";
                    const stepCls  = step.done ? "tt-step-done" : "";
                    return (
                      <div key={step.key} className={`tt-step ${stepCls}`}>
                        <div className={`tt-step-dot ${dotCls}`}>
                          {step.done
                            ? <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><polyline points="20 6 9 17 4 12"/></svg>
                            : isActive
                              ? <span style={{ fontSize:15 }}>{step.icon}</span>
                              : <span style={{ fontSize:14, opacity:0.45 }}>{step.icon}</span>
                          }
                        </div>
                        <div style={{ flex:1, paddingTop:8 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, marginBottom:3 }}>
                            <p style={{ fontSize:13, fontWeight:700, color: step.done ? "#0d1f16" : isActive ? "#1b7d52" : "#9ca3af" }}>{step.label}</p>
                            {step.ts && <span style={{ fontSize:10, color:"#b0b9b5", whiteSpace:"nowrap", fontWeight:600 }}>{fmtDT(step.ts)}</span>}
                          </div>
                          <p style={{ fontSize:11, color: step.done ? "#6b7280" : isActive ? "#374151" : "#b0b9b5", lineHeight:1.55 }}>{step.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              {sellerAction(selected) && (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.1em", color:"#b0b9b5", display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ flex:1, height:1, background:"#f0f2f0" }} />Your Next Action<span style={{ flex:1, height:1, background:"#f0f2f0" }} />
                  </p>
                  {sellerAction(selected) === "ship" ? (
                    <div style={{ background:"rgba(13,51,34,0.04)", border:"1px solid rgba(13,51,34,0.12)", borderRadius:14, padding:"16px 18px" }}>
                      <p style={{ fontSize:12, color:"#374151", marginBottom:14, lineHeight:1.65 }}>
                        Ship your <strong>{selected.sellerItem.title}</strong> to the buyer and enter the courier tracking details.
                      </p>
                      <button className="tt-ship-btn" style={{ width:"100%", justifyContent:"center" }} onClick={() => setShipModal(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                        Mark My Product as Shipped
                      </button>
                    </div>
                  ) : (
                    <div style={{ background:"rgba(46,201,126,0.05)", border:"1px solid rgba(46,201,126,0.22)", borderRadius:14, padding:"16px 18px" }}>
                      <p style={{ fontSize:12, color:"#374151", marginBottom:14, lineHeight:1.65 }}>
                        Has the buyer's <strong>{selected.buyerItem.title}</strong> arrived? Confirm receipt to advance the trade.
                      </p>
                      <button className="tt-recv-btn" style={{ width:"100%", justifyContent:"center" }} onClick={() => setConfirmRecv(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={15} height={15}><polyline points="20 6 9 17 4 12"/></svg>
                        Confirm Item Received
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selected.status === "completed" && (
                <div style={{ background:"linear-gradient(135deg,rgba(46,201,126,0.08),rgba(27,125,82,0.05))", border:"1.5px solid rgba(46,201,126,0.3)", borderRadius:16, padding:"20px 18px", textAlign:"center" }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>Done</div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, color:"#0d3322", marginBottom:6 }}>Trade Complete!</p>
                  <p style={{ fontSize:12, color:"#7a8c82", lineHeight:1.65 }}>Both parties have confirmed receipt. This barter trade has been successfully closed.</p>
                  <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(46,201,126,0.08)", borderRadius:10, display:"inline-flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#1b7d52" }}>Completed {fmtD(selected.timeline.find(s=>s.key==="completed")?.ts)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --------------------------------------
   SELLER HUB SIDEBAR
-------------------------------------- */
const SellerHubSidebar = ({ activePanel, onSelect, pendingOrders, pendingTrades }) => {
  const HUB_NAV = [
    {
      key: "orders",
      label: "Incoming Orders",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
      badge: pendingOrders,
    },
    {
      key: "trades",
      label: "Trade Requests",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/>
        </svg>
      ),
      badge: pendingTrades,
    },
    {
      key: "tracking",
      label: "Trade Tracking",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
      badge: 0,
    },
  ];

  const ACCOUNT_NAV = [
    {
      key: "profile",
      label: "My Profile",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "saved",
      label: "Saved Items",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "mylistings",
      label: "My Listings",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      badge: 0,
    },
    {
      key: "settings",
      label: "Settings",
      icon: (active) => (
        <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
      ),
      badge: 0,
    },
  ];

  const renderNav = (items) => items.map(item => {
    const active = activePanel === item.key;
    return (
      <button key={item.key} className={`sh-sb-item${active ? " active" : ""}`} onClick={() => onSelect(item.key)}>
        <div className="sh-sb-icon">{item.icon(active)}</div>
        <span className="sh-sb-label">{item.label}</span>
        {item.badge > 0 && <span className="sh-sb-badge">{item.badge}</span>}
      </button>
    );
  });

  return (
    <div className="sh-sidebar">
      <div className="sh-sb-header">
        <p className="sh-sb-title">Seller Hub</p>
      </div>
      <nav className="sh-sb-nav">
        {renderNav(HUB_NAV)}
      </nav>
      <div className="sh-sb-divider" />
      <div className="sh-sb-header" style={{ paddingTop: 8, paddingBottom: 6 }}>
        <p className="sh-sb-title">My Account</p>
      </div>
      <nav className="sh-sb-nav">
        {renderNav(ACCOUNT_NAV)}
      </nav>
    </div>
  );
};

/* --------------------------------------
   LISTINGS TAB
-------------------------------------- */
const ListingsTab = ({ listings = [], view = "all" }) => {
  const data = view === "saved"
    ? listings
    : view === "sold"
      ? listings.filter(l => l.status === "sold")
      : listings;
  const title = view === "saved" ? "Saved Items" : view === "sold" ? "Sold Items" : "My Listings";
  const empty = view === "saved" ? "No saved items yet." : view === "sold" ? "No sold items yet." : "No listings yet.";

  return (
  <div>
    <div style={{ marginBottom: 16 }}>
      <p className="up-section-title" style={{ margin: 0 }}>{title}</p>
    </div>
    {data.length === 0 && <p style={{ fontSize: 13, color: "#7a8c82" }}>{empty}</p>}
    {data.map(l => (
      <div key={l.id} className="up-listing-card">
        <div className="up-listing-img">{l.image ? <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : l.emoji}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1f16", marginBottom: 2 }}>{l.title}</p>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>{l.cat}  -  {l.views} views  -  {l.saves} saves</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0d1f16", marginBottom: 4 }}>{l.price}</p>
          <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: l.status === "active" ? "rgba(46,201,126,0.12)" : l.status === "sold" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
            color: l.status === "active" ? "#1b7d52" : l.status === "sold" ? "#dc2626" : "#92400e" }}>
            {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
          </span>
        </div>
      </div>
    ))}
  </div>
  );
};

/* --------------------------------------
   ACTIVITY TAB
-------------------------------------- */
const ActivityTab = () => (
  <div>
    <p className="up-section-title">Recent Activity</p>
    <p style={{ fontSize: 13, color: "#7a8c82" }}>No activity yet.</p>
    <p className="up-section-title" style={{ marginTop: 24 }}>Reviews</p>
    <p style={{ fontSize: 13, color: "#7a8c82" }}>No reviews yet.</p>
  </div>
);

/* --------------------------------------
   NOTIFICATION BELL
-------------------------------------- */
const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sentReplies, setSentReplies] = useState({});
  const unreadCount = notifications.filter(n => !n.read).length;
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const selectMessage = (id) => {
    markRead(id);
    setActiveReplyId(id);
  };
  const sendReply = (id) => {
    const text = (replyDrafts[id] || "").trim();
    if (!text) return;
    setSentReplies(rs => ({ ...rs, [id]: [...(rs[id] || []), text] }));
    setReplyDrafts(ds => ({ ...ds, [id]: "" }));
    setActiveReplyId(null);
  };
  const openAllMessages = (e) => {
    e.stopPropagation();
    setShowAllMessages(true);
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };
  const renderMessages = () => notifications.map(n => (
    <div key={n.id} className={`up-notif-item${!n.read ? " unread" : ""}`} onClick={() => selectMessage(n.id)}>
      <div className="up-notif-avatar">{n.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0d1f16" }}>{n.from}</p>
          <span style={{ fontSize: 10, color: "#b0b9b5", flexShrink: 0, marginLeft: 8 }}>{n.time}</span>
        </div>
        <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.45 }}>{n.text}</p>
        {(sentReplies[n.id] || []).map((reply, index) => (
          <div key={index} className="up-sent-reply">You: {reply}</div>
        ))}
        {activeReplyId === n.id ? (
          <div className="up-reply-box" onClick={e => e.stopPropagation()}>
            <textarea
              className="up-reply-input"
              value={replyDrafts[n.id] || ""}
              onChange={e => setReplyDrafts(ds => ({ ...ds, [n.id]: e.target.value }))}
              placeholder={`Reply to ${n.from}...`}
              autoFocus
            />
            <div className="up-reply-actions">
              <button type="button" className="up-reply-cancel" onClick={() => setActiveReplyId(null)}>Cancel</button>
              <button type="button" className="up-reply-send" disabled={!(replyDrafts[n.id] || "").trim()} onClick={() => sendReply(n.id)}>Send</button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); selectMessage(n.id); }}
            style={{ marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#1b7d52", fontFamily: "inherit" }}
          >
            Reply
          </button>
        )}
      </div>
      {!n.read && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2ec97e", flexShrink: 0, marginTop: 4 }} />}
    </div>
  ));

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        className={`up-bell-btn${unreadCount > 0 ? " has-unread" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && <span className="up-bell-dot" />}
      </button>

      {open && (
        <div className="up-notif-panel">
          <div className="up-notif-header">
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#0d1f16" }}>Messages</p>
              {unreadCount > 0 && <p style={{ fontSize: 11, color: "#2ec97e", fontWeight: 600, marginTop: 1 }}>{unreadCount} unread</p>}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#7a8c82", fontFamily: "inherit" }}>
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {renderMessages()}
          </div>
          <div style={{ padding: "12px 18px", borderTop: "1px solid #f0f2f0", textAlign: "center" }}>
            <button onClick={openAllMessages} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1b7d52", fontFamily: "inherit" }}>
              View all messages {"->"}
            </button>
          </div>
        </div>
      )}

      {showAllMessages && (
        <div className="up-messages-backdrop" onClick={() => setShowAllMessages(false)}>
          <div className="up-messages-modal" onClick={e => e.stopPropagation()}>
            <div className="up-messages-titlebar">
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: "#0d1f16" }}>All Messages</p>
                <p style={{ fontSize: 12, color: "#7a8c82", marginTop: 3 }}>{notifications.length} conversations</p>
              </div>
              <button type="button" className="up-messages-close" onClick={() => setShowAllMessages(false)} aria-label="Close messages">-</button>
            </div>
            <div className="up-messages-list">
              {renderMessages()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --------------------------------------
   MAIN PROFILE PAGE
-------------------------------------- */
/* --------------------------------------
   ROLE HELPERS  (localStorage-backed)
-------------------------------------- */
const getUserRole = (currentUser) => {
  if (currentUser?.role === "seller" || currentUser?.role === "buyer") {
    return currentUser.role;
  }

  try {
    return localStorage.getItem("pb_user_role") || "buyer";
  } catch {
    return "buyer";
  }
};

/* -- Seller: Add Product Banner -- */
const AddProductBanner = ({ onAddProduct }) => (
  <div style={{
    background: "linear-gradient(135deg,#0d3322 0%,#1a5c3a 55%,#2ec97e 140%)",
    borderRadius: 18, padding: "24px 28px", marginBottom: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
    boxShadow: "0 4px 24px rgba(46,201,126,0.18)", border: "1px solid rgba(46,201,126,0.25)",
    animation: "up-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Seller Dashboard</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 3 }}>Manage your listings and track sales performance</p>
      </div>
    </div>
    <button
      onClick={onAddProduct}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#fff", color: "#0d3322", border: "none",
        borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", flexShrink: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        transition: "opacity 0.2s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Add Product
    </button>
  </div>
);

/* -- Seller: Quick Stats Strip -- */
const SellerStatsStrip = ({ listings }) => {
  const active = listings.filter(l => l.status === "active").length;
  const sold   = listings.filter(l => l.status === "sold").length;
  const pending = listings.filter(l => l.status === "pending").length;
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", animation: "up-fadeUp 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both", opacity: 0 }}>
      {[
        { label: "Active", value: active, color: "#2ec97e", bg: "rgba(46,201,126,0.08)", border: "rgba(46,201,126,0.25)" },
        { label: "Sold",   value: sold,   color: "#1b7d52", bg: "rgba(27,125,82,0.08)",  border: "rgba(27,125,82,0.25)"  },
        { label: "Pending",value: pending,color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
        { label: "Total",  value: listings.length, color: "#6b7280", bg: "#f7f8f6", border: "#e9eceb" },
      ].map(s => (
        <div key={s.label} style={{
          flex: "1 1 80px", background: s.bg, border: `1px solid ${s.border}`,
          borderRadius: 14, padding: "14px 16px", textAlign: "center",
        }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{s.label}</p>
        </div>
      ))}
    </div>
  );
};

/* -- Buyer: Browse Products CTA -- */
const BuyerBrowseBanner = ({ onBrowse }) => (
  <div style={{
    background: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)",
    border: "1px solid rgba(46,201,126,0.25)", borderRadius: 18,
    padding: "22px 26px", marginBottom: 20,
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
    animation: "up-fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/>
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "#0d3322", lineHeight: 1.2 }}>Discover Products</p>
        <p style={{ fontSize: 12, color: "#5a7a6a", marginTop: 3 }}>Browse verified listings from trusted sellers near you</p>
      </div>
    </div>
    <button
      onClick={onBrowse}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff",
        border: "none", borderRadius: 12, padding: "11px 20px",
        fontSize: 14, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", flexShrink: 0,
        boxShadow: "0 4px 16px rgba(13,51,34,0.2)", transition: "opacity 0.2s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
    >
      Browse Marketplace
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  </div>
);

const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, token, login, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const fileRef = useRef(null);

  // -- Role-based rendering ----------------------------------------------
  const userRole = getUserRole(authUser || user); // "seller" | "buyer"
  const isSeller = userRole === "seller";

  const handleLogout = () => {
    logout();
    localStorage.removeItem("pb_jwt");
    localStorage.removeItem("pb_user_role");
    setUser(null);
    navigate("/");
  };

  const showLoginModal = () => { setLoginModal(true); };

  const updateProfile = async (payload) => {
    if (!token) {
      throw new Error("You must be signed in to update your profile.");
    }

    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.msg || "Unable to update profile.");
    }

    const nextUser = mapProfileUser(data.user, userListings, user || authUser);
    setUser(nextUser);
    login(token, { ...data.user, id: data.user?._id || data.user?.id });
    return nextUser;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await updateProfile({ profilePicture: ev.target.result });
      } catch (err) {
        setProfileError(err.message || "Unable to update profile picture.");
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    const getTokenUserId = (value) => {
      try {
        const payload = JSON.parse(atob(value.split(".")[1]));
        return payload.id || payload._id || "";
      } catch {
        return "";
      }
    };

    const userId = authUser?.id || authUser?._id || getTokenUserId(token);
    if (!userId) {
      setProfileLoading(false);
      setProfileError("Unable to identify the signed-in user.");
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      try {
        const [profileResponse, listingsResponse, savedResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${userId}`),
          fetch(`${API_BASE_URL}/api/listings/mine`, {
            headers: { "x-auth-token": token },
          }),
          fetch(`${API_BASE_URL}/api/listings/saved`, {
            headers: { "x-auth-token": token },
          }),
        ]);

        const profileData = await profileResponse.json().catch(() => ({}));
        const listingsData = await listingsResponse.json().catch(() => []);
        const savedData = await savedResponse.json().catch(() => []);

        if (!profileResponse.ok) throw new Error(profileData.msg || "Unable to load profile.");
        if (!listingsResponse.ok) throw new Error(listingsData.msg || "Unable to load listings.");
        if (!savedResponse.ok) throw new Error(savedData.msg || "Unable to load saved listings.");

        const normalizedListings = Array.isArray(listingsData)
          ? listingsData.map(mapListingForProfile)
          : [];
        const normalizedSavedListings = Array.isArray(savedData)
          ? savedData.map(mapListingForProfile)
          : [];
        const normalizedUser = mapProfileUser({
          ...profileData,
          savedItems: normalizedSavedListings.length,
        }, normalizedListings, authUser);

        if (!cancelled) {
          setUserListings(normalizedListings);
          setSavedListings(normalizedSavedListings);
          setUser(normalizedUser);
        }
      } catch (err) {
        if (!cancelled) setProfileError(err.message || "Unable to load profile.");
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [authUser, navigate, token]);

  // Seller hub panel state (sidebar navigation)
  const [sellerPanel, setSellerPanel] = useState("orders");
  // Buyer hub panel state
  const [buyerPanel, setBuyerPanel]   = useState("orders");
  const pendingOrderCount = 0;
  const pendingTradeCount = 0;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* LOGIN-FIRST MODAL */}
      {loginModal && (
        <div
          onClick={() => setLoginModal(false)}
          style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 420, width: "100%", textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", animation: "up-pop 0.38s cubic-bezier(0.34,1.56,0.64,1) forwards" }}
          >
            <div style={{ width: 68, height: 68, borderRadius: "50%", background: "linear-gradient(135deg,rgba(46,201,126,0.12),rgba(27,125,82,0.08))", border: "2px dashed rgba(46,201,126,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2ec97e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0d1f16", marginBottom: 10 }}>Log in first</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, marginBottom: 28 }}>
              You need to be signed in to view your profile. Please sign in to continue - or create a free account if you're new here.
            </p>
            <button
              onClick={() => { setLoginModal(false); navigate("/signin"); }}
              style={{ width: "100%", padding: "14px 24px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(13,51,34,0.3)", transition: "opacity 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
              Sign In
            </button>
            <button
              onClick={() => setLoginModal(false)}
              style={{ marginTop: 12, width: "100%", padding: "11px", borderRadius: 13, border: "1.5px solid #e5e7eb", cursor: "pointer", background: "none", color: "#6b7280", fontSize: 14, fontWeight: 600, fontFamily: "inherit" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="up-nav">
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>P</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>Proti-Binimoy</span>
        </Link>
        <div className="up-nav-links">
          <Link to="/"            className="up-nav-link">Home</Link>
          <Link to="/marketplace" className="up-nav-link">Browse</Link>
          {isSeller && <Link to="/post-item" className="up-nav-link">Sell</Link>}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Avatar is display-only when logged in - user is already on their profile */}
              <div
                title={user.name}
                style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)", flexShrink: 0 }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : user.name?.[0]?.toUpperCase()}
              </div>
              <button onClick={handleLogout} className="up-btn-danger" style={{ padding: "7px 14px", fontSize: 13, borderRadius: 100 }}>
                <LogoutIcon /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Ghost avatar - tapping shows "please login first" modal */}
              <div
                onClick={showLoginModal}
                title="Tap to see login prompt"
                style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "2px dashed rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.16)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <button onClick={() => navigate("/signin")} className="up-btn-primary" style={{ padding: "8px 18px", fontSize: 13, borderRadius: 100 }}>
                Sign In
              </button>
            </div>
          )}
        </div>
        <button className="up-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`up-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/"            className="up-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/marketplace" className="up-mobile-link" onClick={() => setMenuOpen(false)}>Browse</Link>
        {isSeller && <Link to="/post-item" className="up-mobile-link" onClick={() => setMenuOpen(false)}>Sell</Link>}
        {user && <button onClick={handleLogout} className="up-mobile-link" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left", color: "#ef4444", fontWeight: 600, fontSize: 17 }}>Sign Out</button>}
      </div>

      {profileLoading && (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#08231a 0%,#0f3d28 55%,#1b7d52 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>
          <div style={{ color: "#fff", display: "flex", alignItems: "center", gap: 12, fontSize: 15 }}>
            <Spinner /> Loading profile...
          </div>
        </div>
      )}

      {!profileLoading && !user && (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#08231a 0%,#0f3d28 55%,#1b7d52 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
          <div style={{ position: "absolute", top: 0, left: "20%", width: 420, height: 420, background: "radial-gradient(circle,rgba(46,201,126,0.15) 0%,transparent 65%)", borderRadius: "50%" }} />
          <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 480 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "2px dashed rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", animation: "up-pulse 2.4s ease-in-out infinite" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,201,126,0.12)", border: "1px solid rgba(46,201,126,0.3)", borderRadius: 100, padding: "7px 16px", marginBottom: 20 }}>
              <div style={{ width: 7, height: 7, background: "#2ec97e", borderRadius: "50%", animation: "up-shimmer 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#2ec97e", letterSpacing: "0.05em" }}>Authentication Required</span>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 16 }}>
              Sign in to view<br /><em style={{ fontStyle: "italic", color: "#2ec97e" }}>your profile</em>
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 36, fontWeight: 300 }}>
              {profileError || "Your profile, listings, and account settings are only visible after signing in. Join thousands of verified members on Proti-Binimoy."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => navigate("/signin")}
                style={{ padding: "15px 32px", borderRadius: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "inherit", boxShadow: "0 8px 28px rgba(46,201,126,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "opacity 0.2s, transform 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                Sign In to Your Account
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{ padding: "14px 32px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: 15, fontWeight: 600, fontFamily: "inherit", backdropFilter: "blur(8px)", transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              >
                New here? Create a free account {"->"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!profileLoading && user && (
        <div className="up-page">
          {/* COVER */}
          <div className="up-cover">
            <div className="up-cover-pattern" />
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `linear-gradient(135deg, rgba(8,35,26,0.72), rgba(15,61,40,0.62) 55%, rgba(27,125,82,0.45) 100%), url(${webBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundBlendMode: "overlay",
            }} />
            <div style={{ position: "absolute", top: -60, right: -40, width: 300, height: 300, background: "radial-gradient(circle,rgba(46,201,126,0.2),transparent 65%)", borderRadius: "50%" }} />
          </div>

          <div className="up-main">
            {/* IDENTITY BAR */}
            <div className="up-identity-bar">
              {/* Avatar */}
              <div className="up-avatar-wrap" style={{ marginTop: -52, flexShrink: 0 }}>
                {user.verified && <div className="up-verify-ring" />}
                <div className="up-avatar" onClick={() => fileRef.current?.click()} title="Change photo">
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span>{user.name?.[0]?.toUpperCase() || "?"}</span>
                  }
                </div>
                <div className="up-avatar-badge" title="Change photo" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
                  <CameraIcon />
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h1 style={{ fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 700, color: "#0d1f16", letterSpacing: "-0.02em" }}>{user.name}</h1>
                  {user.verified && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, background: "rgba(46,201,126,0.1)", border: "1px solid rgba(46,201,126,0.25)", fontSize: 11, fontWeight: 700, color: "#1b7d52" }}>
                      <ShieldIcon /> Verified
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  {user.location && (
                    <span style={{ fontSize: 13, color: "#7a8c82", display: "flex", alignItems: "center", gap: 5 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {user.location}
                    </span>
                  )}
                  {user.bio && (
                    <span style={{ fontSize: 13, color: "#7a8c82" }}>
                      {user.bio}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Bell */}
              <NotificationBell />
            </div>

            {isSeller ? (
              <SellerProfileView
                components={{
                  AddProductBanner,
                  EditProfileTab,
                  IncomingOrdersPage: () => <IncomingOrdersPage token={token} authUser={authUser || user} />,
                  IncomingTradeRequestsPage: () => <IncomingTradeRequestsPage token={token} />,
                  ListingsTab,
                  SecurityTab,
                  SellerHubSidebar,
                  TradeTrackingPage,
                }}
                navigate={navigate}
                pendingOrderCount={pendingOrderCount}
                pendingTradeCount={pendingTradeCount}
                sellerPanel={sellerPanel}
                setSellerPanel={setSellerPanel}
                savedListings={savedListings}
                updateProfile={updateProfile}
                user={user}
                userListings={userListings}
              />
            ) : (
              <BuyerProfileView
                buyerPanel={buyerPanel}
                components={{
                  BuyerBrowseBanner,
                  BuyerHubSidebar,
                  BuyerMyOrdersPage,
                  ListingsTab,
                  EditProfileTab,
                  SecurityTab,
                }}
                navigate={navigate}
                orderCount={BUYER_MOCK_ORDERS.length}
                savedListings={savedListings}
                setBuyerPanel={setBuyerPanel}
                updateProfile={updateProfile}
                user={user}
              />
            )}
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
};

export default UserProfilePage;

