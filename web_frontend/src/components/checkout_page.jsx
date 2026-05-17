import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import PageFooter from "./page-footer";

/* 
   BANGLADESH DIVISIONS & CITIES
 */
const BD_DIVISIONS = [
  {
    division: "Dhaka",
    cities: [
      "Dhaka","Narayanganj","Gazipur","Manikganj","Munshiganj",
      "Narsingdi","Tangail","Kishoreganj","Faridpur","Madaripur",
      "Shariatpur","Rajbari","Gopalganj","Dhaka (Savar)","Dhaka (Keraniganj)",
    ],
  },
  {
    division: "Chittagong",
    cities: [
      "Chittagong","Cox's Bazar","Comilla","Chandpur","Lakshmipur",
      "Noakhali","Feni","Brahmanbaria","Khagrachhari","Rangamati","Bandarban",
    ],
  },
  {
    division: "Rajshahi",
    cities: [
      "Rajshahi","Natore","Naogaon","Chapai Nawabganj","Bogura",
      "Joypurhat","Sirajganj","Pabna",
    ],
  },
  {
    division: "Khulna",
    cities: [
      "Khulna","Bagerhat","Satkhira","Jessore (Jashore)","Narail",
      "Magura","Jhenaidah","Chuadanga","Meherpur","Kushtia",
    ],
  },
  {
    division: "Barisal",
    cities: [
      "Barisal","Patuakhali","Bhola","Pirojpur","Jhalokathi","Barguna",
    ],
  },
  {
    division: "Sylhet",
    cities: ["Sylhet","Habiganj","Moulvibazar","Sunamganj"],
  },
  {
    division: "Rangpur",
    cities: [
      "Rangpur","Dinajpur","Thakurgaon","Panchagarh","Nilphamari",
      "Lalmonirhat","Kurigram","Gaibandha",
    ],
  },
  {
    division: "Mymensingh",
    cities: ["Mymensingh","Netrokona","Jamalpur","Sherpur"],
  },
];

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Delivery",
    icon: "",
    desc: "Pay when item is delivered",
    color: "#2ec97e",
    bg: "rgba(46,201,126,0.1)",
    border: "rgba(46,201,126,0.4)",
  },
  {
    id: "bkash",
    label: "bKash",
    icon: "",
    desc: "Mobile banking via bKash",
    color: "#e2136e",
    bg: "rgba(226,19,110,0.1)",
    border: "rgba(226,19,110,0.4)",
  },
  {
    id: "nagad",
    label: "Nagad",
    icon: "",
    desc: "Mobile banking via Nagad",
    color: "#f7941d",
    bg: "rgba(247,148,29,0.1)",
    border: "rgba(247,148,29,0.4)",
  },
  {
    id: "card",
    label: "Debit / Credit Card",
    icon: "",
    desc: "Visa, Mastercard, AMEX",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.4)",
  },
];

/* 
   GLOBAL STYLES
 */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #08231a; color: #fff; -webkit-font-smoothing: antialiased; }

    @keyframes co-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes co-fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes co-spin   { to{transform:rotate(360deg)} }
    @keyframes co-pop    { 0%{transform:scale(0.85);opacity:0} 65%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
    @keyframes co-ping   { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2);opacity:0} }

    .co-fade { opacity:0; animation:co-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .co-d1{animation-delay:.06s} .co-d2{animation-delay:.14s} .co-d3{animation-delay:.22s}
    .co-d4{animation-delay:.30s} .co-d5{animation-delay:.38s}

    /* NAV */
    .co-nav {
      position:fixed; top:0; left:0; right:0; z-index:200;
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 48px;
      background:rgba(8,35,26,0.78); backdrop-filter:blur(22px);
      border-bottom:1px solid rgba(255,255,255,0.08);
    }
    .co-nav-logo { display:flex; align-items:center; gap:11px; text-decoration:none; }
    .co-nav-mark {
      width:36px; height:36px; border-radius:10px;
      background:linear-gradient(135deg,#2ec97e,#1b7d52);
      display:flex; align-items:center; justify-content:center;
      font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff;
      box-shadow:0 4px 16px rgba(46,201,126,0.4);
    }
    .co-nav-brand { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#fff; }

    /* PAGE */
    .co-page { min-height:100vh; padding-top:61px; background:#08231a; }

    /* BANNER */
    .co-banner {
      background:linear-gradient(135deg,#08231a 0%,#0d3322 50%,#162b1e 100%);
      padding:44px 48px 36px; position:relative; overflow:hidden;
      border-bottom:1px solid rgba(255,255,255,0.06);
    }
    .co-banner-glow { position:absolute; top:-100px; right:-60px; width:400px; height:400px; background:radial-gradient(circle,rgba(245,158,11,0.12),transparent 65%); border-radius:50%; pointer-events:none; }
    .co-banner-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }
    .co-breadcrumb { display:flex; align-items:center; gap:8px; font-size:12px; color:rgba(255,255,255,0.38); margin-bottom:18px; flex-wrap:wrap; }
    .co-breadcrumb a { text-decoration:none; color:rgba(255,255,255,0.45); transition:color .2s; }
    .co-breadcrumb a:hover { color:#2ec97e; }
    .co-breadcrumb-sep { color:rgba(255,255,255,0.22); }
    .co-badge {
      display:inline-flex; align-items:center; gap:7px;
      background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.28);
      border-radius:100px; padding:6px 16px; margin-bottom:16px;
      font-size:11px; font-weight:600; color:#f59e0b; letter-spacing:.12em; text-transform:uppercase;
    }
    .co-banner-title { font-family:'Playfair Display',serif; font-size:clamp(26px,3vw,42px); font-weight:700; color:#fff; line-height:1.15; margin-bottom:8px; }
    .co-banner-sub { font-size:14px; color:rgba(255,255,255,0.45); font-weight:300; max-width:480px; line-height:1.7; }

    /* CONTENT GRID */
    .co-content { max-width:1100px; margin:0 auto; padding:36px 48px 80px; display:grid; grid-template-columns:1fr 380px; gap:28px; align-items:start; }

    /* FORM SECTIONS */
    .co-card {
      background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
      border-radius:22px; overflow:hidden; margin-bottom:20px;
    }
    .co-card-head {
      padding:20px 26px; border-bottom:1px solid rgba(255,255,255,0.07);
      display:flex; align-items:center; gap:13px;
    }
    .co-card-icon {
      width:40px; height:40px; border-radius:12px;
      background:linear-gradient(135deg,rgba(245,158,11,0.18),rgba(217,119,6,0.1));
      border:1px solid rgba(245,158,11,0.22);
      display:flex; align-items:center; justify-content:center; color:#f59e0b; flex-shrink:0;
    }
    .co-card-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff; }
    .co-card-sub { font-size:11.5px; color:rgba(255,255,255,0.38); margin-top:2px; }
    .co-card-body { padding:26px; display:flex; flex-direction:column; gap:20px; }

    /* INPUTS */
    .co-label { display:block; font-size:11px; font-weight:700; color:rgba(255,255,255,0.5); margin-bottom:7px; letter-spacing:.06em; text-transform:uppercase; }
    .co-req { color:#f59e0b; margin-left:3px; }
    .co-input {
      width:100%; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05);
      border-radius:13px; padding:13px 16px; font-size:14px; font-family:inherit;
      outline:none; transition:border-color .22s, box-shadow .22s, background .22s; color:#fff;
    }
    .co-input::placeholder { color:rgba(255,255,255,0.25); }
    .co-input:focus { border-color:rgba(245,158,11,0.55); background:rgba(245,158,11,0.05); box-shadow:0 0 0 4px rgba(245,158,11,0.09); }
    .co-input.error { border-color:rgba(239,68,68,0.55); box-shadow:0 0 0 4px rgba(239,68,68,0.09); }
    .co-input.valid { border-color:rgba(46,201,126,0.5); background:rgba(46,201,126,0.04); }
    .co-select { appearance:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; }
    .co-select option { background:#0d3322; color:#fff; }
    .co-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

    /* PAYMENT METHODS */
    .co-payment-grid { display:grid; grid-template-columns:1fr 1fr; gap:11px; }
    .co-pm-btn {
      padding:16px 14px; border-radius:14px; border:1.5px solid rgba(255,255,255,0.1);
      background:rgba(255,255,255,0.03); cursor:pointer; font-family:inherit;
      transition:all .22s; text-align:left; display:flex; align-items:center; gap:10px;
    }
    .co-pm-btn:hover { border-color:rgba(255,255,255,0.2); background:rgba(255,255,255,0.06); }
    .co-pm-btn.active { box-shadow:0 0 0 3px var(--pm-color-shadow); }
    .co-pm-icon { font-size:24px; line-height:1; flex-shrink:0; }
    .co-pm-label { font-size:13px; font-weight:600; color:rgba(255,255,255,0.85); line-height:1.2; }
    .co-pm-desc { font-size:10.5px; color:rgba(255,255,255,0.38); margin-top:2px; }

    /* ORDER SUMMARY SIDEBAR */
    .co-sidebar { position:sticky; top:81px; display:flex; flex-direction:column; gap:16px; }
    .co-side-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; overflow:hidden; }
    .co-side-head { padding:18px 22px; border-bottom:1px solid rgba(255,255,255,0.07); }
    .co-side-title { font-size:13px; font-weight:700; color:rgba(255,255,255,0.7); letter-spacing:.04em; text-transform:uppercase; }
    .co-side-body { padding:18px 22px; }

    /* ITEM PREVIEW */
    .co-item-preview {
      display:flex; gap:14px; align-items:center;
      padding:16px; border-radius:14px;
      background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
      margin-bottom:18px;
    }
    .co-item-img {
      width:64px; height:64px; border-radius:10px; object-fit:cover;
      background:rgba(46,201,126,0.1); display:flex; align-items:center; justify-content:center;
      font-size:28px; flex-shrink:0; overflow:hidden;
    }
    .co-item-title { font-family:'Playfair Display',serif; font-size:14px; font-weight:700; color:#fff; line-height:1.3; margin-bottom:4px; }
    .co-item-price { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#f59e0b; }
    .co-item-cat { font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:.07em; margin-bottom:2px; }

    /* TOTAL */
    .co-total-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
    .co-total-label { font-size:13px; color:rgba(255,255,255,0.55); }
    .co-total-value { font-size:13px; font-weight:600; color:rgba(255,255,255,0.85); }
    .co-total-final { display:flex; justify-content:space-between; align-items:center; padding:14px 0 0; }
    .co-total-final-label { font-size:14px; font-weight:700; color:#fff; }
    .co-total-final-value { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#f59e0b; }

    /* SUBMIT BUTTON */
    .co-submit {
      width:100%; padding:16px; border-radius:14px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff;
      font-size:15px; font-weight:700; font-family:inherit; letter-spacing:.02em;
      box-shadow:0 6px 24px rgba(245,158,11,0.38);
      display:flex; align-items:center; justify-content:center; gap:9px;
      transition:all .2s; margin-top:8px;
    }
    .co-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(245,158,11,0.5); }
    .co-submit:disabled { opacity:.5; cursor:not-allowed; }

    /* SPINNER */
    .co-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:co-spin .7s linear infinite; }

    /* ERROR */
    .co-error { padding:12px 16px; border-radius:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); font-size:13px; color:#f87171; display:flex; align-items:center; gap:8px; }

    /* SECURITY BADGE */
    .co-secure { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; background:rgba(46,201,126,0.07); border:1px solid rgba(46,201,126,0.18); font-size:11.5px; color:rgba(255,255,255,0.5); line-height:1.55; margin-top:12px; }

    /* RESPONSIVE */
    @media(max-width:900px) {
      .co-content { grid-template-columns:1fr; padding:24px 24px 60px; }
      .co-sidebar { position:static; }
      .co-banner { padding:30px 24px; }
      .co-nav { padding:14px 20px; }
    }
    @media(max-width:560px) {
      .co-payment-grid { grid-template-columns:1fr; }
      .co-row-2 { grid-template-columns:1fr; }
    }
  `}</style>
);

/* 
   CHECKOUT PAGE
 */
const fmt = (n) => new Intl.NumberFormat("en-BD").format(n);

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user: authUser } = useAuth();
  const offer = location.state?.offer;
  const listing = location.state?.listing || offer?.listing;
  const routeItem = location.state?.item;
  const item = useMemo(() => routeItem || (listing ? {
    id: listing._id || listing.id,
    title: listing.title || "Selected listing",
    price: Number(offer?.cashAmount || listing.price) || 0,
    category: listing.category || "Marketplace",
    image: Array.isArray(listing.images) ? listing.images[0] || "" : "",
    seller: offer?.toUser || listing.seller || {},
  } : null), [listing, offer, routeItem]);

  const [form, setForm] = useState({
    name:    authUser?.name || "",
    phone:   authUser?.phone || "",
    address: "",
    division:"",
    city:    "",
    payment: "",
  });
  const [loading, setLoading]  = useState(false);
  const [error,   setError]    = useState("");
  const [tried,   setTried]    = useState(false);

  // Redirect if no item or not logged in
  React.useEffect(() => {
    if (!token)  { navigate("/signin",      { replace: true }); return; }
    if (!item)   { navigate("/marketplace", { replace: true }); }
  }, [token, item, navigate]);

  if (!item) return null;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const citiesForDivision = form.division
    ? BD_DIVISIONS.find(d => d.division === form.division)?.cities || []
    : [];

  const isValid = () =>
    form.name.trim().length >= 2 &&
    form.phone.trim().length >= 9 &&
    form.address.trim().length >= 5 &&
    form.division &&
    form.city &&
    form.payment;

  const handleSubmit = async () => {
    setTried(true);
    if (!isValid()) return;

    setLoading(true);
    setError("");

    const offerId = offer?._id || offer?.id;
    if (!offerId) {
      setError("Checkout requires an accepted offer. Please open checkout from an accepted offer.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ offerId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.msg || data?.message || "Failed to initialize payment. Please try again.");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Payment gateway URL was not returned.");
    } catch (err) {
      const msg =
        err?.message ||
        "Failed to initialize payment. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-page">
      <GlobalStyles />

      {/* NAV */}
      <nav className="co-nav">
        <Link to="/" className="co-nav-logo">
          <div className="co-nav-mark">P</div>
          <span className="co-nav-brand">Proti-Binimoy</span>
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Link to="/marketplace" style={{ textDecoration:"none", color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500 }}>
             Back to Marketplace
          </Link>
        </div>
      </nav>

      {/* BANNER */}
      <div className="co-banner co-fade">
        <div className="co-banner-glow" />
        <div className="co-banner-inner">
          <div className="co-breadcrumb">
            <Link to="/">Home</Link>
            <span className="co-breadcrumb-sep"></span>
            <Link to="/marketplace">Marketplace</Link>
            <span className="co-breadcrumb-sep"></span>
            <span style={{ color:"rgba(255,255,255,0.65)" }}>Checkout</span>
          </div>
          <div className="co-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width:12, height:12 }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            Secure Checkout
          </div>
          <h1 className="co-banner-title co-d1">
            Almost there -<br />
            <em style={{ fontStyle:"italic", color:"#f59e0b" }}>complete your order.</em>
          </h1>
          <p className="co-banner-sub co-d2">
            Fill in your delivery details and choose your payment method. Takes less than a minute.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="co-content">

        {/*  LEFT: FORM  */}
        <div>

          {/* BUYER INFO */}
          <div className="co-card co-fade co-d1">
            <div className="co-card-head">
              <div className="co-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ width:20, height:20 }}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div>
                <div className="co-card-title">Buyer Information</div>
                <div className="co-card-sub">Your name and contact number</div>
              </div>
            </div>
            <div className="co-card-body">
              <div className="co-row-2">
                <div>
                  <label className="co-label">Full Name <span className="co-req">*</span></label>
                  <input
                    className={`co-input${tried && form.name.trim().length < 2 ? " error" : form.name.trim().length >= 2 ? " valid" : ""}`}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="co-label">Phone Number <span className="co-req">*</span></label>
                  <input
                    className={`co-input${tried && form.phone.trim().length < 9 ? " error" : form.phone.trim().length >= 9 ? " valid" : ""}`}
                    placeholder="+880 1xxx-xxxxxx"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    type="tel"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DELIVERY ADDRESS */}
          <div className="co-card co-fade co-d2">
            <div className="co-card-head">
              <div className="co-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ width:20, height:20 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <div className="co-card-title">Delivery Address</div>
                <div className="co-card-sub">Where should we deliver your item?</div>
              </div>
            </div>
            <div className="co-card-body">
              {/* Full Address */}
              <div>
                <label className="co-label">Street / Area Address <span className="co-req">*</span></label>
                <input
                  className={`co-input${tried && form.address.trim().length < 5 ? " error" : form.address.trim().length >= 5 ? " valid" : ""}`}
                  placeholder="House no, road, area, block..."
                  value={form.address}
                  onChange={e => set("address", e.target.value)}
                />
              </div>

              <div className="co-row-2">
                {/* Division */}
                <div>
                  <label className="co-label">Division <span className="co-req">*</span></label>
                  <select
                    className={`co-input co-select${tried && !form.division ? " error" : form.division ? " valid" : ""}`}
                    value={form.division}
                    onChange={e => { set("division", e.target.value); set("city", ""); }}
                  >
                    <option value="">Select division...</option>
                    {BD_DIVISIONS.map(d => (
                      <option key={d.division} value={d.division}>{d.division}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="co-label">City / District <span className="co-req">*</span></label>
                  <select
                    className={`co-input co-select${tried && !form.city ? " error" : form.city ? " valid" : ""}`}
                    value={form.city}
                    onChange={e => set("city", e.target.value)}
                    disabled={!form.division}
                  >
                    <option value="">{form.division ? "Select city..." : "Select division first"}</option>
                    {citiesForDivision.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="co-card co-fade co-d3">
            <div className="co-card-head">
              <div className="co-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" style={{ width:20, height:20 }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <div className="co-card-title">Payment Method</div>
                <div className="co-card-sub">Choose how you'd like to pay</div>
              </div>
            </div>
            <div className="co-card-body">
              <div className="co-payment-grid">
                {PAYMENT_METHODS.map(pm => {
                  const isActive = form.payment === pm.id;
                  return (
                    <button
                      key={pm.id}
                      className={`co-pm-btn${isActive ? " active" : ""}`}
                      style={{
                        borderColor: isActive ? pm.border : tried && !form.payment ? "rgba(239,68,68,0.45)" : "rgba(255,255,255,0.1)",
                        background:  isActive ? pm.bg : "rgba(255,255,255,0.03)",
                        "--pm-color-shadow": pm.bg,
                      }}
                      onClick={() => set("payment", pm.id)}
                    >
                      <span className="co-pm-icon">{pm.icon}</span>
                      <div>
                        <div className="co-pm-label" style={{ color: isActive ? pm.color : "rgba(255,255,255,0.85)" }}>{pm.label}</div>
                        <div className="co-pm-desc">{pm.desc}</div>
                      </div>
                      {isActive && (
                        <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%", background:pm.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width:10, height:10 }}><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {tried && !form.payment && (
                <div style={{ fontSize:12, color:"#f87171", marginTop:4 }}>Please select a payment method.</div>
              )}
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="co-error co-fade">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width:16, height:16, flexShrink:0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
        </div>

        {/*  RIGHT: SIDEBAR  */}
        <aside className="co-sidebar co-fade co-d2">

          {/* Order Summary */}
          <div className="co-side-card">
            <div className="co-side-head">
              <div className="co-side-title">Order Summary</div>
            </div>
            <div className="co-side-body">
              {/* Item preview */}
              <div className="co-item-preview">
                <div className="co-item-img">
                  {item.image
                    ? <img src={item.image} alt={item.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                    : <span>{item.emoji || ""}</span>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="co-item-cat">{item.category}</div>
                  <div className="co-item-title">{item.title}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>
                    Sold by: {item.seller?.name || "Seller"}
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <div>
                <div className="co-total-row">
                  <span className="co-total-label">Item Price</span>
                  <span className="co-total-value">BDT {fmt(item.price)}</span>
                </div>
                <div className="co-total-row">
                  <span className="co-total-label">Platform Fee</span>
                  <span className="co-total-value" style={{ color:"#2ec97e" }}>Free</span>
                </div>
                <div className="co-total-final">
                  <span className="co-total-final-label">Total Amount</span>
                  <span className="co-total-final-value">BDT {fmt(item.price)}</span>
                </div>
              </div>

              {/* Selected payment badge */}
              {form.payment && (() => {
                const pm = PAYMENT_METHODS.find(p => p.id === form.payment);
                return (
                  <div style={{ marginTop:14, padding:"9px 13px", borderRadius:10, background: pm.bg, border:`1px solid ${pm.border}`, display:"flex", alignItems:"center", gap:8, fontSize:12.5, fontWeight:600, color: pm.color }}>
                    <span>{pm.icon}</span>
                    Paying via {pm.label}
                  </div>
                );
              })()}

              {/* Submit */}
              <button
                className="co-submit"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading ? (
                  <><div className="co-spinner" /> Processing Order...</>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width:16, height:16 }}>
                      <path d="M12 3l6 2.5v5.8c0 4.1-2.5 7.9-6 9.7-3.5-1.8-6-5.6-6-9.7V5.5L12 3z"/>
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </button>

              {/* Security note */}
              <div className="co-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2ec97e" strokeWidth="2" style={{ width:15, height:15, flexShrink:0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Your payment is secured with 256-bit SSL encryption. We never store card details.
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="co-side-card">
            <div className="co-side-body">
              {[
                { icon:"", t:"Secure Payment",        s:"SSL encrypted checkout" },
                { icon:"", t:"Buyer Protection",       s:"Report issues within 7 days" },
                { icon:"", t:"24/7 Support",           s:"We're here to help" },
              ].map(b => (
                <div key={b.t} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:"rgba(245,158,11,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{b.icon}</div>
                  <div>
                    <div style={{ fontSize:12.5, fontWeight:600, color:"rgba(255,255,255,0.8)" }}>{b.t}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.35)", marginTop:1 }}>{b.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>

      <PageFooter />
    </div>
  );
};

export default CheckoutPage;

