import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

    @keyframes ms-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .ms-fade { opacity: 0; animation: ms-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .ms-d1 { animation-delay: 0.08s; }
    .ms-d2 { animation-delay: 0.16s; }
    .ms-d3 { animation-delay: 0.24s; }

    .ms-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .ms-nav-links { display: flex; align-items: center; gap: 24px; }
    .ms-nav-link { text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 500; transition: color 0.2s; }
    .ms-nav-link:hover, .ms-nav-link.active { color: #2ec97e; }
    .ms-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .ms-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .ms-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 6px; }
    .ms-hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.25s; }
    .ms-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08); padding: 24px 24px 32px; flex-direction: column;
    }
    .ms-mobile-menu.open { display: flex; }
    .ms-mobile-link { text-decoration: none; color: rgba(255,255,255,0.8); font-size: 17px; font-weight: 500; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .ms-mobile-cta { text-decoration: none; display: block; text-align: center; margin-top: 20px; background: linear-gradient(135deg,#2ec97e,#1b7d52); color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px; }

    @media (max-width: 1024px) { .ms-nav { padding: 14px 28px; } }
    @media (max-width: 640px) {
      .ms-nav { padding: 14px 20px; }
      .ms-nav-links { display: none; }
      .ms-hamburger { display: flex; }
    }
  `}</style>
);

const MessageThreadPage = () => {
  const { offerId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [offer, setOffer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const bottomRef = useRef(null);

  const canSend = useMemo(() => {
    return offer && (offer.status === "pending" || offer.status === "accepted");
  }, [offer]);

  const fetchThread = async () => {
    setLoading(true);
    setError("");
    try {
      const [messagesRes, offerRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/messages/${offerId}`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${API_BASE_URL}/api/offers/${offerId}`, {
          headers: { "x-auth-token": token },
        }),
      ]);

      const messagesData = await messagesRes.json().catch(() => []);
      const offerData = await offerRes.json().catch(() => ({}));

      if (!messagesRes.ok) {
        setError(messagesData.msg || "Unable to load messages.");
        return;
      }
      if (!offerRes.ok) {
        setError(offerData.msg || "Unable to load offer.");
        return;
      }

      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setOffer(offerData.offer || null);
    } catch {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThread();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId, token]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !canSend || sending) return;

    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ offerId, body: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to send message.");
        return;
      }

      const appended = {
        ...data.message,
        sender: {
          _id: user?.id,
          name: user?.name || "You",
          profilePicture: user?.profilePicture || "",
        },
      };
      setMessages((prev) => [...prev, appended]);
      setBody("");
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  const markCompleted = async () => {
    if (!offer?._id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${offer._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        window.alert(data.msg || "Unable to mark as completed.");
        return;
      }
      setOffer((prev) => (prev ? { ...prev, status: data.offer?.status || "completed" } : prev));
    } catch {
      window.alert("Unable to connect. Please check your connection.");
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden", background: "rgba(8,35,26,1)" }}>
      <GlobalStyles />

      <nav className="ms-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, flexShrink: 0, background: "linear-gradient(135deg,#2ec97e,#1b7d52)", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display',serif", fontWeight: 900, fontSize: 19, color: "#fff" }}>
            P
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>Proti-Binimoy</p>
            <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginTop: 3 }}>Sustainable Marketplace</p>
          </div>
        </div>
        <div className="ms-nav-links">
          <Link to="/" className="ms-nav-link">Home</Link>
          <Link to="/listings" className="ms-nav-link">Listings</Link>
          <Link to="/offers" className="ms-nav-link active">Offers</Link>
          <Link to="/saved" className="ms-nav-link">Saved</Link>
          <Link to="/dashboard" className="ms-nav-link">Dashboard</Link>
          <Link to="/listings/new" className="ms-nav-cta">Post Listing</Link>
        </div>
        <button className="ms-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`ms-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="ms-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="ms-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/offers" className="ms-mobile-link" onClick={() => setMenuOpen(false)}>Offers</Link>
        <Link to="/saved" className="ms-mobile-link" onClick={() => setMenuOpen(false)}>Saved</Link>
        <Link to="/dashboard" className="ms-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/listings/new" className="ms-mobile-cta" onClick={() => setMenuOpen(false)}>Post Listing</Link>
      </div>

      <section style={{ padding: "108px 24px 40px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          {loading ? (
            <div className="ms-fade ms-d1" style={{ color: "rgba(255,255,255,0.86)" }}>Loading thread...</div>
          ) : error ? (
            <div className="ms-fade ms-d1" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: "14px 16px", color: "#fecaca" }}>
              {error}
            </div>
          ) : (
            <>
              <div className="ms-fade ms-d1" style={{ marginBottom: 12, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 20, padding: 6 }}>
                <div style={{ background: "#fff", borderRadius: 14, padding: 14, color: "#111827" }}>
                  <Link to="/offers" style={{ textDecoration: "none", color: "#1b7d52", fontWeight: 600, fontSize: 13 }}>
                    ← Back to Offers
                  </Link>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, lineHeight: 1.1, marginBottom: 6, marginTop: 8 }}>
                    {offer?.listing?.title || "Offer"}
                  </h2>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: "#065f46", background: "rgba(16,185,129,0.16)" }}>
                      {offer?.offerType}
                    </span>
                    {Number(offer?.cashAmount) > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: "#065f46", background: "rgba(16,185,129,0.16)" }}>
                        ৳ {Number(offer.cashAmount).toLocaleString()}
                      </span>
                    )}
                    {offer?.barterItem && (
                      <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: "#374151", background: "#f3f4f6" }}>
                        Barter: {offer.barterItem}
                      </span>
                    )}
                    <span style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "4px 10px", color: (statusStyle[offer?.status] || statusStyle.cancelled).color, background: (statusStyle[offer?.status] || statusStyle.cancelled).background }}>
                      {offer?.status}
                    </span>
                  </div>

                  {offer?.status === "accepted" && (
                    <button
                      type="button"
                      onClick={markCompleted}
                      style={{
                        border: "none",
                        background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                        color: "#fff",
                        borderRadius: 12,
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>

              <div className="ms-fade ms-d2" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 20, padding: 6 }}>
                <div style={{ background: "#fff", borderRadius: 14, padding: 12 }}>
                  <div style={{ maxHeight: 360, overflowY: "auto", display: "grid", gap: 10, padding: "4px 2px 8px" }}>
                    {messages.map((message) => {
                      const senderId = message.sender?._id || message.sender;
                      const isMine = String(senderId) === String(user?.id);
                      return (
                        <div key={message._id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                          <div
                            style={{
                              maxWidth: "76%",
                              borderRadius: 12,
                              padding: "10px 12px",
                              background: isMine ? "linear-gradient(135deg,#0d3322,#1b7d52)" : "#f3f4f6",
                              color: isMine ? "#fff" : "#111827",
                            }}
                          >
                            <p style={{ fontSize: 12, opacity: isMine ? 0.88 : 0.75, marginBottom: 4 }}>
                              {message.sender?.name || (isMine ? "You" : "User")} · {formatDateTime(message.createdAt)}
                            </p>
                            <p style={{ fontSize: 14, lineHeight: 1.6 }}>{message.body}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={bottomRef} />
                  </div>

                  <form onSubmit={handleSend} style={{ borderTop: "1px solid #e5e7eb", paddingTop: 10, marginTop: 4 }}>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={3}
                      placeholder={canSend ? "Write a message..." : "Messaging is disabled for this offer status."}
                      disabled={!canSend}
                      style={{
                        width: "100%",
                        border: "1.5px solid #e5e7eb",
                        background: "#f9fafb",
                        borderRadius: 13,
                        padding: "12px 14px",
                        fontSize: 14,
                        fontFamily: "inherit",
                        outline: "none",
                        resize: "vertical",
                        color: "#111827",
                        opacity: canSend ? 1 : 0.7,
                      }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <button
                        type="submit"
                        disabled={!canSend || !body.trim() || sending}
                        style={{
                          border: "none",
                          background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                          color: "#fff",
                          borderRadius: 12,
                          padding: "10px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: !canSend || !body.trim() || sending ? "not-allowed" : "pointer",
                          opacity: !canSend || !body.trim() || sending ? 0.7 : 1,
                        }}
                      >
                        {sending ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default MessageThreadPage;

