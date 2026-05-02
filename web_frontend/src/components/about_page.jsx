import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/* ─── Scroll-reveal hook ─── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ─── Animated counter ─── */
const Counter = ({ target, suffix = "", duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [visible, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Section wrapper with reveal ─── */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.75s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; scroll-behavior: smooth; }

    @keyframes ab-fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ab-shimmer   { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes ab-marquee   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes ab-float1    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
    @keyframes ab-float2    { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
    @keyframes ab-slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes ab-spin      { to{transform:rotate(360deg)} }
    @keyframes ab-orb       { 0%,100%{transform:scale(1) translate(0,0)} 33%{transform:scale(1.08) translate(20px,-15px)} 66%{transform:scale(0.94) translate(-15px,20px)} }
    @keyframes ab-lineDraw  { from{width:0} to{width:100%} }
    @keyframes ab-borderPop { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }

    .ab-fade { opacity:0; animation:ab-fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
    .ab-d1{animation-delay:0.1s} .ab-d2{animation-delay:0.25s} .ab-d3{animation-delay:0.4s}
    .ab-d4{animation-delay:0.55s} .ab-d5{animation-delay:0.7s} .ab-d6{animation-delay:0.85s}

    /* ── NAV ── */
    .ab-nav {
      position:fixed; top:0; left:0; right:0; z-index:300;
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 48px;
      background:rgba(8,35,26,0.72); backdrop-filter:blur(22px);
      border-bottom:1px solid rgba(255,255,255,0.08);
    }
    .ab-nav-links { display:flex; align-items:center; gap:28px; }
    .ab-nav-link  { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .ab-nav-link:hover { color:#2ec97e; }
    .ab-nav-link.active { color:#2ec97e; }
    .ab-nav-cta   { text-decoration:none; color:#fff; font-size:14px; font-weight:600; background:rgba(46,201,126,0.18); border:1px solid rgba(46,201,126,0.45); padding:8px 22px; border-radius:100px; transition:background 0.2s; }
    .ab-nav-cta:hover { background:rgba(46,201,126,0.3); }
    .ab-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .ab-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .ab-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:299; background:rgba(8,35,26,0.98); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; animation:ab-slideDown 0.25s ease forwards; }
    .ab-mobile-menu.open { display:flex; }
    .ab-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
    .ab-mobile-cta { text-decoration:none; display:block; text-align:center; margin-top:20px; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; font-size:16px; font-weight:600; padding:15px; border-radius:14px; }

    /* ── HERO ── */
    .ab-hero {
      min-height:100vh; padding-top:61px;
      background:linear-gradient(160deg,#08231a 0%,#0f3d28 50%,#061910 100%);
      display:flex; align-items:center; justify-content:center;
      position:relative; overflow:hidden;
    }
    .ab-hero-inner {
      max-width:900px; margin:0 auto; padding:120px 48px 100px;
      text-align:center; position:relative; z-index:2;
    }

    /* ── STATS BAND ── */
    .ab-stats-grid {
      display:grid; grid-template-columns:repeat(4,1fr); gap:1px;
      background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.08);
      border-radius:20px; overflow:hidden;
    }
    .ab-stat-cell {
      background:#08231a; padding:36px 24px; text-align:center;
      transition:background 0.2s;
    }
    .ab-stat-cell:hover { background:#0d2e1f; }

    /* ── MISSION ── */
    .ab-mission-grid {
      display:grid; grid-template-columns:1fr 1fr; gap:64px;
      align-items:center;
    }
    .ab-mission-visual {
      position:relative; aspect-ratio:1;
      border-radius:28px; overflow:hidden;
      background:linear-gradient(135deg,#0d3322,#1a6040);
      border:1px solid rgba(46,201,126,0.2);
      display:flex; align-items:center; justify-content:center;
    }

    /* ── VALUES GRID ── */
    .ab-values-grid {
      display:grid; grid-template-columns:repeat(3,1fr); gap:24px;
    }
    .ab-value-card {
      background:#fff; border-radius:22px; padding:32px;
      border:1px solid rgba(0,0,0,0.07);
      box-shadow:0 2px 20px rgba(0,0,0,0.06);
      transition:transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
      position:relative; overflow:hidden;
    }
    .ab-value-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(0,0,0,0.12); }
    .ab-value-card::before {
      content:""; position:absolute; top:0; left:0; right:0; height:3px;
      background:linear-gradient(to right,var(--accent),transparent);
    }

    /* ── TIMELINE ── */
    .ab-timeline { position:relative; padding-left:40px; }
    .ab-timeline::before {
      content:""; position:absolute; left:11px; top:8px; bottom:8px; width:2px;
      background:linear-gradient(to bottom,#2ec97e,rgba(46,201,126,0.1));
    }
    .ab-tl-item { position:relative; margin-bottom:48px; }
    .ab-tl-dot {
      position:absolute; left:-40px; top:4px;
      width:24px; height:24px; border-radius:50%;
      background:#08231a; border:2px solid #2ec97e;
      display:flex; align-items:center; justify-content:center;
    }
    .ab-tl-dot::after {
      content:""; width:8px; height:8px; border-radius:50%; background:#2ec97e;
    }

    /* ── TEAM GRID ── */
    .ab-team-grid {
      display:grid; grid-template-columns:repeat(2,1fr); gap:28px;
    }
    .ab-team-card {
      background:#fff; border-radius:22px; padding:32px 24px;
      text-align:center; border:1px solid rgba(0,0,0,0.07);
      box-shadow:0 2px 16px rgba(0,0,0,0.05);
      transition:transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s;
    }
    .ab-team-card:hover { transform:translateY(-6px); box-shadow:0 20px 52px rgba(0,0,0,0.12); }
    .ab-avatar-ring {
      width:88px; height:88px; border-radius:50%; margin:0 auto 20px;
      border:3px solid transparent;
      background:linear-gradient(#fff,#fff) padding-box,
                 linear-gradient(135deg,#2ec97e,#c49a3c) border-box;
      display:flex; align-items:center; justify-content:center;
      font-size:32px; font-family:'Playfair Display',serif; font-weight:700; color:#0d3322;
    }

    /* ── MARQUEE ── */
    .ab-marquee-track { display:flex; white-space:nowrap; animation:ab-marquee 28s linear infinite; width:max-content; }

    /* ── CTA SECTION ── */
    .ab-cta-btns { display:flex; align-items:center; gap:16px; flex-wrap:wrap; justify-content:center; }
    .ab-btn-primary {
      display:inline-flex; align-items:center; gap:10px;
      padding:16px 36px; border-radius:100px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff;
      font-size:16px; font-weight:600; font-family:inherit; text-decoration:none;
      box-shadow:0 8px 28px rgba(46,201,126,0.35);
      transition:opacity 0.2s, transform 0.15s;
    }
    .ab-btn-primary:hover { opacity:0.88; transform:translateY(-2px); }
    .ab-btn-ghost {
      display:inline-flex; align-items:center; gap:8px;
      padding:15px 34px; border-radius:100px;
      border:1.5px solid rgba(255,255,255,0.25); color:rgba(255,255,255,0.85);
      font-size:16px; font-weight:500; font-family:inherit; text-decoration:none;
      transition:border-color 0.2s, background 0.2s;
    }
    .ab-btn-ghost:hover { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.07); }

    /* ── IMPACT ── */
    .ab-impact-row {
      display:grid; grid-template-columns:repeat(2,1fr); gap:24px;
    }
    .ab-impact-card {
      border-radius:20px; padding:32px;
      background:rgba(255,255,255,0.04);
      border:1px solid rgba(255,255,255,0.1);
      backdrop-filter:blur(8px);
      transition:border-color 0.25s, background 0.25s;
    }
    .ab-impact-card:hover { border-color:rgba(46,201,126,0.35); background:rgba(46,201,126,0.06); }

    /* ── TESTIMONIALS ── */
    .ab-testimonials { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
    .ab-testi-card {
      background:#fff; border-radius:20px; padding:28px;
      box-shadow:0 2px 18px rgba(0,0,0,0.06); border:1px solid rgba(0,0,0,0.06);
      transition:transform 0.3s cubic-bezier(0.22,1,0.36,1);
    }
    .ab-testi-card:hover { transform:translateY(-4px); }

    /* ── RESPONSIVE ── */
    @media(max-width:900px) {
      .ab-nav { padding:14px 24px; }
      .ab-nav-links { display:none; }
      .ab-hamburger { display:flex; }
      .ab-hero-inner { padding:100px 24px 80px; }
      .ab-stats-grid { grid-template-columns:repeat(2,1fr); }
      .ab-mission-grid { grid-template-columns:1fr; gap:40px; }
      .ab-mission-visual { aspect-ratio:16/9; }
      .ab-values-grid { grid-template-columns:1fr 1fr; }
      .ab-team-grid { grid-template-columns:1fr 1fr; }
      .ab-testimonials { grid-template-columns:1fr; }
      .ab-impact-row { grid-template-columns:1fr; }
      .ab-cta-btns { flex-direction:column; }
    }
    @media(max-width:600px) {
      .ab-stats-grid { grid-template-columns:1fr 1fr; }
      .ab-values-grid { grid-template-columns:1fr; }
      .ab-team-grid { grid-template-columns:1fr; }
    }
  `}</style>
);

/* ══ DATA ══ */
const VALUES = [
  {
    icon: "🤝",
    title: "Trust First",
    desc: "Every member is a real person. We verify identities so you can trade with confidence — no anonymous listings, no hidden agendas.",
    accent: "#2ec97e",
  },
  {
    icon: "🌱",
    title: "Sustainability",
    desc: "Each trade extends a product's life by years. We believe the most sustainable product is one that already exists — give it a second chapter.",
    accent: "#c49a3c",
  },
  {
    icon: "🏘️",
    title: "Community",
    desc: "We're building neighbourhoods that talk to each other. Local exchange means local connection — Dhaka, Chittagong, Sylhet and beyond.",
    accent: "#06B6D4",
  },
  {
    icon: "🔐",
    title: "Privacy & Safety",
    desc: "Your data stays yours. Encrypted communications, secure payments, and in-app messaging keep every interaction protected.",
    accent: "#8B5CF6",
  },
  {
    icon: "⚡",
    title: "Simplicity",
    desc: "Post in under two minutes. Browse in seconds. We obsess over removing friction so you spend time trading, not navigating.",
    accent: "#EF4444",
  },
  {
    icon: "🎯",
    title: "Fairness",
    desc: "No auction wars, no bidding pressure. Transparent pricing and an open negotiation culture makes every deal feel honest.",
    accent: "#F59E0B",
  },
];

const TIMELINE = [
  { year: "2022", label: "The Idea", desc: "Three university friends in Dhaka frustrated by unsafe, cluttered Facebook groups for second-hand goods — they began sketching an alternative." },
  { year: "2023", label: "First Build", desc: "A small beta launched to 200 users in Dhanmondi. Within a month, 1,400 items were listed and 380 trades were completed." },
  { year: "2024", label: "City-Wide Launch", desc: "Expanded to all of Dhaka with identity verification, in-app messaging, and bKash payment integration. Crossed 10,000 members." },
  { year: "2025", label: "National Scale", desc: "Proti-Binimoy connects buyers and sellers across Bangladesh. 50,000+ listings. A community built on trust." },
  { year: "2026", label: "New Horizons", desc: "Launching barter-first trading, AI-powered price suggestions, and cross-border exchange with neighbouring countries. The next chapter begins." },
];

const TEAM = [
  { initial: "N", name: "Tashfiq Mahmud Niloy", role: "Co-Founder & CEO", bio: "Product thinker obsessed with marketplaces. Previously built supply chain software at a Dhaka startup." },
  { initial: "T", name: "Nishat Tasnim", role: "Co-Founder & Design", bio: "UX designer with a passion for inclusive interfaces. Believes good design should serve everyone, not just the privileged." },
  { initial: "I", name: "Ihtishamul Haue Shimanto", role: "Co-Founder & Engineering", bio: "Full-stack engineer and open-source contributor. Built the entire platform from a single Mirpur apartment." },
  { initial: "S", name: "Shupto Aditto", role: "Co-Founder & Growth", bio: "Growth strategist and community builder. Connects the dots between product, users, and Bangladesh's fast-growing circular economy." },
];

const TESTIMONIALS = [
  { quote: "I sold my old camera in 48 hours and the buyer became a friend. That's what Proti-Binimoy feels like.", name: "Mehedi H.", city: "Mohammadpur", stars: 5 },
  { quote: "Finally a marketplace where I trust the seller is real. The verification badge changes everything.", name: "Nadia C.", city: "Gulshan", stars: 5 },
  { quote: "I furnished my entire dorm room for ৳8,000. Sustainable and budget-friendly — I'm a convert for life.", name: "Arif B.", city: "Uttara", stars: 5 },
];

const IMPACT = [
  { emoji: "♻️", label: "CO₂ saved this year", value: "42 tonnes", sub: "by keeping items out of landfill" },
  { emoji: "📦", label: "Average item lifespan extended", value: "+3.4 yrs", sub: "through second-hand trading" },
  { emoji: "💚", label: "Trees planted from profits", value: "1,200+", sub: "in partnership with GreenBD" },
  { emoji: "🏙️", label: "Cities & towns active", value: "34", sub: "and growing every month" },
];

/* ══ MAIN COMPONENT ══ */
const AboutPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f7f8f6", color: "#0d1f16" }}>
      <GlobalStyles />

      {/* ── NAV ── */}
      <nav className="ab-nav">
        <Link to="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 900, color: "#fff", textDecoration: "none", letterSpacing: "-0.01em" }}>
          Proti<span style={{ color: "#2ec97e" }}>-</span>Binimoy
        </Link>
        <div className="ab-nav-links">
          <Link to="/"            className="ab-nav-link">Home</Link>
          <Link to="/marketplace" className="ab-nav-link">Marketplace</Link>
          <Link to="/about"       className="ab-nav-link active">About</Link>
        </div>
        <Link to="/signin" className="ab-nav-cta">Sign In</Link>
        <button className="ab-hamburger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      <div className={`ab-mobile-menu${menuOpen ? " open" : ""}`}>
        <Link to="/"            className="ab-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/marketplace" className="ab-mobile-link" onClick={() => setMenuOpen(false)}>Marketplace</Link>
        <Link to="/about"       className="ab-mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/signin"      className="ab-mobile-cta"  onClick={() => setMenuOpen(false)}>Sign In →</Link>
      </div>

      {/* ════ HERO ════ */}
      <section className="ab-hero">
        {/* Background orbs */}
        <div style={{ position:"absolute", top:-100, right:-100, width:560, height:560, borderRadius:"50%", background:"radial-gradient(circle,rgba(46,201,126,0.14),transparent 65%)", animation:"ab-orb 12s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,154,60,0.1),transparent 65%)", animation:"ab-orb 15s ease-in-out infinite 3s" }} />
        {/* Grid overlay */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 0)", backgroundSize:"32px 32px" }} />

        <div className="ab-hero-inner">
          <div className="ab-fade ab-d1" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(46,201,126,0.12)", border:"1px solid rgba(46,201,126,0.3)", borderRadius:100, padding:"7px 18px", marginBottom:28 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#2ec97e", animation:"ab-shimmer 2s infinite" }} />
            <span style={{ fontSize:12, fontWeight:600, color:"#2ec97e", letterSpacing:"0.08em", textTransform:"uppercase" }}>Our Story</span>
          </div>

          <h1 className="ab-fade ab-d2" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(40px,6vw,82px)", fontWeight:900, color:"#fff", lineHeight:1.05, marginBottom:24 }}>
            Trade smarter.<br />
            <em style={{ fontStyle:"italic", color:"#2ec97e" }}>Live greener.</em>
          </h1>

          <p className="ab-fade ab-d3" style={{ fontSize:"clamp(16px,1.8vw,20px)", color:"rgba(255,255,255,0.58)", lineHeight:1.8, fontWeight:300, maxWidth:620, margin:"0 auto 48px" }}>
            Proti-Binimoy was born from a simple belief: that every object deserves a second life,
            and every transaction should begin with trust. We're Bangladesh's marketplace for
            people — not just products.
          </p>

          <div className="ab-fade ab-d4 ab-cta-btns">
            <Link to="/marketplace" className="ab-btn-primary">
              Explore the Marketplace
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#mission" className="ab-btn-ghost">Our Mission ↓</a>
          </div>

          {/* Floating emoji bubbles */}
          <div className="ab-fade ab-d5" style={{ position:"absolute", top:"15%", right:"6%", width:88, height:88, borderRadius:24, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, animation:"ab-float1 6s ease-in-out infinite" }}>♻️</div>
          <div className="ab-fade ab-d5" style={{ position:"absolute", bottom:"20%", right:"10%", width:68, height:68, borderRadius:20, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, animation:"ab-float2 7s ease-in-out infinite 1s" }}>🤝</div>
          <div className="ab-fade ab-d5" style={{ position:"absolute", top:"28%", left:"4%", width:72, height:72, borderRadius:22, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, animation:"ab-float1 8s ease-in-out infinite 2s" }}>🌱</div>
        </div>
      </section>

      {/* ════ STATS BAND ════ */}
      <section style={{ background:"#08231a", padding:"0 48px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div className="ab-stats-grid">
              {[
                { val:50000, suffix:"+", label:"Active Listings" },
                { val:34,    suffix:"",  label:"Cities & Towns" },
                { val:98,    suffix:"%", label:"Verified Members" },
                { val:4.9,   suffix:"★", label:"Average Rating", noCount: true },
              ].map((s, i) => (
                <div key={i} className="ab-stat-cell">
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,3.5vw,52px)", fontWeight:900, color:"#fff", lineHeight:1, marginBottom:8 }}>
                    {s.noCount ? <span>{s.val}{s.suffix}</span> : <><Counter target={s.val} suffix={s.suffix} /></>}
                  </div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.42)", letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════ MARQUEE ════ */}
      <div style={{ background:"#2ec97e", padding:"14px 0", overflow:"hidden" }}>
        <div className="ab-marquee-track">
          {[...Array(2)].flatMap(() =>
            ["Trusted Exchange","Verified Members","Second-Hand Pride","Zero Waste Living","Community Commerce","Bangladesh Made","Real People. Real Trades.","Barter Welcome"].map((item, i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:14, padding:"0 32px", fontSize:12, fontWeight:700, color:"#08231a", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                <span style={{ width:5, height:5, background:"rgba(8,35,26,0.3)", borderRadius:"50%", flexShrink:0 }} />{item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ════ MISSION ════ */}
      <section id="mission" style={{ background:"#0d3322", padding:"120px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-200, right:-200, width:600, height:600, background:"radial-gradient(circle,rgba(46,201,126,0.1),transparent 65%)", borderRadius:"50%" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <div className="ab-mission-grid">
            <div>
              <Reveal>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#2ec97e", marginBottom:18 }}>Our Mission</p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,3.8vw,54px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:24 }}>
                  To make sustainable commerce the <em style={{ fontStyle:"italic", color:"#2ec97e" }}>default</em> — not the exception.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ fontSize:17, color:"rgba(255,255,255,0.55)", lineHeight:1.85, fontWeight:300, marginBottom:24 }}>
                  Millions of perfectly usable goods end up discarded every year across Bangladesh — not because they've stopped working, but because people had no trusted place to pass them on.
                </p>
                <p style={{ fontSize:17, color:"rgba(255,255,255,0.55)", lineHeight:1.85, fontWeight:300, marginBottom:40 }}>
                  Proti-Binimoy fills that gap. We believe in a circular economy where your unused laptop finds a student who needs it, your old bicycle finds a commuter who'd love it, and every home becomes a potential marketplace.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                  {["Circular Economy","Zero-Waste Goal","Community-Led","Climate Positive"].map(tag => (
                    <span key={tag} style={{ padding:"7px 16px", borderRadius:100, background:"rgba(46,201,126,0.1)", border:"1px solid rgba(46,201,126,0.25)", fontSize:12, fontWeight:600, color:"#2ec97e", letterSpacing:"0.04em" }}>{tag}</span>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15}>
              <div className="ab-mission-visual">
                {/* Decorative visual */}
                <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.05) 1px,transparent 0)", backgroundSize:"28px 28px" }} />
                <div style={{ position:"absolute", top:20, right:20, width:100, height:100, borderRadius:20, background:"rgba(46,201,126,0.12)", border:"1px solid rgba(46,201,126,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>🌍</div>
                <div style={{ position:"absolute", bottom:20, left:20, width:80, height:80, borderRadius:16, background:"rgba(196,154,60,0.12)", border:"1px solid rgba(196,154,60,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>♻️</div>
                <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:40 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(52px,6vw,88px)", fontWeight:900, color:"#fff", lineHeight:1, marginBottom:12 }}>
                    প্রতি<span style={{ color:"#2ec97e" }}>-</span><br/>বিনিময়
                  </div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", fontWeight:500 }}>Every Exchange Matters</div>
                  <div style={{ marginTop:24, height:2, background:"linear-gradient(to right,transparent,#2ec97e,transparent)", borderRadius:2 }} />
                  <div style={{ marginTop:16, fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:300, lineHeight:1.6, maxWidth:280, margin:"16px auto 0" }}>
                    "প্রতি-বিনিময়" translates to "Every Exchange" — reflecting our belief that each trade, big or small, has meaning.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════ VALUES ════ */}
      <section style={{ background:"#f3edd8", padding:"120px 48px", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(to right,#2ec97e,#c49a3c,transparent)" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#1b7d52", marginBottom:18 }}>What We Stand For</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,3.8vw,54px)", fontWeight:900, color:"#08231a", lineHeight:1.1, marginBottom:16 }}>
                Six values that guide every decision.
              </h2>
              <p style={{ fontSize:17, color:"rgba(8,35,26,0.5)", fontWeight:300, maxWidth:500, margin:"0 auto", lineHeight:1.8 }}>
                From product features to company culture — these principles are non-negotiable.
              </p>
            </div>
          </Reveal>

          <div className="ab-values-grid">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="ab-value-card" style={{ "--accent": v.accent }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:`${v.accent}18`, border:`1px solid ${v.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:20 }}>{v.icon}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0d1f16", marginBottom:10 }}>{v.title}</h3>
                  <p style={{ fontSize:14, lineHeight:1.8, color:"rgba(13,31,22,0.58)", fontWeight:300 }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TIMELINE / STORY ════ */}
      <section style={{ background:"#08231a", padding:"120px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", bottom:-150, left:-150, width:500, height:500, background:"radial-gradient(circle,rgba(196,154,60,0.08),transparent 65%)", borderRadius:"50%" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }}>
            <div>
              <Reveal>
                <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#2ec97e", marginBottom:18 }}>Our Journey</p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,3.5vw,50px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:24 }}>
                  From a dorm room idea to a national movement.
                </h2>
                <p style={{ fontSize:16, color:"rgba(255,255,255,0.45)", lineHeight:1.85, fontWeight:300 }}>
                  Every great platform starts with a real frustration. Ours started with a broken wardrobe listed in a Facebook group, a stranger who turned out to be trustworthy, and a conversation about what trading between people could really feel like.
                </p>
              </Reveal>
            </div>

            <div>
              <Reveal delay={0.1}>
                <div className="ab-timeline">
                  {TIMELINE.map((item, i) => (
                    <div key={i} className="ab-tl-item">
                      <div className="ab-tl-dot" />
                      <div style={{ marginBottom:6, display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, color:"#2ec97e" }}>{item.year}</span>
                        <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.5)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{item.label}</span>
                      </div>
                      <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", lineHeight:1.75, fontWeight:300 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════ IMPACT ════ */}
      <section style={{ background:"#0d3322", padding:"120px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:480, height:480, background:"radial-gradient(circle,rgba(46,201,126,0.12),transparent 65%)", borderRadius:"50%" }} />
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#2ec97e", marginBottom:18 }}>Our Impact</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3.5vw,50px)", fontWeight:900, color:"#fff", lineHeight:1.1, marginBottom:14 }}>
                Numbers That Mean Something
              </h2>
              <p style={{ fontSize:16, color:"rgba(255,255,255,0.45)", fontWeight:300, maxWidth:440, margin:"0 auto", lineHeight:1.75 }}>
                Every transaction on Proti-Binimoy has a measurable effect on Bangladesh's environment and economy.
              </p>
            </div>
          </Reveal>

          <div className="ab-impact-row">
            {IMPACT.map((item, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="ab-impact-card">
                  <div style={{ fontSize:36, marginBottom:16 }}>{item.emoji}</div>
                  <div style={{ fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:8 }}>{item.label}</div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3vw,44px)", fontWeight:900, color:"#fff", lineHeight:1, marginBottom:8 }}>{item.value}</div>
                  <div style={{ fontSize:14, color:"rgba(255,255,255,0.38)", fontWeight:300 }}>{item.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TEAM ════ */}
      <section style={{ background:"#faf8f2", padding:"120px 48px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:72 }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#1b7d52", marginBottom:18 }}>The People</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(30px,3.8vw,52px)", fontWeight:900, color:"#08231a", lineHeight:1.1, marginBottom:16 }}>
                Built By People Who Believe In People
              </h2>
              <p style={{ fontSize:17, color:"rgba(8,35,26,0.5)", fontWeight:300, maxWidth:480, margin:"0 auto", lineHeight:1.8 }}>
                We're a small team with a big mission. Every feature we ship is shaped by the traders and communities we serve.
              </p>
            </div>
          </Reveal>

          <div className="ab-team-grid">
            {TEAM.map((member, i) => (
              <Reveal key={member.name} delay={i * 0.1}>
                <div className="ab-team-card">
                  <div className="ab-avatar-ring">{member.initial}</div>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:"#0d1f16", marginBottom:4 }}>{member.name}</h3>
                  <p style={{ fontSize:12, fontWeight:600, color:"#2ec97e", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14 }}>{member.role}</p>
                  <p style={{ fontSize:14, color:"rgba(13,31,22,0.55)", lineHeight:1.75, fontWeight:300 }}>{member.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>


        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section style={{ background:"#f3edd8", padding:"100px 48px", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"linear-gradient(to right,#c49a3c,#2ec97e,transparent)" }} />
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.38em", textTransform:"uppercase", color:"#1b7d52", marginBottom:18 }}>Real People, Real Stories</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,3.5vw,48px)", fontWeight:900, color:"#08231a", lineHeight:1.1 }}>
                What our community says.
              </h2>
            </div>
          </Reveal>

          <div className="ab-testimonials">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="ab-testi-card">
                  <div style={{ fontSize:20, color:"#c49a3c", marginBottom:16, letterSpacing:2 }}>{"★".repeat(t.stars)}</div>
                  <p style={{ fontSize:16, color:"#0d1f16", lineHeight:1.8, fontWeight:300, fontStyle:"italic", marginBottom:24 }}>"{t.quote}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:50, background:"linear-gradient(135deg,#2ec97e,#0d3322)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700, flexShrink:0 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#0d1f16" }}>{t.name}</div>
                      <div style={{ fontSize:12, color:"rgba(13,31,22,0.45)" }}>📍 {t.city}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section style={{ background:"linear-gradient(135deg,#08231a 0%,#0f3d28 50%,#1a6040 100%)", padding:"120px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, background:"radial-gradient(circle,rgba(46,201,126,0.18),transparent 65%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:400, height:400, background:"radial-gradient(circle,rgba(196,154,60,0.1),transparent 65%)", borderRadius:"50%" }} />
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center", position:"relative", zIndex:2 }}>
          <Reveal>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(46,201,126,0.12)", border:"1px solid rgba(46,201,126,0.3)", borderRadius:100, padding:"8px 20px", marginBottom:28 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"#2ec97e", letterSpacing:"0.1em", textTransform:"uppercase" }}>Join the Movement</span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px,5vw,68px)", fontWeight:900, color:"#fff", lineHeight:1.05, marginBottom:20 }}>
              Ready to be part of something bigger?
            </h2>
            <p style={{ fontSize:"clamp(15px,1.7vw,18px)", color:"rgba(255,255,255,0.55)", lineHeight:1.8, fontWeight:300, marginBottom:48 }}>
              Join 50,000+ Bangladeshis already making smarter, more sustainable choices every day. Your next trade starts here.
            </p>
            <div className="ab-cta-btns">
              <Link to="/register" className="ab-btn-primary" style={{ fontSize:17, padding:"17px 40px" }}>
                Create Free Account
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:17,height:17}}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link to="/marketplace" className="ab-btn-ghost" style={{ fontSize:16 }}>
                Browse Listings
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer style={{ background:"#08231a", padding:"36px 48px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.3)", letterSpacing:"0.03em" }}>© 2026 Proti-Binimoy. All rights reserved.</p>
          <div style={{ display:"flex", gap:28 }}>
            {["Privacy","Terms","Contact","Help"].map(l => (
              <a key={l} href="#" style={{ fontSize:13, color:"rgba(255,255,255,0.35)", textDecoration:"none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;