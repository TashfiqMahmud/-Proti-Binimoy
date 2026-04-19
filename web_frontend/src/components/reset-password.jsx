import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";
import { API_BASE_URL } from "../config/api";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { token, email } = useMemo(() => {
    const query = new URLSearchParams(window.location.search);
    return {
      token: query.get("token") || "",
      email: query.get("email") || "",
    };
  }, []);

  const isInvalidLink = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.msg || "Unable to reset password. Please try again.");
        return;
      }

      setSuccess("Password reset! Redirecting to sign in…");
      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 1500);
    } catch {
      setError("Unable to connect. Please check your connection.");
    } finally {
      setLoading(false);
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
        <div className="absolute inset-0 pb-parallax-soft bg-[linear-gradient(115deg,rgba(2,6,23,0.9)_0%,rgba(2,6,23,0.8)_44%,rgba(15,118,110,0.2)_100%)]" />
        <div className="absolute left-[-100px] top-16 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl pb-parallax-deep" />
        <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl rounded-[1.8rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl pb-tilt-card">
            <div className="rounded-[1.5rem] bg-white p-8 text-slate-900 md:p-10">
              {isInvalidLink ? (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Password Recovery
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight">Reset Password</h1>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Invalid reset link. Please request a new one.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      to="/forgot-password"
                      className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Request New Link
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Password Recovery
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-tight">Create New Password</h1>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    Enter a strong new password for your account.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                        placeholder="Confirm new password"
                      />
                    </div>

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
                      disabled={loading}
                      className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-700"
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResetPasswordPage;
