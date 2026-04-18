import React from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";


const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    @keyframes pb-float1 {
      0%,100% { transform: translateY(0) rotate(-2deg); }
      50%      { transform: translateY(-14px) rotate(2deg); }
    }
    @keyframes pb-float2 {
      0%,100% { transform: translateY(0) rotate(3deg); }
      50%      { transform: translateY(-10px) rotate(-2deg); }
    }
    @keyframes pb-float3 {
      0%,100% { transform: translateY(0) rotate(-1deg); }
      50%      { transform: translateY(-18px) rotate(3deg); }
    }
    @keyframes pb-marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes pb-fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pb-shimmer {
      0%,100% { opacity: 0.5; }
      50%      { opacity: 1; }
    }

    .pb-fade { opacity: 0; animation: pb-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
    .pb-d1 { animation-delay: 0.1s; }
    .pb-d2 { animation-delay: 0.25s; }
    .pb-d3 { animation-delay: 0.4s; }
    .pb-d4 { animation-delay: 0.55s; }
    .pb-d5 { animation-delay: 0.7s; }

    .pb-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 28px;
      padding: 40px 36px;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s, border-color 0.3s, background 0.3s;
      cursor: default;
    }
    .pb-card:hover {
      transform: translateY(-6px);
      border-color: rgba(46,201,126,0.3);
      background: rgba(255,255,255,0.07);
    }
    .pb-cat-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      border-radius: 100px;
      border: 1.5px solid;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.25s;
      text-decoration: none;
    }
    .pb-cat-pill:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
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
      color: rgba(255,255,255,0.7); text-decoration: none;
      font-weight: 500; font-size: 15px; padding: 16px 24px;
      border-radius: 100px; border: 1px solid rgba(255,255,255,0.15);
      transition: all 0.2s;
    }
    .pb-btn-ghost:hover { border-color: rgba(255,255,255,0.4); color: #fff; background: rgba(255,255,255,0.05); }
    .pb-bubble {
      position: absolute; border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; background: rgba(255,255,255,0.07);
    }
    .pb-step-num {
      width: 80px; height: 80px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700;
      margin: 0 auto 28px;
    }
  `}</style>
);


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
    description: "Give quality items a second life, reduce household waste, and support a smarter, circular economy in Bangladesh.",
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
    num: "01",
    title: "List or Browse",
    desc: "Post items you no longer need or browse thousands of second-hand listings near you.",
    gradient: "linear-gradient(135deg,#2ec97e,#1b7d52)",
    shadow: "0 12px 40px rgba(46,201,126,0.4)",
  },
  {
    num: "02",
    title: "Connect & Negotiate",
    desc: "Chat directly with buyers or sellers. Agree on price, trade, or barter — completely on your terms.",
    gradient: "linear-gradient(135deg,#c49a3c,#a07820)",
    shadow: "0 12px 40px rgba(196,154,60,0.4)",
  },
  {
    num: "03",
    title: "Exchange Safely",
    desc: "Meet locally with confidence using our verified profiles and community reputation system.",
    gradient: "linear-gradient(135deg,#1b7d52,#0d3322)",
    shadow: "0 12px 40px rgba(27,125,82,0.4)",
  },
];

const categories = [
  { icon: "📱", label: "Electronics", color: "rgba(27,125,82,0.3)", textColor: "#1b7d52", bg: "rgba(27,125,82,0.06)" },
  { icon: "👕", label: "Clothing & Fashion", color: "rgba(196,154,60,0.3)", textColor: "#9a7520", bg: "rgba(196,154,60,0.07)" },
  { icon: "📚", label: "Books & Education", color: "rgba(46,150,201,0.3)", textColor: "#1a6a99", bg: "rgba(46,150,201,0.07)" },
  { icon: "🪑", label: "Home & Furniture", color: "rgba(201,46,100,0.3)", textColor: "#a01840", bg: "rgba(201,46,100,0.07)" },
  { icon: "🚲", label: "Sports & Hobbies", color: "rgba(100,46,201,0.3)", textColor: "#5a18a0", bg: "rgba(100,46,201,0.07)" },
  { icon: "🔧", label: "Tools & Hardware", color: "rgba(201,100,46,0.3)", textColor: "#a04510", bg: "rgba(201,100,46,0.07)" },
  { icon: "🎮", label: "Games & Toys", color: "rgba(27,125,82,0.3)", textColor: "#1b7d52", bg: "rgba(27,125,82,0.06)" },
  { icon: "🌿", label: "Plants & Garden", color: "rgba(196,154,60,0.3)", textColor: "#9a7520", bg: "rgba(196,154,60,0.07)" },
];

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const HomePage = () => {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#faf8f2", color: "#0d1f16", overflowX: "hidden" }}>
      <GlobalStyles />

      {/* NAV  */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        background: "rgba(8,35,26,0.6)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48,
            background: "linear-gradient(135deg,#2ec97e,#1b7d52)",
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 22, color: "#fff",
          }}>P</div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              Proti-Binimoy
            </p>
            <p style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 3 }}>
              Sustainable Marketplace
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Home", "Browse", "About"].map((l) => (
            <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase()}`}
              style={{ textDecoration: "none", color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, letterSpacing: "0.03em" }}>
              {l}
            </Link>
          ))}
          <Link to="/signin" style={{
            textDecoration: "none", color: "#2ec97e", fontSize: 14, fontWeight: 600,
            background: "rgba(46,201,126,0.15)", border: "1px solid rgba(46,201,126,0.4)",
            padding: "9px 22px", borderRadius: 100,
          }}>Sign In →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        position: "relative", minHeight: "100vh", background: "#08231a",
        overflow: "hidden", display: "flex", alignItems: "center",
        backgroundImage: `url(${websiteBackground})`,
        backgroundSize: "cover", backgroundPosition: "center",
      }}>
        {/* overlays */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(8,35,26,0.88) 0%, rgba(8,35,26,0.7) 50%, rgba(8,35,26,0.4) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* glows */}
        <div style={{ position: "absolute", top: -120, right: -80, width: 650, height: 650, background: "radial-gradient(circle,rgba(27,125,82,0.35) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -150, left: -100, width: 500, height: 500, background: "radial-gradient(circle,rgba(46,201,126,0.15) 0%,transparent 65%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", maxWidth: 1280, margin: "0 auto", padding: "120px 48px 80px", width: "100%" }}>

          {/* Left */}
          <div>
            <div className="pb-fade pb-d1" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(46,201,126,0.12)", border: "1px solid rgba(46,201,126,0.35)",
              borderRadius: 100, padding: "8px 18px", marginBottom: 32,
            }}>
              <div style={{ width: 8, height: 8, background: "#2ec97e", borderRadius: "50%", animation: "pb-shimmer 2s infinite" }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "#2ec97e", letterSpacing: "0.05em" }}>
                Bangladesh's Sustainable Exchange Platform
              </span>
            </div>

            <h1 className="pb-fade pb-d2" style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "clamp(52px,6vw,80px)", fontWeight: 900,
              lineHeight: 1.02, color: "#fff", marginBottom: 28,
            }}>
              Give quality things<br />
              <em style={{ fontStyle: "italic", color: "#2ec97e" }}>a second life.</em><br />
              <span style={{ color: "#f3edd8", fontSize: "clamp(42px,5vw,66px)" }}>Trade smarter.</span>
            </h1>

            <p className="pb-fade pb-d3" style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.65)", maxWidth: 460, marginBottom: 40, fontWeight: 300 }}>
              Proti-Binimoy connects people across Bangladesh for trusted second-hand buying, selling, and bartering — making sustainable living feel effortless.
            </p>

            <div className="pb-fade pb-d4" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Link to="/signin" className="pb-btn-primary">
                Explore Marketplace
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#how" className="pb-btn-ghost">How it works</a>
            </div>

            <div className="pb-fade pb-d5" style={{ display: "flex", gap: 36, marginTop: 48, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[["12k", "+", "Items Listed"], ["8k", "+", "Active Users"], ["64", "", "Cities"]].map(([num, suffix, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    {num}<span style={{ color: "#2ec97e" }}>{suffix}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating bubbles */}
          <div className="pb-fade pb-d3" style={{ position: "relative", height: 520 }}>
            {[
              { size: 180, top: 30, right: 60, anim: "pb-float1 5s ease-in-out infinite", icon: "📷", fontSize: 56 },
              { size: 140, top: 200, right: 220, anim: "pb-float2 6s ease-in-out infinite", icon: "👟", fontSize: 42 },
              { size: 160, top: 310, right: 40, anim: "pb-float3 7s ease-in-out infinite", icon: "🪑", fontSize: 48 },
              { size: 110, top: 60, right: 260, anim: "pb-float1 4.5s ease-in-out infinite 1s", icon: "🎧", fontSize: 34 },
            ].map(({ size, top, right, anim, icon, fontSize }, i) => (
              <div key={i} className="pb-bubble" style={{ width: size, height: size, top, right, animation: anim }}>
                <div style={{ position: "absolute", inset: -20, background: "radial-gradient(circle,rgba(46,201,126,0.15),transparent 70%)", borderRadius: "50%" }} />
                <span style={{ fontSize }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: "#2ec97e", padding: "18px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", whiteSpace: "nowrap", animation: "pb-marquee 24s linear infinite", width: "max-content" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "0 36px", fontSize: 14, fontWeight: 600, color: "#08231a", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              <span style={{ width: 6, height: 6, background: "rgba(8,35,26,0.4)", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section style={{ background: "#0d3322", padding: "120px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, background: "radial-gradient(circle,rgba(46,201,126,0.12),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 72 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 20 }}>Why Choose Us</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,4vw,58px)", fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
                A marketplace built for<br /><em style={{ fontStyle: "italic", color: "#2ec97e" }}>real trust, real people.</em>
              </h2>
            </div>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300, alignSelf: "end" }}>
              From student essentials to home goods, Proti-Binimoy creates a refined exchange experience — no noise, no clutter, no uncertainty.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {featureCards.map((card) => (
              <div key={card.title} className="pb-card">
                <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "radial-gradient(circle,rgba(46,201,126,0.15),transparent 70%)", borderRadius: "50%" }} />
                <div style={{
                  width: 60, height: 60,
                  background: "linear-gradient(135deg,rgba(46,201,126,0.2),rgba(27,125,82,0.1))",
                  border: "1px solid rgba(46,201,126,0.25)",
                  borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 28, color: "#2ec97e",
                }}>{card.icon}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{card.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>{card.description}</p>
                <div style={{ marginTop: 32, height: 1, background: "linear-gradient(to right,rgba(46,201,126,0.5),transparent)" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ background: "#f3edd8", padding: "120px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(to right,#2ec97e,#c49a3c,transparent)" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.35em", textTransform: "uppercase", color: "#1b7d52", marginBottom: 20 }}>How It Works</p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(36px,4vw,54px)", fontWeight: 700, color: "#08231a", lineHeight: 1.1, marginBottom: 16 }}>
              Three steps to your next great find.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(8,35,26,0.55)", fontWeight: 300, maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Simple, secure, and built for everyday people across Bangladesh.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 48, position: "relative" }}>
            <div style={{ position: "absolute", top: 56, left: "calc(16.666% + 20px)", right: "calc(16.666% + 20px)", height: 1, borderTop: "2px dashed rgba(27,125,82,0.3)", zIndex: 0 }} />
            {steps.map((s) => (
              <div key={s.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div className="pb-step-num" style={{ background: s.gradient, color: "#fff", boxShadow: s.shadow }}>{s.num}</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#08231a", marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(8,35,26,0.6)", fontWeight: 300, maxWidth: 260, margin: "0 auto" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ background: "#faf8f2", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: "#08231a" }}>Browse Categories</h3>
            <Link to="/browse" style={{ fontSize: 14, fontWeight: 600, color: "#1b7d52", textDecoration: "none", borderBottom: "1px solid rgba(27,125,82,0.3)", paddingBottom: 2 }}>
              See all categories →
            </Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {categories.map((cat) => (
              <a key={cat.label} href="#" className="pb-cat-pill" style={{ borderColor: cat.color, color: cat.textColor, background: cat.bg }}>
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg,#08231a 0%,#0f3d28 40%,#1a6040 100%)",
        padding: "120px 48px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle,rgba(46,201,126,0.2),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: "radial-gradient(circle,rgba(196,154,60,0.12),transparent 65%)", borderRadius: "50%" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,201,126,0.15)", border: "1px solid rgba(46,201,126,0.3)", borderRadius: 100, padding: "8px 20px", marginBottom: 32 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#2ec97e", letterSpacing: "0.08em", textTransform: "uppercase" }}>Join the Movement</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(38px,5vw,64px)", fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 24 }}>
            Ready to trade<br /><em style={{ fontStyle: "italic", color: "#2ec97e" }}>smarter, together?</em>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, fontWeight: 300, marginBottom: 44 }}>
            Join thousands of Bangladeshis already buying, selling, and bartering through Proti-Binimoy — the marketplace that puts people and planet first.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <Link to="/signin" className="pb-btn-primary" style={{ fontSize: 17, padding: "18px 40px" }}>
              Start for Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#how" className="pb-btn-ghost" style={{ fontSize: 16 }}>Learn More</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#08231a", padding: 48, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>© 2025 Proti-Binimoy. All rights reserved.</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;