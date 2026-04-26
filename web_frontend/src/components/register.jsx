import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

/* ══════════════════════════════════════
   MOCK AUTH STORE  (localStorage-backed)
══════════════════════════════════════ */
const MOCK_USERS_KEY    = "pb_mock_users";
const MOCK_SESSION_KEY  = "pb_mock_session";

const getMockUsers  = () => { try { return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "{}"); } catch { return {}; } };
const saveMockUsers = (u) => localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(u));
const saveSession   = (u) => localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(u));

/* Seed demo user */
const seedDemoUsers = () => {
  const users = getMockUsers();
  if (!users["demo@protibi.com"]) {
    users["demo@protibi.com"] = {
      id: "u_demo", email: "demo@protibi.com", password: "Demo@1234",
      name: "Rafiul Hasan", phone: "01712345678", joinDate: "2024-09-01",
      location: "Dhanmondi, Dhaka", bio: "Passionate about sustainable commerce and zero-waste living.",
      idType: "nid", idValue: "1234567890", avatar: null,
      rating: 4.8, reviews: 12, totalListings: 7, soldItems: 4, savedItems: 19,
      verified: true, memberTier: "Gold",
    };
    saveMockUsers(users);
  }
};
seedDemoUsers();

/* ─── Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; }

    @keyframes rp-fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes rp-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes rp-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes rp-spin    { to{transform:rotate(360deg)} }
    @keyframes rp-slideIn { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes rp-pop     { 0%{transform:scale(0.82);opacity:0} 65%{transform:scale(1.07)} 100%{transform:scale(1);opacity:1} }
    @keyframes rp-bar     { from{width:0%} to{width:100%} }
    @keyframes rp-pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
    @keyframes rp-checkPop { 0%{transform:scale(0)} 70%{transform:scale(1.25)} 100%{transform:scale(1)} }

    .rp-fade { opacity:0; animation:rp-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .rp-d1{animation-delay:0.06s} .rp-d2{animation-delay:0.14s} .rp-d3{animation-delay:0.22s}
    .rp-d4{animation-delay:0.30s} .rp-d5{animation-delay:0.38s}
    .rp-slide { opacity:0; animation:rp-slideIn 0.34s cubic-bezier(0.22,1,0.36,1) forwards; }
    .rp-pop   { animation:rp-pop 0.44s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* NAV */
    .rp-nav { position:fixed; top:0; left:0; right:0; z-index:200; display:flex; align-items:center; justify-content:space-between; padding:16px 48px; background:rgba(8,35,26,0.7); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,0.08); }
    .rp-nav-links { display:flex; align-items:center; gap:28px; }
    .rp-nav-link { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .rp-nav-link:hover { color:#2ec97e; }
    .rp-nav-cta { text-decoration:none; color:#fff; font-size:14px; font-weight:600; background:rgba(46,201,126,0.28); border:1px solid rgba(46,201,126,0.7); padding:8px 20px; border-radius:100px; transition:background 0.2s; }
    .rp-nav-cta:hover { background:rgba(46,201,126,0.4); }
    .rp-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .rp-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .rp-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:199; background:rgba(8,35,26,0.97); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; }
    .rp-mobile-menu.open { display:flex; }
    .rp-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
    .rp-mobile-cta  { text-decoration:none; display:block; text-align:center; margin-top:20px; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; font-size:16px; font-weight:600; padding:15px; border-radius:14px; }

    /* CARD */
    .rp-card-outer { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13); border-radius:28px; padding:6px; box-shadow:0 32px 96px rgba(0,0,0,0.4); backdrop-filter:blur(24px); }
    .rp-card { background:#fff; border-radius:22px; padding:34px 38px; color:#0d1f16; }

    /* DEMO HINT */
    .rp-demo-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:10px 14px; margin-bottom:16px; font-size:12px; color:#15803d; line-height:1.6; }
    .rp-demo-box strong { display:block; margin-bottom:3px; font-size:13px; }

    /* PROGRESS */
    .rp-prog { display:flex; gap:5px; margin-bottom:22px; }
    .rp-prog-step { flex:1; }
    .rp-prog-bar { height:3px; border-radius:100px; margin-bottom:4px; transition:background 0.4s; }
    .rp-prog-lbl { font-size:9px; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; transition:color 0.3s; }

    /* INPUTS */
    .rp-label { display:block; font-size:12px; font-weight:700; color:#374151; margin-bottom:7px; letter-spacing:0.02em; text-transform:uppercase; }
    .rp-input { width:100%; border:1.5px solid #e5e7eb; background:#f9fafb; border-radius:13px; padding:13px 16px; font-size:15px; font-family:inherit; outline:none; transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; color:#111827; }
    .rp-input::placeholder { color:#9ca3af; }
    .rp-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.11); }
    .rp-input.error { border-color:#ef4444; box-shadow:0 0 0 4px rgba(239,68,68,0.09); }
    .rp-input.valid { border-color:#1b7d52; background:#f0fdf4; }
    .rp-input-wrap { position:relative; }
    .rp-icon-left { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }
    .rp-pl { padding-left:44px; }
    .rp-pr { padding-right:44px; }
    .rp-eye { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; padding:4px; display:flex; }
    .rp-eye:hover { color:#374151; }
    .rp-phone-pre { position:absolute; left:0; top:0; bottom:0; display:flex; align-items:center; padding:0 11px 0 13px; border-right:1.5px solid #e5e7eb; font-size:13px; font-weight:700; color:#374151; gap:4px; pointer-events:none; white-space:nowrap; }
    .rp-phl { padding-left:76px; }
    .rp-field-note { font-size:11px; color:#9ca3af; margin-top:5px; line-height:1.5; }

    /* ID TABS */
    .rp-id-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
    .rp-id-tab { flex:1; min-width:80px; padding:9px 6px; border-radius:11px; border:1.5px solid #e5e7eb; font-size:11px; font-weight:700; cursor:pointer; font-family:inherit; background:#f9fafb; color:#6b7280; transition:all 0.22s; text-align:center; white-space:nowrap; }
    .rp-id-tab.active { border-color:#2ec97e; background:#f0fdf4; color:#1b7d52; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .rp-id-tab:hover:not(.active) { border-color:#9ca3af; color:#374151; }

    /* PASSWORD STRENGTH */
    .rp-pw-bars { display:flex; gap:4px; margin-top:8px; }
    .rp-pw-bar  { flex:1; height:3px; border-radius:100px; transition:background 0.3s; }
    .rp-pw-hints { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
    .rp-pw-hint { display:inline-flex; align-items:center; gap:4px; font-size:10px; font-weight:600; padding:3px 8px; border-radius:100px; transition:all 0.2s; }
    .rp-pw-hint.met   { background:#f0fdf4; color:#1b7d52; }
    .rp-pw-hint.unmet { background:#f3f4f6; color:#9ca3af; }

    /* TERMS */
    .rp-terms-box { border:1.5px solid #e5e7eb; border-radius:13px; overflow:hidden; }
    .rp-terms-scroll { max-height:140px; overflow-y:auto; padding:14px 16px; font-size:12px; color:#374151; line-height:1.7; background:#f9fafb; scrollbar-width:thin; scrollbar-color:#d1d5db #f9fafb; }
    .rp-terms-scroll::-webkit-scrollbar { width:4px; }
    .rp-terms-scroll::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }
    .rp-terms-footer { padding:12px 16px; border-top:1.5px solid #e5e7eb; background:#fff; display:flex; align-items:center; gap:10px; cursor:pointer; }
    .rp-checkbox { width:18px; height:18px; border-radius:5px; border:2px solid #d1d5db; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all 0.2s; }
    .rp-checkbox.checked { background:linear-gradient(135deg,#2ec97e,#1b7d52); border-color:#1b7d52; }
    .rp-checkbox.checked svg { animation:rp-checkPop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* BUTTONS */
    .rp-btn-submit { width:100%; padding:14px; border-radius:13px; border:none; cursor:pointer; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-size:15px; font-weight:600; font-family:inherit; transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow:0 5px 20px rgba(13,51,34,0.3); display:flex; align-items:center; justify-content:center; gap:8px; }
    .rp-btn-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); box-shadow:0 9px 28px rgba(13,51,34,0.4); }
    .rp-btn-submit:disabled { opacity:0.52; cursor:not-allowed; transform:none; }
    .rp-btn-back { background:none; border:1.5px solid #e5e7eb; border-radius:100px; padding:9px 18px; font-family:inherit; font-size:12px; font-weight:600; color:#6b7280; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s; }
    .rp-btn-back:hover { border-color:#9ca3af; color:#374151; }

    /* ALERTS */
    .rp-err     { background:#fef2f2; border:1px solid #fecaca; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#dc2626; display:flex; align-items:flex-start; gap:7px; }
    .rp-success { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:11px; padding:10px 14px; font-size:12px; font-weight:500; color:#15803d; display:flex; align-items:center; gap:7px; }
    .rp-info-box { background:rgba(46,201,126,0.07); border:1px solid rgba(46,201,126,0.2); border-radius:11px; padding:10px 14px; display:flex; gap:9px; align-items:flex-start; }

    /* TRUST ROW */
    .rp-trust-row { display:flex; gap:10px; flex-wrap:wrap; margin-top:24px; }
    .rp-trust-item { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); border-radius:14px; padding:11px 14px; backdrop-filter:blur(8px); flex:1; min-width:160px; }
    .rp-trust-icon { width:32px; height:32px; flex-shrink:0; border-radius:9px; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; }

    /* MISC */
    .rp-spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:rp-spin 0.7s linear infinite; }
    .rp-deco { position:absolute; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }

    @media (max-width:1024px) { .rp-nav { padding:14px 28px; } .rp-card { padding:26px 26px; } }
    @media (max-width:640px) {
      .rp-nav { padding:14px 20px; }
      .rp-nav-links { display:none; }
      .rp-hamburger { display:flex; }
      .rp-card-outer { border-radius:20px; padding:4px; }
      .rp-card { padding:20px 16px; border-radius:16px; }
      .rp-deco { display:none; }
      .rp-id-tab { font-size:10px; padding:8px 4px; }
    }
  `}</style>
);

/* ── Atoms ── */
const Sp = () => <div className="rp-spinner" />;
const Arr = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const ArrL = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:13, height:13 }}>
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);
const ErrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:14, height:14, flexShrink:0, marginTop:1 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const OkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:14, height:14, flexShrink:0 }}>
    <path d="M7 12.5l3.2 3.2L17.5 8.5"/>
  </svg>
);
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:17, height:17 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:17, height:17 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
  </svg>
);
const InfoSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:14, height:14, flexShrink:0, marginTop:1 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

/* ── Progress Bar ── */
const PBar = ({ steps, cur }) => (
  <div className="rp-prog">
    {steps.map((s, i) => (
      <div key={s} className="rp-prog-step">
        <div className="rp-prog-bar" style={{ background: i <= cur ? "linear-gradient(to right,#2ec97e,#1b7d52)" : "#e5e7eb" }} />
        <span className="rp-prog-lbl" style={{ color: i <= cur ? "#1b7d52" : "#9ca3af" }}>{s}</span>
      </div>
    ))}
  </div>
);

/* ── Password Strength ── */
const pwChecks = [
  { key:"len",   label:"8+ chars",  test: p => p.length >= 8 },
  { key:"upper", label:"Uppercase", test: p => /[A-Z]/.test(p) },
  { key:"digit", label:"Number",    test: p => /\d/.test(p) },
  { key:"spcl",  label:"Symbol",    test: p => /[^A-Za-z0-9]/.test(p) },
];
const getPwStrength = p => !p ? 0 : pwChecks.filter(c => c.test(p)).length;
const strengthColors = ["#e5e7eb","#ef4444","#f59e0b","#3b82f6","#1b7d52"];
const strengthLabels = ["","Weak","Fair","Good","Strong"];

const PwStrength = ({ password }) => {
  const s = getPwStrength(password);
  if (!password) return null;
  return (
    <div>
      <div className="rp-pw-bars">
        {[1,2,3,4].map(i => (
          <div key={i} className="rp-pw-bar" style={{ background: i <= s ? strengthColors[s] : "#e5e7eb" }} />
        ))}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
        <div className="rp-pw-hints">
          {pwChecks.map(c => (
            <span key={c.key} className={`rp-pw-hint ${c.test(password) ? "met" : "unmet"}`}>
              {c.test(password) ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {s > 0 && <span style={{ fontSize:11, fontWeight:700, color:strengthColors[s], flexShrink:0, marginLeft:8 }}>{strengthLabels[s]}</span>}
      </div>
    </div>
  );
};

/* ── Terms Text ── */
const TermsText = () => (
  <>
    <p style={{ fontWeight:700, marginBottom:8, color:"#0d1f16" }}>Terms & Conditions — Proti-Binimoy</p>
    <p style={{ marginBottom:8 }}><strong>1. Eligibility.</strong> You must be 18+ years old and a resident of Bangladesh.</p>
    <p style={{ marginBottom:8 }}><strong>2. Account Responsibility.</strong> You are solely responsible for your credentials and all activity under your account.</p>
    <p style={{ marginBottom:8 }}><strong>3. Verified Listings.</strong> All listings must be accurate. Fraudulent or misleading listings will result in immediate suspension.</p>
    <p style={{ marginBottom:8 }}><strong>4. Sustainable Commerce.</strong> Users agree not to list prohibited, counterfeit, or environmentally harmful items.</p>
    <p style={{ marginBottom:8 }}><strong>5. Privacy.</strong> Personal information is collected for verification only and will never be sold to third parties.</p>
    <p style={{ marginBottom:8 }}><strong>6. Identity Verification.</strong> NID / DOB / Passport details are end-to-end encrypted and used solely for identity purposes.</p>
    <p style={{ marginBottom:8 }}><strong>7. Conduct.</strong> Harassment, discrimination, or abuse will result in a permanent ban.</p>
    <p style={{ marginBottom:8 }}><strong>8. Dispute Resolution.</strong> Proti-Binimoy assists in disputes but bears no liability for transaction outcomes.</p>
    <p><strong>9. Modifications.</strong> Terms may be updated. Continued use constitutes acceptance of any revisions.</p>
  </>
);

/* ══════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════ */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep]         = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // Step 0 — Personal
  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step 1 — Identity
  const [idType, setIdType]     = useState("nid");
  const [nid, setNid]           = useState("");
  const [dob, setDob]           = useState("");
  const [passport, setPassport] = useState("");

  // Step 2 — Security
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [termsRead, setTermsRead]   = useState(false);
  const [termsAgree, setTermsAgree] = useState(false);

  const handleTermsScroll = (e) => {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setTermsRead(true);
  };

  /* Step 0 — Personal (client-side validation only, no API) */
  const handlePersonal = (e) => {
    e.preventDefault(); setError("");
    if (!name.trim() || name.trim().length < 3) { setError("Enter your full name (at least 3 characters)."); return; }
    const d = phone.replace(/\D/g,"");
    if (d.length < 11) { setError("Enter a valid 11-digit Bangladeshi phone number."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    // Check if email already exists in mock store
    const users = getMockUsers();
    if (users[email.trim().toLowerCase()]) {
      setError("This email is already registered. Please sign in instead.");
      return;
    }
    setStep(1);
  };

  /* Step 1 — Identity */
  const handleIdentity = (e) => {
    e.preventDefault(); setError("");
    if (idType === "nid") {
      const n = nid.replace(/\D/g,"");
      if (![10,13,17].includes(n.length)) { setError("NID must be 10, 13, or 17 digits."); return; }
    } else if (idType === "dob") {
      if (!dob) { setError("Please select your date of birth."); return; }
      const age = (new Date() - new Date(dob)) / (1000*60*60*24*365.25);
      if (age < 18) { setError("You must be at least 18 years old to register."); return; }
    } else {
      if (!passport.trim() || passport.trim().length < 6) { setError("Enter a valid passport number (minimum 6 characters)."); return; }
    }
    setStep(2);
  };

  /* Step 2 — Security: save to mock store */
  const handleSecurity = (e) => {
    e.preventDefault(); setError("");
    if (getPwStrength(password) < 4) { setError("Password must have 8+ characters, an uppercase letter, a number, and a symbol."); return; }
    if (password !== confirm)        { setError("Passwords do not match."); return; }
    if (!termsAgree)                 { setError("You must agree to the Terms & Conditions to continue."); return; }

    setLoading(true);
    setTimeout(() => {
      const users   = getMockUsers();
      const emailKey = email.trim().toLowerCase();

      const identityValue =
        idType === "nid"      ? nid.replace(/\D/g,"") :
        idType === "dob"      ? dob :
                                passport.trim();

      const newUser = {
        id: `u_${Date.now()}`,
        email: emailKey,
        password,
        name: name.trim(),
        phone: phone.replace(/\D/g,""),
        joinDate: new Date().toISOString().split("T")[0],
        location: "",
        bio: "",
        idType,
        idValue: identityValue,
        avatar: null,
        rating: 0,
        reviews: 0,
        totalListings: 0,
        soldItems: 0,
        savedItems: 0,
        verified: false,
        memberTier: "Basic",
      };

      users[emailKey] = newUser;
      saveMockUsers(users);
      saveSession(newUser);

      setSuccess("Account created successfully!");
      setLoading(false);
      setStep(3);
      setTimeout(() => navigate("/profile", { replace: true }), 2200);
    }, 900);
  };

  const STEPS = ["Personal","Identity","Security","Done"];

  const renderCard = () => {
    /* SUCCESS */
    if (step === 3) return (
      <div className="rp-pop" style={{ textAlign:"center", padding:"12px 0" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#2ec97e,#1b7d52)", display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:18, boxShadow:"0 8px 28px rgba(46,201,126,0.4)", animation:"rp-pulse 1.6s ease-in-out infinite" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width:30, height:30 }}><path d="M7 12.5l3.2 3.2L17.5 8.5"/></svg>
        </div>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:26, fontWeight:700, color:"#0d1f16", marginBottom:10 }}>Welcome aboard!</h3>
        <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.65, marginBottom:20 }}>Your account has been created.<br/>Loading your profile…</p>
        <div style={{ height:4, borderRadius:100, background:"#f3f4f6", overflow:"hidden" }}>
          <div style={{ height:"100%", background:"linear-gradient(to right,#2ec97e,#1b7d52)", borderRadius:100, animation:"rp-bar 2s linear forwards" }} />
        </div>
      </div>
    );

    /* STEP 0 — Personal */
    if (step === 0) return (
      <div className="rp-slide" key="s0">
        <PBar steps={STEPS} cur={0} />
        <div className="rp-demo-box">
          <strong>🧪 Demo Mode</strong>
          A demo account already exists: <code>demo@protibi.com</code>. You can also create your own account here and it will be saved locally.
        </div>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#2ec97e", marginBottom:6 }}>Step 1 of 3</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.3vw,27px)", fontWeight:700, color:"#0d1f16", marginBottom:6 }}>Personal Information</h2>
        <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:20, fontWeight:300 }}>Let's start with your basic details. All fields are required.</p>

        <form onSubmit={handlePersonal} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label className="rp-label">Full Name</label>
            <div className="rp-input-wrap">
              <div className="rp-icon-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <input type="text" placeholder="e.g. Rafi Ahmed" value={name}
                onChange={e => setName(e.target.value)} autoComplete="name"
                className={`rp-input rp-pl ${name.trim().length >= 3 ? "valid" : ""}`} autoFocus />
            </div>
          </div>

          <div>
            <label className="rp-label">Phone Number</label>
            <div className="rp-input-wrap">
              <div className="rp-phone-pre">🇧🇩 +88</div>
              <input type="tel" inputMode="numeric" placeholder="01XXXXXXXXX" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} autoComplete="tel"
                className={`rp-input rp-phl ${phone.replace(/\D/g,"").length === 11 ? "valid" : ""}`} />
            </div>
            <p className="rp-field-note">Used for OTP verification at login.</p>
          </div>

          <div>
            <label className="rp-label">Email Address</label>
            <div className="rp-input-wrap">
              <div className="rp-icon-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} autoComplete="email"
                className={`rp-input rp-pl ${email && /\S+@\S+\.\S+/.test(email) ? "valid" : ""}`} />
            </div>
          </div>

          {error && <div className="rp-err"><ErrIcon />{error}</div>}
          <button type="submit" className="rp-btn-submit">Continue <Arr /></button>
        </form>

        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0 0" }}>
          <div style={{ flex:1, height:1, background:"#e5e7eb" }} />
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase", color:"#9ca3af" }}>Have an account</span>
          <div style={{ flex:1, height:1, background:"#e5e7eb" }} />
        </div>
        <p style={{ textAlign:"center", fontSize:13, color:"#6b7280", marginTop:14 }}>
          Already registered?{" "}
          <Link to="/signin" style={{ fontWeight:700, color:"#1b7d52", textDecoration:"none" }}>Sign in here</Link>
        </p>
      </div>
    );

    /* STEP 1 — Identity */
    if (step === 1) return (
      <div className="rp-slide" key="s1">
        <PBar steps={STEPS} cur={1} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#2ec97e", marginBottom:6 }}>Step 2 of 3</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.3vw,27px)", fontWeight:700, color:"#0d1f16", marginBottom:6 }}>Identity Verification</h2>
        <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:16, fontWeight:300 }}>Choose one identity document to verify your account.</p>

        <div className="rp-id-tabs">
          {[
            { key:"nid", icon:"🪪", label:"NID Number" },
            { key:"dob", icon:"📅", label:"Date of Birth" },
            { key:"passport", icon:"🛂", label:"Passport" },
          ].map(t => (
            <button key={t.key} type="button"
              className={`rp-id-tab ${idType === t.key ? "active" : ""}`}
              onClick={() => { setIdType(t.key); setError(""); }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleIdentity} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {idType === "nid" && (
            <div style={{ animation:"rp-slideIn 0.28s ease forwards" }}>
              <label className="rp-label">National ID Number</label>
              <div className="rp-input-wrap">
                <div className="rp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <input type="text" inputMode="numeric" placeholder="10, 13, or 17 digit NID"
                  value={nid} onChange={e => setNid(e.target.value.replace(/\D/g,"").slice(0,17))}
                  className={`rp-input rp-pl ${[10,13,17].includes(nid.replace(/\D/g,"").length) ? "valid" : ""}`} autoFocus />
              </div>
              <p className="rp-field-note">Encrypted and used for identity verification only.</p>
            </div>
          )}
          {idType === "dob" && (
            <div style={{ animation:"rp-slideIn 0.28s ease forwards" }}>
              <label className="rp-label">Date of Birth</label>
              <div className="rp-input-wrap">
                <div className="rp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split("T")[0]}
                  className={`rp-input rp-pl ${dob ? "valid" : ""}`} autoFocus />
              </div>
              <p className="rp-field-note">You must be at least 18 years old to register.</p>
            </div>
          )}
          {idType === "passport" && (
            <div style={{ animation:"rp-slideIn 0.28s ease forwards" }}>
              <label className="rp-label">Passport Number</label>
              <div className="rp-input-wrap">
                <div className="rp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                </div>
                <input type="text" placeholder="e.g. AB1234567" value={passport}
                  onChange={e => setPassport(e.target.value.toUpperCase().slice(0,12))}
                  className={`rp-input rp-pl ${passport.trim().length >= 6 ? "valid" : ""}`} autoFocus />
              </div>
              <p className="rp-field-note">Enter exactly as it appears on your passport.</p>
            </div>
          )}

          <div className="rp-info-box">
            <InfoSvg />
            <p style={{ fontSize:12, color:"#374151", lineHeight:1.55, fontWeight:300 }}>
              This data is <strong style={{ fontWeight:700, color:"#1b7d52" }}>end-to-end encrypted</strong> and used solely for identity verification. We never share it.
            </p>
          </div>

          {error && <div className="rp-err"><ErrIcon />{error}</div>}
          <button type="submit" className="rp-btn-submit">Continue <Arr /></button>
        </form>
        <button className="rp-btn-back" style={{ marginTop:14 }} onClick={() => { setStep(0); setError(""); }}>
          <ArrL /> Back
        </button>
      </div>
    );

    /* STEP 2 — Security */
    if (step === 2) return (
      <div className="rp-slide" key="s2">
        <PBar steps={STEPS} cur={2} />
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"0.3em", textTransform:"uppercase", color:"#2ec97e", marginBottom:6 }}>Step 3 of 3</p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(20px,2.3vw,27px)", fontWeight:700, color:"#0d1f16", marginBottom:6 }}>Create Password</h2>
        <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.6, marginBottom:18, fontWeight:300 }}>Choose a strong password and agree to our terms to complete registration.</p>

        <form onSubmit={handleSecurity} style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label className="rp-label">Password</label>
            <div className="rp-input-wrap">
              <div className="rp-icon-left">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <input type={showPw ? "text" : "password"} placeholder="Create a strong password"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                className={`rp-input rp-pl rp-pr ${getPwStrength(password) === 4 ? "valid" : password ? "error" : ""}`} autoFocus />
              <button type="button" className="rp-eye" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                {showPw ? <EyeOn /> : <EyeOff />}
              </button>
            </div>
            <PwStrength password={password} />
          </div>

          {password.length > 0 && (
            <div style={{ animation:"rp-slideIn 0.28s ease forwards" }}>
              <label className="rp-label">Confirm Password</label>
              <div className="rp-input-wrap">
                <div className="rp-icon-left">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width:15, height:15 }}><path d="M7 12.5l3.2 3.2L17.5 8.5"/></svg>
                </div>
                <input type={showCf ? "text" : "password"} placeholder="Re-enter your password"
                  value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password"
                  className={`rp-input rp-pl rp-pr ${confirm && confirm === password ? "valid" : confirm ? "error" : ""}`} />
                <button type="button" className="rp-eye" onClick={() => setShowCf(!showCf)} aria-label="Toggle confirm">
                  {showCf ? <EyeOn /> : <EyeOff />}
                </button>
              </div>
              {confirm && confirm !== password && <p style={{ fontSize:11, color:"#ef4444", marginTop:5, fontWeight:600 }}>Passwords don't match.</p>}
              {confirm && confirm === password  && <p style={{ fontSize:11, color:"#1b7d52", marginTop:5, fontWeight:600 }}>✓ Passwords match!</p>}
            </div>
          )}

          <div>
            <label className="rp-label" style={{ marginBottom:10 }}>Terms & Conditions <span style={{ color:"#ef4444" }}>*</span></label>
            <div className="rp-terms-box">
              <div className="rp-terms-scroll" onScroll={handleTermsScroll}><TermsText /></div>
              <div className="rp-terms-footer" onClick={() => setTermsAgree(v => !v)} role="button" tabIndex={0}
                onKeyDown={e => e.key === " " && setTermsAgree(v => !v)}>
                <div className={`rp-checkbox ${termsAgree ? "checked" : ""}`}>
                  {termsAgree && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width:11, height:11 }}>
                      <path d="M7 12.5l3.2 3.2L17.5 8.5"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize:12, color:"#374151", lineHeight:1.5, flex:1, userSelect:"none" }}>
                  I have read and agree to the <strong style={{ color:"#1b7d52" }}>Terms & Conditions</strong> and <strong style={{ color:"#1b7d52" }}>Privacy Policy</strong>
                </span>
              </div>
            </div>
            {!termsRead && <p style={{ fontSize:11, color:"#9ca3af", marginTop:5 }}>↑ Scroll through the terms above before agreeing.</p>}
          </div>

          {error   && <div className="rp-err"><ErrIcon />{error}</div>}
          {success && <div className="rp-success"><OkIcon />{success}</div>}

          <button type="submit" disabled={loading || !termsAgree} className="rp-btn-submit">
            {loading ? <><Sp /> Creating Account…</> : <>Create Account <Arr /></>}
          </button>
        </form>
        <button className="rp-btn-back" style={{ marginTop:14 }} onClick={() => { setStep(1); setError(""); }}>
          <ArrL /> Back to Identity
        </button>
      </div>
    );
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", overflowX:"hidden", minHeight:"100vh" }}>
      <GlobalStyles />

      {/* NAV */}
      <nav className="rp-nav">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, flexShrink:0, background:"linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius:11, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:19, color:"#fff" }}>P</div>
          <div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:700, color:"#fff", lineHeight:1 }}>Proti-Binimoy</p>
            <p style={{ fontSize:9, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)", marginTop:3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="rp-nav-links">
          <Link to="/"       className="rp-nav-link">Home</Link>
          <Link to="/about"  className="rp-nav-link">About</Link>
          <Link to="/signin" className="rp-nav-link">Sign In</Link>
          <Link to="/register" className="rp-nav-cta">Register →</Link>
        </div>
        <button className="rp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform:"rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity:0 } : {}} />
          <span style={menuOpen ? { transform:"rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`rp-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/"       className="rp-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about"  className="rp-mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/signin" className="rp-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
      </div>

      {/* PAGE */}
      <section style={{ position:"relative", minHeight:"100vh", backgroundImage:`url(${websiteBackground})`, backgroundSize:"cover", backgroundPosition:"center" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(115deg,rgba(2,6,23,0.92) 0%,rgba(2,6,23,0.78) 42%,rgba(8,35,26,0.6) 100%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize:"56px 56px" }} />
        <div style={{ position:"absolute", top:-80, right:-60, width:420, height:420, background:"radial-gradient(circle,rgba(46,201,126,0.15) 0%,transparent 65%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:-80, left:-60, width:360, height:360, background:"radial-gradient(circle,rgba(27,125,82,0.12) 0%,transparent 65%)", borderRadius:"50%" }} />

        <div className="rp-deco" style={{ width:82, height:82, top:"18%", left:"4%", animation:"rp-float 5.5s ease-in-out infinite" }}><span style={{ fontSize:30 }}>🌱</span></div>
        <div className="rp-deco" style={{ width:66, height:66, top:"65%", left:"6%", animation:"rp-float 7s ease-in-out infinite 1.2s" }}><span style={{ fontSize:24 }}>📦</span></div>
        <div className="rp-deco" style={{ width:58, height:58, top:"38%", right:"4%", animation:"rp-float 6s ease-in-out infinite 0.5s" }}><span style={{ fontSize:22 }}>🤝</span></div>
        <div className="rp-deco" style={{ width:50, height:50, top:"74%", right:"7%", animation:"rp-float 8s ease-in-out infinite 2s" }}><span style={{ fontSize:18 }}>♻️</span></div>

        <div style={{ position:"relative", zIndex:10, maxWidth:640, margin:"0 auto", padding:"108px 24px 60px", width:"100%" }}>
          <div className="rp-fade rp-d1" style={{ display:"flex", justifyContent:"center", marginBottom:22 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(46,201,126,0.12)", border:"1px solid rgba(46,201,126,0.3)", borderRadius:100, padding:"7px 16px" }}>
              <div style={{ width:7, height:7, background:"#2ec97e", borderRadius:"50%", animation:"rp-shimmer 2s infinite" }} />
              <span style={{ fontSize:12, fontWeight:500, color:"#2ec97e", letterSpacing:"0.05em" }}>Join the Proti-Binimoy community</span>
            </div>
          </div>

          <h1 className="rp-fade rp-d2" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,4vw,52px)", fontWeight:900, lineHeight:1.08, color:"#fff", textAlign:"center", marginBottom:12 }}>
            Create your<br /><em style={{ fontStyle:"italic", color:"#2ec97e" }}>free account.</em>
          </h1>
          <p className="rp-fade rp-d3" style={{ fontSize:"clamp(13px,1.4vw,15px)", lineHeight:1.75, color:"rgba(255,255,255,0.58)", textAlign:"center", maxWidth:380, margin:"0 auto 30px", fontWeight:300 }}>
            Buy, sell, and barter sustainably with verified members across Bangladesh.
          </p>

          <div className="rp-fade rp-d4">
            <div className="rp-card-outer">
              <div className="rp-card">{renderCard()}</div>
            </div>
          </div>

          {step < 3 && (
            <div className="rp-fade rp-d5 rp-trust-row">
              {[
                { icon:"🔒", title:"Secure & Private",   text:"End-to-end encryption"  },
                { icon:"✅", title:"Verified Community", text:"Safe marketplace"        },
                { icon:"♻️", title:"Sustainable",        text:"Eco-friendly exchanges"  },
              ].map((t, i) => (
                <div key={i} className="rp-trust-item">
                  <div className="rp-trust-icon"><span style={{ fontSize:15 }}>{t.icon}</span></div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:"#fff", lineHeight:1 }}>{t.title}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:3 }}>{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;