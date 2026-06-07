"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Upload, Save, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { GlassCard } from "../../../../components/GlassCard";
import { Sidebar, DashboardHeader } from "../../../../components/Sidebar";
import { Button } from "../../../../components/Button";
import { apiFetch, Business, getToken } from "../../../../lib/api";

export default function BusinessSettings() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [form, setForm] = useState({
    businessName: "",
    category: "Restaurant",
    logo: "",
    googleReviewLink: "",
    subscriptionPlan: "free"
  });

  useEffect(() => {
    if (!getToken()) {
      router.push("/");
      return;
    }

    load();
  }, [router]);

  async function load() {
    const profile = await apiFetch<{ business: Business | null }>("/api/business/me");
    if (profile.business) {
      setBusiness(profile.business);
      setForm({
        businessName: profile.business.businessName,
        category: profile.business.category,
        logo: profile.business.logo || "",
        googleReviewLink: profile.business.googleReviewLink,
        subscriptionPlan: profile.business.subscriptionPlan || "free"
      });
      if (profile.business.logo) {
        setLogoPreview(profile.business.logo);
      }
    }
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Please upload a PNG, JPG, or WEBP image" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be smaller than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      setForm({ ...form, logo: dataUrl });
      setMessage(null);
    };
    reader.readAsDataURL(file);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await apiFetch<{ business: Business }>("/api/business/profile", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setBusiness(response.business);
      setMessage({ type: "success", text: "Business profile saved successfully!" });
      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Could not save profile"
      });
    } finally {
      setSaving(false);
    }
  }

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
          {/* Header */}
          <header className="hidden lg:block sticky top-0 z-20 border-b border-white/20 bg-white/30 backdrop-blur-glass">
            <div className="max-w-4xl mx-auto px-8 py-6 flex items-center gap-4">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-white/50 rounded-lg transition">
                  <ArrowLeft size={24} className="text-slate-600" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-950">Business Settings</h1>
                <p className="text-sm text-slate-600 mt-1">Manage your business profile and preferences</p>
              </div>
            </div>
          </header>

          {/* Mobile back button */}
          <div className="lg:hidden px-5 py-4 flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                <ArrowLeft size={24} className="text-slate-600" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-950">Business Settings</h1>
          </div>

          {/* Content */}
          <div className="px-5 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={saveProfile} className="space-y-6">
                {/* Business Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-slate-950 mb-6">Business Information</h2>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="businessName">
                          Business Name
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          value={form.businessName}
                          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                          className="w-full rounded-lg border border-white/30 bg-white/40 px-4 py-3 text-slate-950 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Your business name"
                          required
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="category">
                          Category
                        </label>
                        <select
                          id="category"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full rounded-lg border border-white/30 bg-white/40 px-4 py-3 text-slate-950 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="Restaurant">Restaurant</option>
                          <option value="Retail">Retail</option>
                          <option value="Service">Service</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Technology">Technology</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Logo Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-slate-950 mb-6">Logo</h2>

                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Logo Upload Area */}
                      <div>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="relative rounded-lg border-2 border-dashed border-white/40 bg-white/10 p-8 cursor-pointer hover:bg-white/20 transition"
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <div className="text-center">
                            <Upload size={32} className="mx-auto mb-3 text-slate-600" />
                            <p className="text-sm font-semibold text-slate-950 mb-1">Click to upload</p>
                            <p className="text-xs text-slate-600">PNG, JPG, WEBP • Max 5MB</p>
                          </div>
                        </div>
                      </div>

                      {/* Logo Preview */}
                      {logoPreview && (
                        <div className="flex items-center justify-center">
                          <div className="rounded-lg border border-white/30 bg-white/50 p-4 backdrop-blur">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              width={160}
                              height={160}
                              className="rounded-md object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Google Review Link */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-slate-950 mb-6">Google Review Link</h2>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700" htmlFor="googleReviewLink">
                        Review URL
                      </label>
                      <input
                        id="googleReviewLink"
                        type="url"
                        value={form.googleReviewLink}
                        onChange={(e) => setForm({ ...form, googleReviewLink: e.target.value })}
                        className="w-full rounded-lg border border-white/30 bg-white/40 px-4 py-3 text-slate-950 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="https://g.page/r/xxxxxxxx/review"
                        required
                      />
                      <p className="mt-2 text-xs text-slate-600">
                        Get your Google review link from your Google Business Profile. It typically looks like: https://g.page/r/xxxxxxxx/review
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Subscription Plan */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <GlassCard className="p-6 lg:p-8">
                    <h2 className="text-2xl font-bold text-slate-950 mb-6">Subscription Plan</h2>

                    <div className="grid gap-3 lg:grid-cols-3">
                      {[
                        { value: "free", label: "Free", description: "5 reviews/month" },
                        { value: "starter", label: "Starter", description: "50 reviews/month" },
                        { value: "growth", label: "Growth", description: "Unlimited reviews" }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`relative flex items-start p-4 rounded-lg border-2 cursor-pointer transition ${
                            form.subscriptionPlan === option.value
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-white/30 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="subscriptionPlan"
                            value={option.value}
                            checked={form.subscriptionPlan === option.value}
                            onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}
                            className="mt-1"
                          />
                          <div className="ml-3">
                            <p className="font-semibold text-slate-950">{option.label}</p>
                            <p className="text-xs text-slate-600">{option.description}</p>
                          </div>
                          {form.subscriptionPlan === option.value && (
                            <Check size={20} className="ml-auto text-emerald-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Messages and Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {message && (
                    <div
                      className={`mb-4 rounded-lg border p-4 flex items-start gap-3 ${
                        message.type === "success"
                          ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-800"
                          : "border-red-200/60 bg-red-50/50 text-red-800"
                      }`}
                    >
                      {message.type === "success" ? (
                        <Check size={20} className="flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm font-medium">{message.text}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href="/dashboard">
                      <button type="button" className="px-6 py-3 rounded-lg font-semibold text-slate-700 hover:bg-white/30 transition">
                        Cancel
                      </button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex-1 lg:flex-initial"
                    >
                      <Save size={18} />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </motion.div>
              </form>
            </div>
          </div>

          {/* Padding for scroll */}
          <div className="h-12" />
        </div>
      </div>
    </main>
  );
}
