"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsGrid } from "@/components/StatsGrid";
import { ItemCard } from "@/components/ItemCard";
import { LoanTable } from "@/components/LoanTable";
import { AddItemModal } from "@/components/AddItemModal";
import { BorrowModal } from "@/components/BorrowModal";
import { ReturnModal } from "@/components/ReturnModal";
import { SupabaseGuideModal } from "@/components/SupabaseGuideModal";
import { ToastContainer, ToastMessage } from "@/components/Toast";
import { InventoryService } from "@/lib/inventoryService";
import { Item, Loan, ItemFormData, LoanFormData } from "@/types/inventory";
import {
  Search,
  Filter,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Plus,
  UserCheck,
  Database,
  Info,
} from "lucide-react";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"cloud" | "local">("local");

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"katalog" | "sirkulasi">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Modals state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<Item | null>(null);
  const [selectedReturnLoan, setSelectedReturnLoan] = useState<Loan | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = "toast-" + Date.now() + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, loansRes] = await Promise.all([
        InventoryService.getItems(),
        InventoryService.getLoans(),
      ]);
      setItems(itemsRes.data);
      setLoans(loansRes.data);
      setDataSource(itemsRes.source);
    } catch (err) {
      console.error("Gagal memuat data:", err);
      addToast("error", "Gagal memuat data inventaris");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Kategori unik dari barang yang ada
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategory]);

  // Handler: Tambah Barang
  const handleAddItem = async (formData: ItemFormData) => {
    const result = await InventoryService.addItem(formData);
    if (result.success) {
      addToast("success", `Barang "${formData.name}" berhasil ditambahkan!`);
      await fetchData();
    }
    return result;
  };

  // Handler: Catat Peminjaman
  const handleBorrowItem = async (formData: LoanFormData) => {
    const result = await InventoryService.borrowItem(formData);
    if (result.success) {
      addToast("success", `Peminjaman berhasil dicatat! Stok barang telah dikurangi.`);
      await fetchData();
    } else {
      addToast("error", result.error || "Peminjaman ditolak!");
    }
    return result;
  };

  // Handler: Proses Pengembalian
  const handleReturnItem = async (loanId: string | number) => {
    const result = await InventoryService.returnItem(loanId);
    if (result.success) {
      addToast("success", "Pengembalian berhasil! Stok barang telah dipulihkan.");
      await fetchData();
    } else {
      addToast("error", result.error || "Gagal memproses pengembalian!");
    }
    return result;
  };

  const handleOpenBorrowForItem = (item: Item) => {
    setSelectedBorrowItem(item);
    setIsBorrowOpen(true);
  };

  const isCloud = dataSource === "cloud";

  return (
    <div className="min-h-screen flex flex-col bg-[#07090e] text-slate-100 bg-grid-pattern">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar */}
      <Navbar
        isCloudConnected={isCloud}
        onOpenAddItem={() => setIsAddItemOpen(true)}
        onOpenBorrow={() => {
          setSelectedBorrowItem(null);
          setIsBorrowOpen(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Banner Notifikasi Mode Database */}
      <div className="border-b border-white/5 bg-slate-900/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400" />
            {isCloud ? (
              <span>
                Database aktif: <strong className="text-emerald-400">Supabase Cloud PostgreSQL</strong> (Real-time sync aktif)
              </span>
            ) : (
              <span>
                Mode aktif: <strong className="text-amber-400">Local Storage / Demo Mode</strong>. Belum terhubung ke Supabase Cloud.
              </span>
            )}
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium hover:underline transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lihat Panduan & Skrip SQL Supabase</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Sistem Logistik & Inventaris Terpadu
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Aset Organisasi, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                Terkontrol & Akuntabel.
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Pantau sirkulasi peminjaman proyektor, HDMI, mic, dan peralatan organisasi secara real-time dengan validasi stok otomatis dan anti-duplikasi pengembalian.
            </p>
          </div>

          {/* Quick Refresh */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <StatsGrid items={items} loans={loans} />

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900/80 border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab("katalog")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "katalog"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Katalog Barang & Stok</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                {items.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("sirkulasi")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "sirkulasi"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sirkulasi & Pengembalian</span>
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-black/30 font-mono">
                {loans.filter((l) => l.status === "DIPINJAM").length} aktif
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "katalog" && (
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Barang Baru</span>
              </button>
            )}
            {activeTab === "sirkulasi" && (
              <button
                onClick={() => {
                  setSelectedBorrowItem(null);
                  setIsBorrowOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
              >
                <UserCheck className="w-4 h-4" />
                <span>Form Pinjam Barang</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: KATALOG BARANG */}
        {activeTab === "katalog" && (
          <div className="space-y-6">
            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama atau kode barang (misal: PRJ-01, HDMI)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/70 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 transition-all"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === "ALL"
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold"
                      : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Semua Kategori ({items.length})
                </button>
                {categories.map((cat) => {
                  const count = items.filter((i) => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-semibold"
                          : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Grid Items */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl border border-white/5 bg-slate-900/30 animate-pulse p-6"
                  />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-16 text-center rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Tidak ada barang yang cocok</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian atau pilih kategori lain. Anda juga dapat menambahkan barang baru.
                </p>
                <button
                  onClick={() => setIsAddItemOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20"
                >
                  + Tambah Barang Baru
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onBorrow={handleOpenBorrowForItem}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: SIRKULASI & PENGEMBALIAN */}
        {activeTab === "sirkulasi" && (
          <div className="space-y-6">
            <LoanTable
              loans={loans}
              onOpenReturn={(loan) => {
                setSelectedReturnLoan(loan);
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-[#07090e]/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">VAULT.INV</span>
            <span>•</span>
            <span>Sistem Manajemen Inventaris & Sirkulasi Organisasi</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Dokumentasi SQL Supabase
            </button>
            <span>•</span>
            <span>Next.js 16 + Tailwind CSS + Supabase</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onSubmit={handleAddItem}
        existingCategories={categories}
      />

      <BorrowModal
        isOpen={isBorrowOpen}
        onClose={() => {
          setIsBorrowOpen(false);
          setSelectedBorrowItem(null);
        }}
        onSubmit={handleBorrowItem}
        items={items}
        initialItemId={selectedBorrowItem?.id || null}
      />

      <ReturnModal
        loan={selectedReturnLoan}
        isOpen={Boolean(selectedReturnLoan)}
        onClose={() => setSelectedReturnLoan(null)}
        onConfirmReturn={handleReturnItem}
      />

      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        isCloudConnected={isCloud}
      />
    </div>
  );
}
