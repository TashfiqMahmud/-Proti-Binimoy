import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import MouseEffects from "./mouse-effects";

/* ════════════════════════════════════════════════════════════
   GLOBAL STYLES
════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: #08231a; color: #fff; -webkit-font-smoothing: antialiased; }

    @keyframes pi-fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pi-fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes pi-pop      { 0%{transform:scale(0.84);opacity:0} 65%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
    @keyframes pi-spin     { to{transform:rotate(360deg)} }
    @keyframes pi-shimmer  { 0%,100%{opacity:0.55} 50%{opacity:1} }
    @keyframes pi-checkPop { 0%{transform:scale(0) rotate(-10deg)} 65%{transform:scale(1.3) rotate(3deg)} 100%{transform:scale(1) rotate(0)} }
    @keyframes pi-slideIn  { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pi-bar      { from{width:0%} to{width:var(--bar-w)} }
    @keyframes pi-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
    @keyframes pi-ping     { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2);opacity:0} }

    .pi-fade { opacity:0; animation:pi-fadeUp 0.65s cubic-bezier(0.22,1,0.36,1) forwards; }
    .pi-d1{animation-delay:0.06s} .pi-d2{animation-delay:0.14s} .pi-d3{animation-delay:0.22s}
    .pi-d4{animation-delay:0.30s} .pi-d5{animation-delay:0.38s} .pi-d6{animation-delay:0.46s}
    .pi-pop { animation:pi-pop 0.44s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .pi-slide { opacity:0; animation:pi-slideIn 0.34s cubic-bezier(0.22,1,0.36,1) forwards; }

    /* ── NAV ── */
    .pi-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.75); backdrop-filter: blur(22px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .pi-nav-logo { display:flex; align-items:center; gap:11px; text-decoration:none; }
    .pi-nav-mark {
      width:36px; height:36px; border-radius:10px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      display:flex; align-items:center; justify-content:center;
      font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#fff;
      box-shadow: 0 4px 16px rgba(46,201,126,0.4);
    }
    .pi-nav-brand { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#fff; letter-spacing:-0.01em; }
    .pi-nav-links { display:flex; align-items:center; gap:28px; }
    .pi-nav-link  { text-decoration:none; color:rgba(255,255,255,0.7); font-size:14px; font-weight:500; transition:color 0.2s; }
    .pi-nav-link:hover { color:#2ec97e; }
    .pi-nav-r { display:flex; align-items:center; gap:10px; }
    .pi-nav-ghost {
      text-decoration:none; color:rgba(255,255,255,0.75); font-size:14px; font-weight:500;
      border:1px solid rgba(255,255,255,0.2); padding:8px 18px; border-radius:100px; transition:all 0.2s;
    }
    .pi-nav-ghost:hover { border-color:rgba(255,255,255,0.45); color:#fff; }
    .pi-nav-cta {
      text-decoration:none; color:#fff; font-size:14px; font-weight:600;
      background:rgba(46,201,126,0.2); border:1px solid rgba(46,201,126,0.5);
      padding:8px 20px; border-radius:100px; transition:background 0.2s;
    }
    .pi-nav-cta:hover { background:rgba(46,201,126,0.35); }
    .pi-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; background:none; border:none; padding:6px; }
    .pi-hamburger span { display:block; width:24px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
    .pi-mobile-menu { display:none; position:fixed; top:61px; left:0; right:0; z-index:199; background:rgba(8,35,26,0.98); backdrop-filter:blur(24px); border-bottom:1px solid rgba(255,255,255,0.08); padding:24px 24px 32px; flex-direction:column; }
    .pi-mobile-menu.open { display:flex; }
    .pi-mobile-link { text-decoration:none; color:rgba(255,255,255,0.8); font-size:17px; font-weight:500; padding:14px 0; border-bottom:1px solid rgba(255,255,255,0.07); }
    .pi-mobile-cta  { text-decoration:none; display:block; text-align:center; margin-top:20px; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; font-size:16px; font-weight:600; padding:15px; border-radius:14px; }

    /* ── PAGE LAYOUT ── */
    .pi-page {
      min-height: 100vh;
      padding-top: 61px;
      background: #08231a;
      position: relative;
    }

    /* ── HERO BANNER ── */
    .pi-banner {
      background: linear-gradient(135deg, #08231a 0%, #0d3322 50%, #162b1e 100%);
      padding: 56px 48px 48px;
      position: relative; overflow: hidden;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .pi-banner-glow1 { position:absolute; top:-120px; right:-80px; width:440px; height:440px; background:radial-gradient(circle,rgba(46,201,126,0.14),transparent 65%); border-radius:50%; pointer-events:none; }
    .pi-banner-glow2 { position:absolute; bottom:-80px; left:-60px; width:320px; height:320px; background:radial-gradient(circle,rgba(196,154,60,0.1),transparent 65%); border-radius:50%; pointer-events:none; }
    .pi-banner-inner { max-width:1180px; margin:0 auto; position:relative; z-index:1; }
    .pi-breadcrumb { display:flex; align-items:center; gap:8px; font-size:12.5px; color:rgba(255,255,255,0.38); margin-bottom:20px; flex-wrap:wrap; }
    .pi-breadcrumb a { text-decoration:none; color:rgba(255,255,255,0.45); transition:color 0.2s; }
    .pi-breadcrumb a:hover { color:#2ec97e; }
    .pi-breadcrumb-sep { color:rgba(255,255,255,0.22); }
    .pi-banner-badge {
      display:inline-flex; align-items:center; gap:7px;
      background:rgba(46,201,126,0.12); border:1px solid rgba(46,201,126,0.28);
      border-radius:100px; padding:6px 16px; margin-bottom:20px;
      font-size:11px; font-weight:600; color:#2ec97e; letter-spacing:0.12em; text-transform:uppercase;
    }
    .pi-banner-title { font-family:'Playfair Display',serif; font-size:clamp(28px,3.5vw,48px); font-weight:700; color:#fff; line-height:1.1; margin-bottom:12px; }
    .pi-banner-sub   { font-size:clamp(14px,1.6vw,16px); color:rgba(255,255,255,0.48); font-weight:300; max-width:520px; line-height:1.7; }

    /* ── STEP INDICATOR ── */
    .pi-steps-row { display:flex; align-items:center; gap:0; margin-top:36px; }
    .pi-step-item { display:flex; align-items:center; gap:10px; }
    .pi-step-dot  {
      width:32px; height:32px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:12px; font-weight:700; flex-shrink:0; transition:all 0.3s;
    }
    .pi-step-dot.done  { background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; box-shadow:0 4px 14px rgba(46,201,126,0.45); }
    .pi-step-dot.active{ background:#fff; color:#08231a; box-shadow:0 4px 14px rgba(255,255,255,0.2); }
    .pi-step-dot.idle  { background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.35); border:1px solid rgba(255,255,255,0.12); }
    .pi-step-label { font-size:12px; font-weight:600; white-space:nowrap; transition:color 0.3s; }
    .pi-step-label.done   { color:#2ec97e; }
    .pi-step-label.active { color:#fff; }
    .pi-step-label.idle   { color:rgba(255,255,255,0.28); }
    .pi-step-line { width:40px; height:1px; background:rgba(255,255,255,0.12); margin:0 10px; flex-shrink:0; transition:background 0.3s; }
    .pi-step-line.done { background:rgba(46,201,126,0.5); }

    /* ── MAIN CONTENT AREA ── */
    .pi-content { max-width:1180px; margin:0 auto; padding:40px 48px 80px; display:grid; grid-template-columns:1fr 380px; gap:32px; align-items:start; }

    /* ── FORM CARD ── */
    .pi-form-card {
      background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09);
      border-radius:24px; overflow:hidden;
    }
    .pi-section-head {
      padding:22px 28px; border-bottom:1px solid rgba(255,255,255,0.07);
      display:flex; align-items:center; gap:14px;
    }
    .pi-section-icon {
      width:40px; height:40px; border-radius:12px;
      background:linear-gradient(135deg,rgba(46,201,126,0.18),rgba(27,125,82,0.1));
      border:1px solid rgba(46,201,126,0.22);
      display:flex; align-items:center; justify-content:center; color:#2ec97e; flex-shrink:0;
    }
    .pi-section-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:#fff; }
    .pi-section-sub   { font-size:12px; color:rgba(255,255,255,0.38); margin-top:2px; }
    .pi-form-body     { padding:28px; display:flex; flex-direction:column; gap:22px; }

    /* ── LABEL & INPUTS ── */
    .pi-label { display:block; font-size:11.5px; font-weight:700; color:rgba(255,255,255,0.5); margin-bottom:8px; letter-spacing:0.06em; text-transform:uppercase; }
    .pi-required { color:#2ec97e; margin-left:3px; }
    .pi-input {
      width:100%; border:1.5px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05);
      border-radius:13px; padding:13px 16px; font-size:14.5px; font-family:inherit;
      outline:none; transition:border-color 0.22s, box-shadow 0.22s, background 0.22s; color:#fff;
    }
    .pi-input::placeholder { color:rgba(255,255,255,0.25); }
    .pi-input:focus { border-color:rgba(46,201,126,0.55); background:rgba(46,201,126,0.05); box-shadow:0 0 0 4px rgba(46,201,126,0.1); }
    .pi-input.error { border-color:rgba(239,68,68,0.55); box-shadow:0 0 0 4px rgba(239,68,68,0.09); }
    .pi-input.valid { border-color:rgba(27,125,82,0.6); background:rgba(27,125,82,0.06); }
    .pi-input:disabled { opacity:0.45; cursor:not-allowed; }
    .pi-select { appearance:none; cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(255,255,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; }
    .pi-select option { background:#0d3322; color:#fff; }
    .pi-textarea { resize:vertical; min-height:110px; line-height:1.65; }
    .pi-input-wrap { position:relative; }
    .pi-icon-left  { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.3); pointer-events:none; }
    .pi-pl { padding-left:44px; }
    .pi-field-note { font-size:11px; color:rgba(255,255,255,0.3); margin-top:6px; line-height:1.55; }
    .pi-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .pi-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }

    /* ── CATEGORY PICKER ── */
    .pi-cat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .pi-cat-btn {
      display:flex; flex-direction:column; align-items:center; gap:6px;
      padding:14px 8px; border-radius:14px;
      border:1.5px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.03);
      cursor:pointer; font-family:inherit; transition:all 0.22s; text-align:center;
    }
    .pi-cat-btn:hover { border-color:rgba(46,201,126,0.3); background:rgba(46,201,126,0.05); }
    .pi-cat-btn.active { border-color:rgba(46,201,126,0.5); background:rgba(46,201,126,0.1); box-shadow:0 0 0 3px rgba(46,201,126,0.12); }
    .pi-cat-emoji { font-size:22px; line-height:1; }
    .pi-cat-name  { font-size:10.5px; font-weight:600; color:rgba(255,255,255,0.55); letter-spacing:0.02em; transition:color 0.2s; }
    .pi-cat-btn.active .pi-cat-name { color:#2ec97e; }
    .pi-cat-btn:hover .pi-cat-name  { color:rgba(255,255,255,0.85); }

    /* ── CONDITION PICKER ── */
    .pi-cond-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
    .pi-cond-btn {
      padding:12px 8px; border-radius:12px; border:1.5px solid transparent;
      cursor:pointer; font-family:inherit; font-size:12px; font-weight:600;
      text-align:center; transition:all 0.22s; line-height:1.35;
    }

    /* ── PRICE PREFIX ── */
    .pi-price-wrap { position:relative; }
    .pi-price-pre {
      position:absolute; left:0; top:0; bottom:0;
      display:flex; align-items:center; padding:0 13px;
      border-right:1.5px solid rgba(255,255,255,0.1);
      font-size:15px; font-weight:700; color:rgba(255,255,255,0.45); pointer-events:none;
      border-radius:13px 0 0 13px;
    }
    .pi-price-input { padding-left:52px; }

    /* ── NEGOTIABLE TOGGLE ── */
    .pi-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; }
    .pi-toggle-info { flex:1; }
    .pi-toggle-lbl  { font-size:14px; font-weight:500; color:rgba(255,255,255,0.8); }
    .pi-toggle-desc { font-size:11.5px; color:rgba(255,255,255,0.35); margin-top:2px; }
    .pi-switch { position:relative; width:44px; height:24px; flex-shrink:0; }
    .pi-switch input { opacity:0; width:0; height:0; position:absolute; }
    .pi-switch-track {
      position:absolute; inset:0; border-radius:12px;
      background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.15);
      cursor:pointer; transition:all 0.25s;
    }
    .pi-switch-track::after {
      content:''; position:absolute; top:3px; left:3px;
      width:16px; height:16px; border-radius:50%; background:#fff;
      transition:all 0.25s; opacity:0.5;
    }
    input:checked + .pi-switch-track { background:rgba(46,201,126,0.3); border-color:rgba(46,201,126,0.6); }
    input:checked + .pi-switch-track::after { transform:translateX(20px); opacity:1; background:#2ec97e; box-shadow:0 2px 8px rgba(46,201,126,0.55); }

    /* ── PHOTO UPLOAD ── */
    .pi-photo-zone {
      border:2px dashed rgba(255,255,255,0.12); border-radius:16px;
      padding:32px 24px; text-align:center; cursor:pointer;
      transition:all 0.25s; position:relative;
    }
    .pi-photo-zone:hover { border-color:rgba(46,201,126,0.4); background:rgba(46,201,126,0.04); }
    .pi-photo-zone.dragging { border-color:#2ec97e; background:rgba(46,201,126,0.08); }
    .pi-photo-icon { width:52px; height:52px; border-radius:16px; background:rgba(46,201,126,0.12); border:1px solid rgba(46,201,126,0.2); display:flex; align-items:center; justify-content:center; margin:0 auto 14px; color:#2ec97e; }
    .pi-photo-title { font-size:15px; font-weight:600; color:#fff; margin-bottom:5px; }
    .pi-photo-sub   { font-size:12px; color:rgba(255,255,255,0.35); line-height:1.6; }
    .pi-photo-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-top:14px; }
    .pi-photo-thumb {
      aspect-ratio:1; border-radius:12px; overflow:hidden; position:relative;
      background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
    }
    .pi-photo-thumb img { width:100%; height:100%; object-fit:cover; }
    .pi-photo-del {
      position:absolute; top:5px; right:5px; width:22px; height:22px;
      border-radius:50%; background:rgba(0,0,0,0.7); border:none; color:#fff;
      font-size:10px; cursor:pointer; display:flex; align-items:center; justify-content:center;
      opacity:0; transition:opacity 0.18s;
    }
    .pi-photo-thumb:hover .pi-photo-del { opacity:1; }
    .pi-photo-add {
      aspect-ratio:1; border-radius:12px;
      border:1.5px dashed rgba(255,255,255,0.14); background:transparent;
      display:flex; align-items:center; justify-content:center;
      cursor:pointer; color:rgba(255,255,255,0.25); font-size:22px;
      transition:all 0.2s;
    }
    .pi-photo-add:hover { border-color:rgba(46,201,126,0.35); color:#2ec97e; background:rgba(46,201,126,0.05); }
    .pi-photo-main-badge { position:absolute; bottom:5px; left:5px; font-size:9px; font-weight:700; background:rgba(46,201,126,0.9); color:#fff; padding:2px 7px; border-radius:100px; letter-spacing:0.05em; text-transform:uppercase; }

    /* ── TAGS ── */
    .pi-tag-wrap { display:flex; flex-wrap:wrap; gap:7px; margin-top:10px; }
    .pi-tag {
      display:inline-flex; align-items:center; gap:5px;
      padding:5px 12px; border-radius:100px;
      background:rgba(46,201,126,0.1); border:1px solid rgba(46,201,126,0.25);
      font-size:12px; font-weight:500; color:#2ec97e; cursor:pointer; transition:all 0.18s;
    }
    .pi-tag:hover { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); color:#f87171; }
    .pi-tag-x { font-size:10px; opacity:0.7; }
    .pi-tag-input-row { display:flex; gap:8px; }
    .pi-tag-add-btn {
      padding:0 18px; border-radius:11px; border:1.5px solid rgba(46,201,126,0.35);
      background:rgba(46,201,126,0.08); color:#2ec97e; font-family:inherit;
      font-size:13px; font-weight:600; cursor:pointer; white-space:nowrap; transition:all 0.2s;
      flex-shrink:0;
    }
    .pi-tag-add-btn:hover { background:rgba(46,201,126,0.18); }

    /* ── SIDEBAR CARD ── */
    .pi-sidebar { display:flex; flex-direction:column; gap:16px; position:sticky; top:81px; }
    .pi-side-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:20px; overflow:hidden; }
    .pi-side-head { padding:18px 22px; border-bottom:1px solid rgba(255,255,255,0.07); }
    .pi-side-title { font-size:13px; font-weight:700; color:rgba(255,255,255,0.7); letter-spacing:0.04em; text-transform:uppercase; }
    .pi-side-body  { padding:18px 22px; }

    /* ── PREVIEW CARD ── */
    .pi-preview {
      border-radius:16px; overflow:hidden;
      background:rgba(255,255,255,0.035); border:1px solid rgba(255,255,255,0.08);
    }
    .pi-preview-img {
      aspect-ratio:4/3; background:linear-gradient(135deg,rgba(46,201,126,0.12),rgba(27,125,82,0.06));
      display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
    }
    .pi-preview-emoji { font-size:72px; filter:drop-shadow(0 8px 24px rgba(0,0,0,0.4)); }
    .pi-preview-badge { position:absolute; top:10px; left:10px; font-size:9px; font-weight:700; background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff; padding:3px 10px; border-radius:100px; text-transform:uppercase; letter-spacing:0.07em; }
    .pi-preview-body  { padding:14px; }
    .pi-preview-cat   { font-size:9.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#2ec97e; margin-bottom:4px; }
    .pi-preview-title { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:#fff; line-height:1.3; margin-bottom:4px; }
    .pi-preview-price { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#2ec97e; }
    .pi-preview-neg   { font-size:10px; color:rgba(46,201,126,0.6); margin-left:4px; }
    .pi-preview-seller{ display:flex; align-items:center; gap:8px; margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06); }
    .pi-preview-av    { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#2ec97e,#1b7d52); display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; flex-shrink:0; }
    .pi-preview-sname { font-size:11.5px; color:rgba(255,255,255,0.55); }

    /* ── TIPS LIST ── */
    .pi-tip { display:flex; align-items:flex-start; gap:10px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .pi-tip:last-child { border-bottom:none; }
    .pi-tip-icon { width:26px; height:26px; border-radius:8px; background:rgba(46,201,126,0.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:13px; margin-top:1px; }
    .pi-tip-text { font-size:12.5px; color:rgba(255,255,255,0.5); line-height:1.6; }
    .pi-tip-text strong { color:rgba(255,255,255,0.8); font-weight:600; }

    /* ── SUBMIT BUTTON ── */
    .pi-submit {
      width:100%; padding:16px; border-radius:14px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff;
      font-size:15.5px; font-weight:700; font-family:inherit;
      display:flex; align-items:center; justify-content:center; gap:9px;
      transition:opacity 0.2s, transform 0.18s, box-shadow 0.2s;
      box-shadow:0 6px 24px rgba(46,201,126,0.38); letter-spacing:0.02em;
    }
    .pi-submit:hover:not(:disabled) { opacity:0.9; transform:translateY(-2px); box-shadow:0 10px 36px rgba(46,201,126,0.5); }
    .pi-submit:disabled { opacity:0.45; cursor:not-allowed; transform:none; }
    .pi-spinner { width:17px; height:17px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:pi-spin 0.7s linear infinite; }

    /* ── SUCCESS STATE ── */
    .pi-success-wrap { min-height:60vh; display:flex; align-items:center; justify-content:center; padding:40px 20px; }
    .pi-success-card {
      max-width:480px; width:100%;
      background:rgba(255,255,255,0.04); border:1px solid rgba(46,201,126,0.22);
      border-radius:28px; padding:52px 40px; text-align:center;
      box-shadow:0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(46,201,126,0.08);
    }
    .pi-success-ring { position:relative; width:96px; height:96px; margin:0 auto 28px; }
    .pi-success-ring-inner {
      width:96px; height:96px; border-radius:50%;
      background:linear-gradient(135deg,rgba(46,201,126,0.18),rgba(27,125,82,0.1));
      border:2px solid rgba(46,201,126,0.3);
      display:flex; align-items:center; justify-content:center;
    }
    .pi-success-ring-ping {
      position:absolute; inset:0; border-radius:50%;
      border:2px solid rgba(46,201,126,0.3);
      animation:pi-ping 1.4s ease-out infinite;
    }
    .pi-success-check { animation:pi-checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
    .pi-success-title { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#fff; margin-bottom:12px; }
    .pi-success-msg   { font-size:15px; color:rgba(255,255,255,0.5); line-height:1.75; font-weight:300; margin-bottom:32px; }
    .pi-success-actions { display:flex; flex-direction:column; gap:10px; }
    .pi-success-primary {
      display:flex; align-items:center; justify-content:center; gap:8px;
      padding:14px; border-radius:12px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff;
      font-size:15px; font-weight:600; font-family:inherit; text-decoration:none;
      transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 5px 20px rgba(46,201,126,0.35);
    }
    .pi-success-primary:hover { transform:translateY(-1px); box-shadow:0 9px 30px rgba(46,201,126,0.5); }
    .pi-success-ghost {
      display:flex; align-items:center; justify-content:center; gap:8px;
      padding:13px; border-radius:12px; border:1.5px solid rgba(255,255,255,0.14);
      background:transparent; color:rgba(255,255,255,0.6); font-size:14px; font-weight:500;
      font-family:inherit; cursor:pointer; text-decoration:none; transition:all 0.2s;
    }
    .pi-success-ghost:hover { border-color:rgba(255,255,255,0.32); color:#fff; }

    /* ── ERROR ── */
    .pi-err-msg { display:flex; align-items:flex-start; gap:8px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.22); border-radius:11px; padding:10px 14px; font-size:12.5px; color:#f87171; }

    /* ── CHAR COUNT ── */
    .pi-char-count { font-size:11px; color:rgba(255,255,255,0.25); text-align:right; margin-top:5px; }
    .pi-char-count.warn { color:rgba(245,158,11,0.7); }

    /* ── DIVIDER ── */
    .pi-divider { height:1px; background:rgba(255,255,255,0.06); margin:4px 0; }

    /* ── RESPONSIVE ── */
    @media (max-width: 1100px) {
      .pi-content { grid-template-columns:1fr; padding:32px 32px 64px; }
      .pi-sidebar  { position:static; }
      .pi-banner   { padding:48px 32px 40px; }
    }
    @media (max-width: 768px) {
      .pi-nav      { padding:14px 20px; }
      .pi-nav-links{ display:none; }
      .pi-nav-ghost{ display:none; }
      .pi-hamburger{ display:flex; }
      .pi-banner   { padding:40px 20px 32px; }
      .pi-banner-title { font-size:clamp(24px,6vw,36px); }
      .pi-steps-row{ flex-wrap:wrap; gap:12px; }
      .pi-step-line{ display:none; }
      .pi-content  { padding:24px 20px 56px; gap:24px; }
      .pi-cat-grid { grid-template-columns:repeat(4,1fr); gap:8px; }
      .pi-cond-grid{ grid-template-columns:repeat(2,1fr); }
      .pi-row-2    { grid-template-columns:1fr; }
      .pi-row-3    { grid-template-columns:1fr 1fr; }
      .pi-photo-grid{ grid-template-columns:repeat(3,1fr); }
    }
    @media (max-width: 480px) {
      .pi-cat-grid { grid-template-columns:repeat(4,1fr); gap:6px; }
      .pi-cat-btn  { padding:10px 4px; }
      .pi-cat-emoji{ font-size:18px; }
      .pi-cat-name { font-size:9px; }
      .pi-row-3    { grid-template-columns:1fr; }
      .pi-photo-grid{ grid-template-columns:repeat(2,1fr); }
      .pi-form-body{ padding:18px; }
      .pi-section-head{ padding:16px 18px; }
    }
  `}</style>
);

/* ════════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  { id:"electronics", icon:"📱", label:"Electronics" },
  { id:"furniture",   icon:"🪑", label:"Furniture"   },
  { id:"clothing",    icon:"👕", label:"Clothing"    },
  { id:"books",       icon:"📚", label:"Books"       },
  { id:"sports",      icon:"🚲", label:"Sports"      },
  { id:"vehicles",    icon:"🚗", label:"Vehicles"    },
  { id:"tools",       icon:"🔧", label:"Tools"       },
  { id:"other",       icon:"📦", label:"Other"       },
];

const CONDITIONS = [
  { id:"new",      label:"New",       desc:"Never used",     color:"#2ec97e", bg:"rgba(46,201,126,0.1)",   border:"rgba(46,201,126,0.4)"  },
  { id:"like_new", label:"Like New",  desc:"Barely used",    color:"#06B6D4", bg:"rgba(6,182,212,0.1)",    border:"rgba(6,182,212,0.4)"   },
  { id:"used",     label:"Used",      desc:"Normal wear",    color:"#F59E0B", bg:"rgba(245,158,11,0.1)",   border:"rgba(245,158,11,0.4)"  },
  { id:"for_parts",label:"For Parts", desc:"Needs repair",   color:"#EF4444", bg:"rgba(239,68,68,0.1)",    border:"rgba(239,68,68,0.4)"   },
];

const LOCATIONS = [
  "Dhanmondi","Gulshan","Bashundhara","Uttara","Mirpur","Mohammadpur",
  "Rayer Bazar","Wari","Banani","Motijheel","Farmgate","Tejgaon","Khilgaon","Other",
];

const DELIVERY_OPTIONS = [
  { id:"pickup",   label:"Local Pickup" },
  { id:"delivery", label:"Delivery Available" },
  { id:"courier",  label:"Courier Service" },
];

const PAYMENT_OPTIONS = [
  { id:"cash",     label:"Cash" },
  { id:"bkash",    label:"bKash" },
  { id:"nagad",    label:"Nagad" },
  { id:"bank",     label:"Bank Transfer" },
];

const TIPS = [
  { icon:"📸", text: <><strong>Add clear photos.</strong> Items with 4+ photos get 3× more views.</> },
  { icon:"✍️", text: <><strong>Write a detailed description.</strong> Mention brand, model, age, and any flaws.</> },
  { icon:"💰", text: <><strong>Price it right.</strong> Check similar listings. Enable negotiable for faster sales.</> },
  { icon:"📍", text: <><strong>Set your exact area.</strong> Buyers prefer sellers nearby.</> },
];

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
const fmt = (n) => new Intl.NumberFormat("en-BD").format(n);

const STEPS = ["Item Details", "Pricing & Contact", "Review & Post"];

/* ════════════════════════════════════════════════════════════
   SECTION HEADER
════════════════════════════════════════════════════════════ */
const SectionHead = ({ icon, title, sub }) => (
  <div className="pi-section-head">
    <div className="pi-section-icon">{icon}</div>
    <div>
      <div className="pi-section-title">{title}</div>
      {sub && <div className="pi-section-sub">{sub}</div>}
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
════════════════════════════════════════════════════════════ */
const PostItemPage = () => {
  const navigate = useNavigate ? useNavigate() : null;
  const [mobileMenu, setMobileMenu] = useState(false);
  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const addFileRef = useRef(null);

  // Mock user
  const user = { name: "Rafi Islam", initials: "RI" };

  const [form, setForm] = useState({
    title:       "",
    category:    "",
    condition:   "",
    description: "",
    brand:       "",
    model:       "",
    price:       "",
    negotiable:  false,
    tradeOffer:  false,
    location:    "",
    phone:       "",
    delivery:    [],
    payment:     [],
    tags:        [],
    photos:      [],  // mock: array of emoji strings for demo
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleArr = (k, v) =>
    setForm(p => ({
      ...p,
      [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v],
    }));

  // Real image upload
  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8 - form.photos.length);
    const newPhotos = files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
    set("photos", [...form.photos, ...newPhotos]);
    e.target.value = null;
  };
  const removePhoto = (i) => {
    const toRemove = form.photos[i];
    if (toRemove && toRemove.preview) URL.revokeObjectURL(toRemove.preview);
    set("photos", form.photos.filter((_, idx) => idx !== i));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!tag || form.tags.includes(tag) || form.tags.length >= 8) return;
    set("tags", [...form.tags, tag]);
    setTagInput("");
  };
  const removeTag = (t) => set("tags", form.tags.filter(x => x !== t));

  // Validation per step
  const canAdvance = () => {
    if (step === 0) {
      return (
        form.photos.length > 0 &&
        form.title.trim() &&
        form.category &&
        form.condition &&
        form.description.trim().length >= 20
      );
    }
    if (step === 1) {
      return (
        form.price && Number(form.price) > 0 &&
        form.location &&
        form.phone.trim().length >= 9 &&
        form.payment.length > 0 &&
        form.delivery.length > 0
      );
    }
    return true;
  };

  const next = () => { if (step < 2) setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const prev = () => { if (step > 0) setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1600);
  };

  const categoryObj   = CATEGORIES.find(c => c.id === form.category);
  const conditionObj  = CONDITIONS.find(c => c.id === form.condition);

  // ── Nav ──
  const Nav = () => (
    <>
      <nav className="pi-nav">
        <Link to="/" className="pi-nav-logo">
          <div className="pi-nav-mark">P</div>
          <span className="pi-nav-brand">Proti-Binimoy</span>
        </Link>
        <div className="pi-nav-links">
          {["Home","Marketplace","How It Works","About"].map(l => (
            <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase().replace(/ /g,"-")}`} className="pi-nav-link">{l}</Link>
          ))}
        </div>
        <div className="pi-nav-r">
          <Link to="/marketplace" className="pi-nav-ghost">Browse</Link>
          <a href="#" className="pi-nav-cta">My Account</a>
          <button className="pi-hamburger" onClick={() => setMobileMenu(m => !m)}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>
      <div className={`pi-mobile-menu${mobileMenu ? " open" : ""}`}>
        {["Home","Marketplace","How It Works","About"].map(l => (
          <Link key={l} to="/" className="pi-mobile-link">{l}</Link>
        ))}
        <a href="#" className="pi-mobile-cta">My Account</a>
      </div>
    </>
  );

  // ── Success Screen ──
  if (submitted) return (
    <div className="pi-page" style={{ background: "#08231a" }}>
      <GlobalStyles />
      <Nav />
      <div className="pi-success-wrap pi-fade">
        <div className="pi-success-card">
          <div className="pi-success-ring">
            <div className="pi-success-ring-ping" />
            <div className="pi-success-ring-inner">
              <div className="pi-success-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2ec97e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 38, height: 38 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="pi-success-title">Item Posted!</h2>
          <p className="pi-success-msg">
            <strong style={{ color: "#fff" }}>"{form.title}"</strong> is now live on the marketplace.
            Buyers can find it right away. You'll get notified when someone contacts you.
          </p>
          <div className="pi-success-actions">
            <Link to="/marketplace" className="pi-success-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 16, height: 16 }}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Go to Marketplace
            </Link>
            <button className="pi-success-ghost" onClick={() => { setSubmitted(false); setStep(0); setForm({ title:"",category:"",condition:"",description:"",brand:"",model:"",price:"",negotiable:false,tradeOffer:false,location:"",phone:"",delivery:[],payment:[],tags:[],photos:[] }); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 15, height: 15 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Post Another Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="pi-page" style={{ backgroundImage: `url(${websiteBackground})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      <GlobalStyles />
      <MouseEffects />

      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(8,35,26,0.82)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Nav />

        {/* ── BANNER ── */}
        <div className="pi-banner pi-fade">
          <div className="pi-banner-glow1" />
          <div className="pi-banner-glow2" />
          <div className="pi-banner-inner">
            {/* Breadcrumb */}
            <div className="pi-breadcrumb">
              <Link to="/">Home</Link>
              <span className="pi-breadcrumb-sep">›</span>
              <Link to="/marketplace">Marketplace</Link>
              <span className="pi-breadcrumb-sep">›</span>
              <span style={{ color: "rgba(255,255,255,0.65)" }}>Post an Item</span>
            </div>

            {/* Badge */}
            <div className="pi-banner-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 13, height: 13 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Free Listing
            </div>

            <h1 className="pi-banner-title pi-d1">
              Post your item,<br />
              <em style={{ fontStyle: "italic", color: "#2ec97e" }}>reach thousands.</em>
            </h1>
            <p className="pi-banner-sub pi-d2">
              List any item for free and connect with verified buyers across Dhaka and beyond.
              Takes less than 3 minutes.
            </p>

            {/* Step indicator */}
            <div className="pi-steps-row pi-d3">
              {STEPS.map((s, i) => {
                const state = i < step ? "done" : i === step ? "active" : "idle";
                return (
                  <React.Fragment key={s}>
                    <div className="pi-step-item">
                      <div className={`pi-step-dot ${state}`}>
                        {state === "done"
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12"/></svg>
                          : i + 1}
                      </div>
                      <span className={`pi-step-label ${state}`}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`pi-step-line${i < step ? " done" : ""}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="pi-content">

          {/* ════════ LEFT: FORM ════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ───── STEP 0: Item Details ───── */}
            {step === 0 && (
              <>
                {/* Photos */}
                <div className="pi-form-card pi-fade pi-d1">
                  <SectionHead
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                    title="Photos"
                    sub="Upload up to 8 images — first photo is the cover (required)"
                  />
                  <div className="pi-form-body">
                    <div className="pi-photo-zone" style={{ borderColor: form.photos.length === 0 ? '#EF4444' : undefined }}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => {
                        e.preventDefault(); setDragging(false);
                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).slice(0, 8 - form.photos.length);
                        const newPhotos = files.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
                        set("photos", [...form.photos, ...newPhotos]);
                      }}
                      onClick={() => fileRef.current && fileRef.current.click()}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                        onChange={handlePhotoChange}
                        required
                      />
                      <div className="pi-photo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 24, height: 24 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      </div>
                      <div className="pi-photo-title">{form.photos.length === 0 ? 'Click or drag & drop to upload images' : 'Add more photos (max 8)'}</div>
                      <div className="pi-photo-sub">PNG, JPG up to 10MB each</div>
                    </div>
                    {form.photos.length > 0 && (
                      <div className="pi-photo-grid" style={{ marginTop: 12 }}>
                        {form.photos.map((p, i) => (
                          <div key={i} className="pi-photo-thumb">
                            <img src={p.preview || (typeof p === 'string' ? p : undefined)} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            {i === 0 && <span className="pi-photo-main-badge">Cover</span>}
                            <button className="pi-photo-del" onClick={e => { e.stopPropagation(); removePhoto(i); }}>✕</button>
                          </div>
                        ))}
                        {form.photos.length < 8 && (
                          <button className="pi-photo-add" onClick={e => { e.stopPropagation(); fileRef.current && fileRef.current.click(); }}>+</button>
                        )}
                      </div>
                    )}
                    <div className="pi-field-note" style={{ color: form.photos.length === 0 ? '#EF4444' : undefined }}>
                      {form.photos.length === 0 ? 'At least one image is required.' : '💡 Items with clear, well-lit photos get up to 3× more inquiries'}
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                <div className="pi-form-card pi-fade pi-d2">
                  <SectionHead
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                    title="Basic Information"
                    sub="Title, category, and condition"
                  />
                  <div className="pi-form-body">
                    {/* Title */}
                    <div>
                      <label className="pi-label">Item Title <span className="pi-required">*</span></label>
                      <input
                        className={`pi-input${form.title.length > 0 && form.title.trim().length < 5 ? " error" : form.title.trim().length >= 5 ? " valid" : ""}`}
                        placeholder="e.g. Samsung Galaxy S23 Ultra 256GB — Midnight Black"
                        value={form.title}
                        onChange={e => set("title", e.target.value)}
                        maxLength={100}
                      />
                      <div className={`pi-char-count${form.title.length > 85 ? " warn" : ""}`}>{form.title.length}/100</div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="pi-label">Category <span className="pi-required">*</span></label>
                      <div className="pi-cat-grid">
                        {CATEGORIES.map(c => (
                          <button
                            key={c.id}
                            className={`pi-cat-btn${form.category === c.id ? " active" : ""}`}
                            onClick={() => set("category", c.id)}
                          >
                            <span className="pi-cat-emoji">{c.icon}</span>
                            <span className="pi-cat-name">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="pi-label">Condition <span className="pi-required">*</span></label>
                      <div className="pi-cond-grid">
                        {CONDITIONS.map(c => (
                          <button
                            key={c.id}
                            className="pi-cond-btn"
                            onClick={() => set("condition", c.id)}
                            style={{
                              borderColor: form.condition === c.id ? c.border : "rgba(255,255,255,0.1)",
                              background:  form.condition === c.id ? c.bg : "rgba(255,255,255,0.03)",
                              color:       form.condition === c.id ? c.color : "rgba(255,255,255,0.55)",
                              boxShadow:   form.condition === c.id ? `0 0 0 3px ${c.bg}` : "none",
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 2 }}>{c.label}</div>
                            <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.75 }}>{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand + Model */}
                    <div className="pi-row-2">
                      <div>
                        <label className="pi-label">Brand</label>
                        <input className="pi-input" placeholder="e.g. Samsung, Apple, Otobi…" value={form.brand} onChange={e => set("brand", e.target.value)} />
                      </div>
                      <div>
                        <label className="pi-label">Model</label>
                        <input className="pi-input" placeholder="e.g. Galaxy S23, iPhone 13…" value={form.model} onChange={e => set("model", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description & Tags */}
                <div className="pi-form-card pi-fade pi-d3">
                  <SectionHead
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>}
                    title="Description & Tags"
                    sub="Help buyers understand what you're selling"
                  />
                  <div className="pi-form-body">
                    <div>
                      <label className="pi-label">Description <span className="pi-required">*</span></label>
                      <textarea
                        className={`pi-input pi-textarea${form.description.trim().length > 0 && form.description.trim().length < 20 ? " error" : form.description.trim().length >= 20 ? " valid" : ""}`}
                        placeholder="Describe your item in detail — condition, age, what's included, any defects, reason for selling…"
                        value={form.description}
                        onChange={e => set("description", e.target.value)}
                        maxLength={1200}
                        rows={6}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                        <span className="pi-field-note">Minimum 20 characters</span>
                        <span className={`pi-char-count${form.description.length > 1100 ? " warn" : ""}`}>{form.description.length}/1200</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="pi-label">Search Tags</label>
                      <div className="pi-tag-input-row">
                        <input
                          className="pi-input"
                          placeholder="Add a tag (e.g. iphone, laptop, shimano)…"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                          style={{ flex: 1 }}
                        />
                        <button className="pi-tag-add-btn" onClick={addTag}>+ Add</button>
                      </div>
                      {form.tags.length > 0 && (
                        <div className="pi-tag-wrap">
                          {form.tags.map(t => (
                            <span key={t} className="pi-tag" onClick={() => removeTag(t)}>
                              #{t} <span className="pi-tag-x">✕</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pi-field-note">Up to 8 tags · Tags help buyers find your item faster</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ───── STEP 1: Pricing & Contact ───── */}
            {step === 1 && (
              <>
                {/* Pricing */}
                <div className="pi-form-card pi-fade pi-d1">
                  <SectionHead
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
                    title="Pricing"
                    sub="Set your asking price"
                  />
                  <div className="pi-form-body">
                    <div>
                      <label className="pi-label">Asking Price (BDT) <span className="pi-required">*</span></label>
                      <div className="pi-price-wrap">
                        <span className="pi-price-pre">৳</span>
                        <input
                          type="number"
                          className={`pi-input pi-price-input${form.price && Number(form.price) > 0 ? " valid" : ""}`}
                          placeholder="0"
                          value={form.price}
                          onChange={e => set("price", e.target.value)}
                          min="0"
                        />
                      </div>
                      {form.price && Number(form.price) > 0 && (
                        <div className="pi-field-note" style={{ color: "rgba(46,201,126,0.7)" }}>
                          ৳{fmt(Number(form.price))} BDT
                        </div>
                      )}
                    </div>

                    <div className="pi-divider" />

                    <div className="pi-toggle-row">
                      <div className="pi-toggle-info">
                        <div className="pi-toggle-lbl">Price is Negotiable</div>
                        <div className="pi-toggle-desc">Buyers will see a "Negotiable" badge on your listing</div>
                      </div>
                      <label className="pi-switch">
                        <input type="checkbox" checked={form.negotiable} onChange={e => set("negotiable", e.target.checked)} />
                        <span className="pi-switch-track" />
                      </label>
                    </div>

                    <div className="pi-toggle-row" style={{ paddingTop: 0 }}>
                      <div className="pi-toggle-info">
                        <div className="pi-toggle-lbl">Open to Trade / Barter</div>
                        <div className="pi-toggle-desc">Show you're willing to exchange for other items</div>
                      </div>
                      <label className="pi-switch">
                        <input type="checkbox" checked={form.tradeOffer} onChange={e => set("tradeOffer", e.target.checked)} />
                        <span className="pi-switch-track" />
                      </label>
                    </div>

                    <div className="pi-divider" />

                    {/* Delivery options */}
                    <div>
                      <label className="pi-label">Delivery / Pickup Options <span className="pi-required">*</span></label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 4 }}>
                        {DELIVERY_OPTIONS.map(o => (
                          <button
                            key={o.id}
                            onClick={() => toggleArr("delivery", o.id)}
                            style={{
                              padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                              borderColor: form.delivery.includes(o.id) ? "rgba(46,201,126,0.55)" : (form.delivery.length === 0 ? '#EF4444' : "rgba(255,255,255,0.12)"),
                              background:  form.delivery.includes(o.id) ? "rgba(46,201,126,0.12)" : "rgba(255,255,255,0.04)",
                              color:       form.delivery.includes(o.id) ? "#2ec97e" : (form.delivery.length === 0 ? '#EF4444' : "rgba(255,255,255,0.5)"),
                            }}
                          >{o.label}</button>
                        ))}
                      </div>
                      {form.delivery.length === 0 && <div className="pi-field-note" style={{ color: '#EF4444' }}>At least one delivery option is required.</div>}
                    </div>

                    {/* Payment methods */}
                    <div>
                      <label className="pi-label">Accepted Payment Methods <span className="pi-required">*</span></label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 4 }}>
                        {PAYMENT_OPTIONS.map(o => (
                          <button
                            key={o.id}
                            onClick={() => toggleArr("payment", o.id)}
                            style={{
                              padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 500,
                              border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
                              borderColor: form.payment.includes(o.id) ? "rgba(46,201,126,0.55)" : (form.payment.length === 0 ? '#EF4444' : "rgba(255,255,255,0.12)"),
                              background:  form.payment.includes(o.id) ? "rgba(46,201,126,0.12)" : "rgba(255,255,255,0.04)",
                              color:       form.payment.includes(o.id) ? "#2ec97e" : (form.payment.length === 0 ? '#EF4444' : "rgba(255,255,255,0.5)"),
                            }}
                          >{o.label}</button>
                        ))}
                      </div>
                      {form.payment.length === 0 && <div className="pi-field-note" style={{ color: '#EF4444' }}>At least one payment method is required.</div>}
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="pi-form-card pi-fade pi-d2">
                  <SectionHead
                    icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.04 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>}
                    title="Contact & Location"
                    sub="How buyers can reach you"
                  />
                  <div className="pi-form-body">
                    <div className="pi-row-2">
                      <div>
                        <label className="pi-label">Your Location <span className="pi-required">*</span></label>
                        <select className={`pi-input pi-select${form.location ? " valid" : ""}`} value={form.location} onChange={e => set("location", e.target.value)}>
                          <option value="">Select area…</option>
                          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="pi-label">Phone Number <span className="pi-required">*</span></label>
                        <div className="pi-input-wrap">
                          <span className="pi-icon-left" style={{ fontSize: 13 }}>🇧🇩</span>
                          <input
                            className={`pi-input pi-pl${form.phone.length > 8 ? " valid" : form.phone.length > 0 ? " error" : ""}`}
                            placeholder="+880 1xxx-xxxxxx"
                            value={form.phone}
                            onChange={e => set("phone", e.target.value)}
                            type="tel"
                          />
                        </div>
                        <div className="pi-field-note">Visible only to serious buyers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ───── STEP 2: Review ───── */}
            {step === 2 && (
              <div className="pi-form-card pi-fade pi-d1">
                <SectionHead
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 20, height: 20 }}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
                  title="Review Your Listing"
                  sub="Check everything before posting"
                />
                <div className="pi-form-body">
                  {/* Summary rows */}
                  {[
                    { label: "Title",       val: form.title || "—" },
                    { label: "Category",    val: categoryObj ? `${categoryObj.icon} ${categoryObj.label}` : "—" },
                    { label: "Condition",   val: conditionObj?.label || "—" },
                    { label: "Brand",       val: [form.brand, form.model].filter(Boolean).join(" · ") || "Not specified" },
                    { label: "Price",       val: form.price ? `৳${fmt(Number(form.price))} BDT${form.negotiable ? " · Negotiable" : ""}` : "—" },
                    { label: "Trade",       val: form.tradeOffer ? "Open to trade / barter" : "Not accepting trades" },
                    { label: "Location",    val: form.location || "—" },
                    { label: "Delivery",    val: form.delivery.length ? form.delivery.map(d => DELIVERY_OPTIONS.find(o => o.id === d)?.label).join(", ") : "Not specified" },
                    { label: "Payment",     val: form.payment.length ? form.payment.map(d => PAYMENT_OPTIONS.find(o => o.id === d)?.label).join(", ") : "Not specified" },
                    { label: "Photos",      val: `${form.photos.length} photo${form.photos.length !== 1 ? "s" : ""}` },
                    { label: "Tags",        val: form.tags.length ? form.tags.map(t => `#${t}`).join("  ") : "None added" },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", width: 90, flexShrink: 0, marginTop: 1 }}>{r.label}</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.5, wordBreak: "break-word" }}>{r.val}</span>
                    </div>
                  ))}

                  {/* Description preview */}
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>Description</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
                      {form.description || "—"}
                    </div>
                  </div>

                  {/* Terms note */}
                  <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.18)", borderRadius: 12, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#2ec97e" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }}><path d="M12 3l6 2.5v5.8c0 4.1-2.5 7.9-6 9.7-3.5-1.8-6-5.6-6-9.7V5.5L12 3z"/></svg>
                    By posting, you agree to our <a href="#" style={{ color: "#2ec97e" }}>Community Guidelines</a> and confirm the information above is accurate. Your contact number will only be shared with interested buyers.
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }} className="pi-fade pi-d4">
              {step > 0 && (
                <button
                  onClick={prev}
                  style={{
                    padding: "14px 28px", borderRadius: 13, border: "1.5px solid rgba(255,255,255,0.14)",
                    background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14,
                    fontWeight: 600, font: "inherit", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 7, transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.32)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 15, height: 15 }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
              )}
              {step < 2 ? (
                <button
                  className="pi-submit"
                  style={{ flex: 1 }}
                  disabled={!canAdvance()}
                  onClick={next}
                >
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              ) : (
                <button
                  className="pi-submit"
                  style={{ flex: 1 }}
                  disabled={loading}
                  onClick={submit}
                >
                  {loading ? (
                    <><div className="pi-spinner" /> Publishing…</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" style={{ width: 17, height: 17 }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Post Item for Free
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ════════ RIGHT: SIDEBAR ════════ */}
          <aside className="pi-sidebar pi-fade pi-d2">

            {/* Live Preview */}
            <div className="pi-side-card">
              <div className="pi-side-head">
                <div className="pi-side-title">Live Preview</div>
              </div>
              <div style={{ padding: 16 }}>
                <div className="pi-preview">
                  <div className="pi-preview-img">
                    {form.photos.length > 0
                      ? <img src={form.photos[0].preview || (typeof form.photos[0] === 'string' ? form.photos[0] : undefined)} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                      : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" style={{ width: 56, height: 56 }}><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    }
                    {form.category && (
                      <span className="pi-preview-badge">{categoryObj?.icon} {categoryObj?.label}</span>
                    )}
                  </div>
                  <div className="pi-preview-body">
                    <div className="pi-preview-title">{form.title || <span style={{ color: "rgba(255,255,255,0.2)" }}>Your item title…</span>}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="pi-preview-price">{form.price ? `৳${fmt(Number(form.price))}` : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16 }}>Price…</span>}</span>
                      {form.negotiable && <span className="pi-preview-neg">Neg.</span>}
                    </div>
                    {conditionObj && (
                      <div style={{ marginTop: 7 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 100, background: conditionObj.bg, color: conditionObj.color, border: `1px solid ${conditionObj.border}` }}>
                          {conditionObj.label}
                        </span>
                      </div>
                    )}
                    <div className="pi-preview-seller">
                      <div className="pi-preview-av">{user.initials}</div>
                      <span className="pi-preview-sname">{user.name} · {form.location || "Location…"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Tips */}
            <div className="pi-side-card">
              <div className="pi-side-head">
                <div className="pi-side-title">Seller Tips</div>
              </div>
              <div className="pi-side-body">
                {TIPS.map((tip, i) => (
                  <div key={i} className="pi-tip">
                    <div className="pi-tip-icon">{tip.icon}</div>
                    <div className="pi-tip-text">{tip.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="pi-side-card">
              <div className="pi-side-body">
                {[
                  { icon: "🔒", t: "Free & Secure Listing", s: "Your data stays private" },
                  { icon: "✅", t: "Reach Verified Buyers",  s: "Thousands active daily" },
                  { icon: "⚡", t: "Live in Minutes",        s: "No approval delay" },
                ].map(b => (
                  <div key={b.t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(46,201,126,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{b.icon}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{b.t}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{b.s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* FOOTER */}
        <footer style={{ background: "rgba(8,35,26,0.9)", padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.03em" }}>© 2025 Proti-Binimoy. All rights reserved.</p>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy","Terms","Contact","Help"].map(l => (
                <a key={l} href="#" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.32)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#2ec97e"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.32)"}
                >{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PostItemPage;