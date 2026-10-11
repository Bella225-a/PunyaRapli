"use client";

import React from "react";
import { Layers, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Item, Loan } from "@/types/inventory";

interface Props {
  items: Item[];
  loans: Loan[];
}

export const StatsGrid: React.FC<Props> = ({ items, loans }) => {
  const totalItemTypes = items.length;
  const totalAvailableUnits = items.reduce((sum, item) => sum + Number(item.stok || 0), 0);
  const activeLoans = loans.filter((l) => l.status === "DIPINJAM");
  const totalActiveBorrowedUnits = activeLoans.reduce((sum, l) => sum + Number(l.qty || 0), 0);
  const totalCompletedLoans = loans.filter((l) => l.status === "DIKEMBALIKAN").length;

  const stats = [
    {
      label: "Total Jenis Barang",
      value: totalItemTypes,
      subtext: "Terdaftar di sistem",
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      accent: "from-cyan-500/20 to-transparent",
      border: "border-cyan-500/20",
    },
    {
      label: "Unit Siap Dipinjam",
      value: totalAvailableUnits,
      subtext: "Stok tersedia saat ini",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      accent: "from-emerald-500/20 to-transparent",
      border: "border-emerald-500/20",
    },
    {
      label: "Barang Sedang Dipinjam",
      value: totalActiveBorrowedUnits,
      subtext: `${activeLoans.length} transaksi aktif`,
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      accent: "from-amber-500/20 to-transparent",
      border: "border-amber-500/20",
    },
    {
      label: "Peminjaman Selesai",
      value: totalCompletedLoans,
      subtext: "Aset telah dikembalikan",
      icon: <CheckCircle2 className="w-5 h-5 text-purple-400" />,
      accent: "from-purple-500/20 to-transparent",
      border: "border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl border ${stat.border} bg-slate-900/50 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20`}
        >
          <div
            className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.accent} blur-xl pointer-events-none`}
          />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">{stat.label}</span>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">{stat.icon}</div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {stat.value}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{stat.subtext}</div>
        </div>
      ))}
    </div>
  );
};
