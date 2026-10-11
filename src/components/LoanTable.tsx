"use client";

import React, { useState } from "react";
import { Loan } from "@/types/inventory";
import { Search, RotateCcw, CheckCircle2, Clock, Calendar, User, Box, ShieldCheck } from "lucide-react";

interface Props {
  loans: Loan[];
  onOpenReturn: (loan: Loan) => void;
}

export const LoanTable: React.FC<Props> = ({ loans, onOpenReturn }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DIPINJAM" | "DIKEMBALIKAN">("ALL");

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch =
      loan.borrower_name.toLowerCase().includes(search.toLowerCase()) ||
      loan.item?.name.toLowerCase().includes(search.toLowerCase()) ||
      loan.item?.code.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peminjam, nama barang, atau kode..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/70 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
          {(
            [
              { id: "ALL", label: "Semua Catatan" },
              { id: "DIPINJAM", label: "Sedang Dipinjam" },
              { id: "DIKEMBALIKAN", label: "Sudah Kembali" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === tab.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List Container */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl overflow-hidden shadow-xl">
        {filteredLoans.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Belum ada catatan peminjaman</p>
            <p className="text-xs text-slate-500 mt-1">
              Catatan peminjaman akan muncul di sini ketika ada anggota yang meminjam barang.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-slate-950/40 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Peminjam</th>
                  <th className="py-3.5 px-4">Barang Dipinjam</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4">Tanggal Pinjam</th>
                  <th className="py-3.5 px-4">Tanggal Kembali</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {filteredLoans.map((loan) => {
                  const isReturned = loan.status === "DIKEMBALIKAN";

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Peminjam */}
                      <td className="py-4 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                            {loan.borrower_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{loan.borrower_name}</span>
                        </div>
                      </td>

                      {/* Barang */}
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-200">
                            {loan.item?.name || "Barang Inventaris"}
                          </div>
                          {loan.item?.code && (
                            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                              {loan.item.code}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-white/10">
                          {loan.qty}
                        </span>
                      </td>

                      {/* Tanggal Pinjam */}
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {loan.loan_date}
                      </td>

                      {/* Tanggal Kembali */}
                      <td className="py-4 px-4 font-mono">
                        {loan.return_date ? (
                          <span className="text-emerald-400">{loan.return_date}</span>
                        ) : (
                          <span className="text-slate-500 italic">- (Belum kembali)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            DIKEMBALIKAN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
                            <Clock className="w-3 h-3" />
                            DIPINJAM
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-right">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium px-2 py-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                            Selesai
                          </span>
                        ) : (
                          <button
                            onClick={() => onOpenReturn(loan)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all active:scale-95 hover:shadow-lg hover:shadow-emerald-500/10"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Proses Kembali</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
