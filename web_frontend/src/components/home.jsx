import React from "react";
import { Link } from "react-router-dom";
import websiteBackground from "../assets/web_bg.png";

const featureCards = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M12 3l6 2.5v5.8c0 4.1-2.5 7.9-6 9.7-3.5-1.8-6-5.6-6-9.7V5.5L12 3z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 12.2l1.7 1.7 3.6-3.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Trusted Exchanges",
    description:
      "Connect with people in your area through a platform designed for safer second-hand trading and barter.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M7.5 7.5h5V3.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.7 8.1A6.8 6.8 0 007.5 7.5L5 10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 16.5h-5v3.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.3 15.9a6.8 6.8 0 009.2.6L19 14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Sustainable Choices",
    description:
      "Give quality items a second life, reduce waste, and support smarter everyday consumption.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M8 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4.5 18.5c.8-2.1 2.4-3.2 4.8-3.2s4 1.1 4.8 3.2M11.2 18.5c.7-1.9 2.2-2.9 4.3-2.9 1.9 0 3.3.9 4 2.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "Community First",
    description:
      "Build meaningful local connections while discovering items that still hold real value.",
  },
];

const HomePage = () => {
  return (
    <div className="bg-slate-50 text-slate-900">
      <section
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage: `url(${websiteBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-900/30 to-emerald-900/20" />
        <div className="absolute inset-0 bg-white/10" />
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/30 blur-3xl" />

        <header className="relative z-10">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-2xl font-black text-emerald-700 shadow-lg shadow-black/10">
                P
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-wide text-white md:text-4xl">
                  Proti-Binimoy
                </p>
                <p className="text-sm uppercase tracking-[0.45em] text-white/80 md:text-base">
                  Sustainable Marketplace
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-8 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white shadow-lg backdrop-blur md:flex">
              <Link to="/">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/signin">Sign In</Link>
            </div>

          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl items-center px-6 pb-16 pt-10 lg:px-10">
          <div className="max-w-3xl">
              <div className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/15 px-5 py-2.5 text-base font-semibold text-white shadow-lg backdrop-blur md:text-xl">
                Smarter buying, selling, and bartering across Bangladesh
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[1] text-white md:text-6xl lg:text-7xl">
                Give useful items a
                <span className="block text-emerald-300">second chance.</span>
              </h1>

              <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-100/95 md:text-xl">
                Proti-Binimoy helps people exchange, discover, and resell second-hand
                products through a platform that feels modern, trustworthy, and
                community-driven.
              </p>

              <div className="mt-10">
                <Link
                  to="/signin"
                  className="inline-flex rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-emerald-900/30 transition hover:bg-emerald-400 md:text-lg"
                >
                  Explore Marketplace
                </Link>
              </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.14),_transparent_28%)]" />
        <div className="absolute left-1/2 top-0 h-px w-5/6 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-300">
                Why Choose Us
              </p>
              <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
                A marketplace designed to feel
                <span className="block text-emerald-300">credible, elevated, and modern.</span>
              </h2>
            </div>

            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-lg leading-8 text-slate-300 md:text-xl">
                From student essentials to home goods, Proti-Binimoy creates a more
                refined exchange experience for people who want practical trades
                without the noise, clutter, or uncertainty.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-emerald-300/30 hover:bg-white/12"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl transition duration-300 group-hover:bg-emerald-300/20" />
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-teal-400 text-slate-950 shadow-lg shadow-emerald-950/30">
                {card.icon}
              </div>
              <h3 className="text-2xl font-bold text-white">{card.title}</h3>
              <p className="mt-4 text-base leading-8 text-slate-300">{card.description}</p>
              <div className="mt-8 h-px w-full bg-gradient-to-r from-emerald-300/50 to-transparent" />
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
