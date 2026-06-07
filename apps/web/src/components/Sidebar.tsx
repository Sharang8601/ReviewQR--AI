"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  QrCode,
  FileText,
  Settings,
  CreditCard,
  LogOut,
  MessageCircle,
  Zap,
  Lightbulb,
  Menu
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "../lib/api";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: QrCode, label: "QR Codes", href: "/qr-codes", coming: true },
  { icon: FileText, label: "Reviews", href: "/reviews", coming: true },
  { icon: BarChart3, label: "Analytics", href: "/analytics", coming: true },
  { icon: Settings, label: "Business Settings", href: "/settings/business" },
  { icon: CreditCard, label: "Billing", href: "/billing", coming: true }
];

const futureItems = [
  { icon: MessageCircle, label: "WhatsApp Campaigns" },
  { icon: Zap, label: "NFC Cards" },
  { icon: Lightbulb, label: "AI Insights" }
];

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const sidebarContent = (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {menuItems.map((item) => (
          <div key={item.href} className="relative">
            <Link
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-white/20 transition"
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.coming && (
                <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Soon
                </span>
              )}
            </Link>
          </div>
        ))}

        <div className="my-6 border-t border-white/10" />

        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Coming Soon</p>
          {futureItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 opacity-50">
              <item.icon size={20} />
              <span>{item.label}</span>
              <span className="ml-auto text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                Soon
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}

        <motion.div
          initial={{ x: -288 }}
          animate={{ x: isOpen ? 0 : -288 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-0 z-40 h-screen w-72 overflow-hidden bg-slate-50 border-r border-slate-200 lg:hidden"
        >
          {sidebarContent}
        </motion.div>
      </>
    );
  }

  return (
    <div className="hidden lg:flex flex-col h-screen w-72 bg-slate-50 border-r border-slate-200 sticky top-0">
      {sidebarContent}
    </div>
  );
}

export function DashboardHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-slate-100 rounded-lg transition"
      >
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <QrCode size={22} />
        </div>
        <div>
          <p className="text-xs text-slate-500">Business Dashboard</p>
          <h1 className="text-lg font-bold text-slate-950">ReviewQR AI</h1>
        </div>
      </div>
    </div>
  );
}
