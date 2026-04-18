import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import { API_BASE_URL } from "../config/api";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.msg || "Unable to create account.");
        return;
      }

      setSuccess("Account created. Redirecting to sign in...");
      setTimeout(() => navigate("/signin", { replace: true }), 900);
    } catch {
      setError("Unable to register right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage: `url(${websiteBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.76)_42%,rgba(15,118,110,0.2)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl rounded-[1.8rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
            <div className="rounded-[1.5rem] bg-white p-8 text-slate-900 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Create Account
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Register</h1>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Join Proti-Binimoy to buy, sell, and barter with a trusted local community.
              </p>

              <form onSubmit={handleRegister} className="mt-7 space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                <input
                  type="email"
                  required
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/signin" className="font-semibold text-emerald-600 hover:text-emerald-500">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
