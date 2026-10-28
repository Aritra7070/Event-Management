"use client";

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Globe2,
  LockKeyhole,
  Sparkles,
  Ticket,
  Users,
  WandSparkles,
} from "lucide-react";
import ThreeScene from "@/components/ThreeScene";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function LoginExperience() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090910]">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-1/3 h-96 w-96 rounded-full bg-violet-700/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 -top-20 h-[34rem] w-[34rem] rounded-full bg-cyan-500/10 blur-[140px]" />

      <header className="relative z-10 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 md:px-12">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.06] shadow-lg">
            <Sparkles size={19} className="text-violet-200" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            eventora
            <span className="text-violet-300">.</span>
          </span>
        </a>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-slate-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Your next great gathering starts here
        </div>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1440px] items-center gap-10 px-6 pb-12 pt-3 md:px-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="relative z-10 max-w-2xl py-8 lg:py-16"
        >
          <motion.div
            variants={rise}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3.5 py-2 text-xs font-medium text-violet-100"
          >
            <WandSparkles size={14} /> THE FUTURE OF GATHERING
            <span className="ml-1 rounded-full bg-violet-200/15 px-2 py-0.5 text-[10px]">
              BETA
            </span>
          </motion.div>

          <motion.h1
            variants={rise}
            className="max-w-2xl text-5xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-6xl md:text-7xl"
          >
            Bring people
            <br />
            together for{" "}
            <span className="gradient-text">something</span>
            <br />
            <span className="gradient-text">remarkable.</span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-7 max-w-lg text-base leading-7 text-slate-400 md:text-lg"
          >
            One calm, beautiful place to create events, welcome your people,
            and turn a moment into a memory.
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-9 grid max-w-xl grid-cols-3 gap-3"
          >
            {[
              {
                icon: CalendarDays,
                title: "Plan",
                text: "Events, beautifully",
              },
              {
                icon: Ticket,
                title: "Welcome",
                text: "Effortless check-in",
              },
              {
                icon: Users,
                title: "Connect",
                text: "Your community",
              },
            ].map((x) => (
              <div
                key={x.title}
                className="rounded-2xl border border-white/[0.09] bg-white/[0.025] p-3.5 transition hover:-translate-y-1 hover:border-violet-300/30 sm:p-4"
              >
                <x.icon size={18} className="mb-4 text-violet-200" />
                <p className="text-sm font-medium">{x.title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs">
                  {x.text}
                </p>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={rise}
            className="mt-8 flex items-center gap-3 text-xs text-slate-500"
          >
            <div className="flex -space-x-2">
              {["#a78bfa", "#67e8f9", "#f0abfc", "#86efac"].map((c, i) => (
                <span
                  key={c}
                  style={{ background: c }}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#090910] text-[9px] font-bold text-slate-950"
                >
                  {["A", "J", "M", "K"][i]}
                </span>
              ))}
            </div>
            <span>
              <b className="text-slate-300">Made for your people.</b> Built
              for every kind of event.
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-violet-500/[0.08] blur-3xl" />

          <div className="relative aspect-[1.03/1] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0c18] shadow-2xl sm:aspect-[1.13/1]">
            <ThreeScene />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0c18] via-transparent to-[#0d0c18]/20" />

            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-[11px] text-slate-300 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              A little wonder, in every detail
            </div>

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#12111f]/80 p-4 backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[.22em] text-violet-200">
                    Your world, in sync
                  </p>
                  <h2 className="mt-2 text-xl font-medium sm:text-2xl">
                    Every detail. One place.
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-400">
                    From the first invite to the final hello.
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <Globe2 size={19} className="text-cyan-200" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-2.5 py-1.5 text-[10px] text-emerald-200">
                  <Check size={11} />
                  Smart invitations
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-violet-300/10 px-2.5 py-1.5 text-[10px] text-violet-200">
                  <LockKeyhole size={11} />
                  Verified members
                </span>
              </div>
            </div>

            <div className="absolute right-5 top-1/4 hidden animate-bounce rounded-xl border border-white/10 bg-[#171426]/90 p-3 shadow-xl backdrop-blur-xl sm:block">
              <p className="text-[10px] font-medium">A new memory awaits</p>
              <p className="mt-1 text-[9px] text-slate-500">
                Invite · Connect · Celebrate
              </p>
            </div>
          </div>

          <div className="relative mt-5 flex flex-col items-center">
            <p className="mb-3 text-[11px] uppercase tracking-[.2em] text-slate-500">
              Your community starts with you
            </p>

            <button
              onClick={() =>
                signIn("google", { redirectTo: "/verify-email?send=1" })
              }
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-[#171521] shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-violet-50"
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.27 5.64c4.25-3.92 7.5-9.71 7.5-17.29Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.27-5.64c-2.02 1.35-4.6 2.15-8.64 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>

              Continue with Google

              <ArrowUpRight
                size={16}
                className="ml-auto text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>

            <p className="mt-4 max-w-sm text-center text-[11px] leading-5 text-slate-500">
              Continue securely with Google. We’ll email a one-time code to
              verify your address before registering you.
            </p>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-white/[0.07] px-6 py-5 text-[10px] text-slate-600 sm:flex-row sm:justify-between md:px-12">
        <span>© 2026 Eventora. Make room for remarkable.</span>
        <span>
          Secure sign-in · Email verification · Your data stays yours
        </span>
      </footer>
    </main>
  );
}