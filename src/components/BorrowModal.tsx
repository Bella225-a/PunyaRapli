"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, UserCheck, AlertTriangle, Box, ShieldAlert } from "lucide-react";
import { Item, LoanFormData } from "@/types/inventory";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LoanFormData) => Promise<{ success: boolean; error?: string }>;
  items: Item[];
  initialItemId?: string | number | null;
}

export const BorrowModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  items,
  initialItemId,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [borrowerName, setBorrowerName] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialItemId) {
      setSelectedItemId(String(initialItemId));
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(String(items[0].id));
    }
  }, [initialItemId, items, selectedItemId]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => String(i.id) === String(selectedItemId));
  const availableStock = currentItem ? currentItem.stok : 0;
  const isOutOfStock = availableStock <= 0;
  const isQtyExceeded = qty > availableStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedItemId) {
      setErrorMessage("Silakan pilih barang yang akan dipinjam!");
      return;
    }
    if (!borrowerName.trim()) {
      setErrorMessage("Nama peminjam wajib diisi!");
      return;
    }
    if (qty <= 0) {
      setErrorMessage("Jumlah pinjam minimal 1 unit!");
      return;
    }

    // ATURAN RUANG LINGKUP: Kalau stok kurang peminjaman ditolak!
    if (qty > availableStock) {
      setErrorMessage(
        `Peminjaman DITOLAK! Stok "${currentItem?.name}" tidak mencukupi (Tersedia: ${availableStock} unit, Diminta: ${qty} unit).`
      );
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      items_id: selectedItemId,
      borrower_name: borrowerName.trim(),
      qty: Number(qty),
    });
    setLoading(false);

    if (result.success) {
      setBorrowerName("");
      setQty(1);
      onClose();
    } else {
      setErrorMessage(result.error || "Gagal mencatat peminjaman!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121d] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Form Peminjaman Barang</h2>
              <p className="text-xs text-slate-400">Peminjaman aset organisasi untuk anggota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pilih Barang */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              Pilih Barang
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => {
                setSelectedItemId(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/90 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-all cursor-pointer"
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.code}] {item.name} — (Sisa Stok: {item.stok})
                </option>
              ))}
            </select>

            {/* Status Stok Live Card */}
            {currentItem && (
              <div
                className={`mt-2 p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                  isOutOfStock
                    ? "bg-rose-950/30 border-rose-500/30 text-rose-300"
                    : isQtyExceeded
                    ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                    : "bg-slate-900/60 border-white/5 text-slate-300"
                }`}
              >
                <div>
                  <span className="font-medium text-slate-400">Status Ketersediaan:</span>
                  <span className="ml-2 font-semibold">
                    {currentItem.stok > 0
                      ? `${currentItem.stok} unit tersedia`
                      : "Stok habis (Kosong)"}
                  </span>
                </div>
                {currentItem.stok > 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                    Tersedia
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono font-medium">
                    Habis
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Nama Peminjam */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              Nama Lengkap Peminjam
            </label>
            <input
              type="text"
              required
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="Contoh: Sarah - Divisi Multimedia"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all"
            />
          </div>

          {/* Qty Peminjaman */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Jumlah Unit (Qty)</label>
              {availableStock > 0 && (
                <span className="text-[11px] text-slate-400">
                  Maksimal bisa dipinjam: <strong>{availableStock}</strong>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max={Math.max(1, availableStock)}
                required
                value={qty}
                onChange={(e) => {
                  setQty(parseInt(e.target.value) || 1);
                  setErrorMessage(null);
                }}
                className={`w-32 px-3.5 py-2.5 rounded-xl border text-sm font-semibold text-white focus:outline-none transition-all ${
                  isQtyExceeded
                    ? "border-rose-500 bg-rose-950/20 text-rose-200"
                    : "border-white/10 bg-slate-900/80 focus:border-cyan-500/60"
                }`}
              />
              <span className="text-xs text-slate-400">Unit</span>
            </div>

            {/* Peringatan Stok Kurang */}
            {isQtyExceeded && (
              <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Jumlah pinjam melebihi sisa stok ({availableStock} unit). Peminjaman akan ditolak.
              </p>
            )}
          </div>

          {/* Info aturan */}
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 text-[11px] text-slate-400 space-y-1">
            <p>
              • Tanggal peminjaman akan otomatis tercatat sebagai <strong>hari ini</strong>.
            </p>
            <p>
              • Stok barang akan otomatis dikurangi secara <strong>real-time</strong>.
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
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || isOutOfStock || isQtyExceeded}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Catat Peminjaman</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
