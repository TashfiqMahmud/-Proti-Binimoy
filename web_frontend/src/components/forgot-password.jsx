import React from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

const ForgotPasswordPage = () => {
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
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Password Recovery
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Reset Password</h1>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Password reset is not implemented yet on this build. For now, please contact support
                or create a new account if this is a development environment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/signin"
                  className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 pb-reactive"
                  data-reactive-depth="0.85"
                >
                  Back to Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 pb-reactive"
                  data-reactive-depth="0.8"
                >
                  Create New Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPasswordPage;
