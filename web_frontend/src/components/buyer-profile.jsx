import React, { useMemo, useState } from "react";
import BuyerTradeTrackingPage from "./buyer-trade-tracking";
import { getMockTradeRequestsForBuyer } from "../utils/mockData";

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
  rejected: {
    label: "Rejected",
    color: "#dc2626",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.22)",
    dot: "#ef4444",
    helper: "Seller declined this offer",
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

const sampleTradeRequests = (user) => [
  {
    _id: "buyer_trade_001",
    status: "pending",
    createdAt: "2026-05-04T10:30:00.000Z",
    seller: { name: "Rafiul Hasan", location: "Dhanmondi, Dhaka", rating: 4.8, verified: true },
    offeredItem: { title: "Samsung Galaxy S23 Ultra", category: "Electronics", condition: "Like New", value: 74000, image: "" },
    requestedItem: { title: "iPhone 14 Pro Max 256GB", category: "Electronics", condition: "Like New", value: 92000, image: "" },
    message: `Hi, I am ${user?.name || "interested"} and would like to trade my Samsung phone for your iPhone. I can discuss cash adjustment if needed.`,
  },
  {
    _id: "buyer_trade_002",
    status: "accepted",
    createdAt: "2026-04-30T14:15:00.000Z",
    seller: { name: "Mitu Akter", location: "Uttara, Dhaka", rating: 4.6, verified: true },
    offeredItem: { title: "MacBook Air M1", category: "Electronics", condition: "Good", value: 58000, image: "" },
    requestedItem: { title: "Canon EOS 700D DSLR Camera", category: "Electronics", condition: "Like New", value: 28500, image: "" },
    message: "The MacBook is in good condition. I am open to adding accessories to make the trade fair.",
  },
  {
    _id: "buyer_trade_003",
    status: "rejected",
    createdAt: "2026-04-22T09:45:00.000Z",
    seller: { name: "Nabila Chowdhury", location: "Banani, Dhaka", rating: 4.3, verified: false },
    offeredItem: { title: "Xiaomi 13 Pro", category: "Electronics", condition: "Used", value: 42000, image: "" },
    requestedItem: { title: "Mountain Bike 26 inch", category: "Sports", condition: "Good", value: 14000, image: "" },
    message: "Would you consider a phone-bike exchange? I can meet near your area.",
  },
];

const normalizeTradeRequest = (request) => {
  const requested = request.requestedProduct || request.listing || {};
  const seller = request.seller || requested.seller || {};

  return {
    id: request._id || request.id,
    status: request.status || "pending",
    createdAt: request.createdAt || new Date().toISOString(),
    seller: {
      name: seller.name || "Seller",
      location: seller.location?.city || seller.location || requested.location?.city || "Dhaka",
      rating: Number(seller.rating) || 0,
      verified: Boolean(seller.verified || seller.isVerified),
    },
    offeredItem: request.offeredItem || {
      title: request.offeredTitle || "Offered item",
      category: request.offeredCategory || "Other",
      condition: request.offeredCondition || "Used",
      value: request.offeredEstimatedValue || 0,
      image: request.offeredImages?.[0] || "",
    },
    requestedItem: request.requestedItem || {
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
    { label: status === "rejected" ? "Rejected" : "Decision", sub: status === "rejected" ? "Offer declined" : "Accept / reject" },
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

const BuyerTradeRequestsPage = ({ user }) => {
  const trades = useMemo(() => {
    const stored = getMockTradeRequestsForBuyer(user).map(normalizeTradeRequest);
    return stored.length > 0 ? stored : sampleTradeRequests(user).map(normalizeTradeRequest);
  }, [user]);

  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(trades[0]?.id || null);
  const selected = trades.find(trade => trade.id === selectedId) || trades[0];

  const filtered = trades.filter(trade => filter === "all" || trade.status === filter);
  const counts = {
    total: trades.length,
    pending: trades.filter(trade => trade.status === "pending").length,
    accepted: trades.filter(trade => trade.status === "accepted").length,
    rejected: trades.filter(trade => trade.status === "rejected").length,
    completed: trades.filter(trade => trade.status === "completed").length,
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
          ["Rejected", counts.rejected, "#dc2626"],
          ["Completed", counts.completed, "#0f766e"],
        ].map(([label, value, color]) => (
          <div key={label} className="btr-stat">
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="btr-controls">
        {["all", "pending", "accepted", "rejected", "completed"].map(key => (
          <button key={key} className={`btr-filter${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>
            {key === "all" ? "All Requests" : statusMeta[key].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
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
  const {
    BuyerBrowseBanner,
    BuyerHubSidebar,
    BuyerMyOrdersPage,
    EditProfileTab,
    ListingsTab,
    SecurityTab,
  } = components;

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
              <BuyerMyOrdersPage onBrowse={() => navigate("/marketplace")} />
            </div>
          )}
          {buyerPanel === "trade-requests" && (
            <div className="up-card up-fade up-d2">
              <BuyerTradeRequestsPage user={user} />
            </div>
          )}
          {buyerPanel === "trade-tracking" && (
            <div className="up-card up-fade up-d2">
              <BuyerTradeTrackingPage user={user} />
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

