import React, { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════ */
const MOCK_ITEMS = [
  {
    id: 1, title: "Single-Door Wardrobe with Mirror",
    category: "Furniture", subcategory: "Storage",
    condition: "Used", conditionScore: 3,
    price: 4500, currency: "BDT", negotiable: true,
    description: "Lightly used wardrobe with full-length mirror and 2 bottom drawers. Dark finish, sturdy build. Keys included. Perfect for small bedrooms.",
    brand: "Local Craft", model: "Single Door",
    seller: { name: "Rafi Islam", avatar: "RI", rating: 4.8, reviews: 12, location: "Bashundhara, Dhaka", verified: true, responseTime: "~1 hr" },
    tags: ["wardrobe", "mirror", "storage", "bedroom"],
    shipping: "Local Pickup Only", payment: ["Cash", "bKash"],
    postedDate: "2025-04-15", views: 142, saves: 28,
    status: "available", emoji: "🪞", accentColor: "#8B5CF6",
    badge: "Popular", tradeOffer: false,
    image: "/src/assets/second_hand_almirah.png",
  },
  {
    id: 2, title: "Favron Mountain Bike – 27.5\" Wheels",
    category: "Sports", subcategory: "Cycling",
    condition: "Like New", conditionScore: 5,
    price: 18000, currency: "BDT", negotiable: true,
    description: "Barely ridden Favron MTB, black/red colorway. Disc brakes front & rear, 21-speed Shimano gears. No scratches, bought 3 months ago.",
    brand: "Favron", model: "MTB 275",
    seller: { name: "Tariq Hasan", avatar: "TH", rating: 4.9, reviews: 27, location: "Mirpur-10, Dhaka", verified: true, responseTime: "~30 min" },
    tags: ["cycle", "mtb", "outdoor", "shimano"],
    shipping: "Local Pickup / Delivery Available", payment: ["Cash", "bKash", "Nagad"],
    postedDate: "2025-04-17", views: 389, saves: 64,
    status: "available", emoji: "🚵", accentColor: "#EF4444",
    badge: "Hot Deal", tradeOffer: true,
    image: "/src/assets/second_hand_cycle.png",
  },
  {
    id: 3, title: "Dell Laptop – Core i5, 8GB RAM, 256GB SSD",
    category: "Electronics", subcategory: "Computers",
    condition: "Used", conditionScore: 4,
    price: 32000, currency: "BDT", negotiable: false,
    description: "Dell laptop running Windows 10. Screen in excellent condition, battery holds 3-4 hrs. Ideal for office work and students. Charger included.",
    brand: "Dell", model: "Inspiron 14",
    seller: { name: "Nadia Chowdhury", avatar: "NC", rating: 4.7, reviews: 44, location: "Gulshan, Dhaka", verified: true, responseTime: "~2 hr" },
    tags: ["laptop", "dell", "computer", "student"],
    shipping: "Local Pickup / Courier Available", payment: ["Cash", "bKash", "Bank Transfer"],
    postedDate: "2025-04-18", views: 521, saves: 97,
    status: "available", emoji: "💻", accentColor: "#2ec97e",
    badge: "Verified", tradeOffer: false,
    image: "/src/assets/second_hand_laptop.png",
  },
  {
    id: 4, title: "Samsung 43\" LED Smart TV",
    category: "Electronics", subcategory: "Television",
    condition: "Like New", conditionScore: 5,
    price: 28000, currency: "BDT", negotiable: true,
    description: "Samsung 43-inch smart TV, 2 years old. HDR, WiFi, all ports working. Remote and original box included. No dead pixels.",
    brand: "Samsung", model: "43\" Series 5",
    seller: { name: "Arif Billah", avatar: "AB", rating: 4.6, reviews: 8, location: "Uttara, Dhaka", verified: false, responseTime: "~3 hr" },
    tags: ["tv", "samsung", "smart tv", "hdr"],
    shipping: "Local Pickup Only", payment: ["Cash", "bKash"],
    postedDate: "2025-04-14", views: 213, saves: 41,
    status: "available", emoji: "📺", accentColor: "#F59E0B",
    badge: "New Post", tradeOffer: false,
  },
  {
    id: 5, title: "Wooden Study Table with Drawer",
    category: "Furniture", subcategory: "Tables",
    condition: "Used", conditionScore: 3,
    price: 3200, currency: "BDT", negotiable: true,
    description: "Solid wood study table with 1 drawer. Light brown finish. Ideal for students. Minor surface scratches on top. Very sturdy.",
    brand: "Local Craft", model: "Study Desk",
    seller: { name: "Sumaiya Begum", avatar: "SB", rating: 4.4, reviews: 6, location: "Rayer Bazar, Dhaka", verified: false, responseTime: "~5 hr" },
    tags: ["table", "study", "wooden", "student"],
    shipping: "Local Pickup Only", payment: ["Cash"],
    postedDate: "2025-04-12", views: 88, saves: 14,
    status: "available", emoji: "🪑", accentColor: "#C49A3C",
    badge: null, tradeOffer: false,
  },
  {
    id: 6, title: "iPhone 13 – 128GB, Midnight",
    category: "Electronics", subcategory: "Phones",
    condition: "Like New", conditionScore: 5,
    price: 62000, currency: "BDT", negotiable: false,
    description: "iPhone 13 128GB midnight color. Used 8 months, no scratches. Original charger + EarPods included. PTA approved. Battery 91%.",
    brand: "Apple", model: "iPhone 13",
    seller: { name: "Fahim Uddin", avatar: "FU", rating: 5.0, reviews: 19, location: "Dhanmondi, Dhaka", verified: true, responseTime: "~45 min" },
    tags: ["iphone", "apple", "smartphone", "mobile"],
    shipping: "Local Pickup / Courier", payment: ["Cash", "bKash", "Bank Transfer"],
    postedDate: "2025-04-19", views: 674, saves: 133,
    status: "available", emoji: "📱", accentColor: "#06B6D4",
    badge: "Top Seller", tradeOffer: true,
  },
  {
    id: 7, title: "Canon EOS 200D DSLR Camera",
    category: "Electronics", subcategory: "Cameras",
    condition: "Like New", conditionScore: 4,
    price: 45000, currency: "BDT", negotiable: true,
    description: "Canon 200D with 18-55mm kit lens. Shutter count under 3000. Comes with 32GB card, 2 batteries, bag. Perfect for beginners.",
    brand: "Canon", model: "EOS 200D",
    seller: { name: "Mehedi Hasan", avatar: "MH", rating: 4.9, reviews: 31, location: "Mohammadpur, Dhaka", verified: true, responseTime: "~1 hr" },
    tags: ["camera", "canon", "dslr", "photography"],
    shipping: "Local Pickup / Courier", payment: ["Cash", "bKash"],
    postedDate: "2025-04-20", views: 445, saves: 89,
    status: "available", emoji: "📷", accentColor: "#10B981",
    badge: "Popular", tradeOffer: false,
  },
  {
    id: 8, title: "Vintage Leather Sofa Set (3+1+1)",
    category: "Furniture", subcategory: "Seating",
    condition: "Used", conditionScore: 3,
    price: 22000, currency: "BDT", negotiable: true,
    description: "Genuine leather sofa set (3-seater + 2 single chairs). Tan brown color. Minor wear on armrests. Very comfortable, solid frame.",
    brand: "Otobi", model: "Classic Series",
    seller: { name: "Kawsar Ahmed", avatar: "KA", rating: 4.3, reviews: 5, location: "Wari, Dhaka", verified: false, responseTime: "~6 hr" },
    tags: ["sofa", "leather", "furniture", "living room"],
    shipping: "Local Pickup Only", payment: ["Cash"],
    postedDate: "2025-04-11", views: 167, saves: 22,
    status: "available", emoji: "🛋️", accentColor: "#92400E",
    badge: null, tradeOffer: true,
  },
];

const CATEGORIES = [
  { label: "All",         icon: "◈", count: 8,  color: "#2ec97e" },
  { label: "Electronics", icon: "⚡", count: 4,  color: "#06B6D4" },
  { label: "Furniture",   icon: "🪑", count: 3,  color: "#C49A3C" },
  { label: "Sports",      icon: "🏃", count: 1,  color: "#EF4444" },
  { label: "Clothing",    icon: "👗", count: 0,  color: "#8B5CF6" },
  { label: "Books",       icon: "📚", count: 0,  color: "#F59E0B" },
  { label: "Vehicles",    icon: "🚗", count: 0,  color: "#10B981" },
];

const LOCATIONS = ["All Areas","Dhanmondi","Gulshan","Bashundhara","Uttara","Mirpur","Mohammadpur","Rayer Bazar","Wari"];
const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First",      icon: "🕐" },
  { value: "price_asc",  label: "Price: Low → High",  icon: "↑" },
  { value: "price_desc", label: "Price: High → Low",  icon: "↓" },
  { value: "popular",    label: "Most Viewed",        icon: "🔥" },
  { value: "rating",     label: "Top Rated",          icon: "⭐" },
  { value: "most_saved", label: "Most Saved",         icon: "❤️" },
];
const CONDITIONS = [
  { label: "New",      score: 5, color: "#2ec97e", bg: "rgba(46,201,126,0.13)" },
  { label: "Like New", score: 4, color: "#06B6D4", bg: "rgba(6,182,212,0.13)" },
  { label: "Used",     score: 3, color: "#F59E0B", bg: "rgba(245,158,11,0.13)" },
  { label: "For Parts",score: 1, color: "#EF4444", bg: "rgba(239,68,68,0.13)" },
];

/* ─── Helpers ─── */
const fmt    = (n) => new Intl.NumberFormat("en-BD").format(n);
const cInfo  = (l) => CONDITIONS.find(c => c.label === l) || { color:"#888", bg:"#1a1a1a" };
const dAgo   = (d) => Math.floor((Date.now() - new Date(d)) / 86400000);
const bMeta  = (b) => ({
  "Popular":    { bg:"#8B5CF6", glow:"rgba(139,92,246,.4)" },
  "Hot Deal":   { bg:"#EF4444", glow:"rgba(239,68,68,.4)" },
  "Verified":   { bg:"#2ec97e", glow:"rgba(46,201,126,.4)" },
  "New Post":   { bg:"#F59E0B", glow:"rgba(245,158,11,.4)" },
  "Top Seller": { bg:"#06B6D4", glow:"rgba(6,182,212,.4)" },
}[b] || { bg:"#555", glow:"transparent" });

/* ══════════════════════════════════════════════
   GLOBAL STYLES
══════════════════════════════════════════════ */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Sora:wght@300;400;500;600;700&display=swap');
    :root {
      --g:#2ec97e; --gd:rgba(46,201,126,.14); --gg:rgba(46,201,126,.35);
      --d1:#080f0c; --d2:#0d1a14; --d3:#0f2018; --d4:#162b1e;
      --b1:rgba(255,255,255,.07); --b2:rgba(255,255,255,.12);
      --t:rgba(255,255,255,1); --tm:rgba(255,255,255,.5); --td:rgba(255,255,255,.28);
      --r:16px; --nh:60px;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{overflow-x:hidden;scroll-behavior:smooth}
    body{font-family:'Sora',sans-serif;background:var(--d2);color:var(--t);-webkit-font-smoothing:antialiased}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-track{background:var(--d1)}
    ::-webkit-scrollbar-thumb{background:rgba(46,201,126,.3);border-radius:3px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(46,201,126,.55)}

    @keyframes fuA{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fiA{from{opacity:0}to{opacity:1}}
    @keyframes pI{0%{transform:scale(.88);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
    @keyframes bP{0%{transform:scale(0) rotate(-10deg)}70%{transform:scale(1.2) rotate(2deg)}100%{transform:scale(1) rotate(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}

    .fu{opacity:0;animation:fuA .5s cubic-bezier(.22,1,.36,1) forwards}
    .pi{animation:pI .38s cubic-bezier(.34,1.56,.64,1) forwards}
    .d1{animation-delay:.04s}.d2{animation-delay:.09s}.d3{animation-delay:.14s}
    .d4{animation-delay:.19s}.d5{animation-delay:.24s}.d6{animation-delay:.3s}
    .d7{animation-delay:.36s}.d8{animation-delay:.42s}

    /* NAV */
    .nav{position:fixed;top:0;left:0;right:0;z-index:400;height:var(--nh);display:flex;align-items:center;justify-content:space-between;padding:0 40px;background:rgba(8,15,12,.85);backdrop-filter:blur(28px) saturate(180%);border-bottom:1px solid var(--b1)}
    .nav::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(to right,transparent,rgba(46,201,126,.4),transparent)}
    .nl{display:flex;align-items:center;gap:11px;text-decoration:none}
    .nlm{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2ec97e,#1b7d52);font-size:16px;font-weight:700;color:#fff;box-shadow:0 4px 16px var(--gg);flex-shrink:0}
    .nlt{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:var(--t);letter-spacing:-.01em}
    .nls{display:flex;gap:4px}
    .nla{text-decoration:none;padding:7px 13px;border-radius:8px;font-size:13.5px;font-weight:500;color:var(--tm);transition:all .18s}
    .nla:hover{color:var(--t);background:rgba(255,255,255,.05)}
    .nla.active{color:var(--g);background:var(--gd)}
    .nr{display:flex;align-items:center;gap:10px}
    .nib{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;border:1px solid var(--b2);background:transparent;color:var(--tm);cursor:pointer;transition:all .18s;font-size:15px;position:relative}
    .nib:hover{background:rgba(255,255,255,.07);color:var(--t);border-color:rgba(255,255,255,.2)}
    .nbadge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:var(--g);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center}
    .nb{padding:8px 20px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s}
    .nbg{background:transparent;color:var(--tm);border:1px solid var(--b2)}
    .nbg:hover{color:var(--t);border-color:rgba(255,255,255,.25)}
    .nbp{background:linear-gradient(135deg,#2ec97e,#1a7a50);color:#fff;box-shadow:0 4px 16px var(--gg)}
    .nbp:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(46,201,126,.5)}
    .hbg{display:none;flex-direction:column;gap:4.5px;cursor:pointer;background:none;border:none;padding:7px}
    .hbg span{display:block;width:22px;height:2px;background:var(--tm);border-radius:2px;transition:all .22s}
    .mmenu{display:none;position:fixed;top:60px;left:0;right:0;z-index:399;padding:16px 20px 24px;background:rgba(8,15,12,.98);backdrop-filter:blur(24px);border-bottom:1px solid var(--b1);flex-direction:column}
    .mmenu.open{display:flex}
    .mml{text-decoration:none;color:rgba(255,255,255,.75);font-size:16px;font-weight:500;padding:14px 0;border-bottom:1px solid var(--b1)}

    /* LAYOUT */
    .pw{display:grid;grid-template-columns:auto 1fr;min-height:calc(100vh - var(--nh));margin-top:var(--nh)}

    /* SIDEBAR */
    .sb{position:sticky;top:var(--nh);height:calc(100vh - var(--nh));overflow-y:auto;overflow-x:hidden;background:var(--d3);border-right:1px solid var(--b1);display:flex;flex-direction:column;width:300px;min-width:300px;transition:width .32s cubic-bezier(.22,1,.36,1),min-width .32s cubic-bezier(.22,1,.36,1),opacity .22s ease,border-color .32s ease}
    .sb.collapsed{width:0;min-width:0;opacity:0;pointer-events:none;border-right-color:transparent}
    .sb::-webkit-scrollbar{width:3px}

    .sbh{padding:18px 20px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--b1)}
    .sbt{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--td);display:flex;align-items:center;gap:8px}
    .sbc{font-size:11.5px;color:#EF4444;cursor:pointer;font-weight:600;opacity:0;transition:opacity .2s;border:none;background:none;font-family:inherit}
    .sbc.vis{opacity:1}
    .sbc:hover{opacity:.8}

    .sbs{padding:14px 20px;border-bottom:1px solid var(--b1)}
    .sbl{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--td);margin-bottom:13px;display:flex;align-items:center;gap:8px;transition:color .18s;flex:1}
    .sbl::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06)}
    .sbs-header .sbl{margin-bottom:0}

    /* category list */
    .cl{display:flex;flex-direction:column;gap:3px}
    .ci{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:10px;cursor:pointer;border:1.5px solid transparent;transition:all .18s;width:100%;background:none;font-family:inherit;text-align:left}
    .ci:hover{background:rgba(255,255,255,.04)}
    .ci.act{background:var(--gd);border-color:rgba(46,201,126,.22)}
    .cii{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0}
    .cin{flex:1;font-size:13px;font-weight:500;color:var(--tm);transition:color .18s}
    .ci:hover .cin,.ci.act .cin{color:var(--t)}
    .ci.act .cin{color:var(--g)}
    .cic{font-size:11px;font-weight:600;padding:2px 7px;border-radius:100px;background:rgba(255,255,255,.07);color:var(--td);min-width:24px;text-align:center;transition:all .18s}
    .ci.act .cic{background:rgba(46,201,126,.2);color:var(--g)}

    /* price */
    .pd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px}
    .pv{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--g)}
    .pl{font-size:10px;color:var(--td);margin-bottom:2px}
    .rw{position:relative;padding:8px 0}
    .rt{position:relative;height:4px;background:rgba(255,255,255,.1);border-radius:2px}
    .rf{position:absolute;left:0;top:0;height:100%;border-radius:2px;background:linear-gradient(to right,#2ec97e,#06B6D4)}
    .rs{-webkit-appearance:none;width:100%;height:4px;background:transparent;position:absolute;top:0;left:0;cursor:pointer;margin:0;outline:none}
    .rs::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--g);box-shadow:0 2px 8px rgba(46,201,126,.5);cursor:pointer;transition:transform .15s}
    .rs::-webkit-slider-thumb:hover{transform:scale(1.2)}
    .pps{display:flex;gap:5px;flex-wrap:wrap;margin-top:13px}
    .pp{padding:5px 11px;border-radius:100px;font-size:11px;font-weight:600;border:1px solid var(--b2);color:var(--tm);cursor:pointer;background:transparent;font-family:inherit;transition:all .18s;white-space:nowrap}
    .pp:hover{border-color:rgba(46,201,126,.4);color:var(--g)}
    .pp.act{background:var(--gd);border-color:rgba(46,201,126,.4);color:var(--g)}

    /* condition pills */
    .cg{display:grid;grid-template-columns:1fr 1fr;gap:7px}
    .cp{padding:10px 8px;border-radius:10px;border:1.5px solid transparent;cursor:pointer;font-family:inherit;text-align:center;transition:all .22s;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px}
    .cp:hover{transform:translateY(-1px)}
    .cp.act{transform:translateY(-1px)}

    /* toggle */
    .tr{display:flex;align-items:center;justify-content:space-between;padding:9px 0}
    .trl{font-size:13px;color:var(--tm)}
    .ts{position:relative;width:40px;height:22px;flex-shrink:0}
    .ts input{opacity:0;width:0;height:0;position:absolute}
    .tt{position:absolute;inset:0;border-radius:11px;background:rgba(255,255,255,.1);border:1px solid var(--b2);cursor:pointer;transition:all .25s}
    .tt::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:all .25s;opacity:.4}
    input:checked+.tt{background:rgba(46,201,126,.22);border-color:rgba(46,201,126,.5)}
    input:checked+.tt::after{transform:translateX(18px);background:var(--g);opacity:1;box-shadow:0 2px 8px rgba(46,201,126,.5)}

    /* location select */
    .ls{width:100%;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.05);border:1px solid var(--b2);color:var(--t);font-family:inherit;font-size:13px;outline:none;cursor:pointer;transition:border-color .2s;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
    .ls:focus{border-color:rgba(46,201,126,.4)}
    .ls option{background:#0f2018;color:#fff}

    /* rating rows */
    .rr{display:flex;align-items:center;gap:8px;padding:7px 0;cursor:pointer;border-radius:8px;padding:7px 6px;transition:background .15s}
    .rr:hover{background:rgba(255,255,255,.04)}
    .rstar{font-size:14px;transition:transform .1s}
    .rstar.on{color:#F59E0B}
    .rstar.off{color:rgba(255,255,255,.15)}
    .rlabel{font-size:12px;color:var(--tm);flex:1}
    .rrad{width:14px;height:14px;accent-color:var(--g);cursor:pointer}

    /* collapsible filter section */
    .sbs-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;padding-bottom:2px}
    .sbs-header:hover .sbl{color:rgba(255,255,255,.55)}
    .sbs-chevron{width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:var(--td);transition:transform .25s cubic-bezier(.22,1,.36,1),color .18s;flex-shrink:0}
    .sbs-chevron.open{transform:rotate(180deg)}
    .sbs-chevron svg{display:block}
    .sbs-body{overflow:hidden;transition:max-height .3s cubic-bezier(.22,1,.36,1),opacity .25s ease;opacity:1}
    .sbs-body.closed{max-height:0!important;opacity:0;pointer-events:none}

    /* apply btn */
    .sba{margin:16px 20px 20px;padding:13px;border-radius:12px;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;letter-spacing:.03em;transition:all .2s;box-shadow:0 4px 20px rgba(46,201,126,.35);position:relative;overflow:hidden;width:calc(100% - 40px)}
    .sba::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .2s}
    .sba:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(46,201,126,.5)}
    .sba:hover::before{opacity:1}

    /* sidebar active chips */
    .sac{margin:10px 20px 0;display:flex;flex-wrap:wrap;gap:5px}
    .sfc{display:inline-flex;align-items:center;gap:4px;padding:4px 9px 4px 11px;border-radius:100px;background:rgba(46,201,126,.1);border:1px solid rgba(46,201,126,.2);font-size:11px;color:var(--g);font-weight:500}
    .sfx{cursor:pointer;width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:8px;transition:background .15s}
    .sfx:hover{background:rgba(239,68,68,.3);color:#EF4444}

    /* MAIN */
    .main{background:var(--d2);display:flex;flex-direction:column;min-height:100%}

    /* TOPBAR */
    .tb{position:sticky;top:var(--nh);z-index:200;padding:13px 28px;display:flex;align-items:center;gap:11px;flex-wrap:wrap;background:rgba(13,26,20,.92);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1)}
    .sw{flex:1;min-width:180px;max-width:480px;position:relative}
    .si{width:100%;padding:11px 42px 11px 44px;border-radius:12px;background:rgba(255,255,255,.06);border:1.5px solid var(--b2);color:var(--t);font-family:inherit;font-size:13.5px;outline:none;transition:all .22s}
    .si::placeholder{color:var(--td)}
    .si:focus{border-color:rgba(46,201,126,.5);background:rgba(46,201,126,.05);box-shadow:0 0 0 3px rgba(46,201,126,.1)}
    .sic{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--td);pointer-events:none}
    .scl{position:absolute;right:13px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.12);border:none;color:var(--tm);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .scl:hover{background:rgba(239,68,68,.25);color:#EF4444}

    .tc{display:flex;align-items:center;gap:8px}

    /* sort dropdown */
    .srtw{position:relative}
    .srtb{display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.06);border:1.5px solid var(--b2);color:var(--tm);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;white-space:nowrap}
    .srtb:hover{border-color:rgba(255,255,255,.2);color:var(--t)}
    .srtb.open{border-color:rgba(46,201,126,.4);color:var(--g);background:rgba(46,201,126,.06)}
    .srtd{position:absolute;top:calc(100% + 6px);right:0;width:215px;background:#132319;border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;z-index:300;box-shadow:0 20px 60px rgba(0,0,0,.6);animation:pI .2s ease}
    .srto{display:flex;align-items:center;gap:9px;padding:11px 14px;font-size:13px;color:var(--tm);cursor:pointer;transition:all .15s;border:none;background:none;font-family:inherit;width:100%;text-align:left}
    .srto:hover{background:rgba(255,255,255,.05);color:var(--t)}
    .srto.act{background:var(--gd);color:var(--g);font-weight:600}
    .srti{font-size:13px;width:20px;text-align:center}

    /* view toggle */
    .vt{display:flex;border:1.5px solid var(--b2);border-radius:10px;overflow:hidden}
    .vb{padding:9px 11px;border:none;background:transparent;color:var(--tm);cursor:pointer;transition:all .18s;font-size:14px;line-height:1}
    .vb.act{background:var(--gd);color:var(--g)}
    .vb:hover:not(.act){background:rgba(255,255,255,.05)}

    /* desktop filter toggle button */
    .dftb{display:flex;align-items:center;gap:7px;padding:10px 14px;border-radius:10px;background:rgba(255,255,255,.06);border:1.5px solid var(--b2);color:var(--tm);font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0}
    .dftb:hover{border-color:rgba(46,201,126,.4);color:var(--g);background:rgba(46,201,126,.06)}
    .dftb.active{border-color:rgba(46,201,126,.45);color:var(--g);background:rgba(46,201,126,.08)}
    .dftb-icon{transition:transform .3s cubic-bezier(.22,1,.36,1)}
    .dftb.active .dftb-icon{transform:rotate(180deg)}

    /* mobile filter toggle */
    .fmb{display:none;align-items:center;gap:7px;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.06);border:1.5px solid var(--b2);color:var(--tm);font-family:inherit;font-size:13px;cursor:pointer;transition:all .18s}
    .fmb:hover{border-color:rgba(46,201,126,.35);color:var(--g)}

    /* HERO STRIP */
    .hs{padding:18px 28px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .rc{font-size:13px;color:var(--td)}
    .rc strong{color:var(--t);font-size:19px;font-weight:700;font-family:'Playfair Display',serif}

    /* active chips row */
    .ach{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
    .ac{display:inline-flex;align-items:center;gap:5px;padding:5px 10px 5px 12px;border-radius:100px;background:rgba(46,201,126,.1);border:1px solid rgba(46,201,126,.2);font-size:11.5px;color:var(--g);font-weight:500}
    .ax{cursor:pointer;width:15px;height:15px;border-radius:50%;background:rgba(46,201,126,.15);display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .15s}
    .ax:hover{background:rgba(239,68,68,.25);color:#EF4444}
    .cab{font-size:12px;color:#EF4444;cursor:pointer;border:none;background:none;font-family:inherit;font-weight:600;opacity:.75;transition:opacity .15s;white-space:nowrap}
    .cab:hover{opacity:1}

    /* POST BANNER */
    .pb{margin:0 28px 18px;padding:17px 22px;border-radius:14px;background:linear-gradient(to right,rgba(46,201,126,.08),rgba(27,125,82,.05));border:1px solid rgba(46,201,126,.17);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .pbt p{font-size:14px;font-weight:600;color:var(--t);margin-bottom:2px}
    .pbt span{font-size:12px;color:var(--tm)}
    .pbb{padding:10px 22px;border-radius:100px;font-size:13px;font-weight:700;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(46,201,126,.3);white-space:nowrap;font-family:inherit}
    .pbb:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(46,201,126,.45)}

    /* GRID */
    .ig{padding:0 28px 40px;display:grid;gap:18px}
    .ig.g3{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
    .ig.g2{grid-template-columns:repeat(auto-fill,minmax(360px,1fr))}
    .ig.lv{grid-template-columns:1fr}

    /* ITEM CARD */
    .ic{background:rgba(255,255,255,.032);border:1px solid var(--b1);border-radius:18px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;position:relative;transition:transform .26s cubic-bezier(.22,1,.36,1),border-color .26s,box-shadow .26s}
    .ic:hover{transform:translateY(-5px);border-color:rgba(46,201,126,.22);box-shadow:0 18px 54px rgba(0,0,0,.45),0 0 0 1px rgba(46,201,126,.07)}
    .ic.lc{flex-direction:row}
    .ic.lc .cim{width:220px;min-width:220px;aspect-ratio:auto;min-height:160px}
    .ic.lc .cib{padding:20px 24px}

    .cim{position:relative;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
    .cie{font-size:58px;filter:drop-shadow(0 6px 18px rgba(0,0,0,.5));z-index:1;transition:transform .3s}
    .ic:hover .cie{transform:scale(1.09)}
    .cio{position:absolute;inset:0;background:linear-gradient(to bottom,transparent 45%,rgba(0,0,0,.55));z-index:2}
    .cibg{position:absolute;top:10px;left:11px;z-index:3;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#fff;animation:bP .4s cubic-bezier(.34,1.56,.64,1) both}
    .csv{position:absolute;top:9px;right:9px;z-index:3;width:33px;height:33px;border-radius:50%;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:13px;cursor:pointer;transition:all .2s}
    .csv:hover{transform:scale(1.12);background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.4)}
    .csv.sv{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.45)}
    .cvw{position:absolute;bottom:9px;left:11px;z-index:3;font-size:10.5px;color:rgba(255,255,255,.65);display:flex;align-items:center;gap:4px}

    .cib{padding:15px;display:flex;flex-direction:column;gap:8px;flex:1}
    .cm{display:flex;align-items:center;justify-content:space-between}
    .ccat{font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
    .ccnd{display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;padding:3px 8px;border-radius:100px}
    .ccd{width:5px;height:5px;border-radius:50%;flex-shrink:0}
    .ctit{font-family:'Playfair Display',serif;font-size:15.5px;font-weight:700;color:var(--t);line-height:1.3}
    .cdsc{font-size:12.5px;color:var(--tm);line-height:1.65;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .ctags{display:flex;flex-wrap:wrap;gap:5px}
    .ctag{padding:3px 8px;border-radius:100px;background:rgba(255,255,255,.05);border:1px solid var(--b2);font-size:10.5px;color:var(--td)}

    .cf{display:flex;align-items:flex-end;justify-content:space-between;padding-top:9px;border-top:1px solid var(--b1);margin-top:auto}
    .cpr{font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:var(--g)}
    .cng{font-size:10px;color:rgba(46,201,126,.6);margin-left:3px;font-family:'Sora',sans-serif}
    .csl{display:flex;align-items:center;gap:6px}
    .cav{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5px;font-weight:700;color:#fff;flex-shrink:0}
    .csn{font-size:11.5px;font-weight:500;color:var(--tm)}
    .csr{font-size:10px;color:#F59E0B}

    .ca{display:flex;gap:7px;margin-top:3px}
    .bcon{flex:1;padding:9px;border-radius:9px;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;transition:all .2s}
    .bcon:hover{opacity:.88;transform:translateY(-1px)}
    .bdet{padding:9px 12px;border-radius:9px;border:1px solid var(--b2);background:transparent;color:var(--tm);font-family:inherit;font-size:12.5px;cursor:pointer;transition:all .2s}
    .bdet:hover{border-color:rgba(255,255,255,.28);color:var(--t);background:rgba(255,255,255,.04)}

    /* CONDITION SCORE BAR */
    .csbar{display:flex;gap:3px;margin-top:1px}
    .csbarx{flex:1;height:3px;border-radius:2px;transition:all .3s}

    /* EMPTY */
    .es{padding:80px 28px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center}
    .ei{font-size:64px;opacity:.55}
    .et{font-family:'Playfair Display',serif;font-size:24px;color:var(--t)}
    .esub{font-size:14px;color:var(--tm);max-width:300px;line-height:1.7}
    .eb{padding:11px 28px;border-radius:10px;background:var(--gd);border:1px solid rgba(46,201,126,.3);color:var(--g);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s}
    .eb:hover{background:rgba(46,201,126,.2);transform:translateY(-1px)}

    /* MODAL */
    .mo{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.82);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fiA .2s ease}
    .mb{background:#0f2018;border:1px solid rgba(255,255,255,.1);border-radius:22px;width:100%;max-width:740px;max-height:92vh;overflow-y:auto;animation:pI .35s cubic-bezier(.34,1.56,.64,1);position:relative}
    .mb::-webkit-scrollbar{width:4px}
    .mc{position:absolute;top:16px;right:16px;z-index:10;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.08);border:1px solid var(--b2);color:var(--tm);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s}
    .mc:hover{background:rgba(255,255,255,.15);color:var(--t)}
    .mh{aspect-ratio:16/7;display:flex;align-items:center;justify-content:center;border-radius:18px 18px 0 0;position:relative;overflow:hidden}
    .mhb{position:absolute;top:16px;left:16px;padding:5px 12px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#fff}
    .mbody{padding:26px 30px 30px}
    .mtit{font-family:'Playfair Display',serif;font-size:clamp(20px,2.5vw,28px);font-weight:700;color:var(--t);line-height:1.2;margin-bottom:6px}
    .mpr{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:var(--g)}
    .mdsc{font-size:14px;color:var(--tm);line-height:1.8;margin-bottom:18px}
    .mgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:18px}
    .mch{background:rgba(255,255,255,.04);border:1px solid var(--b2);border-radius:11px;padding:12px 14px}
    .mchl{font-size:10px;color:var(--td);text-transform:uppercase;letter-spacing:.12em;margin-bottom:3px}
    .mchv{font-size:13.5px;color:var(--t);font-weight:500}
    .mtags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
    .mtag{padding:4px 11px;border-radius:100px;background:rgba(46,201,126,.08);border:1px solid rgba(46,201,126,.2);font-size:12px;color:var(--g)}
    .sp{background:rgba(255,255,255,.04);border:1px solid var(--b2);border-radius:13px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:18px;flex-wrap:wrap}
    .sav{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;color:#fff;flex-shrink:0}
    .sinfo{flex:1;min-width:100px}
    .sname{font-size:15px;font-weight:600;color:var(--t);display:flex;align-items:center;gap:6px}
    .smeta{font-size:12px;color:var(--tm);margin-top:2px}
    .sstats{display:flex;gap:12px}
    .sstatv{font-size:15px;font-weight:700;color:var(--t)}
    .sstatl{font-size:10px;color:var(--td)}
    .macts{display:flex;gap:9px;flex-wrap:wrap}
    .mbp{flex:1;min-width:110px;padding:13px;border-radius:11px;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;box-shadow:0 4px 18px rgba(46,201,126,.35)}
    .mbp:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 6px 26px rgba(46,201,126,.5)}
    .mbg{padding:13px 16px;border-radius:11px;border:1.5px solid var(--b2);background:transparent;color:var(--tm);font-family:inherit;font-size:13.5px;cursor:pointer;transition:all .2s}
    .mbg:hover{border-color:rgba(255,255,255,.3);color:var(--t);background:rgba(255,255,255,.04)}

    /* OVERLAY for sidebar mobile */
    .sbo{display:none;position:fixed;inset:0;z-index:350;background:rgba(0,0,0,.6)}
    .sbo.open{display:block}

    /* FOOTER */
    .ft{border-top:1px solid var(--b1);padding:22px 28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
    .ftl{display:flex;gap:22px}
    .fta{font-size:12px;color:var(--td);text-decoration:none;transition:color .18s}
    .fta:hover{color:var(--tm)}

    /* RESPONSIVE */
    @media(max-width:1100px){.sb{width:260px;min-width:260px}.sb.collapsed{width:0;min-width:0}}
    @media(max-width:900px){
      .pw{grid-template-columns:1fr}
      .sb{display:none;position:fixed;top:0;left:0;height:100vh;width:300px;min-width:300px;z-index:360;transform:translateX(-100%);transition:transform .3s cubic-bezier(.22,1,.36,1);opacity:1;border-right-color:var(--b1)}
      .sb.open{display:flex;transform:translateX(0)}
      .sb.collapsed{width:300px;min-width:300px;opacity:1;pointer-events:auto;border-right-color:var(--b1)}
      .dftb{display:none}
      .fmb{display:flex}
    }
    @media(max-width:768px){
      .nav{padding:0 18px}
      .nls{display:none}
      .hbg{display:flex}
      .nbg{display:none}
      .tb{padding:12px 16px}
      .sw{max-width:100%}
      .hs,.ig,.pb{padding-left:16px;padding-right:16px}
      .pb{margin-left:16px;margin-right:16px}
      .ig.g3{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
      .ic.lc{flex-direction:column}
      .ic.lc .cim{width:100%;min-height:unset}
      .mbody{padding:18px 18px 22px}
      .mgrid{grid-template-columns:1fr}
      .sp{flex-direction:column;align-items:flex-start;gap:11px}
    }
    @media(max-width:480px){
      .ig.g3,.ig.g2{grid-template-columns:1fr}
      .tb{flex-wrap:wrap}
    }

    /* NOTIFICATION TOAST */
    @keyframes slideInRight{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
    @keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}
    .ntoast-wrap{position:fixed;bottom:24px;right:24px;z-index:9000;display:flex;flex-direction:column;gap:10px;pointer-events:none}
    .ntoast{pointer-events:auto;display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-radius:14px;background:#0f2018;border:1px solid rgba(46,201,126,.25);box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 0 1px rgba(46,201,126,.08);min-width:280px;max-width:340px;animation:slideInRight .38s cubic-bezier(.22,1,.36,1) forwards}
    .ntoast.out{animation:slideOutRight .3s cubic-bezier(.55,0,1,.45) forwards}
    .ntico{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
    .ntbody{flex:1;min-width:0}
    .nttitle{font-size:13px;font-weight:700;color:var(--t);margin-bottom:2px}
    .ntmsg{font-size:11.5px;color:var(--tm);line-height:1.5;word-break:break-word}
    .ntclose{width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.07);border:none;color:var(--td);font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;margin-top:1px}
    .ntclose:hover{background:rgba(239,68,68,.2);color:#EF4444}
    .ntbar{position:absolute;bottom:0;left:0;height:2px;border-radius:0 0 14px 14px;background:var(--g);animation:ntprog 4s linear forwards}
    @keyframes ntprog{from{width:100%}to{width:0%}}

    /* CONTACT PANEL inside modal */
    .cp-panel{margin-top:18px;border-radius:14px;border:1px solid rgba(255,255,255,.08);overflow:hidden}
    .cp-tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.08)}
    .cp-tab{flex:1;padding:11px 8px;font-family:inherit;font-size:12.5px;font-weight:600;border:none;background:transparent;color:var(--td);cursor:pointer;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:6px}
    .cp-tab:hover{color:var(--tm);background:rgba(255,255,255,.03)}
    .cp-tab.act{color:var(--g);background:rgba(46,201,126,.07);border-bottom:2px solid var(--g);margin-bottom:-1px}
    .cp-body{padding:16px}
    .cp-phone-info{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:11px;background:rgba(46,201,126,.06);border:1px solid rgba(46,201,126,.15)}
    .cp-phone-num{font-size:19px;font-weight:700;font-family:'Playfair Display',serif;color:var(--g);letter-spacing:.04em}
    .cp-phone-sub{font-size:11px;color:var(--tm);margin-top:2px}
    .cp-call-btn{margin-left:auto;padding:9px 18px;border-radius:9px;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;white-space:nowrap}
    .cp-call-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(46,201,126,.4)}
    .cp-field{width:100%;padding:10px 13px;border-radius:10px;background:rgba(255,255,255,.05);border:1.5px solid var(--b2);color:var(--t);font-family:inherit;font-size:13px;outline:none;transition:border-color .2s;resize:none}
    .cp-field::placeholder{color:var(--td)}
    .cp-field:focus{border-color:rgba(46,201,126,.45);background:rgba(46,201,126,.04)}
    .cp-send{width:100%;margin-top:10px;padding:11px;border-radius:10px;font-family:inherit;font-size:13.5px;font-weight:700;cursor:pointer;border:none;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s}
    .cp-send.msg{background:linear-gradient(135deg,#1D4ED8,#1e3a8a);color:#fff;box-shadow:0 4px 16px rgba(29,78,216,.3)}
    .cp-send.msg:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(29,78,216,.45)}
    .cp-send.eml{background:linear-gradient(135deg,#7C3AED,#5b21b6);color:#fff;box-shadow:0 4px 16px rgba(124,58,237,.3)}
    .cp-send.eml:hover{transform:translateY(-1px);box-shadow:0 6px 22px rgba(124,58,237,.45)}

    /* POST ITEM MODAL */
    .pmo{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.88);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fiA .2s ease}
    .pmb{background:#0d1a14;border:1px solid rgba(46,201,126,.18);border-radius:22px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;animation:pI .35s cubic-bezier(.34,1.56,.64,1);position:relative}
    .pmb::-webkit-scrollbar{width:3px}
    .pmb::-webkit-scrollbar-thumb{background:rgba(46,201,126,.3);border-radius:2px}
    .pmhead{padding:24px 28px 18px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between}
    .pmtitle{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--t)}
    .pmsub{font-size:12px;color:var(--tm);margin-top:2px}
    .pmbody{padding:22px 28px 28px;display:flex;flex-direction:column;gap:16px}
    .pm-label{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--td);margin-bottom:6px;display:block}
    .pm-req{color:#2ec97e;margin-left:2px}
    .pm-input{width:100%;padding:11px 14px;border-radius:11px;background:rgba(255,255,255,.05);border:1.5px solid var(--b2);color:var(--t);font-family:inherit;font-size:13.5px;outline:none;transition:border-color .22s,background .22s}
    .pm-input::placeholder{color:var(--td)}
    .pm-input:focus{border-color:rgba(46,201,126,.45);background:rgba(46,201,126,.04)}
    .pm-input.err{border-color:rgba(239,68,68,.55)!important}
    .pm-input.ok{border-color:rgba(46,201,126,.5);background:rgba(46,201,126,.04)}
    .pm-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .pm-submit{width:100%;padding:14px;border-radius:12px;background:linear-gradient(135deg,#2ec97e,#1b7d52);color:#fff;border:none;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 4px 22px rgba(46,201,126,.38);letter-spacing:.02em;margin-top:4px}
    .pm-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(46,201,126,.5)}
    .pm-submit:disabled{opacity:.45;cursor:not-allowed}
    .pm-photo-zone{border:2px dashed rgba(255,255,255,.13);border-radius:13px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .22s}
    .pm-photo-zone:hover,.pm-photo-zone.drag{border-color:rgba(46,201,126,.45);background:rgba(46,201,126,.04)}
    .pm-photo-zone.err-zone{border-color:rgba(239,68,68,.5)}
    .pm-photo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}
    .pm-photo-thumb{aspect-ratio:1;border-radius:9px;overflow:hidden;position:relative;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.09)}
    .pm-photo-thumb img{width:100%;height:100%;object-fit:cover}
    .pm-photo-del{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.75);border:none;color:#fff;font-size:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .18s}
    .pm-photo-thumb:hover .pm-photo-del{opacity:1}
    .pm-cover-badge{position:absolute;bottom:4px;left:4px;font-size:8px;font-weight:700;background:rgba(46,201,126,.9);color:#fff;padding:2px 6px;border-radius:100px;text-transform:uppercase;letter-spacing:.05em}
    .pm-photo-add{aspect-ratio:1;border-radius:9px;border:1.5px dashed rgba(255,255,255,.13);background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.25);font-size:20px;transition:all .2s}
    .pm-photo-add:hover{border-color:rgba(46,201,126,.35);color:#2ec97e;background:rgba(46,201,126,.05)}
    .pm-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
    .pm-chip{padding:7px 15px;border-radius:100px;font-size:12.5px;font-weight:500;border:1.5px solid rgba(255,255,255,.12);cursor:pointer;font-family:inherit;transition:all .2s;background:rgba(255,255,255,.04);color:rgba(255,255,255,.5)}
    .pm-chip.on{border-color:rgba(46,201,126,.55);background:rgba(46,201,126,.12);color:#2ec97e}
    .pm-chip.err-chip{border-color:rgba(239,68,68,.45);color:rgba(239,68,68,.7)}
    .pm-err{font-size:11px;color:#f87171;margin-top:4px}
    .pm-note{font-size:11px;color:rgba(255,255,255,.3);margin-top:5px}
    .pm-divider{height:1px;background:rgba(255,255,255,.06)}
  `}</style>
);

/* ══════════════════════════════════════════════
   CONDITION SCORE BAR
══════════════════════════════════════════════ */
const CondBar = ({ score, color }) => (
  <div className="csbar">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="csbarx" style={{ background: i <= score ? color : "rgba(255,255,255,.1)" }} />
    ))}
  </div>
);

/* ══════════════════════════════════════════════
   NOTIFICATION TOAST SYSTEM
══════════════════════════════════════════════ */
let _toastId = 0;
const toastBus = { listeners: [], emit(t){ this.listeners.forEach(fn=>fn(t)); } };
const pushNotification = (type, title, msg) => toastBus.emit({ id: ++_toastId, type, title, msg });

const TOAST_ICONS = {
  message: { icon:"💬", color:"#1D4ED8", bg:"rgba(29,78,216,.18)" },
  email:   { icon:"✉️", color:"#7C3AED", bg:"rgba(124,58,237,.18)" },
  phone:   { icon:"📞", color:"#2ec97e", bg:"rgba(46,201,126,.18)" },
  post:    { icon:"✦",  color:"#F59E0B", bg:"rgba(245,158,11,.18)" },
};

const NotificationToasts = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const fn = (t) => {
      setToasts(p => [...p, { ...t, out: false }]);
      setTimeout(() => {
        setToasts(p => p.map(x => x.id===t.id ? { ...x, out:true } : x));
        setTimeout(() => setToasts(p => p.filter(x => x.id!==t.id)), 320);
      }, 4000);
    };
    toastBus.listeners.push(fn);
    return () => { toastBus.listeners = toastBus.listeners.filter(l=>l!==fn); };
  }, []);
  return (
    <div className="ntoast-wrap">
      {toasts.map(t => {
        const { icon, color, bg } = TOAST_ICONS[t.type] || TOAST_ICONS.message;
        return (
          <div key={t.id} className={`ntoast${t.out?" out":""}`} style={{position:"relative",overflow:"hidden"}}>
            <div className="ntico" style={{background:bg}}>{icon}</div>
            <div className="ntbody">
              <div className="nttitle">{t.title}</div>
              <div className="ntmsg">{t.msg}</div>
            </div>
            <button className="ntclose" onClick={()=>setToasts(p=>p.filter(x=>x.id!==t.id))}>✕</button>
            <div className="ntbar" style={{background:color}}/>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════════
   POST ITEM MODAL
══════════════════════════════════════════════ */
const DELIVERY_OPTS = [
  { id:"pickup",   label:"Local Pickup" },
  { id:"delivery", label:"Delivery Available" },
  { id:"courier",  label:"Courier Service" },
];
const PAYMENT_OPTS = [
  { id:"cash",  label:"Cash" },
  { id:"bkash", label:"bKash" },
  { id:"nagad", label:"Nagad" },
  { id:"bank",  label:"Bank Transfer" },
];
const CATEGORIES_PM = ["Electronics","Furniture","Sports","Clothing","Books","Vehicles","Tools","Other"];
const CONDITIONS_PM  = ["New","Like New","Used","For Parts"];
const LOCATIONS_PM   = ["Dhanmondi","Gulshan","Bashundhara","Uttara","Mirpur","Mohammadpur","Rayer Bazar","Wari","Banani","Motijheel","Farmgate","Tejgaon","Other"];

const PostItemModal = ({ onClose }) => {
  const fileRef   = React.useRef(null);
  const addRef    = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [tried,    setTried]    = React.useState(false);

  const [tagInput, setTagInput] = React.useState("");
  const [form, setForm] = React.useState({
    photos:     [],
    title:      "",
    category:   "",
    condition:  "",
    brand:      "",
    model:      "",
    price:      "",
    negotiable: false,
    phone:      "",
    location:   "",
    delivery:   [],
    payment:    [],
    tradeOffer: "",
    tags:       [],
    description:"",
  });

  const set  = (k,v) => setForm(p=>({...p,[k]:v}));
  const toggleArr = (k,v) => setForm(p=>({...p,[k]: p[k].includes(v) ? p[k].filter(x=>x!==v) : [...p[k],v]}));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g,"");
    if (!t || form.tags.includes(t) || form.tags.length >= 8) return;
    set("tags",[...form.tags,t]); setTagInput("");
  };
  const removeTag = (t) => set("tags", form.tags.filter(x=>x!==t));

  const handleFiles = (files) => {
    const imgs = Array.from(files).filter(f=>f.type.startsWith("image/")).slice(0, 8 - form.photos.length);
    const withPrev = imgs.map(f => Object.assign(f,{preview:URL.createObjectURL(f)}));
    set("photos", [...form.photos, ...withPrev]);
  };
  const removePhoto = (i) => {
    const p = form.photos[i];
    if (p && p.preview) URL.revokeObjectURL(p.preview);
    set("photos", form.photos.filter((_,idx)=>idx!==i));
  };

  const valid = {
    photos:     form.photos.length > 0,
    title:      form.title.trim().length >= 3,
    category:   !!form.category,
    condition:  !!form.condition,
    brand:      form.brand.trim().length >= 1,
    model:      form.model.trim().length >= 1,
    price:      !!form.price && Number(form.price) > 0,
    phone:      form.phone.trim().length >= 9,
    location:   !!form.location,
    delivery:   form.delivery.length > 0,
    payment:    form.payment.length > 0,
    tradeOffer: form.tradeOffer === "open" || form.tradeOffer === "no",
  };
  const canSubmit = Object.values(valid).every(Boolean);

  const submit = () => {
    setTried(true);
    if (!canSubmit) return;
    pushNotification("post","Item Posted!",`"${form.title}" is now live on the marketplace.`);
    onClose();
  };

  const ic = (field) => tried && !valid[field] ? " err" : valid[field] ? " ok" : "";

  return (
    <div className="pmo" onClick={onClose}>
      <div className="pmb" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="pmhead">
          <div>
            <div className="pmtitle">✦ Post an Item</div>
            <div className="pmsub">List for free — reach thousands of buyers in Dhaka</div>
          </div>
          <button className="mc" style={{position:"static"}} onClick={onClose}>✕</button>
        </div>

        <div className="pmbody">

          {/* ── Photos (mandatory) ── */}
          <div>
            <label className="pm-label">Photos <span className="pm-req">*</span></label>
            <div
              className={`pm-photo-zone${dragging?" drag":""}${tried&&!valid.photos?" err-zone":""}`}
              onClick={()=>fileRef.current&&fileRef.current.click()}
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files);}}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{handleFiles(e.target.files);e.target.value=null;}}/>
              <div style={{fontSize:24,marginBottom:6}}>📷</div>
              <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.75)"}}>
                {form.photos.length===0 ? "Click or drag & drop photos" : "Add more photos"}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:3}}>PNG, JPG up to 10MB · max 8 photos</div>
            </div>
            {tried && !valid.photos && <div className="pm-err">At least one photo is required.</div>}
            {form.photos.length > 0 && (
              <div className="pm-photo-grid">
                {form.photos.map((p,i)=>(
                  <div key={i} className="pm-photo-thumb">
                    <img src={p.preview} alt={`Photo ${i+1}`}/>
                    {i===0 && <span className="pm-cover-badge">Cover</span>}
                    <button className="pm-photo-del" onClick={e=>{e.stopPropagation();removePhoto(i);}}>✕</button>
                  </div>
                ))}
                {form.photos.length < 8 && (
                  <button className="pm-photo-add" onClick={e=>{e.stopPropagation();fileRef.current&&fileRef.current.click();}}>+</button>
                )}
              </div>
            )}
          </div>

          <div className="pm-divider"/>

          {/* ── Title ── */}
          <div>
            <label className="pm-label">Item Title <span className="pm-req">*</span></label>
            <input className={`pm-input${ic("title")}`} placeholder="e.g. Samsung Galaxy S23 Ultra 256GB" value={form.title} onChange={e=>set("title",e.target.value)} maxLength={100}/>
            {tried && !valid.title && <div className="pm-err">Title is required (min 3 characters).</div>}
          </div>

          {/* ── Category & Condition ── */}
          <div className="pm-row">
            <div>
              <label className="pm-label">Category <span className="pm-req">*</span></label>
              <select className={`pm-input ls${ic("category")}`} style={{padding:"11px 14px"}} value={form.category} onChange={e=>set("category",e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES_PM.map(c=><option key={c}>{c}</option>)}
              </select>
              {tried && !valid.category && <div className="pm-err">Required.</div>}
            </div>
            <div>
              <label className="pm-label">Condition <span className="pm-req">*</span></label>
              <select className={`pm-input ls${ic("condition")}`} style={{padding:"11px 14px"}} value={form.condition} onChange={e=>set("condition",e.target.value)}>
                <option value="">Select…</option>
                {CONDITIONS_PM.map(c=><option key={c}>{c}</option>)}
              </select>
              {tried && !valid.condition && <div className="pm-err">Required.</div>}
            </div>
          </div>

          {/* ── Brand & Model ── */}
          <div className="pm-row">
            <div>
              <label className="pm-label">Brand <span className="pm-req">*</span></label>
              <input className={`pm-input${ic("brand")}`} placeholder="e.g. Samsung, Apple, Otobi…" value={form.brand} onChange={e=>set("brand",e.target.value)} maxLength={60}/>
              {tried && !valid.brand && <div className="pm-err">Brand is required.</div>}
            </div>
            <div>
              <label className="pm-label">Model <span className="pm-req">*</span></label>
              <input className={`pm-input${ic("model")}`} placeholder="e.g. Galaxy S23, iPhone 13…" value={form.model} onChange={e=>set("model",e.target.value)} maxLength={60}/>
              {tried && !valid.model && <div className="pm-err">Model is required.</div>}
            </div>
          </div>

          {/* ── Price & Phone ── */}
          <div className="pm-row">
            <div>
              <label className="pm-label">Price (BDT) <span className="pm-req">*</span></label>
              <input className={`pm-input${ic("price")}`} placeholder="0" type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)}/>
              {tried && !valid.price && <div className="pm-err">Enter a valid price.</div>}
            </div>
            <div>
              <label className="pm-label">Phone Number <span className="pm-req">*</span></label>
              <input className={`pm-input${ic("phone")}`} placeholder="+880 1xxx-xxxxxx" type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)}/>
              {tried && !valid.phone && <div className="pm-err">Required (min 9 digits).</div>}
            </div>
          </div>

          {/* ── Negotiable toggle ── */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 2px"}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.8)"}}>Price is Negotiable</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>Buyers will see a "Negotiable" badge on your listing</div>
            </div>
            <label style={{position:"relative",width:44,height:24,flexShrink:0,cursor:"pointer"}}>
              <input type="checkbox" checked={form.negotiable} onChange={e=>set("negotiable",e.target.checked)} style={{opacity:0,width:0,height:0,position:"absolute"}}/>
              <span style={{
                position:"absolute",inset:0,borderRadius:12,cursor:"pointer",transition:"all .25s",
                background: form.negotiable ? "rgba(46,201,126,.3)" : "rgba(255,255,255,.12)",
                border: form.negotiable ? "1px solid rgba(46,201,126,.6)" : "1px solid rgba(255,255,255,.15)"
              }}>
                <span style={{
                  position:"absolute",top:3,left: form.negotiable ? 23 : 3,width:16,height:16,
                  borderRadius:"50%",transition:"all .25s",
                  background: form.negotiable ? "#2ec97e" : "rgba(255,255,255,.5)",
                  boxShadow: form.negotiable ? "0 2px 8px rgba(46,201,126,.55)" : "none"
                }}/>
              </span>
            </label>
          </div>

          {/* ── Location ── */}
          <div>
            <label className="pm-label">Location <span className="pm-req">*</span></label>
            <select className={`pm-input ls${ic("location")}`} style={{padding:"11px 14px"}} value={form.location} onChange={e=>set("location",e.target.value)}>
              <option value="">Select area…</option>
              {LOCATIONS_PM.map(l=><option key={l}>{l}</option>)}
            </select>
            {tried && !valid.location && <div className="pm-err">Location is required.</div>}
          </div>

          <div className="pm-divider"/>

          {/* ── Delivery Options (mandatory) ── */}
          <div>
            <label className="pm-label">Delivery / Pickup <span className="pm-req">*</span></label>
            <div className="pm-chips">
              {DELIVERY_OPTS.map(o=>(
                <button
                  key={o.id}
                  className={`pm-chip${form.delivery.includes(o.id)?" on":""}${tried&&!valid.delivery&&!form.delivery.includes(o.id)?" err-chip":""}`}
                  onClick={()=>toggleArr("delivery",o.id)}
                >{o.label}</button>
              ))}
            </div>
            {tried && !valid.delivery && <div className="pm-err">Select at least one delivery option.</div>}
          </div>

          {/* ── Payment Methods (mandatory) ── */}
          <div>
            <label className="pm-label">Accepted Payment <span className="pm-req">*</span></label>
            <div className="pm-chips">
              {PAYMENT_OPTS.map(o=>(
                <button
                  key={o.id}
                  className={`pm-chip${form.payment.includes(o.id)?" on":""}${tried&&!valid.payment&&!form.payment.includes(o.id)?" err-chip":""}`}
                  onClick={()=>toggleArr("payment",o.id)}
                >{o.label}</button>
              ))}
            </div>
            {tried && !valid.payment && <div className="pm-err">Select at least one payment method.</div>}
          </div>

          {/* ── Trade Offer (mandatory) ── */}
          <div>
            <label className="pm-label">Trade / Barter <span className="pm-req">*</span></label>
            <div className="pm-chips">
              <button
                className={`pm-chip${form.tradeOffer==="open"?" on":""}${tried&&!valid.tradeOffer?" err-chip":""}`}
                onClick={()=>set("tradeOffer","open")}
              >🔄 Open to Trade</button>
              <button
                className={`pm-chip${form.tradeOffer==="no"?" on":""}${tried&&!valid.tradeOffer?" err-chip":""}`}
                onClick={()=>set("tradeOffer","no")}
              >🚫 Not Accepting Trades</button>
            </div>
            {tried && !valid.tradeOffer && <div className="pm-err">Please select a trade preference.</div>}
            {form.tradeOffer==="open" && <div className="pm-note">💡 Buyers will see you're open to exchanging for other items.</div>}
          </div>

          {/* ── Tags (optional, up to 8) ── */}
          <div>
            <label className="pm-label">Search Tags <span style={{fontSize:10,fontWeight:400,color:"rgba(255,255,255,.3)",textTransform:"none",letterSpacing:0}}>(optional · max 8)</span></label>
            <div style={{display:"flex",gap:8}}>
              <input
                className="pm-input"
                placeholder="Add a tag, e.g. iphone, shimano…"
                value={tagInput}
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addTag();}}}
                style={{flex:1}}
                maxLength={24}
              />
              <button
                onClick={addTag}
                style={{padding:"0 16px",borderRadius:11,border:"1.5px solid rgba(46,201,126,.35)",background:"rgba(46,201,126,.08)",color:"#2ec97e",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}
              >+ Add</button>
            </div>
            {form.tags.length > 0 && (
              <div className="pm-chips" style={{marginTop:8}}>
                {form.tags.map(t=>(
                  <button key={t} className="pm-chip on" onClick={()=>removeTag(t)} style={{display:"flex",alignItems:"center",gap:5}}>
                    #{t} <span style={{fontSize:10,opacity:.7}}>✕</span>
                  </button>
                ))}
              </div>
            )}
            <div className="pm-note">Tags help buyers find your listing faster · press Enter or click Add</div>
          </div>

          <div className="pm-divider"/>

          {/* ── Description ── */}
          <div>
            <label className="pm-label">Description</label>
            <textarea className="pm-input" rows={3} placeholder="Describe your item — condition details, brand, model, what's included…" value={form.description} onChange={e=>set("description",e.target.value)} style={{resize:"vertical"}} maxLength={800}/>
            <div className="pm-note">{form.description.length}/800 characters</div>
          </div>

          <button className="pm-submit" disabled={tried && !canSubmit} onClick={submit}>✦ Post Item for Free</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ITEM CARD
══════════════════════════════════════════════ */
const ItemCard = ({ item, view, onOpen, saved, onSave }) => {
  const ci = cInfo(item.condition);
  const isList = view === "list";
  const bm = item.badge ? bMeta(item.badge) : null;
  const da = dAgo(item.postedDate);

  return (
    <div
      className={`ic fu${isList ? " lc" : ""}`}
      onClick={() => onOpen(item, "details")}
    >
      <div className="cim" style={{ background:`linear-gradient(135deg,${item.accentColor}22,${item.accentColor}09)`, height:isList?"auto":undefined }}>
        {item.image ? (
          <img src={item.image} alt={item.title} style={{maxWidth:"100%",maxHeight:"100%",objectFit:"cover",borderRadius:12,boxShadow:"0 4px 18px rgba(0,0,0,.18)"}} />
        ) : (
          <span className="cie">{item.emoji}</span>
        )}
        <div className="cio" />
        {bm && <span className="cibg" style={{ background:bm.bg, boxShadow:`0 4px 14px ${bm.glow}` }}>{item.badge}</span>}
        <button className={`csv${saved?" sv":""}`} onClick={e=>{e.stopPropagation();onSave(item.id);}}>
          {saved ? "❤️" : "🤍"}
        </button>
        <div className="cvw">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:10,height:10}}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {item.views}
        </div>
      </div>

      <div className="cib">
        <div className="cm">
          <span className="ccat" style={{color:item.accentColor}}>{item.category}</span>
          <span className="ccnd" style={{background:ci.bg,color:ci.color}}>
            <span className="ccd" style={{background:ci.color}}/>
            {item.condition}
          </span>
        </div>
        <h3 className="ctit">{item.title}</h3>
        <p className="cdsc">{item.description}</p>

        {isList && (
          <>
            <div className="ctags">{item.tags.slice(0,3).map(t=><span key={t} className="ctag">#{t}</span>)}</div>
            <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:2}}>
              {[
                {icon:"📍",val:item.seller.location},
                {icon:"🚚",val:item.shipping},
                {icon:"🕐",val:da===0?"Today":da===1?"Yesterday":`${da}d ago`},
              ].map(d=>(
                <span key={d.icon} style={{fontSize:11,color:"rgba(255,255,255,.38)",display:"flex",alignItems:"center",gap:4}}>
                  {d.icon} {d.val}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="cf">
          <div>
            <span className="cpr">৳{fmt(item.price)}</span>
            {item.negotiable && <span className="cng">Neg.</span>}
          </div>
          <div className="csl">
            <div className="cav" style={{background:`linear-gradient(135deg,${item.accentColor},${item.accentColor}88)`}}>{item.seller.avatar}</div>
            <div>
              <div className="csn">{item.seller.name.split(" ")[0]}{item.seller.verified&&<span style={{color:"#2ec97e",fontSize:9,marginLeft:2}}>✓</span>}</div>
              <div className="csr">{"★".repeat(Math.round(item.seller.rating))} {item.seller.rating}</div>
            </div>
          </div>
        </div>

        <div className="ca" onClick={e=>e.stopPropagation()}>
          <button className="bcon" onClick={()=>onOpen(item, "contact")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:12,height:12}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.04 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>
            Contact
          </button>
          <button className="bdet" onClick={()=>onOpen(item, "details")}>View Details</button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   DETAILS MODAL
══════════════════════════════════════════════ */
const DetailsModal = ({ item, onClose, saved, onSave }) => {
  const ci = cInfo(item.condition);
  const bm = item.badge ? bMeta(item.badge) : null;
  const da = dAgo(item.postedDate);

  return (
    <div className="mo" onClick={onClose}>
      <div className="mb" onClick={e=>e.stopPropagation()}>
        <button className="mc" onClick={onClose}>✕</button>

        {/* Hero image area */}
        <div className="mh" style={{background:`linear-gradient(135deg,${item.accentColor}28,${item.accentColor}0b)`}}>
          {item.image ? (
            <img src={item.image} alt={item.title} style={{maxWidth:"100%",maxHeight:220,objectFit:"contain",borderRadius:18,boxShadow:"0 8px 28px rgba(0,0,0,.18)"}} />
          ) : (
            <span style={{fontSize:110,filter:"drop-shadow(0 8px 28px rgba(0,0,0,.5))"}}>{item.emoji}</span>
          )}
          {bm && <span className="mhb" style={{background:bm.bg,boxShadow:`0 4px 20px ${bm.glow}`}}>{item.badge}</span>}
          <div style={{position:"absolute",bottom:14,right:16,display:"flex",gap:14,fontSize:12,color:"rgba(255,255,255,.6)"}}>
            <span>👁 {item.views}</span><span>❤️ {item.saves}</span>
          </div>
        </div>

        <div className="mbody">
          {/* Title + price */}
          <h2 className="mtit">{item.title}</h2>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16}}>
            <div>
              <span className="mpr">৳{fmt(item.price)}</span>
              {item.negotiable && <span style={{marginLeft:10,fontSize:12,padding:"3px 10px",borderRadius:100,background:"rgba(46,201,126,.1)",color:"rgba(46,201,126,.8)",border:"1px solid rgba(46,201,126,.2)"}}>Negotiable</span>}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span className="ccnd" style={{background:ci.bg,color:ci.color,fontSize:12}}>
                <span className="ccd" style={{background:ci.color}}/>{item.condition}
              </span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.32)"}}>
                {da===0?"Posted today":da===1?"Posted yesterday":`Posted ${da}d ago`}
              </span>
            </div>
          </div>

          {/* Condition score */}
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:7}}>Condition Score</div>
            <CondBar score={item.conditionScore} color={ci.color} />
          </div>

          {/* Description */}
          <p className="mdsc">{item.description}</p>

          {/* Detail grid */}
          <div className="mgrid">
            {[
              {label:"Category",    val:item.category},
              {label:"Brand / Model", val:`${item.brand} — ${item.model}`},
              {label:"Location",    val:item.seller.location},
              {label:"Shipping",    val:item.shipping},
              {label:"Payment",     val:item.payment.join(", ")},
              {label:"Trade Offer", val:item.tradeOffer?"✅ Open to trade":"Not accepting"},
            ].map(d=>(
              <div key={d.label} className="mch">
                <div className="mchl">{d.label}</div>
                <div className="mchv">{d.val}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mtags">{item.tags.map(t=><span key={t} className="mtag">#{t}</span>)}</div>

          {/* Seller strip */}
          <div className="sp">
            <div className="sav" style={{background:`linear-gradient(135deg,${item.accentColor},${item.accentColor}88)`}}>{item.seller.avatar}</div>
            <div className="sinfo">
              <div className="sname">
                {item.seller.name}
                {item.seller.verified && <span style={{fontSize:13}}>✅</span>}
              </div>
              <div className="smeta">📍 {item.seller.location} · ⚡ Responds {item.seller.responseTime}</div>
            </div>
            <div className="sstats">
              <div style={{textAlign:"center"}}>
                <div className="sstatv" style={{color:"#F59E0B"}}>{"★".repeat(Math.round(item.seller.rating))}</div>
                <div className="sstatl">{item.seller.rating} Rating</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div className="sstatv">{item.seller.reviews}</div>
                <div className="sstatl">Reviews</div>
              </div>
            </div>
          </div>

          {/* Save only */}
          <div style={{marginTop:4,display:"flex",justifyContent:"flex-end"}}>
            <button className="mbg" onClick={()=>onSave(item.id)} style={{borderColor:saved?"rgba(239,68,68,.4)":"",color:saved?"#EF4444":""}}>
              {saved?"❤️ Saved":"🤍 Save Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   CONTACT MODAL
══════════════════════════════════════════════ */
const ContactModal = ({ item, onClose }) => {
  const [tab, setTab] = useState("phone");
  const [msgText, setMsgText]   = useState("");
  const [emailSubj, setEmailSubj] = useState(`Re: ${item.title}`);
  const [emailBody, setEmailBody] = useState("");
  const sellerPhone = "+880 1711-234567";
  const sellerEmail = `${item.seller.name.toLowerCase().replace(" ",".")}@gmail.com`;

  const sendMessage = () => {
    if (!msgText.trim()) return;
    pushNotification("message","Message Sent!",`Your message to ${item.seller.name} was delivered. They respond ${item.seller.responseTime}.`);
    setMsgText("");
  };
  const sendEmail = () => {
    if (!emailBody.trim()) return;
    pushNotification("email","Email Sent!",`Your email about "${item.title}" was sent to ${item.seller.name}.`);
    setEmailBody("");
  };
  const callSeller = () => {
    pushNotification("phone","Call Initiated",`Connecting you to ${item.seller.name} at ${sellerPhone}…`);
  };

  return (
    <div className="mo" onClick={onClose}>
      <div className="mb" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
        <button className="mc" onClick={onClose}>✕</button>

        {/* Compact seller header */}
        <div style={{padding:"28px 28px 20px",borderBottom:"1px solid var(--b1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:`linear-gradient(135deg,${item.accentColor},${item.accentColor}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",flexShrink:0}}>
              {item.seller.avatar}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:700,color:"var(--t)",display:"flex",alignItems:"center",gap:6}}>
                {item.seller.name}
                {item.seller.verified && <span style={{fontSize:13}}>✅</span>}
              </div>
              <div style={{fontSize:12,color:"var(--tm)",marginTop:2}}>
                📍 {item.seller.location} · ⚡ Responds {item.seller.responseTime}
              </div>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:16,color:"#F59E0B",fontWeight:700}}>★ {item.seller.rating}</div>
              <div style={{fontSize:10,color:"var(--td)"}}>{item.seller.reviews} reviews</div>
            </div>
          </div>
          {/* Item reference pill */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 13px",borderRadius:10,background:"rgba(255,255,255,.04)",border:"1px solid var(--b2)"}}>
            {item.image ? (
              <img src={item.image} alt={item.title} style={{width:38,height:38,objectFit:"cover",borderRadius:8,boxShadow:"0 2px 8px rgba(0,0,0,.10)"}} />
            ) : (
              <span style={{fontSize:22}}>{item.emoji}</span>
            )}
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--t)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
              <div style={{fontSize:12,color:"var(--g)",fontWeight:700,fontFamily:"'Playfair Display',serif"}}>৳{fmt(item.price)}</div>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{display:"flex",borderBottom:"1px solid var(--b1)"}}>
          {[
            {key:"phone",   icon:"📞", label:"Call"},
            {key:"message", icon:"💬", label:"Message"},
            {key:"email",   icon:"✉️", label:"Email"},
          ].map(t=>(
            <button key={t.key} className={`cp-tab${tab===t.key?" act":""}`} onClick={()=>setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="cp-body" style={{padding:"20px 28px 28px"}}>
          {tab==="phone" && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:13,color:"var(--tm)"}}>Call {item.seller.name.split(" ")[0]} directly to discuss the item and arrange a meeting.</div>
              <div className="cp-phone-info">
                <div style={{fontSize:28}}>📞</div>
                <div style={{flex:1}}>
                  <div className="cp-phone-num">{sellerPhone}</div>
                  <div className="cp-phone-sub">Available · Responds {item.seller.responseTime}</div>
                </div>
                <button className="cp-call-btn" onClick={callSeller}>Call Now</button>
              </div>
              <div style={{fontSize:11.5,color:"var(--td)",textAlign:"center",padding:"8px 0"}}>
                💡 Tip: Mention the item title when you call for faster service
              </div>
            </div>
          )}

          {tab==="message" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:13,color:"var(--tm)"}}>
                Send a message to <strong style={{color:"var(--t)"}}>{item.seller.name}</strong> — they'll reply {item.seller.responseTime}.
              </div>
              <textarea
                className="cp-field"
                rows={5}
                placeholder={`Hi ${item.seller.name.split(" ")[0]}, I'm interested in "${item.title}". Is it still available?`}
                value={msgText}
                onChange={e=>setMsgText(e.target.value)}
              />
              <button className="cp-send msg" onClick={sendMessage} style={{opacity:msgText.trim()?1:0.5}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:14,height:14}}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                Send Message
              </button>
            </div>
          )}

          {tab==="email" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:11.5,color:"var(--td)"}}>
                To: <span style={{color:"var(--tm)"}}>{sellerEmail}</span>
              </div>
              <input className="cp-field" placeholder="Subject" value={emailSubj} onChange={e=>setEmailSubj(e.target.value)}/>
              <textarea
                className="cp-field"
                rows={5}
                placeholder="Write your message here…"
                value={emailBody}
                onChange={e=>setEmailBody(e.target.value)}
              />
              <button className="cp-send eml" onClick={sendEmail} style={{opacity:emailBody.trim()?1:0.5}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{width:14,height:14}}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Send Email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function MarketplacePage() {
  const [category,     setCategory]     = useState("All");
  const [conditions,   setConditions]   = useState([]);
  const [maxPrice,     setMaxPrice]     = useState(100000);
  const [location,     setLocation]     = useState("All Areas");
  const [minRating,    setMinRating]    = useState(0);
  const [onlyNeg,      setOnlyNeg]      = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyTrade,    setOnlyTrade]    = useState(false);
  const [search,       setSearch]       = useState("");
  const [sort,         setSort]         = useState("newest");
  const [view,         setView]         = useState("g3");
  const [saved,        setSaved]        = useState(new Set());
  const [selected,     setSelected]     = useState(null);
  const [sortOpen,     setSortOpen]     = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [mobileMenu,   setMobileMenu]   = useState(false);
  const [collapsed,    setCollapsed]    = useState({});
  const [filterOpen,   setFilterOpen]   = useState(true);
  const [postModal,    setPostModal]    = useState(false);
  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));
  const sortRef = useRef(null);

  const PRICE_PRESETS = [{label:"< 5K",val:5000},{label:"< 20K",val:20000},{label:"< 50K",val:50000},{label:"All",val:100000}];

  const toggleCond = (l) => setConditions(p => p.includes(l) ? p.filter(c=>c!==l) : [...p,l]);
  const toggleSave = (id) => setSaved(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const reset = () => { setCategory("All");setConditions([]);setMaxPrice(100000);setLocation("All Areas");setMinRating(0);setOnlyNeg(false);setOnlyVerified(false);setOnlyTrade(false);setSearch(""); };

  // Outside click for sort
  useEffect(() => {
    const h = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = MOCK_ITEMS.filter(item => {
    if (category !== "All" && item.category !== category) return false;
    if (conditions.length > 0 && !conditions.includes(item.condition)) return false;
    if (item.price > maxPrice) return false;
    if (location !== "All Areas" && !item.seller.location.toLowerCase().includes(location.toLowerCase())) return false;
    if (minRating > 0 && item.seller.rating < minRating) return false;
    if (onlyNeg && !item.negotiable) return false;
    if (onlyVerified && !item.seller.verified) return false;
    if (onlyTrade && !item.tradeOffer) return false;
    if (search) {
      const q = search.toLowerCase();
      if (![item.title,item.category,item.brand,...item.tags].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a,b) => {
    if (sort==="price_asc")  return a.price-b.price;
    if (sort==="price_desc") return b.price-a.price;
    if (sort==="popular")    return b.views-a.views;
    if (sort==="rating")     return b.seller.rating-a.seller.rating;
    if (sort==="most_saved") return b.saves-a.saves;
    return new Date(b.postedDate)-new Date(a.postedDate);
  });

  const activeFilters = [
    category!=="All"       && {key:"cat",  label:category},
    ...conditions.map(c   => ({key:`c-${c}`,label:c})),
    maxPrice<100000        && {key:"price", label:`≤ ৳${fmt(maxPrice)}`},
    location!=="All Areas" && {key:"loc",  label:location},
    minRating>0            && {key:"rat",  label:`★ ${minRating}+`},
    onlyNeg                && {key:"neg",  label:"Negotiable"},
    onlyVerified           && {key:"ver",  label:"Verified"},
    onlyTrade              && {key:"tra",  label:"Trade"},
  ].filter(Boolean);

  const removeFilter = (key) => {
    if (key==="cat")  setCategory("All");
    else if (key.startsWith("c-")) setConditions(p=>p.filter(c=>`c-${c}`!==key));
    else if (key==="price") setMaxPrice(100000);
    else if (key==="loc")   setLocation("All Areas");
    else if (key==="rat")   setMinRating(0);
    else if (key==="neg")   setOnlyNeg(false);
    else if (key==="ver")   setOnlyVerified(false);
    else if (key==="tra")   setOnlyTrade(false);
  };

  const sortLabel = SORT_OPTIONS.find(o=>o.value===sort)?.label;
  const hasFilters = activeFilters.length > 0;

  return (
    <div style={{minHeight:"100vh",background:"var(--d2)"}}>
      <G />

      {/* NAV */}
      <nav className="nav">
        <a className="nl" href="/">
          <div className="nlm">P</div>
          <span className="nlt">Proti-Binimoy</span>
        </a>
        <div className="nls">
          {["Home","Marketplace","How It Works","About"].map(l=>(
            <a key={l} href="#" className={`nla${l==="Marketplace"?" active":""}`}>{l}</a>
          ))}
        </div>
        <div className="nr">
          <button className="nib" title="Notifications">🔔<span className="nbadge">3</span></button>
          <button className="nib" title="Saved">{saved.size>0?`❤️`:"🤍"}{saved.size>0&&<span className="nbadge">{saved.size}</span>}</button>
          <button className="nb nbg">Sign In</button>
          <button className="nb nbp" onClick={()=>setPostModal(true)}>+ Post Item</button>
          <button className="hbg" onClick={()=>setMobileMenu(!mobileMenu)}><span/><span/><span/></button>
        </div>
      </nav>
      <div className={`mmenu${mobileMenu?" open":""}`}>
        {["Home","Marketplace","How It Works","About"].map(l=><a key={l} href="#" className="mml">{l}</a>)}
        <button className="nb nbp" style={{marginTop:16,width:"100%",borderRadius:12,padding:14}} onClick={()=>{setPostModal(true);setMobileMenu(false);}}>+ Post an Item</button>
      </div>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="sbo open" onClick={()=>setSidebarOpen(false)}/>}

      <div className="pw">
        {/* ════ SIDEBAR ════ */}
        <aside className={`sb${sidebarOpen?" open":""}${!filterOpen?" collapsed":""}`} style={{display:"flex",flexDirection:"column"}}>
          <div style={{flex:1,overflowY:"auto"}}>
            <div className="sbh">
              <span className="sbt">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13,opacity:.6}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Smart Filters
                {hasFilters && <span style={{background:"var(--g)",color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>{activeFilters.length}</span>}
              </span>
              <button className={`sbc${hasFilters?" vis":""}`} onClick={reset}>Reset all</button>
            </div>

            {/* Active chips summary */}
            {hasFilters && (
              <div className="sac">
                {activeFilters.map(f=>(
                  <span key={f.key} className="sfc">
                    {f.label}
                    <span className="sfx" onClick={()=>removeFilter(f.key)}>✕</span>
                  </span>
                ))}
              </div>
            )}

            {/* CATEGORIES */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("cat")}> 
                <div className="sbl" style={{margin:0}}>Category</div>
                <span className={`sbs-chevron${!collapsed.cat?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.cat ? 0 : 320}} aria-hidden={!!collapsed.cat}>
                <div className="cl" style={{marginTop:13}}>
                  {CATEGORIES.map(cat=>(
                    <button key={cat.label} className={`ci${category===cat.label?" act":""}`} onClick={()=>{setCategory(cat.label);setSidebarOpen(false);}}>
                      <div className="cii" style={{background:`${cat.color}18`,color:cat.color}}>{cat.icon}</div>
                      <span className="cin">{cat.label}</span>
                      <span className="cic">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PRICE RANGE */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("price")}> 
                <div className="sbl" style={{margin:0}}>Price Range</div>
                <span className={`sbs-chevron${!collapsed.price?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.price ? 0 : 200}} aria-hidden={!!collapsed.price}>
                <div style={{marginTop:13}}>
                  <div className="pd">
                    <div>
                      <div className="pl">Up to</div>
                      <div className="pv">৳{fmt(maxPrice)}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="pl">Max</div>
                      <div style={{fontSize:13,color:"rgba(255,255,255,.3)"}}>৳1,00,000</div>
                    </div>
                  </div>
                  <div className="rw">
                    <div className="rt"><div className="rf" style={{width:`${(maxPrice/100000)*100}%`}}/></div>
                    <input type="range" className="rs" min={0} max={100000} step={500} value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/>
                  </div>
                  <div className="pps">
                    {PRICE_PRESETS.map(p=>(
                      <button key={p.label} className={`pp${maxPrice===p.val?" act":""}`} onClick={()=>setMaxPrice(p.val)}>{p.label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CONDITION */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("cond")}> 
                <div className="sbl" style={{margin:0}}>Condition</div>
                <span className={`sbs-chevron${!collapsed.cond?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.cond ? 0 : 140}} aria-hidden={!!collapsed.cond}>
                <div className="cg" style={{marginTop:13}}>
                  {CONDITIONS.map(c=>{
                    const isA = conditions.includes(c.label);
                    return (
                      <button key={c.label} className={`cp${isA?" act":""}`} onClick={()=>toggleCond(c.label)}
                        style={{borderColor:isA?c.color:"var(--b2)",background:isA?c.bg:"rgba(255,255,255,.04)",color:isA?c.color:"var(--tm)",boxShadow:isA?`0 4px 12px ${c.color}33`:"none"}}>
                        {isA && <span style={{fontSize:10}}>✓</span>} {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("loc")}> 
                <div className="sbl" style={{margin:0}}>Location</div>
                <span className={`sbs-chevron${!collapsed.loc?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.loc ? 0 : 70}} aria-hidden={!!collapsed.loc}>
                <div style={{marginTop:13}}>
                  <select className="ls" value={location} onChange={e=>setLocation(e.target.value)}>
                    {LOCATIONS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* MINIMUM RATING */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("rat")}> 
                <div className="sbl" style={{margin:0}}>Min. Seller Rating</div>
                <span className={`sbs-chevron${!collapsed.rat?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.rat ? 0 : 220}} aria-hidden={!!collapsed.rat}>
                <div style={{marginTop:6}}>
                  {[0,3,4,4.5,5].map(r=>(
                    <label key={r} className="rr" onClick={()=>setMinRating(r)}>
                      {r===0
                        ? <span style={{fontSize:12,color:"var(--td)"}}>Any rating</span>
                        : <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=><span key={i} className={`rstar${i<=r?" on":" off"}`}>★</span>)}</div>
                      }
                      {r>0&&<span className="rlabel">{r}+ only</span>}
                      <input type="radio" className="rrad" checked={minRating===r} readOnly/>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SMART TOGGLES */}
            <div className="sbs">
              <div className="sbs-header" onClick={()=>toggleSection("smart")}> 
                <div className="sbl" style={{margin:0}}>Smart Filters</div>
                <span className={`sbs-chevron${!collapsed.smart?" open":""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><path d="M6 9l6 6 6-6"/></svg>
                </span>
              </div>
              <div className="sbs-body" style={{maxHeight: collapsed.smart ? 0 : 160}} aria-hidden={!!collapsed.smart}>
                <div style={{marginTop:4}}>
                  {[
                    {label:"💰 Negotiable only",   v:onlyNeg,      s:setOnlyNeg},
                    {label:"✅ Verified sellers",  v:onlyVerified,  s:setOnlyVerified},
                    {label:"🔄 Open to trade",     v:onlyTrade,     s:setOnlyTrade},
                  ].map(t=>(
                    <div key={t.label} className="tr">
                      <span className="trl">{t.label}</span>
                      <label className="ts">
                        <input type="checkbox" checked={t.v} onChange={e=>t.s(e.target.checked)}/>
                        <span className="tt"/>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{position:"sticky",bottom:0,background:"var(--d3)",zIndex:10,paddingTop:10}}>
            <button className="sba" onClick={()=>setSidebarOpen(false)}>
              ✦ Apply Filters{hasFilters?` (${activeFilters.length})`:""}
            </button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <main className="main">
          {/* TOPBAR */}
          <div className="tb">
            <div className="sw">
              <svg className="sic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:16,height:16}}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input className="si" placeholder="Search items, brands, categories…" value={search} onChange={e=>setSearch(e.target.value)}/>
              {search && <button className="scl" onClick={()=>setSearch("")}>✕</button>}
            </div>
            <div className="tc">
              {/* Desktop filter toggle */}
              <button className={`dftb${filterOpen?" active":""}`} onClick={()=>setFilterOpen(v=>!v)}>
                <svg className="dftb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
                {hasFilters && <span style={{background:"var(--g)",color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>{activeFilters.length}</span>}
              </button>

              {/* Mobile filter */}
              <button className="fmb" onClick={()=>setSidebarOpen(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters
                {hasFilters&&<span style={{background:"var(--g)",color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{activeFilters.length}</span>}
              </button>

              {/* Sort */}
              <div className="srtw" ref={sortRef}>
                <button className={`srtb${sortOpen?" open":""}`} onClick={()=>setSortOpen(!sortOpen)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:13,height:13}}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  {sortLabel}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:11,height:11,transition:"transform .2s",transform:sortOpen?"rotate(180deg)":"none"}}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {sortOpen && (
                  <div className="srtd">
                    {SORT_OPTIONS.map(o=>(
                      <button key={o.value} className={`srto${sort===o.value?" act":""}`} onClick={()=>{setSort(o.value);setSortOpen(false);}}>
                        <span className="srti">{o.icon}</span>
                        {o.label}
                        {sort===o.value&&<span style={{marginLeft:"auto",fontSize:13}}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View toggle */}
              <div className="vt">
                <button className={`vb${view==="g3"?" act":""}`} onClick={()=>setView("g3")} title="Grid">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width:14,height:14}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <button className={`vb${view==="lv"?" act":""}`} onClick={()=>setView("lv")} title="List">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS + ACTIVE CHIPS */}
          <div className="hs">
            <div className="rc">
              <strong>{filtered.length}</strong> {filtered.length===1?"item":"items"} found
              {search&&<span style={{color:"rgba(255,255,255,.4)"}}> for "<span style={{color:"var(--g)"}}>{search}</span>"</span>}
            </div>
            {(hasFilters||search)&&(
              <div className="ach">
                {activeFilters.map(f=>(
                  <span key={f.key} className="ac">
                    {f.label}
                    <span className="ax" onClick={()=>removeFilter(f.key)}>✕</span>
                  </span>
                ))}
                <button className="cab" onClick={reset}>Clear all</button>
              </div>
            )}
          </div>

          {/* GRID */}
          {filtered.length > 0 ? (
            <div className={`ig ${view}`}>
              {filtered.map(item=>(
                <ItemCard
                  key={item.id}
                  item={item}
                  view={view==="lv"?"list":"grid"}
                  onOpen={(item, mode) => setSelected({ item, mode })}
                  saved={saved.has(item.id)}
                  onSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="es">
              <div className="ei">🔍</div>
              <h3 className="et">No items match</h3>
              <p className="esub">Try adjusting your filters or search. {MOCK_ITEMS.length} items are available.</p>
              <button className="eb" onClick={reset}>Clear all filters</button>
            </div>
          )}

          {/* FOOTER */}
          <div className="ft">
            <p style={{fontSize:12,color:"var(--td)"}}>© 2025 Proti-Binimoy. All rights reserved.</p>
            <div className="ftl">
              {["Privacy","Terms","Contact","Help"].map(l=><a key={l} href="#" className="fta">{l}</a>)}
            </div>
          </div>
        </main>
      </div>

      {/* DETAILS MODAL */}
      {selected && selected.mode === "details" && (
        <DetailsModal
          item={selected.item}
          onClose={()=>setSelected(null)}
          saved={saved.has(selected.item.id)}
          onSave={toggleSave}
        />
      )}

      {/* CONTACT MODAL */}
      {selected && selected.mode === "contact" && (
        <ContactModal
          item={selected.item}
          onClose={()=>setSelected(null)}
        />
      )}

      {/* POST ITEM MODAL */}
      {postModal && <PostItemModal onClose={()=>setPostModal(false)}/>}

      {/* NOTIFICATION TOASTS */}
      <NotificationToasts/>
    </div>
  );
}