"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, Check, Eye, EyeOff, Gauge, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { apiFetch, getBrowserLocation, setToken } from "../lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string; shape?: string }) => void;
        };
      };
    };
  }
}

type AuthMode = "signup" | "login";

const features = [
  { icon: Sparkles, label: "AI Review Generation" },
  { icon: QrCode, label: "QR Code Reviews" },
  { icon: BarChart3, label: "Review Analytics" },
  { icon: Gauge, label: "Business Dashboard" }
];

const tabContent = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" }
};

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "");

  const isSignup = mode === "signup";

  const buttonText = useMemo(() => {
    if (loading) return "Please wait";
    return isSignup ? "Create Account" : "Login";
  }, [isSignup, loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const locationPromise = getBrowserLocation();

    try {
      const response = await apiFetch<{ token: string }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      setToken(response.token);

      const location = await locationPromise;
      if (location) {
        await apiFetch("/api/auth/location", {
          method: "PATCH",
          body: JSON.stringify(location)
        }).catch(() => null);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not continue");
    } finally {
      setLoading(false);
    }
  }

  const setupGoogleButton = useCallback(() => {
    if (!googleClientId || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        setLoading(true);
        setError("");

        const locationPromise = getBrowserLocation();

        try {
          const location = await locationPromise;
          const result = await apiFetch<{ token: string }>("/api/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential: response.credential, location })
          });
          setToken(result.token);
          router.push("/dashboard");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Google login failed");
        } finally {
          setLoading(false);
        }
      }
    });

    const target = document.getElementById("google-signin");
    if (target) {
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "outline",
        size: "large",
        width: Math.min(target.clientWidth || 320, 360),
        text: "continue_with",
        shape: "pill"
      });
    }
  }, [googleClientId, router]);

  useEffect(() => {
    apiFetch<{ googleClientId: string }>("/api/auth/config")
      .then((config) => {
        if (config.googleClientId) {
          setGoogleClientId(config.googleClientId);
        }
      })
      .catch(() => null)
      .finally(() => setConfigLoaded(true));
  }, []);

  useEffect(() => {
    setupGoogleButton();
  }, [mode, setupGoogleButton]);

  return (
    <main className="min-h-screen overflow-y-auto bg-[#f7fbf8] text-slate-950">
      {googleClientId ? <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={setupGoogleButton} /> : null}

      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative hidden overflow-hidden bg-slate-950 px-10 py-8 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between xl:px-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.36),transparent_34%),radial-gradient(circle_at_82%_24%,rgba(34,197,94,0.2),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_42%,#052e2b_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(16,185,129,0.16),transparent)]" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-400/20">
              <QrCode size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">ReviewQR AI</span>
          </div>

          <div className="relative z-10 max-w-2xl py-8 xl:py-12">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }}>
              <p className="mb-4 inline-flex rounded-full border border-emerald-300/20 bg-white/8 px-3 py-1 text-sm font-semibold text-emerald-100 backdrop-blur">
                AI-powered reputation growth
              </p>
              <h1 className="max-w-xl text-5xl font-bold leading-[1.02] tracking-normal xl:text-6xl">Get More Google Reviews with AI</h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200">
                Generate QR codes, collect customer feedback, and convert it into professional Google reviews using AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.55 }}
              className="mt-8 grid max-w-xl grid-cols-2 gap-3"
            >
              {features.map((feature) => (
                <div key={feature.label} className="rounded-lg border border-white/12 bg-white/8 p-3.5 backdrop-blur-md">
                  <feature.icon className="mb-3 text-emerald-300" size={23} />
                  <p className="text-sm font-semibold text-slate-100">{feature.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.6, ease: "easeOut" }}
            className="relative z-10 mb-1 max-w-xl"
          >
            <div className="relative rounded-[24px] border border-white/14 bg-white/10 p-4 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Review funnel</p>
                  <p className="text-xs text-slate-300">QR scan to published review</p>
                </div>
                <div className="rounded-full bg-emerald-400/16 px-3 py-1 text-xs font-bold text-emerald-200">+38%</div>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-5">
                <div className="grid aspect-square grid-cols-5 gap-1 rounded-2xl bg-white p-3">
                  {Array.from({ length: 25 }).map((_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "rounded-[4px]",
                        [0, 1, 3, 4, 5, 9, 10, 11, 13, 16, 18, 19, 20, 21, 24].includes(index) ? "bg-slate-950" : "bg-emerald-100"
                      )}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {["Customer scans QR", "AI drafts review", "Owner tracks growth"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                        <Check size={15} />
                      </div>
                      <span className="text-sm font-medium text-slate-100">{item}</span>
                      <span className="ml-auto text-xs text-slate-400">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <section className="relative flex min-h-screen items-start justify-center px-5 py-8 sm:px-8 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_12%,rgba(16,185,129,0.22),transparent_28%),radial-gradient(circle_at_78%_80%,rgba(34,197,94,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#eefbf2_100%)]" />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="mb-6 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300 shadow-xl shadow-slate-950/15">
                <QrCode size={25} />
              </div>
              <p className="text-sm font-bold text-emerald-700">ReviewQR AI</p>
              <h1 className="mt-2 text-3xl font-bold leading-tight tracking-normal text-slate-950">Get More Google Reviews with AI</h1>
            </div>

            <Card className="p-5 sm:p-7">
              <div className="mb-7 rounded-2xl bg-slate-100/80 p-1">
                <div className="grid grid-cols-2 gap-1">
                  {(["signup", "login"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setError("");
                        setMode(tab);
                      }}
                      className={cn(
                        "relative h-11 rounded-xl text-sm font-bold text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                        mode === tab && "text-slate-950"
                      )}
                    >
                      {mode === tab ? (
                        <motion.span
                          layoutId="active-auth-tab"
                          className="absolute inset-0 rounded-xl bg-white shadow-sm shadow-slate-950/8"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative z-10">{tab === "signup" ? "Sign Up" : "Login"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={submit}>
                <div className="mb-5 flex min-h-11 justify-center">
                  {googleClientId ? (
                    <div id="google-signin" className="flex w-full justify-center" />
                  ) : (
                    <Button type="button" variant="outline" className="w-full" disabled={!configLoaded}>
                      <ShieldCheck size={18} />
                      Continue with Google
                    </Button>
                  )}
                </div>

                <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" />
                  OR
                  <span className="h-px flex-1 bg-slate-200" />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    variants={tabContent}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        required
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                          Password
                        </label>
                        {!isSignup ? (
                          <a href="#" className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-600">
                            Forgot Password?
                          </a>
                        ) : null}
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete={isSignup ? "new-password" : "current-password"}
                          minLength={8}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Minimum 8 characters"
                          className="pr-12"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {isSignup ? (
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="confirm-password">
                          Confirm Password
                        </label>
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          minLength={8}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter password"
                          required
                        />
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}

                <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
                  {buttonText}
                  <ArrowRight size={18} />
                </Button>
              </form>

              <div className="mt-6 grid gap-2 text-center text-sm font-semibold text-slate-500 sm:grid-cols-2">
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800">No credit card required</div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">Start free in under 30 seconds</div>
              </div>
            </Card>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
