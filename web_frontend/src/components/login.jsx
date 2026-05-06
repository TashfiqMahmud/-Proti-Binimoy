import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

/* ══════════════════════════════════════
   MOCK AUTH STORE  (localStorage-backed)
══════════════════════════════════════ */
const MOCK_USERS_KEY = "pb_mock_users";
const MOCK_SESSION_KEY = "pb_mock_session";

const getMockUsers = () => {
  try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "{}"); }
  catch { return {}; }
};
const saveMockUsers = (users) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
const saveSession   = (user)  => localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));

/* Seed demo user on first load */
const seedDemoUsers = () => {
  const users = getMockUsers();
  if (!users["demo@protibi.com"]) {
    users["demo@protibi.com"] = {
      id: "u_demo",
      email: "demo@protibi.com",
      password: "Demo@1234",
      name: "Rafiul Hasan",
      phone: "01712345678",
      joinDate: "2024-09-01",
      location: "Dhanmondi, Dhaka",
      bio: "Passionate about sustainable commerce and zero-waste living.",
      idType: "nid",
      idValue: "1234567890",
      avatar: null,
      rating: 4.8,
      reviews: 12,
      totalListings: 7,
      soldItems: 4,
      savedItems: 19,
      verified: true,
      memberTier: "Gold",
    };
    saveMockUsers(users);
  }
};
seedDemoUsers();

/* ─── Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes lp-fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes lp-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes lp-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes lp-spin    { to{transform:rotate(360deg)} }
    @keyframes lp-slideIn { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes lp-pop     { 0%{transform:scale(0.82);opacity:0} 65%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
    @keyframes lp-bar     { from{width:0%} to{width:100%} }
    @keyframes lp-pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

    .lp-fade  { opacity:0; animation:lp-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .lp-d1{animation-delay:0.08s} .lp-d2{animation-delay:0.18s} .lp-d3{animation-delay:0.28s}
    .lp-d4{animation-delay:0.38s} .lp-d5{animation-delay:0.48s}
    .lp-slide { opacity:0; animation:lp-slideIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards; }
    .lp-pop   { animation:lp-pop 0.42s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* NAV */
    .lp-nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:16px 48px; background:rgba(8,35,26,0.7); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.08); }
    .lp-nav-links { display:flex; align-items:center; gap:28px; }
    .lp-nav-link { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .lp-nav-link:hover { color:#2ec97e; }
    .lp-nav-active { color:#2ec97e !important; }
    .lp-nav-cta { text-decoration:none; color:#fff; font-size:14px; font-weight:600; background:rgba(46,201,126,0.18); border:1px solid rgba(46,201,126,0.45); padding:8px 20px; border-radius:100px; transition:background 0.2s; }
    .lp-nav-cta:hover { background:rgba(46,201,126,0.3); }
    .lp-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .lp-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .lp-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:199; background:rgba(8,35,26,0.97); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; }
    .lp-mobile-menu.open { display:flex; }
    .lp-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
    .lp-mobile-cta  { text-decoration:none; display:block; text-align:center; margin-top:20px; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; font-size:16px; font-weight:600; padding:15px; border-radius:14px; }

    /* LAYOUT */
    .lp-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; max-width:1280px; margin:0 auto; padding:120px 48px 80px; min-height:100vh; width:100%; }

    /* TRUST */
    .lp-trust-item { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:14px 18px; backdrop-filter:blur(8px); transition:border-color 0.2s, background 0.2s; }
    .lp-trust-item:hover { border-color:rgba(46,201,126,0.3); background:rgba(46,201,126,0.06); }
    .lp-trust-icon { width:36px; height:36px; flex-shrink:0; border-radius:10px; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; }

    /* CARD */
    .lp-card-outer { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); border-radius:28px; padding:6px; box-shadow:0 32px 96px rgba(0,0,0,0.4); backdrop-filter:blur(24px); }
    .lp-card { background:#fff; border-radius:22px; padding:34px 38px; color:#0d1f16; }

    /* DEMO HINT */
    .lp-demo-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:10px 14px; margin-bottom:16px; font-size:12px; color:#15803d; line-height:1.6; }
    .lp-demo-box strong { display:block; margin-bottom:3px; font-size:13px; }

    /* METHOD TOGGLE */
    .lp-toggle { display:grid; grid-template-columns:1fr 1fr; gap:4px; background:#f3f4f6; border-radius:14px; padding:4px; margin-bottom:26px; }
    .lp-toggle-btn { padding:10px 8px; border-radius:10px; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; transition:all 0.22s; background:none; color:#6b7280; display:flex; align-items:center; justify-content:center; gap:6px; }
    .lp-toggle-btn.active { background:#fff; color:#0d1f16; box-shadow:0 2px 8px rgba(0,0,0,0.09); }
    .lp-toggle-btn svg { width:15px; height:15px; }

    /* INPUTS */
    .lp-label { display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:7px; letter-spacing:0.02em; text-transform:uppercase; }
    .lp-input { width:100%; border:1.5px solid #e5e7eb; background:#f9fafb; border-radius:13px; padding:13px 16px; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; color:#111827; }
    .lp-input::placeholder { color:#9ca3af; }
    .lp-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.11); }
    .lp-input-wrap { position:relative; }
    .lp-icon-left  { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
    .lp-pl { padding-left:44px; }
    .lp-pr { padding-right:44px; }
    .lp-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px; display:flex; }
    .lp-eye:hover { color:#374151; }
    .lp-phone-pre { position:absolute; left:0; top:0; bottom:0; display:flex; align-items:center; padding:0 11px 0 13px; border-right:1.5px solid #e5e7eb; font-size:13px; font-weight:700; color:#374151; gap:4px; pointer-events:none; white-space:nowrap; }
    .lp-phl { padding-left:76px; }

    /* OTP */
    .lp-otp-row { display:grid; grid-template-columns:repeat(6,1fr); gap:7px; }
    .lp-otp-box { width:100%; aspect-ratio:1; border:1.5px solid #e5e7eb; background:#f9fafb; border-radius:11px; text-align:center; font-size:19px; font-weight:700; font-family:inherit; outline:none; color:#0d1f16; transition:all 0.2s; }
    .lp-otp-box:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.11); }
    .lp-otp-box.filled { border-color:#1b7d52; background:#f0fdf4; }

    /* BUTTONS */
    .lp-btn-submit { width:100%; padding:14px; border-radius:13px; border:none; cursor:pointer; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-size:15px; font-weight:600; font-family:inherit; transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 5px 20px rgba(13,51,34,0.3); display:flex; align-items:center; justify-content:center; gap:8px; }
    .lp-btn-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); box-shadow:0 9px 28px rgba(13,51,34,0.4); }
    .lp-btn-submit:disabled { opacity:0.52; cursor:not-allowed; transform:none; }
    .lp-btn-back { background:none; border:1.5px solid #e5e7eb; border-radius:100px; padding:9px 18px; font-family:inherit; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s; }
    .lp-btn-back:hover { border-color:#9ca3af; color:#374151; }
    .lp-btn-link { background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:#1b7d52; padding:0; }
    .lp-btn-link:hover { color:#0d3322; }
    .lp-btn-link:disabled { color:#9ca3af; cursor:not-allowed; }

    /* ALERTS */
    .lp-err  { background:#fef2f2; border:1px solid #fecaca; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#dc2626; display:flex; align-items:center; gap:7px; }
    .lp-info { background:rgba(46,201,126,0.07); border:1px solid rgba(46,201,126,0.22); border-radius:11px; padding:10px 14px; font-size:12px; color:#374151; display:flex; align-items:flex-start; gap:7px; }
    .lp-info strong { font-weight:700; color:#1b7d52; }
    .lp-hint { background:#fffbeb; border:1px solid #fde68a; border-radius:11px; padding:10px 13px; font-size:11px; color:#92400e; display:flex; align-items:flex-start; gap:7px; line-height:1.55; }
    .lp-hint code { background:#fef3c7; padding:1px 5px; border-radius:4px; font-size:11px; }

    /* PROGRESS */
    .lp-prog { display:flex; gap:5px; margin-bottom:22px; }
    .lp-prog-step { flex:1; }
    .lp-prog-bar { height:3px; border-radius:100px; margin-bottom:4px; transition:background 0.4s; }
    .lp-prog-lbl { font-size:9px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; transition:color 0.3s; }

    /* MISC */
    .lp-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:lp-spin 0.7s linear infinite; }
    .lp-divider { display:flex; align-items:center; gap:12px; margin:20px 0; }
    .lp-div-line { flex:1; height:1px; background:#e5e7eb; }
    .lp-div-txt  { font-size:10px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:#9ca3af; }
    .lp-resend { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:13px; font-size:12px; color:#6b7280; }
    .lp-deco { position:absolute; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }

    /* RESPONSIVE */
    @media (max-width:1024px) {
      .lp-nav  { padding:14px 28px; }
      .lp-grid { grid-template-columns:1fr; padding:100px 28px 64px; gap:40px; }
      .lp-card { padding:26px 26px; }
      .lp-deco { display:none; }
    }
    @media (max-width:640px) {
      .lp-nav        { padding:14px 20px; }
      .lp-nav-links  { display:none; }
      .lp-hamburger  { display:flex; }
      .lp-grid       { padding:84px 16px 48px; gap:28px; }
      .lp-card-outer { border-radius:20px; padding:4px; }
      .lp-card       { padding:20px 16px; border-radius:16px; }
      .lp-trust-item { padding:11px 13px; border-radius:12px; }
      .lp-otp-box    { font-size:16px; border-radius:9px; }
      .lp-otp-row    { gap:5px; }
    }
  `}</style>
);

/* ── Atoms ── */
const Sp = () => <div className="lp-spinner" />;
const Arr = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const ArrL = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const ErrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1 }}>
    <path d="M7 12.5l3.2 3.2L17.5 8.5" />
  </svg>
);
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
  </svg>
);

/* ── Progress bar ── */
const PBar = ({ steps, cur }) => (
  <div className="lp-prog">
    {steps.map((s, i) => (
      <div key={s} className="lp-prog-step">
        <div className="lp-prog-bar" style={{ background: i <= cur ? "linear-gradient(to right,#2ec97e,#1b7d52)" : "#e5e7eb" }} />
        <span className="lp-prog-lbl" style={{ color: i <= cur ? "#1b7d52" : "#9ca3af" }}>{s}</span>
      </div>
    ))}
  </div>
);

/* ── OTP cells ── */
const OtpInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const cells = value.split("");
  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      if (cells[i]) { const n = [...cells]; n[i] = ""; onChange(n.join("")); }
      else if (i > 0) { refs[i - 1].current?.focus(); const n = [...cells]; n[i - 1] = ""; onChange(n.join("")); }
      return;
    }
    if (e.key === "ArrowLeft"  && i > 0) refs[i - 1].current?.focus();
    if (e.key === "ArrowRight" && i < 5) refs[i + 1].current?.focus();
  };
  const handleChange = (i, e) => {
    const d = e.target.value.replace(/\D/, "").slice(-1);
    if (!d) return;
    const n = [...cells]; n[i] = d; onChange(n.join(""));
    if (i < 5) refs[i + 1].current?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p.padEnd(6, "").slice(0, 6));
    refs[Math.min(p.length, 5)].current?.focus();
  };
  return (
    <div className="lp-otp-row">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={cells[i] || ""} className={`lp-otp-box ${cells[i] ? "filled" : ""}`}
          onChange={e => handleChange(i, e)} onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste} autoFocus={i === 0}
        />
      ))}
    </div>
  );
};

/* ── Resend timer ── */
const ResendTimer = ({ onResend }) => {
  const [s, setS] = useState(30);
  useEffect(() => {
    const t = setInterval(() => setS(v => { if (v <= 1) { clearInterval(t); return 0; } return v - 1; }), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="lp-resend">
      <span>Didn't receive it?</span>
      {s > 0
        ? <span style={{ color: "#1b7d52", fontWeight: 700 }}>Resend in {s}s</span>
        : <button className="lp-btn-link" onClick={() => { setS(30); onResend(); }}>Resend OTP</button>
      }
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const LoginPage = () => {
  const navigate    = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [method, setMethod]     = useState("phone");
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  // phone flow
  const [phone, setPhone]   = useState("");
  const [otp, setOtp]       = useState("");
  const [mockOtp, setMockOtp] = useState(""); // displayed hint OTP

  // email flow
  const [email, setEmail]   = useState("");
  const [password, setPw]   = useState("");
  const [showPw, setShowPw] = useState(false);

  const switchMethod = (m) => {
    setMethod(m); setStep(0); setError("");
    setPhone(""); setOtp(""); setEmail(""); setPw(""); setShowPw(false); setMockOtp("");
  };

  /* ── MOCK: Phone step 0 ── */
  const handlePhoneCheck = (e) => {
    e.preventDefault(); setError("");
    const d = phone.replace(/\D/g, "");
    if (d.length < 11) { setError("Enter a valid 11-digit Bangladeshi number."); return; }
    setLoading(true);
    setTimeout(() => {
      const users = getMockUsers();
      const found = Object.values(users).find(u => u.phone === d);
      if (!found) { setError("This number is not registered. Please create an account first."); setLoading(false); return; }
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setMockOtp(generatedOtp);
      setStep(1);
      setLoading(false);
    }, 700);
  };

  /* ── MOCK: Phone step 1 ── */
  const handleOtpVerify = (e) => {
    e?.preventDefault(); setError("");
    if (otp.length < 6) { setError("Enter the full 6-digit OTP."); return; }
    setLoading(true);
    setTimeout(() => {
      if (otp !== mockOtp) { setError("Incorrect OTP. Please try again."); setLoading(false); return; }
      const users = getMockUsers();
      const user  = Object.values(users).find(u => u.phone === phone.replace(/\D/g, ""));
      if (user) saveSession(user);
      setStep(2);
      setLoading(false);
      setTimeout(() => navigate("/profile", { replace: true }), 1600);
    }, 800);
  };

  const handleOtpResend = () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setMockOtp(generatedOtp);
    setOtp("");
    setError("");
  };

  /* ── MOCK: Email step 0 ── */
  const handleEmailCheck = (e) => {
    e.preventDefault(); setError("");
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    setTimeout(() => {
      const users = getMockUsers();
      if (!users[email.trim().toLowerCase()]) {
        setError("This email is not registered. Please create an account first.");
        setLoading(false); return;
      }
      setStep(1);
      setLoading(false);
    }, 600);
  };

  /* ── MOCK: Email step 1 ── */
  const handlePasswordCheck = (e) => {
    e.preventDefault(); setError("");
    if (!password) { setError("Enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const users = getMockUsers();
      const user  = users[email.trim().toLowerCase()];
      if (!user || user.password !== password) {
        setError("Invalid email or password.");
        setLoading(false); return;
      }
      saveSession(user);
      setStep(2);
      setLoading(false);
      setTimeout(() => navigate("/profile", { replace: true }), 1600);
    }, 800);
  };

  const trustPoints = [
    "Verified profiles for more confident exchanges",
    "Cleaner listings and simpler communication",
    "Built for sustainable buying, selling, and barter",
  ];

  /* ── Card content ── */
  const renderCard = () => {
    // SUCCESS
    if (step === 2) return (
      <div className="lp-pop" style={{ textAlign: "center", padding: "12px 0" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 18, boxShadow: "0 8px 28px rgba(46,201,126,0.4)", animation: "lp-pulse 1.6s ease-in-out infinite" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 30, height: 30 }}>
            <path d="M7 12.5l3.2 3.2L17.5 8.5" />
          </svg>
        </div>
        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: "#0d1f16", marginBottom: 10 }}>You're in!</h3>
        <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 20 }}>Redirecting to your profile…</p>
        <div style={{ height: 4, borderRadius: 100, background: "#f3f4f6", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(to right,#2ec97e,#1b7d52)", borderRadius: 100, animation: "lp-bar 1.5s linear forwards" }} />
        </div>
      </div>
    );

    // PHONE FLOW
    if (method === "phone") {
      if (step === 0) return (
        <div className="lp-slide" key="ph0">
          <PBar steps={["Phone", "OTP", "Done"]} cur={0} />
          {/* Demo hint */}
          <div className="lp-demo-box">
            <strong>🧪 Demo Account</strong>
            Phone: <code>01812345678</code> — Use any 6-digit OTP shown after submitting.
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 6 }}>Step 1 of 2</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.3vw,28px)", fontWeight: 700, color: "#0d1f16", marginBottom: 6 }}>Enter your phone</h2>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16, fontWeight: 300 }}>We'll send a one-time code to verify your number.</p>
          <form onSubmit={handlePhoneCheck} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="lp-label">Phone Number</label>
              <div className="lp-input-wrap">
                <div className="lp-phone-pre">🇧🇩 +88</div>
                <input type="tel" inputMode="numeric" placeholder="01XXXXXXXXX" value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="lp-input lp-phl" autoFocus />
              </div>
            </div>
            {error && <div className="lp-err"><ErrIcon />{error}</div>}
            <button type="submit" disabled={loading} className="lp-btn-submit">
              {loading ? <><Sp /> Checking…</> : <>Send OTP <Arr /></>}
            </button>
          </form>
        </div>
      );

      if (step === 1) return (
        <div className="lp-slide" key="ph1">
          <PBar steps={["Phone", "OTP", "Done"]} cur={1} />
          {mockOtp && (
            <div className="lp-demo-box">
              <strong>🔑 Your mock OTP</strong>
              Enter this code: <code style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>{mockOtp}</code>
            </div>
          )}
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 6 }}>Step 2 of 2</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.3vw,28px)", fontWeight: 700, color: "#0d1f16", marginBottom: 6 }}>Verify OTP</h2>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16, fontWeight: 300 }}>
            Code sent to <strong style={{ color: "#0d1f16" }}>+88 {phone}</strong>
          </p>
          <OtpInput value={otp} onChange={setOtp} />
          {error && <div className="lp-err" style={{ marginTop: 12 }}><ErrIcon />{error}</div>}
          <button onClick={handleOtpVerify} disabled={loading || otp.length < 6} className="lp-btn-submit" style={{ marginTop: 16 }}>
            {loading ? <><Sp /> Verifying…</> : <>Verify & Sign In <Arr /></>}
          </button>
          <ResendTimer onResend={handleOtpResend} />
          <button className="lp-btn-back" style={{ marginTop: 14 }} onClick={() => { setStep(0); setOtp(""); setError(""); setMockOtp(""); }}>
            <ArrL /> Change number
          </button>
        </div>
      );
    }

    // EMAIL FLOW
    if (method === "email") {
      if (step === 0) return (
        <div className="lp-slide" key="em0">
          <PBar steps={["Email", "Password", "Done"]} cur={0} />
          <div className="lp-demo-box">
            <strong>🧪 Demo Account</strong>
            Email: <code>test@example.com</code> &nbsp;/&nbsp; Password: <code>Test123</code>
          </div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 6 }}>Step 1 of 2</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.3vw,28px)", fontWeight: 700, color: "#0d1f16", marginBottom: 6 }}>Enter your email</h2>
          <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16, fontWeight: 300 }}>We'll check if it's registered before showing your password field.</p>
          <form onSubmit={handleEmailCheck} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="lp-label">Email Address</label>
              <div className="lp-input-wrap">
                <div className="lp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                </div>
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="lp-input lp-pl" autoFocus />
              </div>
            </div>
            {error && <div className="lp-err"><ErrIcon />{error}</div>}
            <button type="submit" disabled={loading} className="lp-btn-submit">
              {loading ? <><Sp /> Checking…</> : <>Continue <Arr /></>}
            </button>
          </form>
        </div>
      );

      if (step === 1) return (
        <div className="lp-slide" key="em1">
          <PBar steps={["Email", "Password", "Done"]} cur={1} />
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 6 }}>Step 2 of 2</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(20px,2.3vw,28px)", fontWeight: 700, color: "#0d1f16", marginBottom: 10 }}>Enter password</h2>
          <div className="lp-info" style={{ marginBottom: 12 }}>
            <Check /><span>Signing in as <strong>{email}</strong></span>
          </div>
          <form onSubmit={handlePasswordCheck} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label className="lp-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 600, color: "#1b7d52", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2ec97e"}
                  onMouseLeave={e => e.currentTarget.style.color = "#1b7d52"}>
                  Forgot password?
                </Link>
              </div>
              <div className="lp-input-wrap">
                <div className="lp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                </div>
                <input type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPw(e.target.value)} className="lp-input lp-pl lp-pr" autoFocus />
                <button type="button" className="lp-eye" onClick={() => setShowPw(!showPw)} aria-label="Toggle">
                  {showPw ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
            </div>
            {error && <div className="lp-err"><ErrIcon />{error}</div>}
            <button type="submit" disabled={loading} className="lp-btn-submit">
              {loading ? <><Sp /> Signing In…</> : <>Sign In <Arr /></>}
            </button>
          </form>
          <button className="lp-btn-back" style={{ marginTop: 14 }} onClick={() => { setStep(0); setPw(""); setError(""); }}>
            <ArrL /> Change email
          </button>
        </div>
      );
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <GlobalStyles />

      {/* NAV */}
      <nav className="lp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>P</div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Proti-Binimoy</p>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="lp-nav-links">
          <Link to="/" className="lp-nav-link">Home</Link>
          <Link to="/about" className="lp-nav-link">About</Link>
          <Link to="/signin" className="lp-nav-link lp-nav-active">Sign In</Link>
          <Link to="/register" className="lp-nav-cta">Register →</Link>
        </div>
        <button className="lp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`lp-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/register" className="lp-mobile-cta" onClick={() => setMenuOpen(false)}>Create Account →</Link>
      </div>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", backgroundImage: `url(${websiteBackground})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(8,35,26,0.95) 0%,rgba(8,35,26,0.82) 45%,rgba(8,35,26,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div style={{ position: "absolute", top: -80, left: -80, width: 400, height: 400, background: "radial-gradient(circle,rgba(46,201,126,0.18) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 340, height: 340, background: "radial-gradient(circle,rgba(27,125,82,0.15) 0%,transparent 65%)", borderRadius: "50%" }} />

        <div className="lp-deco" style={{ width: 88, height: 88, top: "18%", left: "3%", animation: "lp-float 5s ease-in-out infinite" }}><span style={{ fontSize: 34 }}>📷</span></div>
        <div className="lp-deco" style={{ width: 68, height: 68, top: "62%", left: "6%", animation: "lp-float 7s ease-in-out infinite 1s" }}><span style={{ fontSize: 26 }}>👟</span></div>
        <div className="lp-deco" style={{ width: 56, height: 56, top: "38%", left: "1%", animation: "lp-float 6s ease-in-out infinite 0.5s" }}><span style={{ fontSize: 21 }}>🎧</span></div>

        <div className="lp-grid" style={{ position: "relative", zIndex: 10 }}>
          {/* LEFT: copy */}
          <div>
            <div className="lp-fade lp-d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,201,126,0.12)", border: "1px solid rgba(46,201,126,0.3)", borderRadius: 100, padding: "7px 16px", marginBottom: 26 }}>
              <div style={{ width: 7, height: 7, background: "#2ec97e", borderRadius: "50%", animation: "lp-shimmer 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#2ec97e", letterSpacing: "0.05em" }}>Welcome back to Proti-Binimoy</span>
            </div>
            <h1 className="lp-fade lp-d2" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,4.5vw,64px)", fontWeight: 900, lineHeight: 1.06, color: "#fff", marginBottom: 18 }}>
              Sign in to your<br />
              <em style={{ fontStyle: "italic", color: "#2ec97e" }}>trusted marketplace</em><br />
              <span style={{ color: "#f3edd8", fontSize: "clamp(28px,3.5vw,50px)" }}>journey.</span>
            </h1>
            <p className="lp-fade lp-d3" style={{ fontSize: "clamp(13px,1.5vw,15px)", lineHeight: 1.75, color: "rgba(255,255,255,0.6)", maxWidth: 420, marginBottom: 0, fontWeight: 300 }}>
              Use your phone for instant OTP access, or sign in with your email and password.
            </p>
            <div className="lp-fade lp-d4" style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 28 }}>
              {trustPoints.map((p, i) => (
                <div key={i} className="lp-trust-item">
                  <div className="lp-trust-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M7 12.5l3.2 3.2L17.5 8.5" /></svg>
                  </div>
                  <p style={{ fontSize: "clamp(12px,1.3vw,14px)", color: "rgba(255,255,255,0.82)", fontWeight: 400 }}>{p}</p>
                </div>
              ))}
            </div>
            <p className="lp-fade lp-d5" style={{ marginTop: 26, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              No account?{" "}
              <Link to="/register" style={{ color: "#2ec97e", fontWeight: 600, textDecoration: "none" }}>Create one for free →</Link>
            </p>
          </div>

          {/* RIGHT: form card */}
          <div className="lp-fade lp-d3" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div className="lp-card-outer" style={{ width: "100%", maxWidth: 468 }}>
              <div className="lp-card">
                {step === 0 && (
                  <div className="lp-toggle">
                    <button className={`lp-toggle-btn ${method === "phone" ? "active" : ""}`} onClick={() => switchMethod("phone")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10 19.79 19.79 0 01.22 1.37 2 2 0 012.2 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" /></svg>
                      Phone & OTP
                    </button>
                    <button className={`lp-toggle-btn ${method === "email" ? "active" : ""}`} onClick={() => switchMethod("email")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                      Email
                    </button>
                  </div>
                )}

                {renderCard()}

                {step === 0 && (
                  <div style={{ marginTop: 20 }}>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="lp-btn-submit"
                      style={{
                        background: "#ffffff",
                        color: "#111827",
                        border: "1px solid #d1d5db",
                        boxShadow: "none"
                      }}
                    >
                      Continue with Google
                    </button>
                  </div>
                )}

                {step === 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9ca3af" }}>New here</span>
                      <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    </div>
                    <p style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 12 }}>
                      Don't have an account?{" "}
                      <Link to="/register" style={{ fontWeight: 700, color: "#1b7d52", textDecoration: "none" }}>Create one now</Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;