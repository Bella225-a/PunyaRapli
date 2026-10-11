"use client";

import React, { useState } from "react";
import { X, CheckCircle, RotateCcw, AlertTriangle, Sparkles, Calendar, Box, User } from "lucide-react";
import { Loan } from "@/types/inventory";
import confetti from "canvas-confetti";

interface Props {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturn: (loanId: string | number) => Promise<{ success: boolean; error?: string }>;
}

export const ReturnModal: React.FC<Props> = ({
  loan,
  isOpen,
  onClose,
  onConfirmReturn,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !loan) return null;

  const isAlreadyReturned = loan.status === "DIKEMBALIKAN";

  const handleConfirm = async () => {
    if (isAlreadyReturned) {
      setErrorMessage("Barang ini sudah pernah dikembalikan sebelumnya!");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const result = await onConfirmReturn(loan.id);
    setLoading(false);

    if (result.success) {
      // Trigger celebratory micro-interaction
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#38bdf8", "#34d399", "#818cf8"],
        });
      } catch {
        // Safe fallback if confetti canvas not ready
      }
      onClose();
    } else {
      setErrorMessage(result.error || "Gagal memproses pengembalian!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121d] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Proses Pengembalian Barang</h2>
              <p className="text-xs text-slate-400">Validasi fisik & pemulihan stok inventaris</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isAlreadyReturned ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-200">Perhatian:</p>
                <p className="mt-0.5">
                  Catatan peminjaman ini sudah berstatus <strong>DIKEMBALIKAN</strong> pada tanggal{" "}
                  <strong>{loan.return_date || "sebelumnya"}</strong>. Sistem menolak proses pengembalian ganda untuk mencegah penambahan stok berlebih.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed">
              Konfirmasi bahwa barang pinjaman di bawah ini telah dikembalikan oleh peminjam dalam kondisi baik:
            </p>
          )}

          {/* Loan Details Card */}
          <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Peminjam:
              </span>
              <span className="font-semibold text-white">{loan.borrower_name}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                Barang:
              </span>
              <span className="font-semibold text-white text-right">
                {loan.item?.name || "Aset Inventaris"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-slate-400">Jumlah Dipinjam:</span>
              <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                +{loan.qty} unit dipulihkan
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Tanggal Pinjam:
              </span>
              <span className="text-slate-200 font-mono">{loan.loan_date}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300/90 space-y-1">
            <div className="font-semibold flex items-center gap-1 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Dampak Aksi Ini:
            </div>
            <p>
              • Tanggal pengembalian (<code>return_date</code>) otomatis diisi hari ini.
            </p>
            <p>
              • Stok barang bertambah otomatis sejumlah <strong>+{loan.qty} unit</strong>.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || isAlreadyReturned}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Konfirmasi Pengembalian</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
