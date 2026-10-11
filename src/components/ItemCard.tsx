"use client";

import React from "react";
import { Item } from "@/types/inventory";
import { UserCheck, Tag, Box, AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  item: Item;
  onBorrow: (item: Item) => void;
}

export const ItemCard: React.FC<Props> = ({ item, onBorrow }) => {
  const isOutOfStock = item.stok <= 0;
  const isLowStock = item.stok > 0 && item.stok <= 2;

  return (
    <div className="glass-panel glass-panel-hover relative flex flex-col justify-between rounded-2xl p-5 group">
      <div>
        {/* Top bar: Category & Code */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="font-mono text-xs font-bold tracking-wider px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            {item.code}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5 truncate max-w-[140px]">
            {item.category}
          </span>
        </div>

        {/* Item Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
          {item.name}
        </h3>

        {/* Description / Location */}
        {item.description ? (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic mb-4">Tidak ada catatan kelengkapan.</p>
        )}
      </div>

      <div className="pt-4 border-t border-white/5 space-y-3.5">
        {/* Stock Meter */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Sisa Stok:</span>
          {isOutOfStock ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              Habis (0 unit)
            </span>
          ) : isLowStock ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Sisa {item.stok} unit
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {item.stok} unit tersedia
            </span>
          )}
        </div>

        {/* Borrow Button */}
        <button
          onClick={() => onBorrow(item)}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            isOutOfStock
              ? "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
              : "bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{isOutOfStock ? "Stok Habis" : "Pinjam Barang Ini"}</span>
        </button>
      </div>
    </div>
  );
};
