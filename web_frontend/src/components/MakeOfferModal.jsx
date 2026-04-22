import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    @keyframes mo-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .mo-card { animation: mo-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  `}</style>
);

const MakeOfferModal = ({ listing, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [offerType, setOfferType] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [barterItem, setBarterItem] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const needsCash = offerType === "cash" || offerType === "cash+barter";
  const needsBarter = offerType === "barter" || offerType === "cash+barter";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!listing?._id) return;

    setError("");
    if (needsCash) {
      const value = Number(cashAmount);
      if (!Number.isFinite(value) || value < 0) {
        setError("Cash amount must be 0 or more.");
        return;
      }
    }

    if (needsBarter && !barterItem.trim()) {
      setError("Please describe what you're offering to barter.");
      return;
    }

    if (barterItem.length > 200) {
      setError("Barter item must be 200 characters or fewer.");
      return;
    }

    if (message.length > 500) {
      setError("Message must be 500 characters or fewer.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          listingId: listing._id,
          offerType,
          cashAmount: Number(cashAmount) || 0,
          barterItem: barterItem.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.msg || "Unable to send offer.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (typeof onSuccess === "function") onSuccess();
        if (typeof onClose === "function") onClose();
      }, 1500);
    } catch {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <GlobalStyles />

      <div
        className="mo-card"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.13)",
          borderRadius: 22,
          backdropFilter: "blur(24px)",
          padding: 6,
        }}
      >
        <div style={{ background: "#fff", borderRadius: 16, padding: 18, color: "#0d1f16" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, marginBottom: 6 }}>
            Make an Offer
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
            For: <strong style={{ color: "#111827" }}>{listing?.title}</strong>
          </p>

          {success ? (
            <div
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.35)",
                borderRadius: 12,
                padding: "13px 14px",
                fontSize: 14,
                color: "#065f46",
                fontWeight: 600,
              }}
            >
              Offer sent!
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                  Offer Type
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6 }}>
                  {[
                    { value: "cash", label: "Cash" },
                    { value: "barter", label: "Barter" },
                    { value: "cash+barter", label: "Cash + Barter" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setOfferType(item.value)}
                      style={{
                        border: offerType === item.value ? "1.5px solid #1b7d52" : "1.5px solid #e5e7eb",
                        background: offerType === item.value ? "rgba(16,185,129,0.12)" : "#fff",
                        color: offerType === item.value ? "#065f46" : "#374151",
                        borderRadius: 12,
                        padding: "10px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {needsCash && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                    Your Offer (BDT ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    style={{
                      width: "100%",
                      border: "1.5px solid #e5e7eb",
                      background: "#f9fafb",
                      borderRadius: 13,
                      padding: "12px 14px",
                      fontSize: 14,
                      fontFamily: "inherit",
                      outline: "none",
                      color: "#111827",
                    }}
                  />
                </div>
              )}

              {needsBarter && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                      What are you offering to barter?
                    </label>
                    <span style={{ fontSize: 12, color: "#6b7280" }}>{barterItem.length}/200</span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={barterItem}
                    onChange={(e) => setBarterItem(e.target.value)}
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
                    }}
                  />
                </div>
              )}

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>
                    Add a message (optional)
                  </label>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{message.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.07)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    fontSize: 14,
                    color: "#b91c1c",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    border: "none",
                    background: "linear-gradient(135deg,#0d3322,#1b7d52)",
                    color: "#fff",
                    borderRadius: 13,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Sending..." : "Send Offer"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    color: "#374151",
                    borderRadius: 13,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;

