import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import { API_BASE_URL } from "../config/api";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Sports",
  "Books",
  "Vehicles",
  "Other",
];

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes ls-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .ls-fade { opacity: 0; animation: ls-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .ls-d1 { animation-delay: 0.08s; }
    .ls-d2 { animation-delay: 0.16s; }
    .ls-d3 { animation-delay: 0.24s; }
    .ls-d4 { animation-delay: 0.32s; }

    .ls-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .ls-nav-links { display: flex; align-items: center; gap: 28px; }
    .ls-nav-link {
      text-decoration: none; color: rgba(255,255,255,0.7);
      font-size: 14px; font-weight: 500; transition: color 0.2s;
    }
    .ls-nav-link:hover, .ls-nav-link.active { color: #2ec97e; }
    .ls-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .ls-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .ls-hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; background: none; border: none; padding: 6px;
    }
    .ls-hamburger span {
      display: block; width: 24px; height: 2px; background: #fff;
      border-radius: 2px; transition: all 0.25s;
    }
    .ls-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 24px 24px 32px; flex-direction: column;
    }
    .ls-mobile-menu.open { display: flex; }
    .ls-mobile-link {
      text-decoration: none; color: rgba(255,255,255,0.8);
      font-size: 17px; font-weight: 500; padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .ls-mobile-cta {
      text-decoration: none; display: block; text-align: center; margin-top: 20px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px;
    }

    .ls-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 22px;
    }

    @media (max-width: 1024px) {
      .ls-nav { padding: 14px 28px; }
      .ls-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 640px) {
      .ls-nav { padding: 14px 20px; }
      .ls-nav-links { display: none; }
      .ls-hamburger { display: flex; }
      .ls-grid { grid-template-columns: 1fr; }
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

const ListingsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings`);
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          setError(data.msg || "Unable to load listings right now.");
          return;
        }
        setListings(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to connect. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesCategory = !categoryFilter || listing.category === categoryFilter;
      const matchesCondition = !conditionFilter || listing.condition === conditionFilter;
      const title = typeof listing.title === "string" ? listing.title : "";
      const matchesSearch =
        !search || title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesCategory && matchesCondition && matchesSearch;
    });
  }, [categoryFilter, conditionFilter, listings, search]);

  const clearFilters = () => {
    setCategoryFilter("");
    setConditionFilter("");
    setSearch("");
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <GlobalStyles />

      <nav className="ls-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              background: "linear-gradient(135deg,#2ec97e,#1b7d52)",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 900,
              fontSize: 19,
              color: "#fff",
            }}
          >
            P
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              Proti-Binimoy
            </p>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginTop: 3,
              }}
            >
              Sustainable Marketplace
            </p>
          </div>
        </div>

        <div className="ls-nav-links">
          <Link to="/" className="ls-nav-link">Home</Link>
          <Link to="/listings" className="ls-nav-link active">Listings</Link>
          <Link to="/offers" className="ls-nav-link">Offers</Link>
          <Link to="/saved" className="ls-nav-link">Saved</Link>
          <Link to="/signin" className="ls-nav-link">Sign In</Link>
          <Link to="/register" className="ls-nav-cta">Register</Link>
        </div>

        <button className="ls-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`ls-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="ls-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="ls-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/offers" className="ls-mobile-link" onClick={() => setMenuOpen(false)}>Offers</Link>
        <Link to="/saved" className="ls-mobile-link" onClick={() => setMenuOpen(false)}>Saved</Link>
        <Link to="/signin" className="ls-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <Link to="/register" className="ls-mobile-cta" onClick={() => setMenuOpen(false)}>Create Account</Link>
      </div>

      <section
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${websiteBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "106px 24px 56px",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(8,35,26,0.94) 0%,rgba(8,35,26,0.84) 52%,rgba(8,35,26,0.72) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>
          <div className="ls-fade ls-d1" style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 10 }}>
              Marketplace
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,4vw,52px)", lineHeight: 1.08, color: "#fff", fontWeight: 700 }}>
              Explore active listings
            </h1>
          </div>

          <div
            className="ls-fade ls-d2"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 22,
              backdropFilter: "blur(24px)",
              padding: 6,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "16px 16px",
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              }}
            >
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1.5px solid #e5e7eb",
                    background: "#f9fafb",
                    borderRadius: 13,
                    padding: "11px 12px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#111827",
                  }}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Condition</label>
                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1.5px solid #e5e7eb",
                    background: "#f9fafb",
                    borderRadius: 13,
                    padding: "11px 12px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#111827",
                  }}
                >
                  <option value="">All Conditions</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Search</label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1.5px solid #e5e7eb",
                    background: "#f9fafb",
                    borderRadius: 13,
                    padding: "11px 12px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    outline: "none",
                    color: "#111827",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    width: "100%",
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    borderRadius: 13,
                    padding: "11px 12px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="ls-fade ls-d3" style={{ color: "rgba(255,255,255,0.86)", fontSize: 15 }}>Loading listings...</div>
          ) : error ? (
            <div
              className="ls-fade ls-d3"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 14,
                padding: "14px 16px",
                fontSize: 14,
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          ) : filteredListings.length === 0 ? (
            <div
              className="ls-fade ls-d3"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 16,
                padding: "18px 20px",
                color: "rgba(255,255,255,0.84)",
              }}
            >
              No listings found.
            </div>
          ) : (
            <div className="ls-grid ls-fade ls-d4">
              {filteredListings.map((listing) => (
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

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "4px 9px",
                          borderRadius: 999,
                          color: listing.condition === "New" ? "#065f46" : "#374151",
                          background: listing.condition === "New" ? "rgba(16,185,129,0.16)" : "#f3f4f6",
                          fontWeight: 600,
                        }}
                      >
                        {listing.condition}
                      </span>
                      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{listing.category}</span>
                    </div>

                    <h3
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#0d1f16",
                        lineHeight: 1.2,
                        marginBottom: 8,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        minHeight: 52,
                      }}
                    >
                      {listing.title}
                    </h3>

                    <p style={{ fontSize: 22, fontWeight: 700, color: "#1b7d52", marginBottom: 10 }}>
                      ৳ {Number(listing.price).toLocaleString()}
                    </p>

                    <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                      Seller: <strong style={{ fontWeight: 600 }}>{listing.seller?.name || "Unknown"}</strong>
                    </p>
                    <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 14 }}>
                      City: <strong style={{ fontWeight: 600 }}>{listing.location?.city || "Not specified"}</strong>
                    </p>

                    <Link
                      to={`/listings/${listing._id}`}
                      style={{
                        marginTop: "auto",
                        textDecoration: "none",
                        background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                        color: "#fff",
                        borderRadius: 13,
                        padding: "12px 14px",
                        fontSize: 14,
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                      }}
                    >
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
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

export default ListingsPage;


