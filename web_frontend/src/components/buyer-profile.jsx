import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BuyerTradeTrackingPage from "./buyer-trade-tracking";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const fmtBDT = (value) => `BDT ${new Intl.NumberFormat("en-BD").format(Number(value) || 0)}`;
const fmtDate = (value) => new Date(value).toLocaleDateString("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const statusMeta = {
  pending: {
    label: "Pending",
    color: "#b45309",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.3)",
    dot: "#f59e0b",
    helper: "Seller is reviewing your offer",
    step: 1,
  },
  accepted: {
    label: "Accepted",
    color: "#1b7d52",
    bg: "rgba(46,201,126,0.1)",
    border: "rgba(46,201,126,0.3)",
    dot: "#2ec97e",
    helper: "Seller accepted. Coordinate exchange.",
    step: 2,
  },
  declined: {
    label: "Declined",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    dot: "#ef4444",
    helper: "Seller declined this offer",
    step: 2,
  },
  cancelled: {
    label: "Cancelled",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    dot: "#ef4444",
    helper: "You cancelled this offer",
    step: 2,
  },
  completed: {
    label: "Completed",
    color: "#0f766e",
    bg: "rgba(15,118,110,0.1)",
    border: "rgba(15,118,110,0.26)",
    dot: "#14b8a6",
    helper: "Trade closed successfully",
    step: 3,
  },
};

const normalizeTradeRequest = (request) => {
  const requested = request.listing || request.requestedProduct || {};
  const seller = request.toUser || request.seller || requested.seller || {};
  const barterTitle = request.barterItem || (request.offerType === "cash" ? "Cash offer" : "Offered item");
  const cashAmount = Number(request.cashAmount) || 0;

  return {
    id: request._id || request.id,
    status: request.status || "pending",
    createdAt: request.createdAt || new Date().toISOString(),
    rawOffer: request,
    seller: {
      name: seller.name || "Seller",
      location: seller.location?.city || seller.location || requested.location?.city || "Dhaka",
      rating: Number(seller.rating) || 0,
      verified: Boolean(seller.verified || seller.isVerified),
    },
    offeredItem: {
      title: request.offerType === "cash" ? fmtBDT(cashAmount) : barterTitle,
      category: request.offerType || "barter",
      condition: request.offeredCondition || "Used",
      value: cashAmount,
      image: "",
    },
    requestedItem: {
      title: requested.title || "Requested item",
      category: requested.category || "Other",
      condition: requested.condition || "Used",
      value: requested.price || 0,
      image: requested.images?.[0] || "",
    },
    message: request.message || "",
  };
};

const StatusPill = ({ status }) => {
  const meta = statusMeta[status] || statusMeta.pending;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 12px",
      borderRadius: 100,
      background: meta.bg,
      border: `1px solid ${meta.border}`,
      color: meta.color,
      fontSize: 12,
      fontWeight: 800,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.dot }} />
      {meta.label}
    </span>
  );
};

const TradeFlow = ({ status }) => {
  const meta = statusMeta[status] || statusMeta.pending;
  const steps = [
    { label: "Sent", sub: "Buyer sends offer" },
    { label: "Review", sub: "Seller reviews" },
    { label: ["declined", "cancelled"].includes(status) ? "Closed" : "Decision", sub: ["declined", "cancelled"].includes(status) ? "Offer closed" : "Accept / reject" },
    { label: "Complete", sub: "Trade closed" },
  ];

  return (
    <div className="btr-flow">
      {steps.map((step, index) => {
        const active = index <= meta.step;
        return (
          <React.Fragment key={step.label}>
            {index > 0 && <div className={`btr-flow-line${active ? " active" : ""}`} />}
            <div className={`btr-flow-step${active ? " active" : ""}`}>
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
              <small>{step.sub}</small>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

const TradeItemCard = ({ item, tone, label }) => (
  <div className={`btr-item ${tone}`}>
    <div className="btr-item-media">
      {item.image ? <img src={item.image} alt="" /> : <span>{tone === "offered" ? "-" : ""}</span>}
    </div>
    <div>
      <p className="btr-mini-label">{label}</p>
      <h4>{item.title}</h4>
      <div className="btr-item-meta">
        <span>{item.category}</span>
        <span>{item.condition}</span>
        <strong>{fmtBDT(item.value)}</strong>
      </div>
    </div>
  </div>
);

const BuyerTradeRequestsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!token) {
      setTrades([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchOffers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/offers/sent`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data.msg || "Unable to load sent offers.");
        }
        const nextTrades = Array.isArray(data) ? data.map(normalizeTradeRequest) : [];
        if (!cancelled) {
          setTrades(nextTrades);
          setSelectedId(nextTrades[0]?.id || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load sent offers.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOffers();
    return () => { cancelled = true; };
  }, [token]);

  const selected = trades.find(trade => trade.id === selectedId) || trades[0];

  const filtered = trades.filter(trade => filter === "all" || trade.status === filter);
  const counts = {
    total: trades.length,
    pending: trades.filter(trade => trade.status === "pending").length,
    accepted: trades.filter(trade => trade.status === "accepted").length,
    declined: trades.filter(trade => trade.status === "declined").length,
    cancelled: trades.filter(trade => trade.status === "cancelled").length,
    completed: trades.filter(trade => trade.status === "completed").length,
  };

  const updateOfferStatus = async (trade, status) => {
    const offerId = trade?.rawOffer?._id || trade?.id;
    if (!token || !offerId) return;

    setActing(prev => ({ ...prev, [trade.id]: status }));
    setError("");
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
        throw new Error(data.msg || "Unable to update offer.");
      }
      setTrades(prev => prev.map(item => (
        item.id === trade.id
          ? normalizeTradeRequest({ ...item.rawOffer, ...(data.offer || {}), status })
          : item
      )));
    } catch (err) {
      setError(err.message || "Unable to update offer.");
    } finally {
      setActing(prev => {
        const next = { ...prev };
        delete next[trade.id];
        return next;
      });
    }
  };

  const proceedToCheckout = (trade) => {
    const offer = trade?.rawOffer;
    if (!offer) return;
    navigate("/checkout", { state: { offer, listing: offer.listing } });
  };

  const renderTradeDetail = (trade, className = "btr-detail") => (
    <div className={className}>
      <div className="btr-detail-cover">
        <StatusPill status={trade.status} />
        <h3>{trade.offeredItem.title}<br />for {trade.requestedItem.title}</h3>
        <p>{(statusMeta[trade.status] || statusMeta.pending).helper}</p>
      </div>
      <div className="btr-detail-body">
        <div className="btr-seller">
          <div className="btr-avatar">{trade.seller.name?.[0]?.toUpperCase() || "S"}</div>
          <div>
            <h4>{trade.seller.name}</h4>
            <p>{trade.seller.location}  -  {trade.seller.rating > 0 ? `${trade.seller.rating.toFixed(1)} rating` : "New seller"}{trade.seller.verified ? "  -  Verified" : ""}</p>
          </div>
        </div>

        <div className="btr-items">
          <TradeItemCard item={trade.offeredItem} tone="offered" label="Offered product" />
          <TradeItemCard item={trade.requestedItem} tone="requested" label="Requested product" />
        </div>

        <TradeFlow status={trade.status} />

        {trade.message && (
          <div className="btr-note">
            <strong>Message to seller:</strong> {trade.message}
          </div>
        )}

        {trade.status === "pending" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => updateOfferStatus(trade, "cancelled")}
              disabled={Boolean(acting[trade.id])}
              style={{ border: "1.5px solid rgba(239,68,68,0.35)", background: "#fff", color: "#dc2626", borderRadius: 12, padding: "10px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: acting[trade.id] ? "not-allowed" : "pointer", opacity: acting[trade.id] ? 0.55 : 1 }}
            >
              {acting[trade.id] === "cancelled" ? "Cancelling..." : "Cancel offer"}
            </button>
          </div>
        )}

        {trade.status === "accepted" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => proceedToCheckout(trade)}
              style={{ border: "none", background: "linear-gradient(135deg,#0d3322,#1b7d52)", color: "#fff", borderRadius: 12, padding: "10px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
            >
              Proceed to Checkout
            </button>
            <button
              type="button"
              onClick={() => updateOfferStatus(trade, "completed")}
              disabled={Boolean(acting[trade.id])}
              style={{ border: "1.5px solid rgba(46,201,126,0.4)", background: "#fff", color: "#1b7d52", borderRadius: 12, padding: "10px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: 800, cursor: acting[trade.id] ? "not-allowed" : "pointer", opacity: acting[trade.id] ? 0.55 : 1 }}
            >
              {acting[trade.id] === "completed" ? "Completing..." : "Mark as completed"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="btr-page">
      <style>{`
        .btr-page { color:#0d1f16; }
        .btr-head { display:grid; grid-template-columns:minmax(0,1fr) minmax(170px,220px); align-items:stretch; gap:16px; margin-bottom:18px; }
        .btr-head-main { border:1px solid #edf1ed; border-radius:22px; padding:22px; background:radial-gradient(circle at 88% 18%,rgba(46,201,126,.13),transparent 34%),linear-gradient(135deg,#fff,#fbfcfb); position:relative; overflow:hidden; }
        .btr-head-main::after { content:''; position:absolute; right:-58px; bottom:-72px; width:184px; height:184px; border-radius:50%; border:30px solid rgba(46,201,126,.07); }
        .btr-kicker { font-size:10px; font-weight:900; color:#1b7d52; text-transform:uppercase; letter-spacing:.12em; margin-bottom:7px; }
        .btr-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,34px); line-height:1.05; font-weight:900; color:#0d1f16; }
        .btr-sub { margin-top:9px; color:#7a8c82; font-size:13px; line-height:1.65; max-width:620px; }
        .btr-head-card { min-width:180px; border-radius:22px; padding:18px; background:radial-gradient(circle at top right,rgba(255,255,255,.18),transparent 42%),linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; box-shadow:0 16px 38px rgba(13,51,34,.2); display:flex; flex-direction:column; justify-content:space-between; }
        .btr-head-card span { display:block; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; opacity:.58; margin-bottom:5px; }
        .btr-head-card strong { font-size:30px; line-height:1; }
        .btr-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
        .btr-stat { border:1px solid #edf1ed; background:linear-gradient(180deg,#fff,#fcfefd); border-radius:18px; padding:13px 14px; box-shadow:0 8px 22px rgba(13,51,34,.035); }
        .btr-stat span { display:block; font-size:10px; font-weight:800; color:#9ca3af; text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; }
        .btr-stat strong { font-size:22px; color:#0d1f16; }
        .btr-controls { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:12px; border:1px solid #edf1ed; border-radius:18px; background:#fbfcfb; }
        .btr-filter { border:1.5px solid #e9eceb; background:#fff; color:#6b7280; border-radius:999px; padding:9px 15px; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; transition:.18s; }
        .btr-filter.active { border-color:rgba(46,201,126,.55); background:rgba(46,201,126,.09); color:#1b7d52; box-shadow:0 0 0 3px rgba(46,201,126,.08); }
        .btr-layout { display:grid; grid-template-columns:minmax(320px,.95fr) minmax(360px,1.25fr); gap:16px; align-items:start; }
        .btr-list { display:flex; flex-direction:column; gap:12px; }
        .btr-card { text-align:left; width:100%; border:1.5px solid #eef2ee; background:linear-gradient(180deg,#fff,#fcfefd); border-radius:20px; padding:16px; cursor:pointer; transition:.2s; font-family:inherit; position:relative; overflow:hidden; }
        .btr-card::before { content:''; position:absolute; inset:0 auto 0 0; width:4px; background:linear-gradient(to bottom,#2ec97e,#1b7d52); opacity:0; transition:.2s; }
        .btr-card:hover, .btr-card.active { border-color:rgba(46,201,126,.42); box-shadow:0 12px 30px rgba(13,51,34,.08); transform:translateY(-1px); }
        .btr-card.active::before { opacity:1; }
        .btr-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
        .btr-card h3 { font-size:15px; line-height:1.35; color:#0d1f16; margin-bottom:5px; }
        .btr-card p { font-size:12px; color:#7a8c82; line-height:1.45; }
        .btr-swap { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:10px; }
        .btr-swap-box { border-radius:13px; padding:11px 12px; min-width:0; }
        .btr-swap-box.offered { background:rgba(59,130,246,.055); border:1px solid rgba(59,130,246,.15); }
        .btr-swap-box.requested { background:rgba(46,201,126,.06); border:1px solid rgba(46,201,126,.18); }
        .btr-swap-box span { display:block; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.1em; margin-bottom:5px; }
        .btr-swap-box.offered span { color:#2563eb; }
        .btr-swap-box.requested span { color:#1b7d52; }
        .btr-swap-box strong { display:block; font-size:12px; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .btr-arrow { width:30px; height:30px; border-radius:50%; background:#0d3322; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; }
        .btr-inline-detail { display:block; background:linear-gradient(180deg,#fff,#fbfcfb); border:1px solid #eef2ee; border-radius:22px; overflow:hidden; box-shadow:0 18px 48px rgba(13,51,34,.08); }
        .btr-detail-cover { padding:22px; background:radial-gradient(circle at top right,rgba(46,201,126,.18),transparent 34%),linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; }
        .btr-detail-cover h3 { font-family:'Playfair Display',serif; font-size:24px; line-height:1.1; margin:10px 0 8px; }
        .btr-detail-cover p { font-size:13px; opacity:.72; line-height:1.55; }
        .btr-detail-body { padding:20px; display:flex; flex-direction:column; gap:16px; }
        .btr-seller { display:flex; align-items:center; gap:12px; padding:14px; border-radius:16px; background:#f7f9f7; border:1px solid #edf1ed; }
        .btr-avatar { width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; flex-shrink:0; }
        .btr-seller h4 { font-size:14px; margin-bottom:3px; }
        .btr-seller p { font-size:12px; color:#7a8c82; }
        .btr-items { display:grid; grid-template-columns:1fr; gap:10px; }
        .btr-item { display:grid; grid-template-columns:58px 1fr; gap:12px; align-items:center; border-radius:16px; padding:14px; }
        .btr-item.offered { background:rgba(59,130,246,.055); border:1px solid rgba(59,130,246,.16); }
        .btr-item.requested { background:rgba(46,201,126,.06); border:1px solid rgba(46,201,126,.18); }
        .btr-item-media { width:58px; height:58px; border-radius:14px; overflow:hidden; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:900; background:#fff; border:1px solid rgba(0,0,0,.06); }
        .btr-item-media img { width:100%; height:100%; object-fit:cover; }
        .btr-mini-label { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.1em; color:#9ca3af; margin-bottom:4px; }
        .btr-item h4 { font-size:15px; line-height:1.28; margin-bottom:5px; }
        .btr-item-meta { display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:11px; color:#7a8c82; }
        .btr-item-meta strong { color:#0d1f16; }
        .btr-flow { display:grid; grid-template-columns:auto 1fr auto 1fr auto 1fr auto; align-items:start; gap:8px; padding:15px; border-radius:16px; background:#f7f9f7; border:1px solid #edf1ed; }
        .btr-flow-step { text-align:center; min-width:62px; color:#b0b9b5; }
        .btr-flow-step span { width:26px; height:26px; margin:0 auto 6px; border-radius:50%; background:#e9eceb; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:900; }
        .btr-flow-step strong { display:block; font-size:11px; margin-bottom:2px; }
        .btr-flow-step small { display:block; font-size:9px; line-height:1.25; }
        .btr-flow-step.active { color:#1b7d52; }
        .btr-flow-step.active span { color:#fff; background:linear-gradient(135deg,#2ec97e,#1b7d52); box-shadow:0 5px 14px rgba(46,201,126,.26); }
        .btr-flow-line { height:2px; background:#e9eceb; margin-top:13px; }
        .btr-flow-line.active { background:linear-gradient(to right,#2ec97e,#1b7d52); }
        .btr-note { border-left:3px solid #2ec97e; background:rgba(46,201,126,.055); padding:13px 14px; border-radius:0 14px 14px 0; color:#374151; font-size:13px; line-height:1.65; }
        .btr-empty { text-align:center; padding:54px 20px; border:1.5px dashed #e9eceb; border-radius:18px; background:#fbfcfb; }
        .btr-empty div { font-size:38px; margin-bottom:10px; }
        .btr-empty h3 { font-size:16px; margin-bottom:6px; }
        .btr-empty p { color:#7a8c82; font-size:13px; line-height:1.55; }
        @media(max-width:980px){ .btr-layout{grid-template-columns:1fr}.btr-stats{grid-template-columns:repeat(2,1fr)}.btr-head{grid-template-columns:1fr}.btr-head-card{min-height:96px} }
        @media(max-width:620px){ .btr-swap{grid-template-columns:1fr}.btr-arrow{transform:rotate(90deg);margin:0 auto}.btr-flow{grid-template-columns:1fr}.btr-flow-line{height:18px;width:2px;margin:0 auto} }
      `}</style>

      <div className="btr-head">
        <div className="btr-head-main">
          <p className="btr-kicker">Barter Management</p>
          <h2 className="btr-title">My Trade Requests</h2>
          <p className="btr-sub">Review every barter offer you sent, compare offered and requested products, and follow each seller decision from one clean request desk.</p>
        </div>
        <div className="btr-head-card">
          <span>Total Sent</span>
          <strong>{counts.total}</strong>
        </div>
      </div>

      <div className="btr-stats">
        {[
          ["Pending", counts.pending, "#b45309"],
          ["Accepted", counts.accepted, "#1b7d52"],
          ["Declined", counts.declined, "#dc2626"],
          ["Completed", counts.completed, "#0f766e"],
        ].map(([label, value, color]) => (
          <div key={label} className="btr-stat">
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="btr-controls">
        {["all", "pending", "accepted", "declined", "cancelled", "completed"].map(key => (
          <button key={key} className={`btr-filter${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>
            {key === "all" ? "All Requests" : statusMeta[key].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="btr-empty">
          <div></div>
          <h3>Loading trade requests...</h3>
          <p>Please wait while your sent offers are loaded.</p>
        </div>
      ) : error ? (
        <div className="btr-empty">
          <div></div>
          <h3>Unable to load trade requests</h3>
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="btr-empty">
          <div></div>
          <h3>No trade requests found</h3>
          <p>Send a barter offer from the marketplace and it will appear here.</p>
        </div>
      ) : (
        <div className="btr-layout" style={{ gridTemplateColumns: "1fr" }}>
          <div className="btr-list">
            {filtered.map(trade => {
              const isSelected = selected?.id === trade.id;
              return (
              <React.Fragment key={trade.id}>
                <button
                  type="button"
                  className={`btr-card${isSelected ? " active" : ""}`}
                  aria-expanded={isSelected}
                  onClick={() => setSelectedId(trade.id)}
                >
                  <div className="btr-card-top">
                    <div>
                      <h3>{trade.offeredItem.title} for {trade.requestedItem.title}</h3>
                      <p>Sent to {trade.seller.name}  -  {fmtDate(trade.createdAt)}</p>
                    </div>
                    <StatusPill status={trade.status} />
                  </div>
                  <div className="btr-swap">
                    <div className="btr-swap-box offered">
                      <span>You offer</span>
                      <strong>{trade.offeredItem.title}</strong>
                    </div>
                    <div className="btr-arrow"></div>
                    <div className="btr-swap-box requested">
                      <span>You request</span>
                      <strong>{trade.requestedItem.title}</strong>
                    </div>
                  </div>
                </button>
                {isSelected && renderTradeDetail(trade, "btr-inline-detail")}
              </React.Fragment>
            );})}
          </div>

        </div>
      )}
    </div>
  );
};

const BuyerProfileView = ({
  buyerPanel,
  components,
  navigate,
  orderCount,
  savedListings,
  setBuyerPanel,
  updateProfile,
  user,
}) => {
  const { token } = useAuth();
  const [sentOffers, setSentOffers] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [buyerOrdersLoading, setBuyerOrdersLoading] = useState(true);
  const [buyerOrdersError, setBuyerOrdersError] = useState("");
  const orderCountValue = orderCount ?? buyerOrders.length;
  const {
    BuyerBrowseBanner,
    BuyerHubSidebar,
    BuyerMyOrdersPage,
    EditProfileTab,
    ListingsTab,
    SecurityTab,
  } = components;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    const fetchSentOffers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/offers/sent`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok || !Array.isArray(data)) return;
        if (!cancelled) setSentOffers(data);
      } catch {
        if (!cancelled) setSentOffers([]);
      }
    };

    fetchSentOffers();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      setBuyerOrders([]);
      setBuyerOrdersLoading(false);
      return;
    }

    let cancelled = false;
    const fetchBuyerOrders = async () => {
      setBuyerOrdersLoading(true);
      setBuyerOrdersError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/payments/my`, {
          headers: { "x-auth-token": token },
        });
        const data = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(data.msg || "Unable to load your orders.");
        }

        const buyerId = user._id || user.id;
        const nextOrders = Array.isArray(data)
          ? data
              .filter(payment => {
                const paymentBuyerId = payment.buyer?._id || payment.buyer?.id || payment.buyer;
                return buyerId && paymentBuyerId?.toString() === buyerId.toString();
              })
              .map(payment => {
                const listing = payment.listing || {};
                const seller = payment.seller || {};
                const paymentStatus = payment.status || "pending";
                return {
                  id: payment.transactionId || payment._id || "",
                  product: {
                    title: listing.title || "Listing",
                    image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
                    emoji: "",
                    category: listing.category || "Marketplace",
                    qty: 1,
                  },
                  seller: {
                    name: seller.name || "Seller",
                    avatar: seller.profilePicture || seller.avatar || "",
                    location: seller.location?.city || seller.location || "",
                    rating: Number(seller.rating) || 0,
                    phone: seller.phone || "",
                  },
                  price: Number(payment.amount) || 0,
                  payment: { method: "SSLCommerz", status: paymentStatus === "success" ? "paid" : paymentStatus },
                  deliveryStatus: paymentStatus === "success" ? "processing" : paymentStatus === "failed" ? "pending" : paymentStatus,
                  orderedAt: payment.createdAt || new Date().toISOString(),
                  estimatedDelivery: payment.createdAt ? new Date(new Date(payment.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : "",
                  trackingId: payment.transactionId || "",
                  address: payment.buyer?.email || "",
                  note: payment.transactionId || "",
                };
              })
          : [];

        if (!cancelled) {
          setBuyerOrders(nextOrders);
        }
      } catch (err) {
        if (!cancelled) {
          setBuyerOrdersError(err.message || "Unable to load your orders.");
          setBuyerOrders([]);
        }
      } finally {
        if (!cancelled) {
          setBuyerOrdersLoading(false);
        }
      }
    };

    fetchBuyerOrders();
    return () => { cancelled = true; };
  }, [token, user]);

  const completeSentOffer = async (offerId) => {
    if (!token || !offerId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${offerId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;
      setSentOffers(prev => prev.map(offer => (
        (offer._id || offer.id) === offerId ? { ...offer, ...(data.offer || {}), status: "completed" } : offer
      )));
    } catch {
      // Tracking remains display-only if completion update fails.
    }
  };

  return (
    <>
      <BuyerBrowseBanner onBrowse={() => navigate("/marketplace")} />

      <div className="bh-wrap">
        <BuyerHubSidebar
          activePanel={buyerPanel}
          onSelect={setBuyerPanel}
          orderCount={orderCount}
        />
        <div>
          {buyerPanel === "orders" && (
            <div className="up-card up-fade up-d2">
              <BuyerMyOrdersPage
                onBrowse={() => navigate("/marketplace")}
                orders={buyerOrders}
                loading={buyerOrdersLoading}
                error={buyerOrdersError}
              />
            </div>
          )}
          {buyerPanel === "trade-requests" && (
            <div className="up-card up-fade up-d2">
              <BuyerTradeRequestsPage user={user} />
            </div>
          )}
          {buyerPanel === "trade-tracking" && (
            <div className="up-card up-fade up-d2">
              <BuyerTradeTrackingPage user={user} offers={sentOffers} onCompleteOffer={completeSentOffer} />
            </div>
          )}
          {buyerPanel === "saved" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <ListingsTab listings={savedListings} view="saved" />
            </div>
          )}
          {buyerPanel === "profile" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <EditProfileTab user={user} onSave={updateProfile} />
            </div>
          )}
          {buyerPanel === "settings" && (
            <div className="up-card up-fade up-d2" style={{ minHeight: 360 }}>
              <SecurityTab user={user} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BuyerProfileView;

