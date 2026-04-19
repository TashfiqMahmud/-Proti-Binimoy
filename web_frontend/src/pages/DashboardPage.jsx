import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const formatDate = (value) => {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes db-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .db-fade { opacity: 0; animation: db-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .db-d1 { animation-delay: 0.08s; }
    .db-d2 { animation-delay: 0.16s; }
    .db-d3 { animation-delay: 0.24s; }

    .db-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .db-nav-links { display: flex; align-items: center; gap: 28px; }
    .db-nav-link {
      text-decoration: none; color: rgba(255,255,255,0.7);
      font-size: 14px; font-weight: 500; transition: color 0.2s;
    }
    .db-nav-link:hover, .db-nav-link.active { color: #2ec97e; }
    .db-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .db-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .db-hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; background: none; border: none; padding: 6px;
    }
    .db-hamburger span {
      display: block; width: 24px; height: 2px; background: #fff;
      border-radius: 2px; transition: all 0.25s;
    }
    .db-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 24px 24px 32px; flex-direction: column;
    }
    .db-mobile-menu.open { display: flex; }
    .db-mobile-link {
      text-decoration: none; color: rgba(255,255,255,0.8);
      font-size: 17px; font-weight: 500; padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .db-mobile-cta {
      text-decoration: none; display: block; text-align: center; margin-top: 20px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px;
    }

    @media (max-width: 1024px) {
      .db-nav { padding: 14px 28px; }
    }
    @media (max-width: 640px) {
      .db-nav { padding: 14px 20px; }
      .db-nav-links { display: none; }
      .db-hamburger { display: flex; }
    }
  `}</style>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMine = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/mine`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          setError(data.msg || "Unable to load your listings.");
          return;
        }
        setListings(Array.isArray(data) ? data : []);
      } catch {
        setError("Unable to connect. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, [token]);

  const summary = useMemo(() => {
    const total = listings.length;
    const active = listings.filter((listing) => listing.status === "active").length;
    const sold = listings.filter((listing) => listing.status === "sold").length;
    return { total, active, sold };
  }, [listings]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this listing?");
    if (!ok) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to delete listing.");
        return;
      }
      setListings((prev) => prev.filter((listing) => listing._id !== id));
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden", background: "rgba(8,35,26,1)" }}>
      <GlobalStyles />

      <nav className="db-nav">
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

        <div className="db-nav-links">
          <Link to="/" className="db-nav-link">Home</Link>
          <Link to="/listings" className="db-nav-link">Listings</Link>
          <Link to="/dashboard" className="db-nav-link active">Dashboard</Link>
          <Link to="/listings/new" className="db-nav-cta">Post a New Listing</Link>
        </div>

        <button className="db-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`db-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="db-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="db-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/dashboard" className="db-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/listings/new" className="db-mobile-cta" onClick={() => setMenuOpen(false)}>Post a New Listing</Link>
      </div>

      <section style={{ padding: "108px 24px 42px" }}>
        <div style={{ maxWidth: 1220, margin: "0 auto" }}>
          <div className="db-fade db-d1" style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 8 }}>
              Dashboard
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.8vw,48px)", lineHeight: 1.08, color: "#fff", marginBottom: 8 }}>
              Welcome back, {user?.name || "User"}
            </h1>
          </div>

          <div
            className="db-fade db-d2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 12,
              marginBottom: 18,
            }}
          >
            {[
              { label: "Total Listings", value: summary.total },
              { label: "Active", value: summary.active },
              { label: "Sold", value: summary.sold },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  backdropFilter: "blur(24px)",
                }}
              >
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginBottom: 5 }}>{item.label}</p>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, lineHeight: 1, color: "#fff" }}>{item.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="db-fade db-d3" style={{ color: "rgba(255,255,255,0.86)", fontSize: 15 }}>Loading your listings...</div>
          ) : error ? (
            <div
              className="db-fade db-d3"
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
          ) : listings.length === 0 ? (
            <div
              className="db-fade db-d3"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 22,
                padding: 6,
              }}
            >
              <div style={{ background: "#fff", borderRadius: 16, padding: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: "#0d1f16", marginBottom: 10 }}>
                  You haven't posted any listings yet
                </h2>
                <Link
                  to="/listings/new"
                  style={{
                    textDecoration: "none",
                    borderRadius: 13,
                    background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "12px 14px",
                    display: "inline-flex",
                  }}
                >
                  Post a New Listing
                </Link>
              </div>
            </div>
          ) : (
            <div
              className="db-fade db-d3"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 22,
                padding: 6,
                backdropFilter: "blur(24px)",
              }}
            >
              <div style={{ background: "#fff", borderRadius: 16, padding: 12, overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>
                      {["Title", "Category", "Condition", "Price", "Status", "City", "Created", "Actions"].map((head) => (
                        <th key={head} style={{ fontSize: 12, color: "#4b5563", fontWeight: 700, padding: "10px 8px" }}>{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((listing) => (
                      <tr key={listing._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 8px", color: "#111827", fontSize: 13, fontWeight: 600 }}>{listing.title}</td>
                        <td style={{ padding: "10px 8px", color: "#374151", fontSize: 13 }}>{listing.category}</td>
                        <td style={{ padding: "10px 8px", color: "#374151", fontSize: 13 }}>{listing.condition}</td>
                        <td style={{ padding: "10px 8px", color: "#1b7d52", fontSize: 13, fontWeight: 700 }}>৳ {Number(listing.price).toLocaleString()}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              borderRadius: 999,
                              padding: "3px 9px",
                              color: listing.status === "active" ? "#065f46" : "#374151",
                              background: listing.status === "active" ? "rgba(16,185,129,0.16)" : "#f3f4f6",
                            }}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td style={{ padding: "10px 8px", color: "#374151", fontSize: 13 }}>{listing.location?.city || "-"}</td>
                        <td style={{ padding: "10px 8px", color: "#374151", fontSize: 13 }}>{formatDate(listing.createdAt)}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => navigate(`/listings/${listing._id}/edit`)}
                              style={{
                                border: "1px solid #d1d5db",
                                background: "#fff",
                                color: "#111827",
                                borderRadius: 10,
                                padding: "7px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(listing._id)}
                              style={{
                                border: "1px solid rgba(220,38,38,0.3)",
                                background: "rgba(220,38,38,0.08)",
                                color: "#b91c1c",
                                borderRadius: 10,
                                padding: "7px 10px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

