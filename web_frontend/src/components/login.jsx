import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import { API_BASE_URL } from "../config/api";

const trustPoints = [
  "Verified profiles for more confident exchanges",
  "Cleaner listings and simpler communication",
  "Built for sustainable buying, selling, and barter",
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.msg || "Invalid email or password.");
        return;
      }

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      if (data.user) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
      }

      navigate("/", { replace: true });
    } catch {
      setError("Unable to sign in right now. Please try again.");
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
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.74)_38%,rgba(15,23,42,0.38)_64%,rgba(15,118,110,0.18)_100%)]" />
        <div className="absolute inset-0 pb-parallax-soft bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_24%)]" />
        <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl pb-parallax-deep" />

        <header className="relative z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-2xl font-black text-emerald-700 shadow-lg shadow-black/20">
                P
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-wide text-white md:text-4xl">
                  Proti-Binimoy
                </p>
                <p className="text-xs uppercase tracking-[0.45em] text-white/75 md:text-sm">
                  Sustainable Marketplace
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-8 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur md:flex">
              <Link to="/" className="transition hover:text-emerald-300 pb-reactive">
                Home
              </Link>
              <Link to="/about" className="transition hover:text-emerald-300 pb-reactive">
                About
              </Link>
              <Link to="/signin" className="text-emerald-300 pb-reactive">
                Sign In
              </Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] max-w-7xl items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur pb-reactive" data-reactive-depth="0.55">
              Welcome back to a smarter exchange experience
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[1.02] text-white md:text-6xl lg:text-7xl">
              Sign in to continue your
              <span className="block text-emerald-300">trusted marketplace journey.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200 md:text-xl">
              Access a cleaner, more reliable platform for second-hand trade, resale,
              and local bartering built for modern users across Bangladesh.
            </p>

            <div className="mt-10 grid gap-4">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur pb-tilt-card"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 to-teal-400 text-slate-950">
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path
                        d="M7 12.5l3.2 3.2L17.5 8.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-base text-slate-100">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl pb-tilt-card">
              <div className="w-full max-w-xl rounded-[1.6rem] bg-white p-8 text-slate-900 md:p-10">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Account Access
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight">
                    Sign In
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-500">
                    Enter your email and password to manage listings, connect with
                    buyers, and continue exchanging with confidence.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-emerald-600 transition hover:text-emerald-500 pb-reactive"
                        data-reactive-depth="0.7"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-slate-950 px-6 py-4 text-base font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-700 pb-reactive"
                    data-reactive-depth="0.85"
                  >
                    {isSubmitting ? "Signing In..." : "Sign In"}
                  </button>
                </form>

                <div className="mt-8">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      New Here
                    </p>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <p className="mt-6 text-center text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-emerald-600 transition hover:text-emerald-500 pb-reactive"
                      data-reactive-depth="0.7"
                    >
                      Create now
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
