import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes sv-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .sv-fade { opacity: 0; animation: sv-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .sv-d1 { animation-delay: 0.08s; }
    .sv-d2 { animation-delay: 0.16s; }
    .sv-d3 { animation-delay: 0.24s; }

    .sv-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .sv-nav-links { display: flex; align-items: center; gap: 24px; }
    .sv-nav-link { text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .sv-nav-link:hover, .sv-nav-link.active { color: #2ec97e; }
    .sv-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .sv-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .sv-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
    .sv-hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.25s; }
    .sv-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08); padding: 24px 24px 32px; flex-direction: column;
    }
    .sv-mobile-menu.open { display: flex; }
    .sv-mobile-link { text-decoration: none; color: rgba(255,255,255,0.8); font-size: 17px; font-weight: 500; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .sv-mobile-cta { text-decoration: none; display: block; text-align: center; margin-top: 20px; background: linear-gradient(135deg,#2ec97e,#1b7d52); color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px; }

    .sv-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
    @media (max-width: 1024px) {
      .sv-nav { padding: 14px 28px; }
      .sv-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 640px) {
      .sv-nav { padding: 14px 20px; }
      .sv-nav-links { display: none; }
      .sv-hamburger { display: flex; }
      .sv-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

const ImagePlaceholder = ({ height = 180 }) => (
  <div
    style={{
      height,
      background: "linear-gradient(135deg, #0d3322, #1b7d52)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.92)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 34, height: 34 }}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="10.5" r="1.6" />
      <path d="M21 15l-4.5-4.5L8 19" />
    </svg>
  </div>
);

const SavedListingsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/saved`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          setError(data.msg || "Unable to load saved listings.");
          return;
        }
        setListings(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to connect. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, [token]);

  const handleUnsave = async (listingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listingId}/save`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to update saved listings.");
        return;
      }
      setListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden", background: "rgba(8,35,26,1)" }}>
      <GlobalStyles />

      <nav className="sv-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>
            P
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Proti-Binimoy</p>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="sv-nav-links">
          <Link to="/" className="sv-nav-link">Home</Link>
          <Link to="/listings" className="sv-nav-link">Listings</Link>
          <Link to="/offers" className="sv-nav-link">Offers</Link>
          <Link to="/saved" className="sv-nav-link active">Saved</Link>
          <Link to="/dashboard" className="sv-nav-link">Dashboard</Link>
          <Link to="/listings/new" className="sv-nav-cta">Post Listing</Link>
        </div>
        <button className="sv-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`sv-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="sv-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="sv-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/offers" className="sv-mobile-link" onClick={() => setMenuOpen(false)}>Offers</Link>
        <Link to="/saved" className="sv-mobile-link" onClick={() => setMenuOpen(false)}>Saved</Link>
        <Link to="/dashboard" className="sv-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/listings/new" className="sv-mobile-cta" onClick={() => setMenuOpen(false)}>Post Listing</Link>
      </div>

      <section style={{ padding: "108px 24px 40px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div className="sv-fade sv-d1" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 8 }}>
              Saved Listings
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.8vw,48px)", color: "#fff" }}>
              Your saved items
            </h1>
          </div>

          {loading ? (
            <div className="sv-fade sv-d2" style={{ color: "rgba(255,255,255,0.86)" }}>Loading saved listings...</div>
          ) : error ? (
            <div className="sv-fade sv-d2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "14px 16px", color: "#fecaca" }}>
              {error}
            </div>
          ) : listings.length === 0 ? (
            <div className="sv-fade sv-d2" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 16, padding: "16px 18px", color: "rgba(255,255,255,0.84)" }}>
              No saved listings yet. Browse the marketplace to save items.
            </div>
          ) : (
            <div className="sv-grid sv-fade sv-d3">
              {listings.map((listing) => (
                <div
                  key={listing._id}
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.13)",
                    borderRadius: 22,
                    backdropFilter: "blur(18px)",
                    padding: 6,
                  }}
                >
                  <div style={{ background: "#fff", borderRadius: 16, padding: 14, height: "100%", display: "flex", flexDirection: "column" }}>
                    {Array.isArray(listing.images) && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 14, marginBottom: 12 }}
                      />
                    ) : (
                      <div style={{ marginBottom: 12 }}>
                        <ImagePlaceholder height={190} />
                      </div>
                    )}

                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#0d1f16", lineHeight: 1.2, marginBottom: 8 }}>
                      {listing.title}
                    </h3>

                    <p style={{ fontSize: 22, fontWeight: 700, color: "#1b7d52", marginBottom: 10 }}>
                      ৳ {Number(listing.price).toLocaleString()}
                    </p>

                    <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 14 }}>
                      City: <strong style={{ fontWeight: 600 }}>{listing.location?.city || "Not specified"}</strong>
                    </p>

                    <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/listings/${listing._id}`)}
                        style={{
                          border: "none",
                          background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                          color: "#fff",
                          borderRadius: 13,
                          padding: "12px 14px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnsave(listing._id)}
                        style={{
                          border: "1px solid rgba(220,38,38,0.3)",
                          background: "rgba(220,38,38,0.08)",
                          color: "#b91c1c",
                          borderRadius: 13,
                          padding: "11px 14px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        ♥ Unsave
                      </button>
                    </div>
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

export default SavedListingsPage;

