import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import webBg from "../assets/web_bg.png";
import { BD_LOCATIONS } from "../config/locations";
import PageFooter from "./page-footer";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const getTokenUserId = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id || "";
  } catch {
    return "";
  }
};

const getLocationText = (location) => {
  if (!location) return "";
  if (typeof location === "string") return location;
  return location.city || "";
};

const mapListingForProfile = (listing) => ({
  id: listing._id,
  emoji: Array.isArray(listing.images) && listing.images[0] ? listing.images[0] : "📦",
  title: listing.title || "Untitled listing",
  price: `৳${new Intl.NumberFormat("en-BD").format(Number(listing.price) || 0)}`,
  status: listing.status || "active",
  cat: listing.category || "Other",
  views: 0,
  saves: 0,
  image: Array.isArray(listing.images) ? listing.images.find(Boolean) || "" : ""
});

const mapProfileUser = (profile, listings = [], fallback = {}) => ({
  id: profile?._id || profile?.id || fallback?.id || "",
  email: profile?.email || fallback?.email || "",
  name: profile?.name || fallback?.name || "User",
  phone: profile?.phone || "",
  joinDate: profile?.createdAt || "",
  location: getLocationText(profile?.location),
  locationData: profile?.location || {},
  bio: profile?.bio || "",
  idType: profile?.nid ? "nid" : profile?.passportNumber ? "passport" : "",
  idValue: profile?.nid || profile?.passportNumber || "",
  avatar: profile?.profilePicture || "",
  profilePicture: profile?.profilePicture || "",
  rating: Number(profile?.rating) || 0,
  reviews: Number(profile?.totalReviews) || 0,
  totalReviews: Number(profile?.totalReviews) || 0,
  totalListings: listings.length,
  soldItems: listings.filter(listing => listing.status === "sold").length,
  savedItems: 0,
  verified: Boolean(profile?.isVerified),
  memberTier: profile?.isVerified ? "Verified" : "Member",
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

    /* ── NOTIFICATION BELL ── */
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

    /* ── PROFILE NAV ── */
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

    /* ── PROFILE LAYOUT ── */
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
    .up-main { max-width:960px; margin:0 auto; padding:0 24px 80px; }
    .up-header-row {
      display:flex; align-items:flex-end; justify-content:space-between;
      gap:20px; margin-bottom:32px; flex-wrap:wrap;
    }

    /* ── AVATAR ── */
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

    /* ── BODY GRID ── */
    .up-grid { position:relative; z-index:1; display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }

    /* ── CARD ── */
    .up-card { background:#fff; border-radius:20px; padding:28px; box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06); }
    .up-card-sm { background:#fff; border-radius:16px; padding:20px 24px; box-shadow:0 1px 8px rgba(0,0,0,0.04); border:1px solid rgba(0,0,0,0.06); }

    /* ── TABS ── */
    .up-tabs { display:flex; gap:2px; background:#eff1ee; border-radius:14px; padding:4px; margin-bottom:26px; overflow-x:auto; }
    .up-tab { flex:1; min-width:max-content; padding:10px 18px; border-radius:11px; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; transition:all 0.22s; background:none; color:#7a8c82; white-space:nowrap; display:flex; align-items:center; justify-content:center; gap:6px; }
    .up-tab.active { background:#fff; color:#0d3322; box-shadow:0 1px 6px rgba(0,0,0,0.09); }
    .up-tab:hover:not(.active) { color:#374151; }

    /* ── INPUTS ── */
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

    /* ── BUTTONS ── */
    .up-btn-primary { display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#0d3322; color:#fff; border:none; border-radius:11px; padding:11px 22px; font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:background 0.2s, transform 0.15s; }
    .up-btn-primary:hover:not(:disabled) { background:#1a5c3a; transform:translateY(-1px); }
    .up-btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .up-btn-ghost { display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid #e9eceb; border-radius:11px; padding:10px 18px; font-size:13px; font-weight:600; font-family:inherit; color:#374151; cursor:pointer; transition:all 0.2s; }
    .up-btn-ghost:hover { border-color:#b0b9b5; background:#fafbfa; }
    .up-btn-danger { display:inline-flex; align-items:center; gap:6px; background:none; border:1.5px solid #fecaca; border-radius:11px; padding:10px 18px; font-size:13px; font-weight:600; font-family:inherit; color:#dc2626; cursor:pointer; transition:all 0.2s; }
    .up-btn-danger:hover { background:#fef2f2; border-color:#ef4444; }
    .up-btn-sm { display:inline-flex; align-items:center; gap:5px; background:rgba(46,201,126,0.1); border:1px solid rgba(46,201,126,0.22); border-radius:100px; padding:6px 14px; font-size:12px; font-weight:600; font-family:inherit; color:#1b7d52; cursor:pointer; transition:all 0.2s; }
    .up-btn-sm:hover { background:rgba(46,201,126,0.2); }

    /* ── ALERTS ── */
    .up-err  { background:#fef2f2; border:1px solid #fecaca; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#dc2626; display:flex; align-items:center; gap:7px; }
    .up-ok   { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#15803d; display:flex; align-items:center; gap:7px; }
    .up-warn { background:#fffbeb; border:1px solid #fde68a; border-radius:11px; padding:10px 14px; font-size:12px; color:#92400e; display:flex; align-items:flex-start; gap:7px; }

    /* ── STAT CHIP ── */
    .up-stat-chip { display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f7f8f6; border:1px solid #e9eceb; border-radius:16px; padding:18px 12px; flex:1; min-width:80px; transition:border-color 0.2s, background 0.2s, transform 0.15s; font-family:inherit; cursor:default; }
    .up-stat-chip.clickable { cursor:pointer; }
    .up-stat-chip.clickable:hover { border-color:rgba(46,201,126,0.4); transform:translateY(-1px); }
    .up-stat-chip.active { background:rgba(46,201,126,0.08); border-color:rgba(46,201,126,0.45); }

    /* ── ACTIVITY ITEM ── */
    .up-activity-item { display:flex; align-items:center; gap:14px; padding:14px 0; border-bottom:1px solid #f0f2f0; }
    .up-activity-item:last-child { border-bottom:none; }
    .up-activity-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:18px; }

    /* ── LISTING CARD ── */
    .up-listing-card { display:flex; gap:14px; padding:14px; border-radius:14px; border:1.5px solid #f0f2f0; transition:border-color 0.2s, box-shadow 0.2s; margin-bottom:10px; align-items:center; }
    .up-listing-card:hover { border-color:rgba(46,201,126,0.3); box-shadow:0 3px 12px rgba(0,0,0,0.05); }
    .up-listing-img { width:52px; height:52px; border-radius:10px; background:#f3f5f2; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }

    /* ── TIER BADGE ── */
    .up-tier { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:100px; font-size:11px; font-weight:700; letter-spacing:0.04em; }

    /* ── PROGRESS ── */
    .up-progress-bar { height:5px; background:#e9eceb; border-radius:100px; overflow:hidden; }
    .up-progress-fill { height:100%; border-radius:100px; background:linear-gradient(to right,#2ec97e,#1b7d52); transition:width 0.8s cubic-bezier(0.22,1,0.36,1); }

    /* ── SPINNER ── */
    .up-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:up-spin 0.7s linear infinite; }
    .up-spinner-dark { border-color:rgba(13,51,34,0.2); border-top-color:#0d3322; }

    /* ── SECTION TITLE ── */
    .up-section-title { font-size:11px; font-weight:700; color:#b0b9b5; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
    .up-section-title::after { content:''; flex:1; height:1px; background:#f0f2f0; }

    /* ── SLIDE ANIMATION ── */
    .up-fade  { opacity:0; animation:up-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .up-d1{animation-delay:0.06s} .up-d2{animation-delay:0.14s} .up-d3{animation-delay:0.22s}
    .up-d4{animation-delay:0.30s} .up-d5{animation-delay:0.38s} .up-d6{animation-delay:0.46s}
    .up-slide { opacity:0; animation:up-slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards; }

    /* ── PROFILE IDENTITY BAR ── */
    .up-identity-bar {
      position:relative; z-index:20; overflow:visible;
      background:#fff; border-radius:20px; padding:24px 28px;
      box-shadow:0 1px 12px rgba(0,0,0,0.05); border:1px solid rgba(0,0,0,0.06);
      margin-bottom:20px; display:flex; align-items:center; gap:20px; flex-wrap:wrap;
      animation:up-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; opacity:0;
    }

    /* ── RESPONSIVE ── */
    @media(max-width:900px) {
      .up-nav { padding:14px 24px; }
      .up-cover { height:160px; }
      .up-avatar { width:88px; height:88px; font-size:28px; }
      .auth-login-grid { grid-template-columns:1fr; padding:60px 24px 60px; gap:32px; }
      .auth-nav { padding:14px 28px; }
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

/* ══════════════════════════════════════
   AUTH ATOMS
══════════════════════════════════════ */
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

/* ── Progress Bar ── */
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

/* ── Password Strength ── */
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
              {c.test(password) ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {s > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: strengthColors[s], flexShrink: 0, marginLeft: 8 }}>{strengthLabels[s]}</span>}
      </div>
    </div>
  );
};

/* ── OTP Input ── */
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

/* ── Terms Text ── */
const TermsText = () => (
  <>
    <p style={{ fontWeight: 700, marginBottom: 8, color: "#0d1f16" }}>Terms & Conditions — Proti-Binimoy</p>
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

/* ══════════════════════════════════════
   FULL-PAGE LOGIN OVERLAY
══════════════════════════════════════ */
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
    Bronze:  { bg: "rgba(205,127,50,0.12)",  text: "#b8762a", border: "rgba(205,127,50,0.3)",  icon: "🥉" },
    Silver:  { bg: "rgba(160,160,160,0.12)", text: "#707070", border: "rgba(160,160,160,0.3)", icon: "🥈" },
    Gold:    { bg: "rgba(245,158,11,0.12)",  text: "#b45309", border: "rgba(245,158,11,0.3)",  icon: "🥇" },
    Platinum:{ bg: "rgba(46,201,126,0.12)",  text: "#1b7d52", border: "rgba(46,201,126,0.3)",  icon: "💎" },
  };
  const c = map[tier] || map.Bronze;
  return (
    <span className="up-tier" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {c.icon} {tier}
    </span>
  );
};

/* ══════════════════════════════════════
   PROFILE STAT STRIP (replaces sidebar)
══════════════════════════════════════ */
const ProfileSidebar = ({ user, activeView, onViewChange }) => (
  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, animation: "up-fadeUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both" }}>
    {[
      { key: "all", value: user.totalListings, label: "Listings", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
      )},
      { key: "sold", value: user.soldItems, label: "Sold", icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:16,height:16}}><polyline points="20 6 9 17 4 12"/></svg>
      )},
      { value: user.rating > 0 ? user.rating.toFixed(1) : "—", label: "Rating", icon: (
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

/* ══════════════════════════════════════
   EDIT PROFILE TAB
══════════════════════════════════════ */
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
        <textarea className="up-input up-textarea" value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Tell others about yourself…" rows={3} />
      </div>
      {msg && (msg.type === "ok"
        ? <div className="up-ok"><OkIcon />{msg.text}</div>
        : <div className="up-err"><ErrIcon />{msg.text}</div>
      )}
      <button type="submit" disabled={loading} className="up-btn-primary" style={{ alignSelf: "flex-start" }}>
        {loading ? <><Spinner /> Saving…</> : <><SaveIcon /> Save Changes</>}
      </button>
    </form>
  );
};

/* ══════════════════════════════════════
   SECURITY TAB
══════════════════════════════════════ */
const SecurityTab = ({ user }) => {
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
          {loading ? <><Spinner /> Updating…</> : "Update Password"}
        </button>
      </form>
      <div style={{ marginTop: 32 }}>
        <p className="up-section-title">Identity Verification</p>
        <div className="up-card-sm" style={{ display: "flex", alignItems: "center", gap: 14, background: user.idValue ? "rgba(46,201,126,0.05)" : "rgba(245,158,11,0.05)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: user.idValue ? "rgba(46,201,126,0.15)" : "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {user.idValue ? "🔐" : "🔓"}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1f16", marginBottom: 3 }}>{user.idValue ? "Identity Verified" : "Identity Not Verified"}</p>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              {user.idValue ? `${user.idType?.toUpperCase() || "ID"} verified — encrypted & secure.` : "Add a NID, DOB, or Passport to verify your identity."}
            </p>
          </div>
          {user.idValue && (
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 100, background: "rgba(46,201,126,0.15)", color: "#1b7d52", fontSize: 12, fontWeight: 700 }}>
                <ShieldIcon /> Verified
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   LISTINGS TAB
══════════════════════════════════════ */
const ListingsTab = ({ listings = [], view = "all" }) => {
  const data = view === "saved"
    ? []
    : view === "sold"
      ? listings.filter(l => l.status === "sold")
      : listings;
  const title = view === "saved" ? "Saved Items" : view === "sold" ? "Sold Items" : "My Listings";
  const empty = view === "saved" ? "No saved items yet." : view === "sold" ? "No sold items yet." : "No listings yet.";

  return (
  <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <p className="up-section-title" style={{ margin: 0 }}>{title}</p>
      {view !== "saved" && (
        <Link to="/post-item" style={{ textDecoration: "none" }}>
          <button className="up-btn-sm">+ New Listing</button>
        </Link>
      )}
    </div>
    {data.length === 0 && <p style={{ fontSize: 13, color: "#7a8c82" }}>{empty}</p>}
    {data.map(l => (
      <div key={l.id} className="up-listing-card">
        <div className="up-listing-img">{l.image ? <img src={l.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} /> : l.emoji}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#0d1f16", marginBottom: 2 }}>{l.title}</p>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>{l.cat} · {l.views} views · {l.saves} saves</p>
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

/* ══════════════════════════════════════
   ACTIVITY TAB
══════════════════════════════════════ */
const ActivityTab = () => (
  <div>
    <p className="up-section-title">Recent Activity</p>
    <p style={{ fontSize: 13, color: "#7a8c82" }}>No activity yet.</p>
    <p className="up-section-title" style={{ marginTop: 24 }}>Reviews</p>
    <p style={{ fontSize: 13, color: "#7a8c82" }}>No reviews yet.</p>
  </div>
);

/* ══════════════════════════════════════
   NOTIFICATION BELL
══════════════════════════════════════ */
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
              View all messages →
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
              <button type="button" className="up-messages-close" onClick={() => setShowAllMessages(false)} aria-label="Close messages">×</button>
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

/* ══════════════════════════════════════
   MAIN PROFILE PAGE
══════════════════════════════════════ */
const UserProfilePage = () => {
  const navigate = useNavigate();
  const { user: authUser, token, login, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [listingView, setListingView] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const fileRef = useRef(null);

  const handleLogout = () => { logout(); setUser(null); navigate("/"); };

  const showLoginModal = () => { setLoginModal(true); };
  const showListingView = (view) => {
    setListingView(view);
    setActiveTab("listings");
  };

  const updateProfile = async (payload) => {
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

    const nextUser = mapProfileUser(data.user, userListings, user);
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
      setProfileLoading(false);
      navigate("/signin", { replace: true });
      return;
    }

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
        const [profileResponse, listingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/${userId}`),
          fetch(`${API_BASE_URL}/api/listings/mine`, {
            headers: { "x-auth-token": token },
          }),
        ]);

        const profileData = await profileResponse.json().catch(() => ({}));
        const listingsData = await listingsResponse.json().catch(() => []);

        if (!profileResponse.ok) throw new Error(profileData.msg || "Unable to load profile.");
        if (!listingsResponse.ok) throw new Error(listingsData.msg || "Unable to load listings.");

        const normalizedListings = Array.isArray(listingsData)
          ? listingsData.map(mapListingForProfile)
          : [];
        const normalizedUser = mapProfileUser(profileData, normalizedListings, authUser);

        if (!cancelled) {
          setUserListings(normalizedListings);
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

  const tabs = [
    { key: "edit",     label: "Edit Profile", icon: "✏️" },
    { key: "listings", label: "Listings",     icon: "📦" },
    { key: "activity", label: "Activity",     icon: "⚡" },
    { key: "security", label: "Security",     icon: "🔐" },
  ];

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
              You need to be signed in to view your profile. Please sign in to continue — or create a free account if you're new here.
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
          <Link to="/post-item"   className="up-nav-link">Sell</Link>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Avatar is display-only when logged in — user is already on their profile */}
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
              {/* Ghost avatar — tapping shows "please login first" modal */}
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
        <Link to="/post-item"   className="up-mobile-link" onClick={() => setMenuOpen(false)}>Sell</Link>
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
                New here? Create a free account →
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
                    <span style={{ fontSize: 13, color: "#7a8c82", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.bio}
                    </span>
                  )}
                </div>
              </div>

              {/* Notification Bell */}
              <NotificationBell />
            </div>

            <div className="up-grid">
              <ProfileSidebar user={user} activeView={listingView} onViewChange={showListingView} />
              <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
                <div className="up-tabs">
                  {tabs.map(t => (
                    <button key={t.key} className={`up-tab ${activeTab === t.key ? "active" : ""}`} onClick={() => { if (t.key === "listings") setListingView("all"); setActiveTab(t.key); }}>
                      <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
                <div className="up-slide" key={activeTab}>
                  {activeTab === "edit"     && <EditProfileTab user={user} onSave={updateProfile} />}
                  {activeTab === "listings" && <ListingsTab    listings={userListings} view={listingView} />}
                  {activeTab === "activity" && <ActivityTab />}
                  {activeTab === "security" && <SecurityTab    user={user} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
};

export default UserProfilePage;
