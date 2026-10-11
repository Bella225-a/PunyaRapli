"use client";

import React, { useState } from "react";
import { X, Plus, PackagePlus, Sparkles, Tag, Layers, Hash } from "lucide-react";
import { ItemFormData } from "@/types/inventory";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ItemFormData) => Promise<{ success: boolean; error?: string }>;
  existingCategories: string[];
}

export const AddItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  existingCategories,
}) => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [stok, setStok] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultCategories = [
    "Display & Audio",
    "Kabel & Aksesoris",
    "Presentasi",
    "Listrik & Daya",
    "Dokumentasi",
  ];

  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));

  const handleGenerateCode = () => {
    const prefix = category ? category.substring(0, 3).toUpperCase().replace(/\s/g, "") : "ITM";
    const rand = Math.floor(100 + Math.random() * 900);
    setCode(`${prefix}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const finalCategory = category === "OTHER" ? customCategory.trim() : category.trim();

    if (!code.trim()) {
      setErrorMessage("Kode unik barang wajib diisi!");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Nama barang wajib diisi!");
      return;
    }
    if (!finalCategory) {
      setErrorMessage("Silakan pilih atau masukkan kategori barang!");
      return;
    }
    if (stok < 0) {
      setErrorMessage("Stok barang tidak boleh negatif!");
      return;
    }

    setLoading(true);
    const result = await onSubmit({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: finalCategory,
      stok: Number(stok),
      description: description.trim() || undefined,
    });
    setLoading(false);

    if (result.success) {
      setCode("");
      setName("");
      setCategory("");
      setCustomCategory("");
      setStok(1);
      setDescription("");
      onClose();
    } else {
      setErrorMessage(result.error || "Gagal menambahkan barang!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d121d] text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Tambah Barang Baru</h2>
              <p className="text-xs text-slate-400">Daftarkan inventaris baru ke katalog organisasi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed animate-in fade-in">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Kode Barang */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                Kode Unik Barang
              </label>
              <button
                type="button"
                onClick={handleGenerateCode}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3" /> Auto-generate
              </button>
            </div>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Contoh: PRJ-01, HDMI-03"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-sm font-mono text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Nama Barang */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Nama Barang
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Proyektor Epson EB-X51"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Kategori
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {allCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    category === cat
                      && category !== "OTHER"
                      ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-medium"
                      : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory("OTHER")}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  category === "OTHER"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-medium"
                    : "bg-slate-900/60 border-white/5 text-slate-400 hover:text-slate-200"
                }`}
              >
                + Kategori Baru
              </button>
            </div>

            {category === "OTHER" && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Tulis nama kategori baru..."
                className="w-full px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-slate-900/80 text-sm text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
              />
            )}
          </div>

          {/* Stok Awal */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              Stok Tersedia
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                required
                value={stok}
                onChange={(e) => setStok(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-32 px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-sm font-semibold text-white focus:outline-none focus:border-cyan-500/60 transition-all"
              />
              <span className="text-xs text-slate-400">Unit / Pcs</span>
            </div>
          </div>

          {/* Keterangan / Kelengkapan */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              Deskripsi & Kelengkapan (Opsional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Disimpan di lemari A, termasuk tas dan kabel power"
              className="w-full px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/80 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-all resize-none"
            />
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
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Simpan Barang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
