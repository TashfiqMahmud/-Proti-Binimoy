/*UPDATED FORGOT-PASSWORD.JSX*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

/* ─── Global Styles ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes fp-fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fp-shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes fp-spin    { to{transform:rotate(360deg)} }
    @keyframes fp-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    @keyframes fp-checkIn { 0%{transform:scale(0) rotate(-15deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
    @keyframes fp-pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

    .fp-fade { opacity:0; animation:fp-fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .fp-d1{animation-delay:0.08s} .fp-d2{animation-delay:0.18s} .fp-d3{animation-delay:0.28s} .fp-d4{animation-delay:0.4s}

    /* ── NAV ── */
    .fp-nav {
      position:fixed; top:0; left:0; right:0; z-index:100;
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 48px;
      background:rgba(8,35,26,0.65); backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(255,255,255,0.08);
    }
    .fp-nav-links { display:flex; align-items:center; gap:28px; }
    .fp-nav-link  { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .fp-nav-link:hover { color:#2ec97e; }
    .fp-nav-cta   { text-decoration:none; color:#fff; font-size:14px; font-weight:600; background:rgba(46,201,126,0.18); border:1px solid rgba(46,201,126,0.4); padding:8px 20px; border-radius:100px; transition:background 0.2s; }
    .fp-nav-cta:hover { background:rgba(46,201,126,0.3); }
    .fp-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .fp-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .fp-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:99; background:rgba(8,35,26,0.97); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; }
    .fp-mobile-menu.open { display:flex; }
    .fp-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
    .fp-mobile-cta  { text-decoration:none; display:block; text-align:center; margin-top:20px; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; font-size:16px; font-weight:600; padding:15px; border-radius:14px; }

    /* ── CARD ── */
    .fp-card-outer {
      background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.13);
      border-radius:28px; padding:6px;
      box-shadow:0 32px 96px rgba(0,0,0,0.4); backdrop-filter:blur(24px);
      width:100%; max-width:520px;
    }
    .fp-card { background:#fff; border-radius:22px; padding:40px 44px; color:#0d1f16; }

    /* ── INPUT ── */
    .fp-label { display:block; font-size:13px; font-weight:600; color:#374151; margin-bottom:8px; }
    .fp-input {
      width:100%; border:1.5px solid #e5e7eb; background:#f9fafb;
      border-radius:14px; padding:14px 18px 14px 46px;
      font-size:15px; font-family:inherit; outline:none;
      transition:border-color 0.2s, box-shadow 0.2s, background 0.2s; color:#111827;
    }
    .fp-input::placeholder { color:#9ca3af; }
    .fp-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 4px rgba(46,201,126,0.12); }
    .fp-input-wrap { position:relative; }
    .fp-input-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#9ca3af; pointer-events:none; }

    /* ── BUTTONS ── */
    .fp-submit {
      width:100%; padding:16px; border-radius:14px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff;
      font-size:16px; font-weight:600; font-family:inherit;
      transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      box-shadow:0 6px 24px rgba(13,51,34,0.35);
      display:flex; align-items:center; justify-content:center; gap:10px;
    }
    .fp-submit:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 10px 32px rgba(13,51,34,0.45); }
    .fp-submit:disabled { opacity:0.6; cursor:not-allowed; }
    .fp-btn-ghost {
      display:inline-flex; align-items:center; gap:8px; text-decoration:none;
      color:#374151; font-size:14px; font-weight:500;
      border:1.5px solid #e5e7eb; border-radius:100px; padding:11px 22px;
      transition:all 0.2s;
    }
    .fp-btn-ghost:hover { border-color:#1b7d52; color:#1b7d52; }

    .fp-spinner { width:18px; height:18px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:fp-spin 0.7s linear infinite; }

    /* ── SUCCESS STATE ── */
    .fp-success-icon { animation:fp-checkIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .fp-success-pulse { animation:fp-pulse 2s ease-in-out infinite; }

    /* ── DECO ── */
    .fp-deco { position:absolute; border-radius:50%; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.11); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(6px); }

    /* ── RESPONSIVE ── */
    @media (max-width: 1024px) {
      .fp-nav  { padding:14px 28px; }
      .fp-card { padding:32px 28px; }
    }
    @media (max-width: 640px) {
      .fp-nav       { padding:14px 20px; }
      .fp-nav-links { display:none; }
      .fp-hamburger { display:flex; }
      .fp-card-outer { max-width:100%; border-radius:22px; }
      .fp-card      { padding:24px 20px; border-radius:18px; }
      .fp-deco      { display:none; }
    }
  `}</style>
);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1400);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <GlobalStyles />

      {/* ── NAV ── */}
      <nav className="fp-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>P</div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Proti-Binimoy</p>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="fp-nav-links">
          <Link to="/"       className="fp-nav-link">Home</Link>
          <Link to="/about"  className="fp-nav-link">About</Link>
          <Link to="/signin" className="fp-nav-link">Sign In</Link>
          <Link to="/register" className="fp-nav-cta">Register →</Link>
        </div>
        <button className="fp-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`fp-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/"        className="fp-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/about"   className="fp-mobile-link" onClick={() => setMenuOpen(false)}>About</Link>
        <Link to="/signin"  className="fp-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <Link to="/register" className="fp-mobile-cta" onClick={() => setMenuOpen(false)}>Create Account →</Link>
      </div>

      {/* ── HERO BG ── */}
      <section style={{ position: "relative", minHeight: "100vh", backgroundImage: `url(${websiteBackground})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(8,35,26,0.93) 0%,rgba(8,35,26,0.8) 50%,rgba(8,35,26,0.6) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "56px 56px" }} />
        <div style={{ position: "absolute", top: -100, right: -60, width: 460, height: 460, background: "radial-gradient(circle,rgba(46,201,126,0.15) 0%,transparent 65%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -80, left: -60, width: 380, height: 380, background: "radial-gradient(circle,rgba(27,125,82,0.13) 0%,transparent 65%)", borderRadius: "50%" }} />

        {/* Deco bubbles */}
        <div className="fp-deco" style={{ width: 88, height: 88, top: "22%", left: "5%", animation: "fp-float 6s ease-in-out infinite" }}><span style={{ fontSize: 32 }}>🔑</span></div>
        <div className="fp-deco" style={{ width: 64, height: 64, top: "60%", left: "7%", animation: "fp-float 8s ease-in-out infinite 1.2s" }}><span style={{ fontSize: 24 }}>📧</span></div>
        <div className="fp-deco" style={{ width: 72, height: 72, top: "38%", right: "5%", animation: "fp-float 5.5s ease-in-out infinite 0.6s" }}><span style={{ fontSize: 28 }}>🛡️</span></div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", padding: "120px 24px 60px", width: "100%", maxWidth: 640 }}>

          {/* Eyebrow */}
          <div className="fp-fade fp-d1" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(46,201,126,0.12)", border: "1px solid rgba(46,201,126,0.3)", borderRadius: 100, padding: "7px 16px", marginBottom: 28, textAlign: "center" }}>
            <div style={{ width: 7, height: 7, background: "#2ec97e", borderRadius: "50%", animation: "fp-shimmer 2s infinite" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#2ec97e", letterSpacing: "0.05em" }}>Password Recovery</span>
          </div>

          {/* Heading */}
          <h1 className="fp-fade fp-d2" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(32px,4vw,54px)", fontWeight: 900, lineHeight: 1.08, color: "#fff", textAlign: "center", marginBottom: 14 }}>
            Recover your<br /><em style={{ fontStyle: "italic", color: "#2ec97e" }}>account access.</em>
          </h1>
          <p className="fp-fade fp-d3" style={{ fontSize: "clamp(13px,1.5vw,16px)", lineHeight: 1.7, color: "rgba(255,255,255,0.58)", textAlign: "center", maxWidth: 400, marginBottom: 36, fontWeight: 300 }}>
            Enter your registered email and we'll send you a secure link to reset your password.
          </p>

          {/* Card */}
          <div className="fp-card-outer fp-fade fp-d4">
            <div className="fp-card">

              {!sent ? (
                <>
                  {/* Steps */}
                  <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
                    {["Enter Email", "Check Inbox", "Reset"].map((s, i) => (
                      <div key={s} style={{ flex: 1 }}>
                        <div style={{ height: 3, borderRadius: 100, background: i === 0 ? "linear-gradient(to right,#2ec97e,#1b7d52)" : "#e5e7eb", marginBottom: 5 }} />
                        <span style={{ fontSize: 10, color: i === 0 ? "#1b7d52" : "#9ca3af", fontWeight: 600, letterSpacing: "0.04em" }}>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 8 }}>Step 1 of 3</p>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,2.4vw,30px)", fontWeight: 700, color: "#0d1f16", marginBottom: 8 }}>Reset Password</h2>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.65, fontWeight: 300 }}>
                      We'll send a secure reset link to your email address. Check your inbox after submitting.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label htmlFor="fp-email" className="fp-label">Email address</label>
                      <div className="fp-input-wrap">
                        <div className="fp-input-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                        </div>
                        <input id="fp-email" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="fp-input" />
                      </div>
                    </div>

                    <button type="submit" disabled={loading} className="fp-submit">
                      {loading ? (
                        <><div className="fp-spinner" /> Sending Link…</>
                      ) : (
                        <>Send Reset Link <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
                      )}
                    </button>
                  </form>

                  {/* Info box */}
                  <div style={{ marginTop: 20, background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1b7d52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.55, fontWeight: 300 }}>
                      The link will expire in <strong style={{ fontWeight: 600, color: "#1b7d52" }}>15 minutes</strong>. Check your spam folder if you don't see it.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0 0" }}>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af" }}>Or</span>
                    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
                  </div>

                  <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/signin" className="fp-btn-ghost">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                      Back to Sign In
                    </Link>
                    <Link to="/register" className="fp-btn-ghost" style={{ color: "#1b7d52", borderColor: "rgba(27,125,82,0.3)" }}>
                      Create Account
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </>
              ) : (
                /* ── SUCCESS STATE ── */
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div className="fp-success-pulse" style={{ display: "inline-flex", width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 8px 32px rgba(46,201,126,0.4)" }}>
                    <svg className="fp-success-icon" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 36, height: 36 }}>
                      <path d="M7 12.5l3.2 3.2L17.5 8.5" />
                    </svg>
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(22px,2.4vw,28px)", fontWeight: 700, color: "#0d1f16", marginBottom: 12 }}>Check your inbox!</h2>
                  <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, fontWeight: 300, marginBottom: 8 }}>
                    We've sent a password reset link to
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "#1b7d52", marginBottom: 28, wordBreak: "break-all" }}>{email}</p>

                  <div style={{ background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.2)", borderRadius: 14, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
                    {[
                      "Open the email from Proti-Binimoy",
                      "Click the secure reset link",
                      "Create your new password",
                    ].map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 0", borderBottom: i < 2 ? "1px solid rgba(46,201,126,0.12)" : "none" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#2ec97e,#1b7d52)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff" }}>{i + 1}</div>
                        <span style={{ fontSize: 13, color: "#374151", fontWeight: 400 }}>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => { setSent(false); setEmail(""); }} style={{ background: "none", border: "1.5px solid #e5e7eb", borderRadius: 100, padding: "11px 22px", fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer", transition: "all 0.2s" }}>
                      Try a different email
                    </button>
                    <Link to="/signin" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: 14, padding: "12px 22px", borderRadius: 100 }}>
                      Back to Sign In
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;