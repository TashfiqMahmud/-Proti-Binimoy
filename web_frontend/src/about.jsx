import React from "react";
import { Link } from "react-router-dom";
import websiteBackground from "./assets/web_bg.png";

const pillars = [
  {
    title: "Trust First",
    description:
      "We design for safer second-hand exchanges with verified profiles, clearer listings, and transparent communication.",
  },
  {
    title: "Sustainability",
    description:
      "Every reused item lowers waste. Proti-Binimoy helps quality products stay in use longer across Bangladesh.",
  },
  {
    title: "Community Value",
    description:
      "We connect people locally so trade feels personal, practical, and rooted in mutual benefit.",
  },
];

const milestones = [
  {
    year: "2024",
    title: "Concept & Research",
    description:
      "Started with one question: how can second-hand trade feel modern, safe, and easy for everyone?",
  },
  {
    year: "2025",
    title: "Platform Foundation",
    description:
      "Built core authentication and listing features to launch a reliable exchange experience.",
  },
  {
    year: "Now",
    title: "Refinement Stage",
    description:
      "Improving onboarding, trust signals, and listing quality while preparing for larger community growth.",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `url(${websiteBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(112deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.8)_42%,rgba(15,118,110,0.24)_100%)]" />
        <div className="absolute inset-0 pb-parallax-soft bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.14),transparent_30%)]" />
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl pb-parallax-deep" />

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
              <Link to="/about" className="text-emerald-300 pb-reactive">
                About
              </Link>
              <Link to="/signin" className="transition hover:text-emerald-300 pb-reactive">
                Sign In
              </Link>
            </div>
          </nav>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur pb-reactive" data-reactive-depth="0.55">
              About Proti-Binimoy
            </div>
            <h1 className="mt-8 text-5xl font-black leading-[1.03] text-white md:text-6xl lg:text-7xl">
              A trusted second-hand marketplace
              <span className="block text-emerald-300">for a smarter Bangladesh.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
              We built Proti-Binimoy to make buying, selling, and bartering feel
              safer, cleaner, and more community-driven. Our focus is practical
              sustainability with real trust at every step.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur pb-tilt-card"
            >
              <div className="mb-5 inline-flex rounded-full border border-emerald-300/35 bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Pillar
              </div>
              <h2 className="text-2xl font-extrabold text-white">{pillar.title}</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                {pillar.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-900/80 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur md:p-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Our Journey
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              Where we started and where we are heading.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {milestones.map((milestone) => (
              <article
                key={milestone.title}
                className="rounded-2xl border border-white/10 bg-slate-950/60 p-6 pb-tilt-card"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  {milestone.year}
                </p>
                <h3 className="mt-3 text-xl font-bold text-white">{milestone.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {milestone.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Join Us
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            Trade better. Waste less. Connect locally.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
            Whether you are clearing space, hunting for value, or bartering with
            neighbors, Proti-Binimoy gives you a more trusted place to exchange.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex rounded-full bg-emerald-500 px-7 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 pb-reactive"
              data-reactive-depth="0.8"
            >
              Create Account
            </Link>
            <Link
              to="/signin"
              className="inline-flex rounded-full border border-white/25 px-7 py-3 text-sm font-bold text-white transition hover:border-emerald-300 hover:text-emerald-300 pb-reactive"
              data-reactive-depth="0.8"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
