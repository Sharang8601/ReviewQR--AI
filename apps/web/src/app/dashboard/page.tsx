"use client";

import { BarChart3, Copy, Download, ExternalLink, LogOut, QrCode, Save, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { apiFetch, Business, CurrentUser, clearToken, getToken } from "../../lib/api";

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
  const [form, setForm] = useState({
    businessName: "",
    category: "Restaurant",
    logo: "",
    googleReviewLink: "",
    subscriptionPlan: "free"
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
    if (profile.business) {
      setForm({
        businessName: profile.business.businessName,
        category: profile.business.category,
        logo: profile.business.logo || "",
        googleReviewLink: profile.business.googleReviewLink,
        subscriptionPlan: profile.business.subscriptionPlan || "free"
      });
    }

    const metrics = await apiFetch<Analytics>("/api/business/analytics");
    setAnalytics(metrics);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await apiFetch<{ business: Business }>("/api/business/profile", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setBusiness(response.business);
      setMessage("Profile saved and QR code generated.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearToken();
    router.push("/");
  }

  function downloadQr() {
    if (!business?.qrCode) return;
    const anchor = document.createElement("a");
    anchor.href = business.qrCode;
    anchor.download = `${business.businessName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    anchor.click();
  }

  const metrics = analytics?.metrics;

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-[#d9e2dd] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-fern text-white">
              <QrCode size={22} />
            </div>
            <div>
              <p className="text-sm text-ink/60">Business dashboard</p>
              <h1 className="text-xl font-bold">Boost The Reviews</h1>
              {user?.lastLoginLocation ? (
                <p className="mt-1 text-xs text-ink/55">
                  Login location: {user.lastLoginLocation.latitude.toFixed(4)}, {user.lastLoginLocation.longitude.toFixed(4)}
                </p>
              ) : null}
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={logout}>
            <LogOut size={17} />
            Logout
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={saveProfile} className="rounded-lg bg-white p-5 shadow-soft">
          <h2 className="mb-5 text-lg font-bold">Business Profile</h2>
          <Field label="Business name" value={form.businessName} onChange={(businessName) => setForm({ ...form, businessName })} />
          <Field label="Category" value={form.category} onChange={(category) => setForm({ ...form, category })} />
          <Field label="Logo URL" value={form.logo} onChange={(logo) => setForm({ ...form, logo })} />
          <Field
            label="Google review link"
            value={form.googleReviewLink}
            onChange={(googleReviewLink) => setForm({ ...form, googleReviewLink })}
          />

          <label className="mb-2 block text-sm font-semibold" htmlFor="plan">
            Subscription plan
          </label>
          <select
            id="plan"
            value={form.subscriptionPlan}
            onChange={(event) => setForm({ ...form, subscriptionPlan: event.target.value })}
            className="focus-ring mb-5 h-11 w-full rounded-md border border-[#d9e2dd] bg-white px-3"
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
          </select>

          {message ? <p className="mb-4 rounded-md bg-mist px-3 py-2 text-sm">{message}</p> : null}

          <Button type="submit" disabled={saving} className="w-full">
            <Save size={17} />
            {saving ? "Saving" : "Save Profile"}
          </Button>
        </form>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Metric icon={QrCode} label="QR scans" value={metrics?.qrScans ?? 0} />
            <Metric icon={Star} label="Generated" value={metrics?.reviewsGenerated ?? 0} />
            <Metric icon={ExternalLink} label="Posted" value={metrics?.reviewsPosted ?? 0} />
            <Metric icon={BarChart3} label="Avg rating" value={metrics?.averageRating ?? 0} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
            <div className="rounded-lg bg-white p-5 shadow-soft">
              <h2 className="mb-4 text-lg font-bold">QR Code</h2>
              {business?.qrCode ? (
                <>
                  <div className="mb-4 overflow-hidden rounded-md border border-[#d9e2dd] bg-white p-3">
                    <Image src={business.qrCode} alt="Business review QR code" width={300} height={300} className="h-auto w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="secondary" onClick={() => navigator.clipboard.writeText(reviewUrl)}>
                      <Copy size={17} />
                      Copy Link
                    </Button>
                    <Button type="button" onClick={downloadQr}>
                      <Download size={17} />
                      Download
                    </Button>
                  </div>
                </>
              ) : (
                <p className="rounded-md bg-mist p-4 text-sm text-ink/70">Save your business profile to generate a QR code.</p>
              )}
            </div>

            <div className="rounded-lg bg-white p-5 shadow-soft">
              <h2 className="mb-4 text-lg font-bold">AI Insights</h2>
              <p className="mb-5 rounded-md bg-mist p-4 text-sm leading-6 text-ink/75">
                {analytics?.insights?.summary || "Customer insights appear after reviews are generated."}
              </p>
              <div className="flex flex-wrap gap-2">
                {analytics?.insights?.mostMentionedWords?.length ? (
                  analytics.insights.mostMentionedWords.map((item) => (
                    <span key={item.word} className="rounded-md bg-[#eef7f3] px-3 py-2 text-sm font-semibold text-fern">
                      {item.word} ({item.count})
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/60">No keywords yet.</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <>
      <label className="mb-2 block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mb-4 h-11 w-full rounded-md border border-[#d9e2dd] px-3"
        required={label !== "Logo URL"}
      />
    </>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof QrCode; label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-soft">
      <Icon className="mb-3 text-coral" size={22} />
      <p className="text-sm text-ink/60">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
