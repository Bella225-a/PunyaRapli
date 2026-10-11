"use client";

import React from "react";
import { Package, Plus, UserCheck, Database, Layers, ShieldCheck, Sparkles } from "lucide-react";

interface Props {
  isCloudConnected: boolean;
  onOpenAddItem: () => void;
  onOpenBorrow: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<Props> = ({
  isCloudConnected,
  onOpenAddItem,
  onOpenBorrow,
  onOpenGuide,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center text-cyan-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">VAULT</span>
              <span className="text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-semibold">
                LOGISTIK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Sirkulasi & Inventaris Organisasi
            </p>
          </div>
        </div>

        {/* Center / Database Status */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenGuide}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all ${
              isCloudConnected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCloudConnected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isCloudConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span className="font-medium">
              {isCloudConnected ? "Supabase Cloud Terhubung" : "Database Lokal (Klik untuk Setup Supabase)"}
            </span>
            <Database className="w-3.5 h-3.5 ml-1 opacity-70" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenGuide}
            className="md:hidden p-2 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
            title="Panduan Supabase"
          >
            <Database className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={onOpenAddItem}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 border border-white/10 bg-slate-900/60 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Tambah</span> Barang
          </button>

          <button
            onClick={onOpenBorrow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Pinjam Barang</span>
          </button>
        </div>
      </div>
    </header>
  );
};
