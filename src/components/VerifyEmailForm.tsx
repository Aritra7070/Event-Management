"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailForm({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);

  const router = useRouter(),
    params = useSearchParams();

  async function sendCode() {
    setSending(true);
    setError("");
    setStatus("");

    try {
      const r = await fetch("/api/otp/send", { method: "POST" }),
        d = await r.json();

      if (!r.ok) throw Error(d.error || "Could not send code.");

      if (d.verified) {
        router.push("/dashboard");
        return;
      }

      setSent(true);
      setStatus(d.message || "Code sent.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not send code."
      );
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (params.get("send") === "1") void sendCode();
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError("");
    setStatus("");

    try {
      const r = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      }),
        d = await r.json();

      if (!r.ok) throw Error(d.error || "Verification failed.");

      setStatus("Email verified. Opening your workspace…");
      router.push(d.redirect || "/dashboard");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Verification failed."
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090910] px-5 py-12">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass relative z-10 w-full max-w-lg rounded-[2rem] p-7 sm:p-10"
      >
        <a
          href="/login"
          className="mb-10 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Eventora
        </a>

        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10">
          <ShieldCheck size={25} className="text-violet-200" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[.25em] text-violet-200">
          One last step
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Verify it’s really you.
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          Hey {name.split(" ")[0]}, enter the six-digit code sent to
          your Google email to finish creating your account.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
            <Mail size={17} className="text-cyan-200" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">
              Verification email
            </p>
            <p className="mt-1 truncate text-sm text-slate-200">
              {email}
            </p>
          </div>

          <CheckCircle2 size={17} className="ml-auto text-emerald-300" />
        </div>

        {status && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] px-4 py-3 text-sm text-emerald-200"
          >
            {status}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </p>
        )}

        <form onSubmit={verify} className="mt-6">
          <label
            htmlFor="otp"
            className="mb-2 block text-xs font-medium text-slate-300"
          >
            6-digit verification code
          </label>

          <input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
            className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-center font-mono text-2xl tracking-[.55em] text-white outline-none placeholder:text-slate-700 focus:border-violet-300/50"
          />

          <button
            disabled={verifying || code.length !== 6}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 text-sm font-semibold text-[#171521] disabled:opacity-40"
          >
            {verifying
              ? "Verifying…"
              : "Verify email & create account"}
            <Sparkles size={15} />
          </button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-3 text-xs text-slate-500 sm:flex-row sm:justify-between">
          <span>Check spam if it’s missing.</span>

          <button
            onClick={sendCode}
            disabled={sending}
            className="text-violet-200 underline underline-offset-4 disabled:opacity-50"
          >
            {sending
              ? "Sending…"
              : sent
                ? "Send a new code"
                : "Send verification code"}
          </button>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-8 w-full border-t border-white/[0.08] pt-5 text-xs text-slate-500 hover:text-slate-300"
        >
          Use a different Google account
        </button>
      </motion.div>
    </main>
  );
}