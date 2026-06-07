"use client";

import { motion } from "framer-motion";
import { BarChart3, Copy, Download, ExternalLink, QrCode, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GlassCard } from "../../components/GlassCard";
import { Sidebar, DashboardHeader } from "../../components/Sidebar";
import { Button } from "../../components/Button";
import { apiFetch, Business, CurrentUser, getToken } from "../../lib/api";

type Analytics = {
  metrics: {
    qrScans: number;
    reviewsGenerated: number;
    reviewsPosted: number;
    averageRating: number;
  } | null;
  insights: {
    mostMentionedWords: { word: string; count: number }[];
    summary: string;
  } | null;
};

export default function Dashboard() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const reviewUrl = useMemo(() => (business ? `${window.location.origin}/review/${business._id}` : ""), [business]);

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }

    load();
  }, [router]);

  async function load() {
    const profile = await apiFetch<{ business: Business | null; user: CurrentUser | null }>("/api/business/me");
    setBusiness(profile.business);
    setUser(profile.user);

    const metrics = await apiFetch<Analytics>("/api/business/analytics");
    setAnalytics(metrics);
  }

  function downloadQr() {
    if (!business?.qrCode) return;
    const anchor = document.createElement("a");
    anchor.href = business.qrCode;
    anchor.download = `${business.businessName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    anchor.click();
  }

  function getLocationDisplay() {
    const location = user?.lastLoginLocation;
    if (!location) return "Unknown location";
    
    const parts = [];
    if (location.locality) parts.push(location.locality);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  }

  const metrics = analytics?.metrics;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* Mobile Header */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="relative z-10 flex">
        {/* Sidebar */}
        <Sidebar
          isMobile={true}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Sidebar isMobile={false} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop Header */}
          <header className="hidden lg:block sticky top-0 z-20 border-b border-white/20 bg-white/30 backdrop-blur-glass">
            <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-950 mb-1">ReviewQR AI</h1>
                <p className="text-sm text-slate-600">Welcome back 👋</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1">{getLocationDisplay()}</p>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="px-5 pt-8 lg:px-8"
          >
            <div className="max-w-7xl mx-auto">
              <GlassCard className="p-8 lg:p-12 mb-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <p className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-50/40 px-4 py-1.5 text-sm font-semibold text-emerald-700 backdrop-blur mb-4">
                        AI-powered reputation growth
                      </p>
                    </motion.div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-950 mb-3">
                      Collect Reviews & Grow Your Reputation
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl">
                      ReviewQR AI helps you generate QR codes, collect customer feedback, and convert it into professional Google reviews using AI.
                    </p>
                  </div>
                  {business?.logo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="hidden lg:block ml-8 flex-shrink-0"
                    >
                      <Image
                        src={business.logo}
                        alt="Business logo"
                        width={120}
                        height={120}
                        className="rounded-2xl shadow-lg"
                      />
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </div>
          </motion.section>

          {/* Metrics Row */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="px-5 lg:px-8 py-4"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={QrCode} label="QR Scans" value={metrics?.qrScans ?? 0} color="emerald" />
                <MetricCard icon={Star} label="Reviews Generated" value={metrics?.reviewsGenerated ?? 0} color="blue" />
                <MetricCard icon={ExternalLink} label="Reviews Posted" value={metrics?.reviewsPosted ?? 0} color="amber" />
                <MetricCard icon={BarChart3} label="Average Rating" value={metrics?.averageRating ?? 0} color="rose" />
              </div>
            </div>
          </motion.section>

          {/* QR Code and Insights Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="px-5 lg:px-8 py-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                {/* QR Code Card */}
                <GlassCard className="p-6 h-fit">
                  <h3 className="text-xl font-bold text-slate-950 mb-4">Your QR Code</h3>
                  {business?.qrCode ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="mb-6 overflow-hidden rounded-2xl border border-white/30 bg-white p-4">
                        <Image
                          src={business.qrCode}
                          alt="Business review QR code"
                          width={300}
                          height={300}
                          className="h-auto w-full"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => navigator.clipboard.writeText(reviewUrl)}
                          className="text-xs"
                        >
                          <Copy size={16} />
                          Copy Link
                        </Button>
                        <Button
                          type="button"
                          onClick={downloadQr}
                          className="text-xs"
                        >
                          <Download size={16} />
                          Download
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => window.open(reviewUrl, "_blank")}
                        className="w-full mt-2 text-xs"
                      >
                        <ExternalLink size={16} />
                        Preview
                      </Button>
                    </motion.div>
                  ) : (
                    <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                      Complete your business profile to generate a QR code.
                    </p>
                  )}
                </GlassCard>

                {/* AI Insights Card */}
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold text-slate-950 mb-4">AI Insights</h3>
                  {analytics?.insights?.summary ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-5"
                    >
                      <p className="rounded-xl bg-slate-100/50 p-4 text-sm leading-7 text-slate-700">
                        {analytics.insights.summary}
                      </p>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Top Keywords</p>
                        <div className="flex flex-wrap gap-2">
                          {analytics.insights.mostMentionedWords?.length ? (
                            analytics.insights.mostMentionedWords.map((item) => (
                              <motion.span
                                key={item.word}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-full border border-emerald-200/60 bg-emerald-50/40 px-4 py-1.5 text-sm font-medium text-emerald-700 backdrop-blur"
                              >
                                {item.word} <span className="text-xs opacity-60 ml-1">({item.count})</span>
                              </motion.span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No keywords yet.</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                      Customer insights will appear after reviews are generated.
                    </p>
                  )}
                </GlassCard>
              </div>
            </div>
          </motion.section>

          {/* Padding for scroll */}
          <div className="h-12" />
        </div>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color = "emerald"
}: {
  icon: typeof QrCode;
  label: string;
  value: number;
  color?: "emerald" | "blue" | "amber" | "rose";
}) {
  const colorClasses = {
    emerald: "bg-emerald-100/40 border-emerald-200/60 text-emerald-700",
    blue: "bg-blue-100/40 border-blue-200/60 text-blue-700",
    amber: "bg-amber-100/40 border-amber-200/60 text-amber-700",
    rose: "bg-rose-100/40 border-rose-200/60 text-rose-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className={`p-6 border ${colorClasses[color]}`}>
        <Icon size={24} className="mb-3" />
        <p className="text-sm font-medium text-slate-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-950">{value}</p>
      </GlassCard>
    </motion.div>
  );
}
