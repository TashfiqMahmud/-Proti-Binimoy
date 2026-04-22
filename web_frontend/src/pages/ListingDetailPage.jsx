import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import MakeOfferModal from "../components/MakeOfferModal";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes dt-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .dt-fade { opacity: 0; animation: dt-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .dt-d1 { animation-delay: 0.08s; }
    .dt-d2 { animation-delay: 0.16s; }
    .dt-d3 { animation-delay: 0.24s; }

    .dt-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .dt-nav-links { display: flex; align-items: center; gap: 24px; }
    .dt-nav-link {
      text-decoration: none; color: rgba(255,255,255,0.7);
      font-size: 14px; font-weight: 500; transition: color 0.2s;
    }
    .dt-nav-link:hover, .dt-nav-link.active { color: #2ec97e; }
    .dt-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .dt-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .dt-hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; background: none; border: none; padding: 6px;
    }
    .dt-hamburger span {
      display: block; width: 24px; height: 2px; background: #fff;
      border-radius: 2px; transition: all 0.25s;
    }
    .dt-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 24px 24px 32px; flex-direction: column;
    }
    .dt-mobile-menu.open { display: flex; }
    .dt-mobile-link {
      text-decoration: none; color: rgba(255,255,255,0.8);
      font-size: 17px; font-weight: 500; padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .dt-mobile-cta {
      text-decoration: none; display: block; text-align: center; margin-top: 20px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px;
    }

    .dt-layout {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .dt-nav { padding: 14px 28px; }
      .dt-layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .dt-nav { padding: 14px 20px; }
      .dt-nav-links { display: none; }
      .dt-hamburger { display: flex; }
    }
  `}</style>
);

const ImagePlaceholder = ({ height = 340 }) => (
  <div
    style={{
      height,
      width: "100%",
      background: "linear-gradient(135deg, #0d3322, #1b7d52)",
      borderRadius: 16,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.92)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 42, height: 42 }}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="10.5" r="1.6" />
      <path d="M21 15l-4.5-4.5L8 19" />
    </svg>
  </div>
);

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/${id}`);
        const data = await response.json().catch(() => ({}));
        if (response.status === 404) {
          setError("Listing not found");
          return;
        }
        if (!response.ok) {
          setError(data.msg || "Unable to load this listing.");
          return;
        }
        setListing(data);
        setSelectedImage(0);
      } catch {
        setError("Unable to connect. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const fetchSavedListings = async () => {
      if (!token) {
        setIsSaved(false);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/listings/saved`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) {
          return;
        }
        setIsSaved(data.some((savedListing) => savedListing?._id === id));
      } catch {
        // ignore saved state fetch failure
      }
    };

    fetchSavedListings();
  }, [id, token]);

  const isSeller = Boolean(
    user?.id &&
      listing?.seller?._id &&
      String(user.id) === String(listing.seller._id)
  );

  const images = useMemo(() => {
    return Array.isArray(listing?.images) ? listing.images.filter(Boolean) : [];
  }, [listing]);

  const mainImage = images[selectedImage] || images[0] || "";

  const handleDelete = async () => {
    if (!token || !listing?._id || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listing._id}`, {
        method: "DELETE",
        headers: { "x-auth-token": token },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to delete listing.");
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!listing?._id) return;
    if (!token) {
      navigate("/signin");
      return;
    }
    setSaveLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/listings/${listing._id}/save`, {
        method: "POST",
        headers: { "x-auth-token": token },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to update saved state.");
        return;
      }
      setIsSaved(Boolean(data.saved));
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleOpenOffer = () => {
    if (!token) {
      navigate("/signin");
      return;
    }
    setShowOfferModal(true);
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <GlobalStyles />

      <nav className="dt-nav">
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

        <div className="dt-nav-links">
          <Link to="/" className="dt-nav-link">Home</Link>
          <Link to="/listings" className="dt-nav-link active">Listings</Link>
          <Link to="/offers" className="dt-nav-link">Offers</Link>
          <Link to="/saved" className="dt-nav-link">Saved</Link>
          <Link to="/signin" className="dt-nav-link">Sign In</Link>
          <Link to="/register" className="dt-nav-cta">Register</Link>
        </div>

        <button className="dt-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`dt-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="dt-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="dt-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/offers" className="dt-mobile-link" onClick={() => setMenuOpen(false)}>Offers</Link>
        <Link to="/saved" className="dt-mobile-link" onClick={() => setMenuOpen(false)}>Saved</Link>
        <Link to="/signin" className="dt-mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
        <Link to="/register" className="dt-mobile-cta" onClick={() => setMenuOpen(false)}>Create Account</Link>
      </div>

      <section
        style={{
          minHeight: "100vh",
          backgroundImage: `url(${websiteBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          padding: "108px 24px 48px",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg,rgba(8,35,26,0.94) 0%,rgba(8,35,26,0.84) 52%,rgba(8,35,26,0.73) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1160, margin: "0 auto" }}>
          {loading ? (
            <div className="dt-fade dt-d1" style={{ color: "rgba(255,255,255,0.86)", fontSize: 15 }}>Loading listing...</div>
          ) : error === "Listing not found" ? (
            <div
              className="dt-fade dt-d1"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.13)",
                borderRadius: 20,
                padding: 6,
              }}
            >
              <div style={{ background: "#fff", borderRadius: 16, padding: 20 }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, color: "#0d1f16", marginBottom: 12 }}>
                  Listing not found
                </h2>
                <Link to="/listings" style={{ color: "#1b7d52", fontWeight: 600, textDecoration: "none" }}>
                  ← Back to Listings
                </Link>
              </div>
            </div>
          ) : error ? (
            <div
              className="dt-fade dt-d1"
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
          ) : (
            <div className="dt-layout dt-fade dt-d2">
              <div
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: 22,
                  padding: 6,
                  backdropFilter: "blur(24px)",
                }}
              >
                <div style={{ background: "#fff", borderRadius: 16, padding: 14 }}>
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={listing?.title}
                      style={{ width: "100%", height: 390, borderRadius: 14, objectFit: "cover" }}
                    />
                  ) : (
                    <ImagePlaceholder height={390} />
                  )}

                  {images.length > 1 && (
                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(86px,1fr))", gap: 8 }}>
                      {images.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          style={{
                            borderRadius: 10,
                            border: index === selectedImage ? "2px solid #1b7d52" : "1.5px solid #e5e7eb",
                            padding: 0,
                            background: "#fff",
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                        >
                          <img src={image} alt={`Preview ${index + 1}`} style={{ width: "100%", height: 68, objectFit: "cover" }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="dt-fade dt-d3"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  borderRadius: 22,
                  padding: 6,
                  backdropFilter: "blur(24px)",
                }}
              >
                <div style={{ background: "#fff", borderRadius: 16, padding: 20, color: "#0d1f16" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 999,
                        padding: "4px 10px",
                        color: "#065f46",
                        background: "rgba(16,185,129,0.16)",
                      }}
                    >
                      {listing?.category || "Other"}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 999,
                        padding: "4px 10px",
                        color: listing?.condition === "New" ? "#065f46" : "#374151",
                        background: listing?.condition === "New" ? "rgba(16,185,129,0.16)" : "#f3f4f6",
                      }}
                    >
                      {listing?.condition || "Used"}
                    </span>
                  </div>

                  <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.2vw,42px)", lineHeight: 1.08, marginBottom: 10 }}>
                    {listing?.title}
                  </h1>
                  <p style={{ color: "#1b7d52", fontWeight: 700, fontSize: 32, marginBottom: 16 }}>
                    ৳ {Number(listing?.price).toLocaleString()}
                  </p>

                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, marginBottom: 8 }}>Description</h3>
                  <p style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.8, color: "#374151", marginBottom: 16 }}>
                    {listing?.description}
                  </p>

                  <p style={{ fontSize: 14, color: "#4b5563", marginBottom: 18 }}>
                    <strong style={{ color: "#0d1f16" }}>Location:</strong>{" "}
                    {[listing?.location?.city, listing?.location?.address].filter(Boolean).join(", ") || "Not specified"}
                  </p>

                  <div
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: 14,
                      padding: "12px 14px",
                      background: "#f9fafb",
                      marginBottom: 16,
                    }}
                  >
                    <p style={{ fontSize: 14, color: "#111827", marginBottom: 5 }}>
                      <strong>Seller:</strong> {listing?.seller?.name || "Unknown"}
                    </p>
                    <p style={{ fontSize: 13, color: "#4b5563", marginBottom: token && listing?.seller?.phone ? 5 : 0 }}>
                      <strong>City:</strong> {listing?.seller?.location?.city || "Not specified"}
                    </p>
                    {token && listing?.seller?.phone && (
                      <p style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Phone:</strong> {listing.seller.phone}
                      </p>
                    )}
                  </div>

                  {isSeller ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <Link
                        to={`/listings/${listing?._id}/edit`}
                        style={{
                          textDecoration: "none",
                          background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                          color: "#fff",
                          borderRadius: 13,
                          padding: "12px 14px",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Edit Listing
                      </Link>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                          border: "1px solid rgba(220,38,38,0.35)",
                          background: "rgba(220,38,38,0.08)",
                          color: "#b91c1c",
                          borderRadius: 13,
                          padding: "12px 14px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: deleting ? "not-allowed" : "pointer",
                          opacity: deleting ? 0.7 : 1,
                        }}
                      >
                        {deleting ? "Deleting..." : "Delete Listing"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <button
                        type="button"
                        onClick={handleOpenOffer}
                        style={{
                          border: "none",
                          background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                          color: "#fff",
                          borderRadius: 13,
                          padding: "13px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Make an Offer
                      </button>

                      <button
                        type="button"
                        disabled={saveLoading}
                        onClick={handleToggleSave}
                        style={{
                          border: "1px solid rgba(220,38,38,0.3)",
                          background: isSaved ? "rgba(220,38,38,0.08)" : "#fff",
                          color: isSaved ? "#b91c1c" : "#374151",
                          borderRadius: 13,
                          padding: "12px 14px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: saveLoading ? "not-allowed" : "pointer",
                          opacity: saveLoading ? 0.7 : 1,
                        }}
                      >
                        {isSaved ? "♥ Saved" : "♡ Save"}
                      </button>
                    </div>
                  )}

                  <div>
                    <Link to="/listings" style={{ textDecoration: "none", color: "#1b7d52", fontWeight: 600 }}>
                      ← Back to Listings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {showOfferModal && listing && (
        <MakeOfferModal
          listing={listing}
          onClose={() => setShowOfferModal(false)}
          onSuccess={() => setShowOfferModal(false)}
        />
      )}
    </div>
  );
};

export default ListingDetailPage;

