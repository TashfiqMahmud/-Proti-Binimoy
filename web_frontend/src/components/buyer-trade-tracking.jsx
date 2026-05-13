import React, { useEffect, useState } from "react";

const fmtBDT = (value) => `BDT ${new Intl.NumberFormat("en-BD").format(Number(value) || 0)}`;
const fmtDate = (value) => new Date(value).toLocaleDateString("en-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const trackingStatusMeta = {
  accepted: {
    label: "Accepted",
    helper: "Seller accepted. Prepare your item for shipment.",
    color: "#1b7d52",
    bg: "rgba(46,201,126,0.1)",
    border: "rgba(46,201,126,0.3)",
  },
  shipping: {
    label: "Shipping",
    helper: "Exchange is in transit. Watch both shipment confirmations.",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.09)",
    border: "rgba(37,99,235,0.24)",
  },
  completed: {
    label: "Completed",
    helper: "Both parties confirmed receipt. Trade closed.",
    color: "#0f766e",
    bg: "rgba(15,118,110,0.1)",
    border: "rgba(15,118,110,0.28)",
  },
};

const bangladeshCouriers = [
  "Sundarban Courier Service",
  "SA Paribahan",
  "Pathao Courier",
  "RedX",
  "Paperfly",
  "eCourier",
  "Steadfast Courier",
  "Janata Courier",
  "Karnaphuli Courier Service",
  "Continental Courier Service",
  "Korotoa Courier Service",
  "SCS Courier",
  "AJR Courier",
  "DHL Bangladesh",
  "FedEx Bangladesh",
  "UPS Bangladesh",
  "Aramex Bangladesh",
  "USB Express",
  "Biddyut Limited",
  "Delivery Tiger",
  "Daraz Express",
  "Bangladesh Post Office",
];

const mapOfferToTrackedTrade = (offer) => {
  const listing = offer.listing || {};
  const seller = offer.toUser || {};
  const cashAmount = Number(offer.cashAmount) || 0;
  const buyerItemTitle = offer.offerType === "cash"
    ? `Cash offer ${fmtBDT(cashAmount)}`
    : offer.barterItem || "Your barter item";
  const isCompleted = offer.status === "completed";

  return {
    id: offer._id || offer.id,
    offerId: offer._id || offer.id,
    status: isCompleted ? "completed" : "accepted",
    acceptedAt: offer.updatedAt || offer.createdAt || new Date().toISOString(),
    seller: {
      name: seller.name || "Seller",
      phone: seller.phone || "",
      location: seller.location?.city || seller.location || "Bangladesh",
      rating: Number(seller.rating) || 0,
    },
    buyerItem: {
      title: buyerItemTitle,
      category: offer.offerType || "barter",
      value: cashAmount,
    },
    sellerItem: {
      title: listing.title || "Seller item",
      category: listing.category || "Marketplace",
      value: Number(listing.price) || 0,
    },
    buyerShipment: { shipped: true, courier: "Self coordinated", tracking: "Pending", shippedAt: offer.updatedAt || offer.createdAt || new Date().toISOString() },
    sellerShipment: { shipped: true, courier: "Self coordinated", tracking: "Pending", shippedAt: offer.updatedAt || offer.createdAt || new Date().toISOString() },
    buyerReceived: isCompleted,
    sellerReceived: isCompleted,
    note: offer.message || "Coordinate exchange details with the seller.",
  };
};

const TrackingStatusPill = ({ status }) => {
  const meta = trackingStatusMeta[status] || trackingStatusMeta.accepted;
  return (
    <span className="btt-pill" style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}>
      <span style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
};

const BuyerTradeTrackingPage = ({ user, offers, onCompleteOffer }) => {
  const hasOfferProp = Array.isArray(offers);
  const initialTrades = hasOfferProp
    ? offers.filter(offer => ["accepted", "completed"].includes(offer.status)).map(mapOfferToTrackedTrade)
    : [];
  const [trades, setTrades] = useState(() => initialTrades);
  const [selectedId, setSelectedId] = useState(() => initialTrades[0]?.id);
  const [filter, setFilter] = useState("all");
  const [shipForm, setShipForm] = useState({ courier: "", tracking: "" });
  const [toast, setToast] = useState(null);

  const filtered = trades.filter(trade => filter === "all" || trade.status === filter);
  const selected = trades.find(trade => trade.id === selectedId) || filtered[0] || trades[0];

  useEffect(() => {
    if (!hasOfferProp) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      const nextTrades = offers
        .filter(offer => ["accepted", "completed"].includes(offer.status))
        .map(mapOfferToTrackedTrade);
      setTrades(nextTrades);
      setSelectedId(current => nextTrades.some(trade => trade.id === current) ? current : nextTrades[0]?.id);
    });
    return () => { cancelled = true; };
  }, [hasOfferProp, offers]);

  const showToast = (message, ok = true) => {
    setToast({ message, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const syncTrade = (tradeId, updater) => {
    setTrades(prev => prev.map(trade => {
      if (trade.id !== tradeId) return trade;
      const next = updater(trade);
      const completed = next.buyerReceived && next.sellerReceived;
      const shipping = next.buyerShipment.shipped || next.sellerShipment.shipped;
      return { ...next, status: completed ? "completed" : shipping ? "shipping" : "accepted" };
    }));
  };

  const markShipped = () => {
    if (!selected || selected.buyerShipment.shipped) return;
    if (!shipForm.courier.trim() || !shipForm.tracking.trim()) {
      showToast("Add courier and tracking number first.", false);
      return;
    }

    syncTrade(selected.id, trade => ({
      ...trade,
      buyerShipment: {
        shipped: true,
        courier: shipForm.courier.trim(),
        tracking: shipForm.tracking.trim(),
        shippedAt: new Date().toISOString(),
      },
    }));
    setShipForm({ courier: "", tracking: "" });
    showToast("Your product is marked as shipped.");
  };

  const markReceived = () => {
    if (!selected || selected.buyerReceived) return;
    if (!selected.sellerShipment.shipped) {
      showToast("Seller shipping info is not available yet.", false);
      return;
    }

    syncTrade(selected.id, trade => ({ ...trade, buyerReceived: true }));
    if (selected.offerId && typeof onCompleteOffer === "function") {
      onCompleteOffer(selected.offerId);
    }
    showToast("Product receipt confirmed.");
  };

  const counts = {
    total: trades.length,
    accepted: trades.filter(trade => trade.status === "accepted").length,
    shipping: trades.filter(trade => trade.status === "shipping").length,
    completed: trades.filter(trade => trade.status === "completed").length,
  };

  const progressSteps = [
    { key: "accepted", label: "Accepted", done: true },
    { key: "buyer_shipped", label: "You shipped", done: selected?.buyerShipment.shipped },
    { key: "seller_shipped", label: "Seller shipped", done: selected?.sellerShipment.shipped },
    { key: "received", label: "Both received", done: selected?.buyerReceived && selected?.sellerReceived },
    { key: "completed", label: "Completed", done: selected?.status === "completed" },
  ];

  return (
    <div className="btt-page">
      <style>{`
        .btt-page { color:#0d1f16; position:relative; }
        .btt-head { display:grid; grid-template-columns:minmax(0,1fr) minmax(190px,240px); align-items:stretch; gap:16px; margin-bottom:16px; }
        .btt-head-main { border:1px solid #edf1ed; border-radius:22px; padding:22px; background:radial-gradient(circle at 88% 18%,rgba(46,201,126,.13),transparent 34%),linear-gradient(135deg,#ffffff,#fbfcfb); overflow:hidden; position:relative; }
        .btt-head-main::after { content:''; position:absolute; right:-54px; bottom:-68px; width:180px; height:180px; border-radius:50%; border:30px solid rgba(46,201,126,.08); }
        .btt-kicker { font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.12em; color:#1b7d52; margin-bottom:7px; }
        .btt-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3vw,34px); line-height:1.05; font-weight:900; }
        .btt-sub { margin-top:9px; color:#7a8c82; font-size:13px; line-height:1.65; max-width:650px; }
        .btt-hero-card { min-width:190px; border-radius:22px; padding:18px; color:#fff; background:radial-gradient(circle at top right,rgba(255,255,255,.18),transparent 42%),linear-gradient(135deg,#0d3322,#1b7d52); box-shadow:0 16px 38px rgba(13,51,34,.2); display:flex; flex-direction:column; justify-content:space-between; min-height:150px; }
        .btt-hero-card span { display:block; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.1em; opacity:.6; margin-bottom:6px; }
        .btt-hero-card strong { font-size:32px; line-height:1; }
        .btt-route-strip { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; gap:10px; align-items:center; margin:0 0 18px; padding:12px; border:1px solid #edf1ed; border-radius:20px; background:#fbfcfb; box-shadow:0 8px 22px rgba(13,51,34,.035); }
        .btt-route-node { border-radius:14px; background:#fff; border:1px solid #eef2ee; padding:12px; min-height:70px; }
        .btt-route-node span { display:block; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.1em; color:#9ca3af; margin-bottom:5px; }
        .btt-route-node strong { display:block; font-size:13px; line-height:1.35; color:#0d1f16; }
        .btt-route-line { height:2px; min-width:26px; background:linear-gradient(to right,#2ec97e,#1b7d52); border-radius:999px; opacity:.55; }
        .btt-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
        .btt-stat { background:linear-gradient(180deg,#fff,#fcfefd); border:1px solid #edf1ed; border-radius:18px; padding:13px 14px; box-shadow:0 8px 22px rgba(13,51,34,.035); }
        .btt-stat span { display:block; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.08em; color:#9ca3af; margin-bottom:5px; }
        .btt-stat strong { font-size:22px; }
        .btt-controls { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:18px; padding:12px; border:1px solid #edf1ed; border-radius:18px; background:#fbfcfb; }
        .btt-filter { border:1.5px solid #e9eceb; background:#fff; color:#6b7280; border-radius:999px; padding:9px 15px; font-family:inherit; font-size:12px; font-weight:800; cursor:pointer; transition:.18s; }
        .btt-filter.active { border-color:rgba(46,201,126,.55); background:rgba(46,201,126,.09); color:#1b7d52; box-shadow:0 0 0 3px rgba(46,201,126,.08); }
        .btt-grid { display:grid; grid-template-columns:minmax(290px,.78fr) minmax(420px,1.22fr); gap:16px; align-items:start; }
        .btt-list { display:flex; flex-direction:column; gap:12px; }
        .btt-card { width:100%; text-align:left; border:1.5px solid #eef2ee; border-radius:20px; background:linear-gradient(180deg,#fff,#fcfefd); padding:16px; font-family:inherit; cursor:pointer; transition:.2s; position:relative; overflow:hidden; }
        .btt-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:4px; background:linear-gradient(to bottom,#2ec97e,#1b7d52); opacity:0; transition:.2s; }
        .btt-card:hover,.btt-card.active { border-color:rgba(46,201,126,.42); box-shadow:0 12px 30px rgba(13,51,34,.08); transform:translateY(-1px); }
        .btt-card.active::before { opacity:1; }
        .btt-card-top { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:12px; }
        .btt-card h3 { font-size:15px; line-height:1.35; margin-bottom:5px; }
        .btt-card p { font-size:12px; color:#7a8c82; line-height:1.45; }
        .btt-mini-route { display:grid; grid-template-columns:1fr auto 1fr; gap:9px; align-items:center; }
        .btt-mini-box { border-radius:13px; padding:10px 11px; min-width:0; background:#f8faf9; border:1px solid #edf1ed; }
        .btt-mini-box span { display:block; font-size:9px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:#9ca3af; margin-bottom:4px; }
        .btt-mini-box strong { display:block; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .btt-mini-arrow { width:28px; height:28px; border-radius:50%; background:#0d3322; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; }
        .btt-panel { background:linear-gradient(180deg,#fff,#fbfcfb); border:1px solid #eef2ee; border-radius:22px; overflow:hidden; box-shadow:0 18px 48px rgba(13,51,34,.08); position:sticky; top:16px; }
        .btt-panel-cover { padding:22px; color:#fff; background:radial-gradient(circle at top right,rgba(255,255,255,.16),transparent 36%),linear-gradient(135deg,#0d3322,#1b7d52); }
        .btt-panel-cover h3 { font-family:'Playfair Display',serif; font-size:25px; line-height:1.1; margin:10px 0 8px; }
        .btt-panel-cover p { font-size:13px; opacity:.74; line-height:1.55; }
        .btt-panel-body { padding:20px; display:flex; flex-direction:column; gap:16px; }
        .btt-pill { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; border:1px solid; font-size:12px; font-weight:900; width:max-content; }
        .btt-pill span { width:7px; height:7px; border-radius:50%; }
        .btt-exchange { display:grid; grid-template-columns:1fr auto 1fr; align-items:stretch; gap:10px; }
        .btt-item { border-radius:16px; padding:14px; border:1px solid #edf1ed; background:#f8faf9; min-width:0; }
        .btt-item.sent { background:rgba(59,130,246,.055); border-color:rgba(59,130,246,.16); }
        .btt-item.receive { background:rgba(46,201,126,.06); border-color:rgba(46,201,126,.18); }
        .btt-label { font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.1em; color:#9ca3af; margin-bottom:7px; }
        .btt-item h4 { font-size:15px; line-height:1.3; margin-bottom:6px; }
        .btt-item p { font-size:12px; color:#7a8c82; }
        .btt-swap { width:34px; height:34px; align-self:center; border-radius:50%; background:#0d3322; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:900; }
        .btt-progress { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; padding:15px; border-radius:18px; background:#f7f9f7; border:1px solid #edf1ed; }
        .btt-step { text-align:center; color:#b0b9b5; position:relative; }
        .btt-step span { width:30px; height:30px; margin:0 auto 7px; border-radius:50%; background:#e9eceb; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:900; }
        .btt-step.done { color:#1b7d52; }
        .btt-step.done span { background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; box-shadow:0 5px 14px rgba(46,201,126,.25); }
        .btt-step strong { display:block; font-size:11px; line-height:1.25; }
        .btt-ship-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .btt-ship { padding:15px; border-radius:18px; background:linear-gradient(180deg,#fff,#fbfcfb); border:1px solid #edf1ed; }
        .btt-ship-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }
        .btt-ship h4 { font-size:13px; }
        .btt-ship p { font-size:12px; color:#7a8c82; line-height:1.55; }
        .btt-track { margin-top:8px; font-family:monospace; color:#0d3322; background:#eef8f1; border:1px solid rgba(46,201,126,.24); border-radius:9px; padding:5px 9px; display:inline-block; font-size:12px; font-weight:900; }
        .btt-form { display:grid; grid-template-columns:1.15fr 1fr auto; gap:9px; align-items:end; padding:15px; border-radius:18px; background:linear-gradient(135deg,rgba(46,201,126,.075),rgba(59,130,246,.045)); border:1px solid rgba(46,201,126,.2); }
        .btt-field label { display:block; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.08em; color:#7a8c82; margin-bottom:6px; }
        .btt-input { width:100%; border:1.5px solid #e5e7eb; border-radius:12px; padding:11px 12px; font-family:inherit; outline:none; background:#fff; color:#0d1f16; }
        .btt-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237a8c82' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; background-size:16px; padding-right:38px; }
        .btt-input:focus { border-color:#2ec97e; box-shadow:0 0 0 3px rgba(46,201,126,.1); }
        .btt-action { border:none; border-radius:12px; padding:12px 16px; background:linear-gradient(135deg,#0d3322,#1b7d52); color:#fff; font-family:inherit; font-weight:900; cursor:pointer; white-space:nowrap; }
        .btt-action.secondary { background:#fff; color:#1b7d52; border:1.5px solid rgba(46,201,126,.4); }
        .btt-action:disabled { opacity:.48; cursor:not-allowed; }
        .btt-note { padding:13px 14px; border-left:3px solid #2ec97e; background:rgba(46,201,126,.055); border-radius:0 14px 14px 0; color:#374151; font-size:13px; line-height:1.65; }
        .btt-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); z-index:9999; padding:12px 20px; border-radius:999px; color:#fff; font-size:13px; font-weight:800; box-shadow:0 10px 30px rgba(0,0,0,.18); }
        @media(max-width:1020px){ .btt-grid{grid-template-columns:1fr}.btt-stats{grid-template-columns:repeat(2,1fr)}.btt-panel{position:static} }
        @media(max-width:760px){ .btt-head{grid-template-columns:1fr}.btt-hero-card{width:100%;min-height:auto}.btt-route-strip{grid-template-columns:1fr}.btt-route-line{width:2px;height:18px;margin:0 auto}.btt-exchange,.btt-mini-route,.btt-ship-grid,.btt-form{grid-template-columns:1fr}.btt-swap,.btt-mini-arrow{transform:rotate(90deg);margin:0 auto}.btt-progress{grid-template-columns:1fr}.btt-step{text-align:left;display:flex;align-items:center;gap:10px}.btt-step span{margin:0} }
      `}</style>

      {toast && (
        <div className="btt-toast" style={{ background: toast.ok ? "#0d3322" : "#dc2626" }}>
          {toast.message}
        </div>
      )}

      <div className="btt-head">
        <div className="btt-head-main">
          <p className="btt-kicker">Exchange Delivery</p>
          <h2 className="btt-title">Trade Tracking</h2>
          <p className="btt-sub">Manage accepted barter exchanges, add your shipping information, and confirm receipt once the seller's product arrives.</p>
        </div>
        <div className="btt-hero-card">
          <span>Active Exchanges</span>
          <strong>{counts.accepted + counts.shipping}</strong>
        </div>
      </div>

      {selected && (
        <div className="btt-route-strip">
          <div className="btt-route-node">
            <span>Buyer dispatch</span>
            <strong>{selected.buyerShipment.shipped ? selected.buyerShipment.courier : "Waiting for your shipment"}</strong>
          </div>
          <div className="btt-route-line" />
          <div className="btt-route-node">
            <span>Exchange partner</span>
            <strong>{selected.seller.name} / {selected.seller.location}</strong>
          </div>
          <div className="btt-route-line" />
          <div className="btt-route-node">
            <span>Seller dispatch</span>
            <strong>{selected.sellerShipment.shipped ? selected.sellerShipment.courier : "Seller has not shipped yet"}</strong>
          </div>
        </div>
      )}

      <div className="btt-stats">
        {[
          ["Total", counts.total, "#0d1f16"],
          ["Accepted", counts.accepted, "#1b7d52"],
          ["Shipping", counts.shipping, "#2563eb"],
          ["Completed", counts.completed, "#0f766e"],
        ].map(([label, value, color]) => (
          <div key={label} className="btt-stat">
            <span>{label}</span>
            <strong style={{ color }}>{value}</strong>
          </div>
        ))}
      </div>

      <div className="btt-controls">
        {["all", "accepted", "shipping", "completed"].map(key => (
          <button key={key} className={`btt-filter${filter === key ? " active" : ""}`} onClick={() => setFilter(key)}>
            {key === "all" ? "All Trades" : trackingStatusMeta[key].label}
          </button>
        ))}
      </div>

      <div className="btt-grid">
        <div className="btt-list">
          {filtered.map(trade => (
            <button key={trade.id} type="button" className={`btt-card${selected?.id === trade.id ? " active" : ""}`} onClick={() => setSelectedId(trade.id)}>
              <div className="btt-card-top">
                <div>
                  <h3>{trade.buyerItem.title} for {trade.sellerItem.title}</h3>
                  <p>Accepted by {trade.seller.name}  -  {fmtDate(trade.acceptedAt)}</p>
                </div>
                <TrackingStatusPill status={trade.status} />
              </div>
              <div className="btt-mini-route">
                <div className="btt-mini-box">
                  <span>You ship</span>
                  <strong>{trade.buyerItem.title}</strong>
                </div>
                <div className="btt-mini-arrow"></div>
                <div className="btt-mini-box">
                  <span>You receive</span>
                  <strong>{trade.sellerItem.title}</strong>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="btt-panel">
            <div className="btt-panel-cover">
              <TrackingStatusPill status={selected.status} />
              <h3>{selected.buyerItem.title}<br />for {selected.sellerItem.title}</h3>
              <p>{(trackingStatusMeta[selected.status] || trackingStatusMeta.accepted).helper}</p>
            </div>

            <div className="btt-panel-body">
              <div className="btt-exchange">
                <div className="btt-item sent">
                  <p className="btt-label">Your product to ship</p>
                  <h4>{selected.buyerItem.title}</h4>
                  <p>{selected.buyerItem.category}  -  {fmtBDT(selected.buyerItem.value)}</p>
                </div>
                <div className="btt-swap"></div>
                <div className="btt-item receive">
                  <p className="btt-label">Seller product to receive</p>
                  <h4>{selected.sellerItem.title}</h4>
                  <p>{selected.sellerItem.category}  -  {fmtBDT(selected.sellerItem.value)}</p>
                </div>
              </div>

              <div className="btt-progress">
                {progressSteps.map((step, index) => (
                  <div key={step.key} className={`btt-step${step.done ? " done" : ""}`}>
                    <span>{step.done ? "" : index + 1}</span>
                    <strong>{step.label}</strong>
                  </div>
                ))}
              </div>

              <div className="btt-ship-grid">
                <div className="btt-ship">
                  <div className="btt-ship-head">
                    <h4>Your shipping info</h4>
                    <span>{selected.buyerShipment.shipped ? "Shipped" : "Waiting"}</span>
                  </div>
                  {selected.buyerShipment.shipped ? (
                    <>
                      <p>{selected.buyerShipment.courier}  -  Shipped {fmtDate(selected.buyerShipment.shippedAt)}</p>
                      <span className="btt-track">{selected.buyerShipment.tracking}</span>
                    </>
                  ) : (
                    <p>Add courier details after you dispatch your product.</p>
                  )}
                </div>

                <div className="btt-ship">
                  <div className="btt-ship-head">
                    <h4>Seller shipping info</h4>
                    <span>{selected.sellerShipment.shipped ? "Shipped" : "Waiting"}</span>
                  </div>
                  {selected.sellerShipment.shipped ? (
                    <>
                      <p>{selected.sellerShipment.courier}  -  Shipped {fmtDate(selected.sellerShipment.shippedAt)}</p>
                      <span className="btt-track">{selected.sellerShipment.tracking}</span>
                    </>
                  ) : (
                    <p>Seller shipping details will appear here after dispatch.</p>
                  )}
                </div>
              </div>

              {!selected.buyerShipment.shipped && (
                <div className="btt-form">
                  <div className="btt-field">
                    <label>Courier Service</label>
                    <select
                      className="btt-input btt-select"
                      value={shipForm.courier}
                      onChange={event => setShipForm(form => ({ ...form, courier: event.target.value }))}
                    >
                      <option value="">Select Bangladesh courier</option>
                      {bangladeshCouriers.map(courier => (
                        <option key={courier} value={courier}>{courier}</option>
                      ))}
                    </select>
                  </div>
                  <div className="btt-field">
                    <label>Tracking No.</label>
                    <input className="btt-input" value={shipForm.tracking} onChange={event => setShipForm(form => ({ ...form, tracking: event.target.value }))} placeholder="PTH-123456" />
                  </div>
                  <button className="btt-action" onClick={markShipped}>Mark Product Shipped</button>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btt-action secondary" disabled={selected.buyerReceived || !selected.sellerShipment.shipped} onClick={markReceived}>
                  {selected.buyerReceived ? "Product Received" : "Mark Product Received"}
                </button>
              </div>

              <div className="btt-note">
                <strong>Seller:</strong> {selected.seller.name}  -  {selected.seller.phone}  -  {selected.seller.location}
                <br />
                {selected.note}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerTradeTrackingPage;
