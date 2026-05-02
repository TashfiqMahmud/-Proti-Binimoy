import React, { useState } from "react";

/* ─── Footer Modal Styles (self-contained) ─── */
const FooterStyles = () => (
  <style>{`
    @keyframes pb-modalIn    { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes pb-backdropIn { from{opacity:0} to{opacity:1} }

    .pb-modal-backdrop {
      position:fixed; inset:0; z-index:9000;
      background:rgba(8,35,26,0.72); backdrop-filter:blur(10px);
      display:flex; align-items:center; justify-content:center;
      padding:24px; animation:pb-backdropIn 0.22s ease forwards;
    }
    .pb-modal {
      background:#fff; border-radius:24px; width:100%; max-width:640px;
      max-height:85vh; display:flex; flex-direction:column;
      box-shadow:0 40px 100px rgba(0,0,0,0.35);
      animation:pb-modalIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
      overflow:hidden;
    }
    .pb-modal-header {
      display:flex; align-items:center; justify-content:space-between;
      padding:24px 28px 20px; border-bottom:1px solid #f0f0ee; flex-shrink:0;
    }
    .pb-modal-body { overflow-y:auto; padding:28px; flex:1; scrollbar-width:thin; scrollbar-color:#d1d5db #f9fafb; }
    .pb-modal-body::-webkit-scrollbar { width:4px; }
    .pb-modal-body::-webkit-scrollbar-thumb { background:#d1d5db; border-radius:2px; }
    .pb-modal-close {
      width:36px; height:36px; border-radius:50%; border:1.5px solid #e5e7eb;
      background:#f9fafb; color:#6b7280; cursor:pointer; font-size:18px;
      display:flex; align-items:center; justify-content:center; flex-shrink:0;
      transition:background 0.2s, border-color 0.2s; line-height:1;
    }
    .pb-modal-close:hover { background:#f3f4f6; border-color:#9ca3af; color:#374151; }
    .pb-modal-section { margin-bottom:28px; }
    .pb-modal-section:last-child { margin-bottom:0; }
    .pb-modal-section h3 {
      font-family:'Playfair Display',serif; font-size:16px; font-weight:700;
      color:#0d1f16; margin-bottom:8px;
    }
    .pb-modal-section p, .pb-modal-section li {
      font-size:14px; line-height:1.8; color:#4b5563; font-weight:300;
    }
    .pb-modal-section ul { padding-left:18px; }
    .pb-modal-section li { margin-bottom:4px; }
    .pb-modal-divider { height:1px; background:#f0f0ee; margin:20px 0; }
    .pb-modal-tag {
      display:inline-flex; align-items:center; gap:6px;
      background:rgba(46,201,126,0.1); border:1px solid rgba(46,201,126,0.25);
      border-radius:100px; padding:4px 12px; margin-bottom:16px;
      font-size:11px; font-weight:600; color:#1b7d52; letter-spacing:0.06em; text-transform:uppercase;
    }
    .pb-contact-input {
      width:100%; border:1.5px solid #e5e7eb; background:#f9fafb;
      border-radius:12px; padding:12px 14px; font-size:14px;
      font-family:inherit; outline:none; color:#111827;
      transition:border-color 0.2s, box-shadow 0.2s;
    }
    .pb-contact-input::placeholder { color:#9ca3af; }
    .pb-contact-input:focus { border-color:#2ec97e; background:#fff; box-shadow:0 0 0 3px rgba(46,201,126,0.1); }
    .pb-contact-label { display:block; font-size:11px; font-weight:700; color:#374151; margin-bottom:6px; letter-spacing:0.04em; text-transform:uppercase; }
    .pb-contact-submit {
      width:100%; padding:13px; border-radius:12px; border:none; cursor:pointer;
      background:linear-gradient(135deg,#2ec97e,#1b7d52); color:#fff;
      font-size:15px; font-weight:600; font-family:inherit;
      transition:opacity 0.2s, transform 0.15s;
      box-shadow:0 6px 20px rgba(46,201,126,0.3);
    }
    .pb-contact-submit:hover { opacity:0.88; transform:translateY(-1px); }
    .pb-contact-submit:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
    .pb-contact-success { text-align:center; padding:32px 20px; }
    .pb-footer-inner { max-width:1280px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; }
    @media (max-width:640px) { .pb-footer-inner { flex-direction:column; gap:20px; text-align:center; } }
  `}</style>
);

/* ─── Footer Modal ─── */
const FooterModal = ({ type, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1200);
  };

  const CONTENT = {
    Privacy: {
      emoji: "🔐", label: "Privacy Policy", updated: "Last updated: May 2026",
      sections: [
        { title: "Information We Collect", body: "We collect information you provide directly — such as your name, email address, phone number, and profile details when you register. We also collect information about how you use our platform, including listings you view, items you save, and messages you send through our in-app system." },
        { title: "How We Use Your Information", items: ["To create and manage your account", "To connect buyers and sellers safely", "To send important service notifications", "To improve platform features and user experience", "To detect and prevent fraud or misuse"] },
        { title: "Information Sharing", body: "We do not sell your personal data to third parties. Your contact information is only shared with other users when you choose to initiate a trade or exchange. We may share anonymised, aggregated data for analytics purposes." },
        { title: "Data Security", body: "All data is encrypted in transit using TLS. Passwords are hashed and never stored in plain text. We conduct regular security audits and follow industry best practices to keep your information safe." },
        { title: "Your Rights", items: ["Request a copy of your personal data", "Ask us to correct inaccurate information", "Request deletion of your account and data", "Opt out of non-essential communications"] },
        { title: "Contact Us", body: "If you have any questions about this Privacy Policy, please contact us at privacy@protibi.com. We aim to respond within 48 hours." },
      ],
    },
    Terms: {
      emoji: "📋", label: "Terms of Service", updated: "Last updated: January 2026",
      sections: [
        { title: "Acceptance of Terms", body: "By accessing or using Proti-Binimoy, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform." },
        { title: "Eligibility", body: "You must be at least 16 years old to use Proti-Binimoy. By creating an account, you confirm that you are of eligible age and that the information you provide is accurate and truthful." },
        { title: "User Responsibilities", items: ["List only items you legally own or have permission to sell", "Provide accurate descriptions, photos, and pricing", "Respond to messages in a timely manner", "Complete agreed trades in good faith", "Do not engage in fraud, harassment, or deceptive practices"] },
        { title: "Prohibited Items", body: "The following items are strictly prohibited: counterfeit or stolen goods, weapons and ammunition, controlled substances, adult content, and any items banned under Bangladeshi law. Violating this rule will result in immediate account suspension." },
        { title: "Platform Role", body: "Proti-Binimoy is a peer-to-peer marketplace. We facilitate connections between users but are not a party to any transaction. We are not responsible for the quality, safety, or legality of items listed, or for any disputes between users." },
        { title: "Termination", body: "We reserve the right to suspend or terminate accounts that violate these Terms, engage in harmful behaviour, or harm the integrity of the platform. You may also delete your account at any time from your profile settings." },
      ],
    },
    Contact: null,
  };

  const content = CONTENT[type];

  return (
    <div className="pb-modal-backdrop" onClick={onClose}>
      <div className="pb-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="pb-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,rgba(46,201,126,0.15),rgba(27,125,82,0.25))", border: "1px solid rgba(46,201,126,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {type === "Privacy" ? "🔐" : type === "Terms" ? "📋" : "✉️"}
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#1b7d52", letterSpacing: "0.08em", textTransform: "uppercase" }}>Proti-Binimoy</p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: "#0d1f16", lineHeight: 1.2 }}>
                {type === "Privacy" ? "Privacy Policy" : type === "Terms" ? "Terms of Service" : "Get in Touch"}
              </h2>
            </div>
          </div>
          <button className="pb-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="pb-modal-body">
          {/* Privacy & Terms */}
          {(type === "Privacy" || type === "Terms") && content && (
            <>
              <div className="pb-modal-tag">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2ec97e", display: "inline-block" }} />
                {content.updated}
              </div>
              {content.sections.map((s, i) => (
                <div key={i} className="pb-modal-section">
                  <h3>{s.title}</h3>
                  {s.body && <p>{s.body}</p>}
                  {s.items && <ul>{s.items.map((item, j) => <li key={j}>{item}</li>)}</ul>}
                  {i < content.sections.length - 1 && <div className="pb-modal-divider" />}
                </div>
              ))}
            </>
          )}

          {/* Contact */}
          {type === "Contact" && (
            sent ? (
              <div className="pb-contact-success">
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: "#0d1f16", marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7 }}>Thanks for reaching out, <strong>{form.name}</strong>. Our team will get back to you at <strong>{form.email}</strong> within 24–48 hours.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24, padding: "16px 18px", borderRadius: 14, background: "rgba(46,201,126,0.07)", border: "1px solid rgba(46,201,126,0.2)" }}>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                    Have a question, feedback, or need help with a trade? We're here for you. Fill out the form below and our team will respond within <strong>24–48 hours</strong>.
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label className="pb-contact-label">Your Name</label>
                    <input className="pb-contact-input" placeholder="e.g. Rafiul Hasan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="pb-contact-label">Email Address</label>
                    <input className="pb-contact-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label className="pb-contact-label">Subject</label>
                  <select className="pb-contact-input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={{ cursor: "pointer" }}>
                    <option value="">Select a topic…</option>
                    <option>General Enquiry</option>
                    <option>Report a Problem</option>
                    <option>Account & Security</option>
                    <option>Trade Dispute</option>
                    <option>Feedback & Suggestions</option>
                    <option>Partnership Opportunity</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="pb-contact-label">Message</label>
                  <textarea className="pb-contact-input" rows={5} placeholder="Tell us how we can help…" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: "vertical", minHeight: 110 }} />
                </div>

                <button className="pb-contact-submit" onClick={handleSubmit} disabled={sending || !form.name || !form.email || !form.message}>
                  {sending ? "Sending…" : "Send Message →"}
                </button>

                <div style={{ marginTop: 20, display: "flex", gap: 20, flexWrap: "wrap" }}>
                  {[
                    { icon: "📧", label: "Email", val: "hello@protibi.com" },
                    { icon: "📍", label: "Location", val: "Dhanmondi, Dhaka" },
                    { icon: "⏱️", label: "Response", val: "Within 48 hours" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
                        <p style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── PageFooter — drop this into any page ─── */
const PageFooter = () => {
  const [modal, setModal] = useState(null); // "Privacy" | "Terms" | "Contact" | null

  return (
    <>
      <FooterStyles />
      <footer style={{ background: "#08231a", padding: "40px 48px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="pb-footer-inner">
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)", letterSpacing: "0.04em" }}>© 2026 Proti-Binimoy. All rights reserved.</p>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Contact"].map((l) => (
              <button
                key={l}
                onClick={() => setModal(l)}
                style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#2ec97e"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.38)"}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </footer>
      {modal && <FooterModal type={modal} onClose={() => setModal(null)} />}
    </>
  );
};

export default PageFooter;