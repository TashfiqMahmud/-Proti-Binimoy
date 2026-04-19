import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Sports",
  "Books",
  "Vehicles",
  "Other",
];

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { overflow-x: hidden; }

    @keyframes pl-fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .pl-fade { opacity: 0; animation: pl-fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
    .pl-d1 { animation-delay: 0.08s; }
    .pl-d2 { animation-delay: 0.16s; }

    .pl-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 48px;
      background: rgba(8,35,26,0.7); backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .pl-nav-links { display: flex; align-items: center; gap: 28px; }
    .pl-nav-link {
      text-decoration: none; color: rgba(255,255,255,0.7);
      font-size: 14px; font-weight: 500; transition: color 0.2s;
    }
    .pl-nav-link:hover, .pl-nav-link.active { color: #2ec97e; }
    .pl-nav-cta {
      text-decoration: none; color: #fff; font-size: 14px; font-weight: 600;
      background: rgba(46,201,126,0.18); border: 1px solid rgba(46,201,126,0.45);
      padding: 8px 20px; border-radius: 100px; transition: background 0.2s;
    }
    .pl-nav-cta:hover { background: rgba(46,201,126,0.3); }
    .pl-hamburger {
      display: none; flex-direction: column; gap: 5px;
      cursor: pointer; background: none; border: none; padding: 6px;
    }
    .pl-hamburger span {
      display: block; width: 24px; height: 2px; background: #fff;
      border-radius: 2px; transition: all 0.25s;
    }
    .pl-mobile-menu {
      display: none; position: fixed; top: 61px; left: 0; right: 0; z-index: 199;
      background: rgba(8,35,26,0.97); backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 24px 24px 32px; flex-direction: column;
    }
    .pl-mobile-menu.open { display: flex; }
    .pl-mobile-link {
      text-decoration: none; color: rgba(255,255,255,0.8);
      font-size: 17px; font-weight: 500; padding: 14px 0;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .pl-mobile-cta {
      text-decoration: none; display: block; text-align: center; margin-top: 20px;
      background: linear-gradient(135deg,#2ec97e,#1b7d52);
      color: #fff; font-size: 16px; font-weight: 600; padding: 15px; border-radius: 14px;
    }

    @media (max-width: 1024px) {
      .pl-nav { padding: 14px 28px; }
    }
    @media (max-width: 640px) {
      .pl-nav { padding: 14px 20px; }
      .pl-nav-links { display: none; }
      .pl-hamburger { display: flex; }
    }
  `}</style>
);

const PostListingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (index, value) => {
    setImageUrls((prev) => prev.map((url, i) => (i === index ? value : url)));
  };

  const addImageInput = () => {
    setImageUrls((prev) => (prev.length >= 5 ? prev : [...prev, ""]));
  };

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (title.trim().length > 100) return "Title cannot exceed 100 characters.";
    if (!description.trim()) return "Description is required.";
    if (description.trim().length < 20) return "Description must be at least 20 characters.";
    if (price === "") return "Price is required.";
    if (Number(price) < 0) return "Price must be 0 or more.";
    if (!category) return "Category is required.";
    if (!condition) return "Condition is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      images: imageUrls.map((url) => url.trim()).filter(Boolean),
      location: {
        city: city.trim(),
        address: address.trim(),
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.msg || "Unable to create listing.");
        return;
      }

      const createdId = data?.listing?._id;
      if (!createdId) {
        setError("Listing created, but no listing id was returned.");
        return;
      }
      navigate(`/listings/${createdId}`, { replace: true });
    } catch {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", color: "#fff", overflowX: "hidden", background: "rgba(8,35,26,1)" }}>
      <GlobalStyles />

      <nav className="pl-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              background: "linear-gradient(135deg,#2ec97e,#1b7d52)",
              borderRadius: 11,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Playfair Display',serif",
              fontWeight: 900,
              fontSize: 19,
              color: "#fff",
            }}
          >
            P
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
              Proti-Binimoy
            </p>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginTop: 3,
              }}
            >
              Sustainable Marketplace
            </p>
          </div>
        </div>

        <div className="pl-nav-links">
          <Link to="/" className="pl-nav-link">Home</Link>
          <Link to="/listings" className="pl-nav-link">Listings</Link>
          <Link to="/dashboard" className="pl-nav-link">Dashboard</Link>
          <Link to="/listings/new" className="pl-nav-cta">Post Listing</Link>
        </div>

        <button className="pl-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>
      <div className={`pl-mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/listings" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>Listings</Link>
        <Link to="/dashboard" className="pl-mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        <Link to="/listings/new" className="pl-mobile-cta" onClick={() => setMenuOpen(false)}>Post Listing</Link>
      </div>

      <section style={{ padding: "108px 24px 42px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div className="pl-fade pl-d1" style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "#2ec97e", marginBottom: 8 }}>
              New Listing
            </p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,3.8vw,48px)", lineHeight: 1.08, color: "#fff", marginBottom: 8 }}>
              Post something valuable
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.66)" }}>
              Posting as <strong style={{ color: "#fff", fontWeight: 600 }}>{user?.name || "User"}</strong>
            </p>
          </div>

          <div
            className="pl-fade pl-d2"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: 22,
              backdropFilter: "blur(24px)",
              padding: 6,
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 18,
                display: "grid",
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Title *</label>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{title.length}/100</span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  required
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
                  placeholder="Product title"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Description *</label>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{description.length} characters</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={20}
                  rows={5}
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
                  placeholder="Describe condition, features, and any defects..."
                />
              </div>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Price (BDT ৳) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
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
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
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
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>City / Area</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
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
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Full Address (optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                  Image URLs (up to 5)
                </label>
                <div style={{ display: "grid", gap: 8 }}>
                  {imageUrls.map((url, index) => (
                    <input
                      key={index}
                      type="url"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
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
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImageInput}
                  disabled={imageUrls.length >= 5}
                  style={{
                    marginTop: 10,
                    border: "1.5px solid #e5e7eb",
                    background: "#fff",
                    borderRadius: 13,
                    padding: "10px 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    cursor: imageUrls.length >= 5 ? "not-allowed" : "pointer",
                    opacity: imageUrls.length >= 5 ? 0.7 : 1,
                  }}
                >
                  Add another image
                </button>
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
                    padding: "13px 17px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Posting..." : "Post Listing"}
                </button>
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: "none",
                    border: "1.5px solid #e5e7eb",
                    color: "#374151",
                    borderRadius: 13,
                    padding: "12px 14px",
                    fontSize: 14,
                    fontWeight: 600,
                    background: "#fff",
                  }}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PostListingPage;

