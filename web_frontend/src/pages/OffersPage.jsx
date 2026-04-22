import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const statusStyle = {
  pending: { color: "#92400e", background: "rgba(245,158,11,0.16)" },
  accepted: { color: "#065f46", background: "rgba(16,185,129,0.16)" },
  declined: { color: "#b91c1c", background: "rgba(239,68,68,0.14)" },
  cancelled: { color: "#374151", background: "#f3f4f6" },
  completed: { color: "#1d4ed8", background: "rgba(59,130,246,0.16)" },
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes of-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .of-fade { opacity: 0; animation: of-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .of-d1 { animation-delay: 0.08s; }
    .of-d2 { animation-delay: 0.16s; }
    .of-d3 { animation-delay: 0.24s; }

    .of-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .of-nav-links { display: flex; align-items: center; gap: 24px; }
    .of-nav-link { text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .of-nav-link:hover, .of-nav-link.active { color: #2ec97e; }
    .of-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .of-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .of-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
    .of-hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.25s; }
    .of-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08); padding: 24px 24px 32px; flex-direction: column;
    }
    .of-mobile-menu.open { display: flex; }
    .of-mobile-link { text-decoration: none; color: rgba(255,255,255,0.8); font-size: 17px; font-weight: 500; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .of-mobile-cta { text-decoration: none; display: block; text-align: center; margin-top: 20px; background: linear-gradient(135deg,#2ec97e,#1b7d52); color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px; }

    @media (max-width: 1024px) { .of-nav { padding: 14px 28px; } }
    @media (max-width: 640px) {
      .of-nav { padding: 14px 20px; }
      .of-nav-links { display: none; }
      .of-hamburger { display: flex; }
    }
  `}</style>
);

const ImagePlaceholder = () => (
  <div
    style={{
      width: 84,
      height: 84,
      borderRadius: 12,
      background: "linear-gradient(135deg, #0d3322, #1b7d52)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 28, height: 28 }}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
      <circle cx="8.5" cy="10.5" r="1.6" />
      <path d="M21 15l-4.5-4.5L8 19" />
    </svg>
  </div>
);

const OffersPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState("received");
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOffers = async (targetTab = tab) => {
    setLoading(true);
    setError("");
    try {
      const endpoint = targetTab === "received" ? "received" : "sent";
      const response = await fetch(`${API_BASE_URL}/api/offers/${endpoint}`, {
        headers: { "x-auth-token": token },
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        setError(data.msg || "Unable to load offers.");
        return;
      }
      if (targetTab === "received") {
        setReceivedOffers(Array.isArray(data) ? data : []);
      } else {
        setSentOffers(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers("received");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (tab === "received" && receivedOffers.length === 0) {
      fetchOffers("received");
    }
    if (tab === "sent" && sentOffers.length === 0) {
      fetchOffers("sent");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const updateOfferStatus = async (offerId, status, listType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to update offer.");
        return;
      }
      const updater = (offers) =>
        offers.map((offer) =>
          offer._id === offerId ? { ...offer, status: data.offer?.status || status } : offer
        );
      if (listType === "received") setReceivedOffers(updater);
      if (listType === "sent") setSentOffers(updater);
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    }
  };

  const activeOffers = tab === "received" ? receivedOffers : sentOffers;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden", background: "rgba(8,35,26,1)" }}>
      <GlobalStyles />

      <nav className="of-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>
            P
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Proti-Binimoy</p>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="of-nav-links">
          <Link to="/" className="of-nav-link">Home</Link>
          <Link to="/listings" className="of-nav-link">Listings</Link>
          <Link to="/offers" className="of-nav-link active">Offers</Link>
          <Link to="/saved" className="of-nav-link">Saved</Link>
          <Link to="/dashboard" className="of-nav-link">Dashboard</Link>
          <Link to="/listings/new" className="of-nav-cta">Post Listing</Link>
        </div>
        <button className="of-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`of-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="of-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="of-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/offers" className="of-mobile-link" onClick={() => setMenuOpen(false)}>Offers</Link>
        <Link to="/saved" className="of-mobile-link" onClick={() => setMenuOpen(false)}>Saved</Link>
        <Link to="/dashboard" className="of-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/listings/new" className="of-mobile-cta" onClick={() => setMenuOpen(false)}>Post Listing</Link>
      </div>

      <section style={{ padding: "108px 24px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="of-fade of-d1" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 8 }}>
              Offers Inbox
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.8vw,48px)", color: "#fff" }}>
              Manage your offers
            </h1>
          </div>

          <div className="of-fade of-d2" style={{ marginBottom: 16, display: "inline-flex", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 14, padding: 4 }}>
            {[
              { id: "received", label: "Received" },
              { id: "sent", label: "Sent" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                style={{
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 16px",
                  background: tab === item.id ? "linear-gradient(135deg,#0d3322,#1b7d52)" : "transparent",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="of-fade of-d3" style={{ color: "rgba(255,255,255,0.86)" }}>Loading offers...</div>
          ) : error ? (
            <div className="of-fade of-d3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "14px 16px", color: "#fecaca" }}>
              {error}
            </div>
          ) : activeOffers.length === 0 ? (
            <div className="of-fade of-d3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 16, padding: "16px 18px", color: "rgba(255,255,255,0.84)" }}>
              No offers in this tab yet.
            </div>
          ) : (
            <div className="of-fade of-d3" style={{ display: "grid", gap: 12 }}>
              {activeOffers.map((offer) => {
                const listing = offer.listing || {};
                const peer = tab === "received" ? offer.fromUser : offer.toUser;
                const styles = statusStyle[offer.status] || statusStyle.cancelled;

                return (
                  <div
                    key={offer._id}
                    onClick={() => navigate(`/messages/${offer._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate(`/messages/${offer._id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      border: "1px solid rgba(255,255,255,0.13)",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 18,
                      textAlign: "left",
                      padding: 6,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ background: "#fff", borderRadius: 14, padding: 14, color: "#111827" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        {Array.isArray(listing.images) && listing.images[0] ? (
                          <img src={listing.images[0]} alt={listing.title || "Listing"} style={{ width: 84, height: 84, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />
                        ) : (
                          <ImagePlaceholder />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: "#065f46", background: "rgba(16,185,129,0.16)" }}>
                              {offer.offerType}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: styles.color, background: styles.background }}>
                              {offer.status}
                            </span>
                          </div>
                          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, lineHeight: 1.1, marginBottom: 4 }}>
                            {listing.title || "Listing"}
                          </h3>
                          <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                            {tab === "received" ? "From" : "To"}: <strong>{peer?.name || "Unknown user"}</strong>
                          </p>
                          {Number(offer.cashAmount) > 0 && (
                            <p style={{ fontSize: 13, color: "#1b7d52", fontWeight: 700, marginBottom: 4 }}>
                              Cash Offer: ৳ {Number(offer.cashAmount).toLocaleString()}
                            </p>
                          )}
                          {offer.barterItem && (
                            <p style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                              Barter: {offer.barterItem}
                            </p>
                          )}
                          <p style={{ fontSize: 12, color: "#6b7280" }}>Created: {formatDate(offer.createdAt)}</p>
                        </div>
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {tab === "received" && offer.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOfferStatus(offer._id, "accepted", "received");
                              }}
                              style={{
                                border: "none",
                                background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                                color: "#fff",
                                borderRadius: 10,
                                padding: "9px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOfferStatus(offer._id, "declined", "received");
                              }}
                              style={{
                                border: "1px solid rgba(220,38,38,0.3)",
                                background: "rgba(220,38,38,0.08)",
                                color: "#b91c1c",
                                borderRadius: 10,
                                padding: "9px 12px",
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {tab === "sent" && offer.status === "pending" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOfferStatus(offer._id, "cancelled", "sent");
                            }}
                            style={{
                              border: "1px solid rgba(107,114,128,0.3)",
                              background: "#f3f4f6",
                              color: "#374151",
                              borderRadius: 10,
                              padding: "9px 12px",
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OffersPage;
