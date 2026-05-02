import React, { useState } from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

/* ─── Injected global CSS + all media queries ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes pb-float1 { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
    @keyframes pb-float2 { 0%,100%{transform:translateY(0) rotate(3deg)}  50%{transform:translateY(-10px) rotate(-2deg)} }
    @keyframes pb-float3 { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-18px) rotate(3deg)} }
    @keyframes pb-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes pb-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pb-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes pb-slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }

    .pb-fade { opacity:0; animation:pb-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards }
    .pb-d1{animation-delay:0.1s} .pb-d2{animation-delay:0.25s} .pb-d3{animation-delay:0.4s}
    .pb-d4{animation-delay:0.55s} .pb-d5{animation-delay:0.7s}

    /* ── NAV ── */
    .pb-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .pb-nav-links { display: flex; align-items: center; gap: 32px; }
    .pb-nav-link {
      text-decoration: none; color: rgba(255,255,255,0.75);
      font-size: 14px; font-weight: 500; letter-spacing: 0.03em; transition: color 0.2s;
    }
    .pb-nav-link:hover { color: #2ec97e; }
    .pb-nav-cta {
      text-decoration: none; color: #2ec97e; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.15); border: 1px solid rgba(46,201,126,0.4);
      padding: 9px 22px; border-radius: 100px; transition: background 0.2s;
    }
    .pb-nav-cta:hover { background: rgba(46,201,126,0.28); }
    .pb-nav-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      text-decoration: none; color: #2ec97e;
      background: rgba(46,201,126,0.15); border: 1.5px solid rgba(46,201,126,0.45);
      transition: all 0.2s;
    }
    .pb-nav-avatar:hover {
      background: rgba(46,201,126,0.28); border-color: rgba(46,201,126,0.75); box-shadow: 0 0 12px rgba(46,201,126,0.25);
    }
    .pb-hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; background: none; border: none; padding: 6px;
    }
    .pb-hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.25s; }

    /* Mobile Nav Dropdown */
    .pb-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 24px 24px 32px; flex-direction: column; gap: 0;
      animation: pb-slideDown 0.25s ease forwards;
    }
    .pb-mobile-menu.open { display: flex; }
    .pb-mobile-link {
      text-decoration: none; color: rgba(255,255,255,0.8); font-size: 18px;
      font-weight: 500; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .pb-mobile-cta {
      text-decoration: none; display: block; text-align: center; margin-top: 20px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52); color: #fff;
      font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px;
    }

    /* ── HERO ── */
    .pb-hero-inner {
      position: relative; z-index: 10;
      display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
      max-width: 1280px; margin: 0 auto; padding: 140px 48px 80px; width: 100%;
    }
    .pb-hero-bubbles { position: relative; height: 520px; }
    .pb-bubble {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; background: rgba(255,255,255,0.07);
    }
    .pb-bubble-glow {
      position: absolute; inset: -20px;
      background: radial-gradient(circle,rgba(46,201,126,0.2),transparent 70%); border-radius: 50%;
    }

    /* ── STATS ── */
    .pb-stats { display: flex; gap: 36px; margin-top: 48px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); }

    /* ── HERO ACTIONS ── */
    .pb-hero-actions { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

    /* ── BUTTONS ── */
    .pb-btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      color: #fff; text-decoration: none; font-weight: 600;
      font-size: 16px; padding: 16px 34px; border-radius: 100px;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 8px 32px rgba(46,201,126,0.35);
    }
    .pb-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(46,201,126,0.5); }
    .pb-btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      color: rgba(255,255,255,0.7); text-decoration: none; font-weight: 500;
      font-size: 15px; padding: 16px 24px; border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.2); transition: all 0.2s;
    }
    .pb-btn-ghost:hover { border-color: rgba(255,255,255,0.45); color: #fff; background: rgba(255,255,255,0.06); }

    /* ── FEATURE CARDS ── */
    .pb-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
    .pb-card {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 28px; padding: 40px 36px; position: relative; overflow: hidden;
      transition: transform 0.3s, border-color 0.3s, background 0.3s; cursor: default;
    }
    .pb-card:hover { transform: translateY(-6px); border-color: rgba(46,201,126,0.3); background: rgba(255,255,255,0.07); }

    /* ── FEATURES HEADER ── */
    .pb-features-header { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: end; margin-bottom: 72px; }

    /* ── HOW IT WORKS ── */
    .pb-steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 48px; position: relative; }
    .pb-steps-line {
      position: absolute; top: 56px; left: calc(16.666% + 20px); right: calc(16.666% + 20px);
      height: 0; border-top: 2px dashed rgba(27,125,82,0.3); z-index: 0;
    }
    .pb-step-num {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display',serif; font-size: 28px; font-weight: 700;
      margin: 0 auto 28px;
    }

    /* ── CATEGORIES ── */
    .pb-cats-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
    .pb-cats-grid { display: flex; flex-wrap: wrap; gap: 12px; }
    .pb-cat-pill {
      display: inline-flex; align-items: center; gap: 10px; padding: 14px 24px;
      border-radius: 100px; border: 1.5px solid; font-size: 14px; font-weight: 500;
      cursor: pointer; transition: all 0.25s; text-decoration: none;
    }
    .pb-cat-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

    /* ── CTA ACTIONS ── */
    .pb-cta-actions { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }

    /* ── FOOTER ── */
    .pb-footer-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }

    /* ════════════════════════════════════════
       RESPONSIVE — Tablet (≤ 1024px)
    ════════════════════════════════════════ */
    @media (max-width: 1024px) {
      .pb-nav { padding: 14px 28px; }
      .pb-hero-inner { grid-template-columns: 1fr; padding: 120px 28px 64px; gap: 40px; }
      .pb-hero-bubbles { height: 320px; }
      .pb-cards-grid { grid-template-columns: repeat(2,1fr); }
      .pb-features-header { grid-template-columns: 1fr; gap: 24px; margin-bottom: 48px; }
      .pb-steps { grid-template-columns: 1fr 1fr; gap: 40px; }
      .pb-steps-line { display: none; }
    }

    /* ════════════════════════════════════════
       RESPONSIVE — Mobile (≤ 640px)
    ════════════════════════════════════════ */
    @media (max-width: 640px) {
      /* Nav */
      .pb-nav { padding: 14px 20px; }
      .pb-nav-links { display: none; }
      .pb-hamburger { display: flex; }

      /* Hero */
      .pb-hero-inner { grid-template-columns: 1fr; padding: 100px 20px 56px; gap: 0; }
      .pb-hero-bubbles { display: none; }
      .pb-stats { gap: 20px; flex-wrap: wrap; }
      .pb-hero-actions { gap: 12px; }
      .pb-btn-primary { font-size: 15px; padding: 14px 26px; }
      .pb-btn-ghost { font-size: 14px; padding: 14px 20px; }

      /* Sections padding */
      .pb-section-pad { padding: 72px 20px !important; }
      .pb-section-pad-sm { padding: 56px 20px !important; }

      /* Features */
      .pb-cards-grid { grid-template-columns: 1fr; gap: 16px; }
      .pb-features-header { grid-template-columns: 1fr; gap: 20px; margin-bottom: 40px; }
      .pb-card { padding: 28px 24px; border-radius: 20px; }

      /* How it works */
      .pb-steps { grid-template-columns: 1fr; gap: 40px; }
      .pb-steps-line { display: none; }
      .pb-step-num { width: 64px; height: 64px; font-size: 22px; margin-bottom: 20px; }

      /* Categories */
      .pb-cats-top { flex-direction: column; align-items: flex-start; gap: 12px; }
      .pb-cat-pill { font-size: 13px; padding: 11px 18px; }

      /* CTA */
      .pb-cta-actions { flex-direction: column; align-items: stretch; gap: 12px; }
      .pb-cta-actions a { text-align: center; justify-content: center; }

      /* Footer */
      .pb-footer-inner { flex-direction: column; gap: 20px; text-align: center; }
    }

    /* ── FOOTER MODALS ── */
    @keyframes pb-modalIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes pb-backdropIn { from{opacity:0} to{opacity:1} }

    .pb-modal-backdrop {
      position:fixed; inset:0; z-index:9000;
      background:rgba(8,35,26,0.72); backdrop-filter:blur(10px);
      display:flex; align-items:center; justify-content:center;
      padding:24px; animation:pb-backdropIn 0.22s ease forwards;
    }
    .pb-modal {
      background:#fff; border-radius:24px; width:100%; max-width:640px;
      max-height:85vh; display:flex; flex-direction:column;
      box-shadow:0 40px 100px rgba(0,0,0,0.35);
      animation:pb-modalIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
      overflow:hidden;
    }
    .pb-modal-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:24px 28px 20px; border-bottom:1px solid #f0f0ee; flex-shrink:0;
    }
    .pb-modal-body { overflow-y:auto; padding:28px; flex:1; scrollbar-width:thin; scrollbar-color:#d1d5db #f9fafb; }
    .pb-modal-body::-webkit-scrollbar { width:4px; }
    .pb-modal-body::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }
    .pb-modal-close {
      width:36px; height:36px; border-radius:50%; border:1.5px solid #e5e7eb;
      background:#f9fafb; color:#6b7280; cursor:pointer; font-size:18px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      transition:background 0.2s, border-color 0.2s; line-height:1;
    }
    .pb-modal-close:hover { background:#f3f4f6; border-color:#9ca3af; color:#374151; }
    .pb-modal-section { margin-bottom:28px; }
    .pb-modal-section:last-child { margin-bottom:0; }
    .pb-modal-section h3 {
      font-family:'Playfair Display',serif; font-size:16px; font-weight:700;
      color:#0d1f16; margin-bottom:8px;
    }
    .pb-modal-section p, .pb-modal-section li {
      font-size:14px; line-height:1.8; color:#4b5563; font-weight:300;
    }
    .pb-modal-section ul { padding-left:18px; }
    .pb-modal-section li { margin-bottom:4px; }
    .pb-modal-divider { height:1px; background:#f0f0ee; margin:20px 0; }
    .pb-modal-tag {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(46,201,126,0.1); border:1px solid rgba(46,201,126,0.25);
      border-radius:100px; padding:4px 12px; margin-bottom:16px;
      font-size:11px; font-weight:600; color:#1b7d52; letter-spacing:0.06em; text-transform:uppercase;
    }
    /* Contact form */
    .pb-contact-input {
      width:100%; border:1.5px solid #e5e7eb; background:#f9fafb;
      border-radius:12px; padding:12px 14px; font-size:14px;
      font-family:inherit; outline:none; color:#111827;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .pb-contact-input::placeholder { color:#9ca3af; }
    .pb-contact-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .pb-contact-label { display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:6px; letter-spacing:0.04em; text-transform:uppercase; }
    .pb-contact-submit {
      width:100%; padding:13px; border-radius:12px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff;
      font-size:15px; font-weight:600; font-family:inherit;
      transition:opacity 0.2s, transform 0.15s;
      box-shadow:0 6px 20px rgba(46,201,126,0.3);
    }
    .pb-contact-submit:hover { opacity:0.88; transform:translateY(-1px); }
    .pb-contact-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .pb-contact-success {
      text-align:center; padding:32px 20px;
    }
  `}</style>
);

/* ─── Data ─── */
const featureCards = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <path d="M12 3l6 2.5v5.8c0 4.1-2.5 7.9-6 9.7-3.5-1.8-6-5.6-6-9.7V5.5L12 3z" />
        <path d="M9.5 12.2l1.7 1.7 3.6-3.9" />
      </svg>
    ),
    title: "Trusted Exchanges",
    description: "Connect with verified people in your area through a platform engineered for safer, scam-free second-hand trading.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <path d="M7.5 7.5h5V3.8" />
        <path d="M16.7 8.1A6.8 6.8 0 007.5 7.5L5 10" />
        <path d="M16.5 16.5h-5v3.7" />
        <path d="M7.3 15.9a6.8 6.8 0 009.2.6L19 14" />
      </svg>
    ),
    title: "Sustainable Choices",
    description: "Give quality items a second life, reduce household waste, and support a smarter circular economy in Bangladesh.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
        <path d="M8 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path d="M4.5 18.5c.8-2.1 2.4-3.2 4.8-3.2s4 1.1 4.8 3.2M11.2 18.5c.7-1.9 2.2-2.9 4.3-2.9 1.9 0 3.3.9 4 2.9" />
      </svg>
    ),
    title: "Community First",
    description: "Build genuine local connections while discovering items that still hold real value — within your neighbourhood.",
  },
];

const marqueeItems = [
  "Zero Waste Trading", "Trusted Community", "Secure Exchanges",
  "Bangladesh-Wide Network", "Smarter Consumption", "Quality Second-Hand Goods",
];

const steps = [
  {
    num: "01", title: "List or Browse",
    desc: "Post items you no longer need or browse thousands of second-hand listings near you.",
    gradient: "linear-gradient(135deg,#2ec97e,#1b7d52)", shadow: "0 12px 40px rgba(46,201,126,0.4)",
  },
  {
    num: "02", title: "Connect & Negotiate",
    desc: "Chat directly with buyers or sellers. Agree on price, trade, or barter — on your terms.",
    gradient: "linear-gradient(135deg,#c49a3c,#a07820)", shadow: "0 12px 40px rgba(196,154,60,0.4)",
  },
  {
    num: "03", title: "Exchange Safely",
    desc: "Meet locally with confidence using verified profiles and our community reputation system.",
    gradient: "linear-gradient(135deg,#1b7d52,#0d3322)", shadow: "0 12px 40px rgba(27,125,82,0.4)",
  },
];

const categories = [
  { icon: "📱", label: "Electronics",        color: "rgba(27,125,82,0.3)",   text: "#1b7d52",  bg: "rgba(27,125,82,0.06)"  },
  { icon: "👕", label: "Clothing & Fashion", color: "rgba(196,154,60,0.3)",  text: "#9a7520",  bg: "rgba(196,154,60,0.07)" },
  { icon: "📚", label: "Books & Education",  color: "rgba(46,150,201,0.3)",  text: "#1a6a99",  bg: "rgba(46,150,201,0.07)" },
  { icon: "🪑", label: "Home & Furniture",   color: "rgba(201,46,100,0.3)",  text: "#a01840",  bg: "rgba(201,46,100,0.07)" },
  { icon: "🚲", label: "Sports & Hobbies",   color: "rgba(100,46,201,0.3)",  text: "#5a18a0",  bg: "rgba(100,46,201,0.07)" },
  { icon: "🔧", label: "Tools & Hardware",   color: "rgba(201,100,46,0.3)",  text: "#a04510",  bg: "rgba(201,100,46,0.07)" },
  { icon: "🎮", label: "Games & Toys",       color: "rgba(27,125,82,0.3)",   text: "#1b7d52",  bg: "rgba(27,125,82,0.06)"  },
  { icon: "🌿", label: "Plants & Garden",    color: "rgba(196,154,60,0.3)",  text: "#9a7520",  bg: "rgba(196,154,60,0.07)" },
];

const stats = [
  { num: "12k", suffix: "+", label: "Items Listed"  },
  { num: "8k",  suffix: "+", label: "Active Users"  },
  { num: "64",  suffix: "",  label: "Cities"        },
];

/* ─── Footer Modal ─── */
const FooterModal = ({ type, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1200);
  };

  const CONTENT = {
    Privacy: {
      emoji: "🔐", label: "Privacy Policy", updated: "Last updated: January 2026",
      sections: [
        { title: "Information We Collect", body: "We collect information you provide directly — such as your name, email address, phone number, and profile details when you register. We also collect information about how you use our platform, including listings you view, items you save, and messages you send through our in-app system." },
        { title: "How We Use Your Information", items: ["To create and manage your account", "To connect buyers and sellers safely", "To send important service notifications", "To improve platform features and user experience", "To detect and prevent fraud or misuse"] },
        { title: "Information Sharing", body: "We do not sell your personal data to third parties. Your contact information is only shared with other users when you choose to initiate a trade or exchange. We may share anonymised, aggregated data for analytics purposes." },
        { title: "Data Security", body: "All data is encrypted in transit using TLS. Passwords are hashed and never stored in plain text. We conduct regular security audits and follow industry best practices to keep your information safe." },
        { title: "Your Rights", items: ["Request a copy of your personal data", "Ask us to correct inaccurate information", "Request deletion of your account and data", "Opt out of non-essential communications"] },
        { title: "Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at privacy@protibi.com. We aim to respond within 48 hours." },
      ],
    },
    Terms: {
      emoji: "📋", label: "Terms of Service", updated: "Last updated: January 2026",
      sections: [
        { title: "Acceptance of Terms", body: "By accessing or using Proti-Binimoy, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform." },
        { title: "Eligibility", body: "You must be at least 16 years old to use Proti-Binimoy. By creating an account, you confirm that you are of eligible age and that the information you provide is accurate and truthful." },
        { title: "User Responsibilities", items: ["List only items you legally own or have permission to sell", "Provide accurate descriptions, photos, and pricing", "Respond to messages in a timely manner", "Complete agreed trades in good faith", "Do not engage in fraud, harassment, or deceptive practices"] },
        { title: "Prohibited Items", body: "The following items are strictly prohibited: counterfeit or stolen goods, weapons and ammunition, controlled substances, adult content, and any items banned under Bangladeshi law. Violating this rule will result in immediate account suspension." },
        { title: "Platform Role", body: "Proti-Binimoy is a peer-to-peer marketplace. We facilitate connections between users but are not a party to any transaction. We are not responsible for the quality, safety, or legality of items listed, or for any disputes between users." },
        { title: "Termination", body: "We reserve the right to suspend or terminate accounts that violate these Terms, engage in harmful behaviour, or harm the integrity of the platform. You may also delete your account at any time from your profile settings." },
      ],
    },
    Contact: null,
  };

  const content = CONTENT[type];

  return (
    <div className="pb-modal-backdrop" onClick={onClose}>
      <div className="pb-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pb-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,rgba(46,201,126,0.15),rgba(27,125,82,0.25))", border: "1px solid rgba(46,201,126,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {type === "Privacy" ? "🔐" : type === "Terms" ? "📋" : "✉️"}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1b7d52", letterSpacing: "0.08em", textTransform: "uppercase" }}>Proti-Binimoy</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0d1f16", lineHeight: 1.2 }}>
                {type === "Privacy" ? "Privacy Policy" : type === "Terms" ? "Terms of Service" : "Get in Touch"}
              </h2>
            </div>
          </div>
          <button className="pb-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="pb-modal-body">
          {/* Privacy & Terms */}
          {(type === "Privacy" || type === "Terms") && content && (
            <>
              <div className="pb-modal-tag">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ec97e", display: "inline-block" }} />
                {content.updated}
              </div>
              {content.sections.map((s, i) => (
                <div key={i} className="pb-modal-section">
                  <h3>{s.title}</h3>
                  {s.body && <p>{s.body}</p>}
                  {s.items && <ul>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ul>}
                  {i < content.sections.length - 1 && <div className="pb-modal-divider" />}
                </div>
              ))}
            </>
          )}

          {/* Contact */}
          {type === "Contact" && (
            sent ? (
              <div className="pb-contact-success">
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0d1f16", marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>Thanks for reaching out, <strong>{form.name}</strong>. Our team will get back to you at <strong>{form.email}</strong> within 24–48 hours.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24, padding: "16px 18px", borderRadius: 14, background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.2)" }}>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                    Have a question, feedback, or need help with a trade? We're here for you. Fill out the form below and our team will respond within <strong>24–48 hours</strong>.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="pb-contact-label">Your Name</label>
                    <input className="pb-contact-input" placeholder="e.g. Rafiul Hasan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="pb-contact-label">Email Address</label>
                    <input className="pb-contact-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="pb-contact-label">Subject</label>
                  <select className="pb-contact-input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ cursor: "pointer" }}>
                    <option value="">Select a topic…</option>
                    <option>General Enquiry</option>
                    <option>Report a Problem</option>
                    <option>Account & Security</option>
                    <option>Trade Dispute</option>
                    <option>Feedback & Suggestions</option>
                    <option>Partnership Opportunity</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="pb-contact-label">Message</label>
                  <textarea className="pb-contact-input" rows={5} placeholder="Tell us how we can help…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical", minHeight: 110 }} />
                </div>

                <button className="pb-contact-submit" onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message}>
                  {sending ? "Sending…" : "Send Message →"}
                </button>

                <div style={{ marginTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { icon: "📧", label: "Email", val: "hello@protibi.com" },
                    { icon: "📍", label: "Location", val: "Dhanmondi, Dhaka" },
                    { icon: "⏱️", label: "Response", val: "Within 48 hours" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                        <p style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Component ─── */
const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null); // "Privacy" | "Terms" | "Contact" | null

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#faf8f2", color: "#0d1f16", overflowX: "hidden" }}>
      <GlobalStyles />

      {/* ════ NAV ════ */}
      <nav className="pb-nav">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, flexShrink: 0,
            background: "linear-gradient(135deg,#2ec97e,#1b7d52)",
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 20, color: "#fff",
          }}>P</div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              Proti-Binimoy
            </p>
            <p style={{ fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
              Sustainable Marketplace
            </p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="pb-nav-links">
          <Link to="/"        className="pb-nav-link">Home</Link>
          <Link to="/marketplace"  className="pb-nav-link">Browse</Link>
          <Link to="/about"   className="pb-nav-link">About</Link>
          <Link to="/profile" className="pb-nav-avatar" aria-label="Profile">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </Link>
          <Link to="/signin"  className="pb-nav-cta">Sign In →</Link>
        </div>

        {/* Hamburger */}
        <button className="pb-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div className={`pb-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/"        className="pb-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/marketplace"  className="pb-mobile-link" onClick={() => setMenuOpen(false)}>Browse</Link>
        <Link to="/about"   className="pb-mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/signin"  className="pb-mobile-cta"  onClick={() => setMenuOpen(false)}>Sign In →</Link>
      </div>

      {/* ════ HERO ════ */}
      <section style={{
        position: "relative", minHeight: "100vh", background: "#08231a",
        overflow: "hidden", display: "flex", alignItems: "center",
        backgroundImage: `url(${websiteBackground})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        {/* Overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(8,35,26,0.92) 0%,rgba(8,35,26,0.75) 55%,rgba(8,35,26,0.45) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: -120, right: -80,   width: 620, height: 620, background: "radial-gradient(circle,rgba(27,125,82,0.38) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -150, left: -100, width: 480, height: 480, background: "radial-gradient(circle,rgba(46,201,126,0.16) 0%,transparent 65%)", borderRadius: "50%" }} />

        <div className="pb-hero-inner">
          {/* Left */}
          <div>
            {/* Badge */}
            <div className="pb-fade pb-d1" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(46,201,126,0.12)", border: "1px solid rgba(46,201,126,0.35)",
              borderRadius: 100, padding: "8px 18px", marginBottom: 28,
            }}>
              <div style={{ width: 7, height: 7, background: "#2ec97e", borderRadius: "50%", animation: "pb-shimmer 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#2ec97e", letterSpacing: "0.05em" }}>
                Bangladesh's Sustainable Exchange Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="pb-fade pb-d2" style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(40px,5.5vw,78px)", fontWeight: 900,
              lineHeight: 1.04, color: "#fff", marginBottom: 24,
            }}>
              Give quality things<br />
              <em style={{ fontStyle: "italic", color: "#2ec97e" }}>a second life.</em><br />
              <span style={{ color: "#f3edd8", fontSize: "clamp(32px,4.5vw,64px)" }}>Trade smarter.</span>
            </h1>

            <p className="pb-fade pb-d3" style={{
              fontSize: "clamp(15px,1.8vw,17px)", lineHeight: 1.75,
              color: "rgba(255,255,255,0.65)", maxWidth: 480, marginBottom: 36, fontWeight: 300,
            }}>
              Proti-Binimoy connects people across Bangladesh for trusted second-hand
              buying, selling, and bartering — making sustainable living feel effortless.
            </p>

            {/* CTA Buttons */}
            <div className="pb-hero-actions pb-fade pb-d4">
              <Link to="/marketplace" className="pb-btn-primary">
                Explore Marketplace
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how" className="pb-btn-ghost">How it works</a>
            </div>

            {/* Stats */}
            <div className="pb-stats pb-fade pb-d5">
              {stats.map(({ num, suffix, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,3vw,36px)", fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    {num}<span style={{ color: "#2ec97e" }}>{suffix}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Floating Bubbles (hidden on mobile via CSS) */}
          <div className="pb-hero-bubbles pb-fade pb-d3">
            {[
              { size: 180, top: 30,  right: 60,  anim: "pb-float1 5s ease-in-out infinite",       icon: "📷", fs: 56 },
              { size: 140, top: 200, right: 220, anim: "pb-float2 6s ease-in-out infinite",       icon: "👟", fs: 42 },
              { size: 160, top: 310, right: 40,  anim: "pb-float3 7s ease-in-out infinite",       icon: "🪑", fs: 48 },
              { size: 110, top: 60,  right: 260, anim: "pb-float1 4.5s ease-in-out infinite 1s", icon: "🎧", fs: 34 },
            ].map(({ size, top, right, anim, icon, fs }, i) => (
              <div key={i} className="pb-bubble" style={{ width: size, height: size, top, right, animation: anim }}>
                <div className="pb-bubble-glow" />
                <span style={{ fontSize: fs }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <div style={{ background: "#2ec97e", padding: "16px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "pb-marquee 24s linear infinite", width: "max-content" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 32px", fontSize: 13, fontWeight: 600, color: "#08231a", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              <span style={{ width: 5, height: 5, background: "rgba(8,35,26,0.35)", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════ FEATURES ════ */}
      <section className="pb-section-pad" style={{ background: "#0d3322", padding: "100px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, right: -200, width: 560, height: 560, background: "radial-gradient(circle,rgba(46,201,126,0.11),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="pb-features-header">
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 18 }}>Why Choose Us</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.8vw,56px)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
                A marketplace built for<br />
                <em style={{ fontStyle: "italic", color: "#2ec97e" }}>real trust, real people.</em>
              </h2>
            </div>
            <p style={{ fontSize: "clamp(15px,1.6vw,17px)", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300, alignSelf: "end" }}>
              From student essentials to home goods, Proti-Binimoy creates a refined exchange
              experience — no noise, no clutter, no uncertainty.
            </p>
          </div>

          <div className="pb-cards-grid">
            {featureCards.map((card) => (
              <div key={card.title} className="pb-card">
                <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, background: "radial-gradient(circle,rgba(46,201,126,0.14),transparent 70%)", borderRadius: "50%" }} />
                <div style={{
                  width: 56, height: 56,
                  background: "linear-gradient(135deg,rgba(46,201,126,0.2),rgba(27,125,82,0.1))",
                  border: "1px solid rgba(46,201,126,0.25)",
                  borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 24, color: "#2ec97e",
                }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{card.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{card.description}</p>
                <div style={{ marginTop: 28, height: 1, background: "linear-gradient(to right,rgba(46,201,126,0.5),transparent)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how" className="pb-section-pad" style={{ background: "#f3edd8", padding: "100px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right,#2ec97e,#c49a3c,transparent)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", color: "#1b7d52", marginBottom: 18 }}>How It Works</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(28px,3.6vw,52px)", fontWeight: 700, color: "#08231a", lineHeight: 1.12, marginBottom: 16 }}>
              Three steps to your next great find.
            </h2>
            <p style={{ fontSize: "clamp(14px,1.6vw,17px)", color: "rgba(8,35,26,0.55)", fontWeight: 300, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
              Simple, secure, and built for everyday people across Bangladesh.
            </p>
          </div>

          <div className="pb-steps">
            <div className="pb-steps-line" />
            {steps.map((s) => (
              <div key={s.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div className="pb-step-num" style={{ background: s.gradient, color: "#fff", boxShadow: s.shadow }}>{s.num}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(18px,1.8vw,22px)", fontWeight: 700, color: "#08231a", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: "clamp(13px,1.4vw,15px)", lineHeight: 1.8, color: "rgba(8,35,26,0.6)", fontWeight: 300, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section className="pb-section-pad" style={{ background: "linear-gradient(135deg,#08231a 0%,#0f3d28 45%,#1a6040 100%)", padding: "100px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 480, height: 480, background: "radial-gradient(circle,rgba(46,201,126,0.18),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 380, height: 380, background: "radial-gradient(circle,rgba(196,154,60,0.11),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,201,126,0.14)", border: "1px solid rgba(46,201,126,0.3)", borderRadius: 100, padding: "8px 20px", marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#2ec97e", letterSpacing: "0.1em", textTransform: "uppercase" }}>Join the Movement</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,4.5vw,62px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            Ready to trade<br /><em style={{ fontStyle: "italic", color: "#2ec97e" }}>smarter, together?</em>
          </h2>
          <p style={{ fontSize: "clamp(14px,1.6vw,17px)", color: "rgba(255,255,255,0.58)", lineHeight: 1.8, fontWeight: 300, marginBottom: 40 }}>
            Join thousands of Bangladeshis already buying, selling, and bartering through
            Proti-Binimoy — the marketplace that puts people and planet first.
          </p>
          <div className="pb-cta-actions">
            <Link to="/signin" className="pb-btn-primary" style={{ fontSize: "clamp(15px,1.6vw,17px)", padding: "17px 38px" }}>
              Start for Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background: "#08231a", padding: "40px 48px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="pb-footer-inner">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", letterSpacing: "0.04em" }}>© 2025 Proti-Binimoy. All rights reserved.</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <button key={l} onClick={() => setModal(l)} style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#2ec97e"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.38)"}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ════ FOOTER MODALS ════ */}
      {modal && <FooterModal type={modal} onClose={() => setModal(null)} />}
    </div>
  );
};

export default HomePage;