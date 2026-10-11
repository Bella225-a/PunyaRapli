"use client";

import React, { useState } from "react";
import { X, Copy, Check, Database, ExternalLink, ShieldAlert, Sparkles, Terminal } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isCloudConnected: boolean;
}

export const SupabaseGuideModal: React.FC<Props> = ({ isOpen, onClose, isCloudConnected }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- JIKA TABEL SUDAH ADA, JALANKAN 2 BARIS INI:
alter table items add column if not exists description text;
drop policy if exists "loans_access" on loans;
create policy "loans_access" on loans for all to anon using (true) with check (true);

-- 1. TABEL ITEMS (Katalog Barang)
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  code varchar(50) unique not null,
  name varchar(150) not null,
  category varchar(50) not null,
  stok integer not null default 0 check (stok >= 0),
  description text,
  created_at timestamptz not null default now()
);

-- 2. TABEL LOANS (Catatan Peminjaman)
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  items_id uuid not null references items(id) on delete restrict,
  borrower_name varchar(100) not null,
  qty integer not null check (qty > 0),
  loan_date date not null default current_date,
  return_date date,
  status varchar(20) not null default 'DIPINJAM' check (status in ('DIPINJAM', 'DIKEMBALIKAN')),
  created_at timestamptz not null default now()
);

-- 3. ROW LEVEL SECURITY (RLS)
alter table items enable row level security;
alter table loans enable row level security;

-- 4. POLICIES PUBLIK ANON
drop policy if exists "items_access" on items;
create policy "items_access" on items for all to anon using (true) with check (true);

drop policy if exists "loans_access" on loans;
create policy "loans_access" on loans for all to anon using (true) with check (true);

-- 5. FUNCTION ATOMIK PINJAM (Cegah balapan & tolak jika stok kurang)
create or replace function borrow_item_rpc(
  p_item_id uuid,
  p_borrower_name text,
  p_qty int
) returns uuid language plpgsql as $$
declare
  v_current_stock int;
  v_loan_id uuid;
begin
  select stok into v_current_stock from items where id = p_item_id for update;
  if not found then
    raise exception 'Barang tidak ditemukan!';
  end if;
  if v_current_stock < p_qty then
    raise exception 'Stok tidak mencukupi! Tersedia hanya: % unit', v_current_stock;
  end if;
  update items set stok = stok - p_qty where id = p_item_id;
  insert into loans (items_id, borrower_name, qty, loan_date, status)
  values (p_item_id, p_borrower_name, p_qty, current_date, 'DIPINJAM')
  returning id into v_loan_id;
  return v_loan_id;
end;
$$;

-- 6. FUNCTION ATOMIK PENGEMBALIAN (Tolak kembalikan ulang & kembalikan stok)
create or replace function return_item_rpc(p_loan_id uuid)
returns boolean language plpgsql as $$
declare
  v_item_id uuid;
  v_qty int;
  v_status varchar(20);
begin
  select items_id, qty, status into v_item_id, v_qty, v_status from loans where id = p_loan_id for update;
  if not found then
    raise exception 'Data peminjaman tidak ditemukan!';
  end if;
  if v_status = 'DIKEMBALIKAN' then
    raise exception 'Barang pada catatan ini sudah pernah dikembalikan sebelumnya!';
  end if;
  update loans set status = 'DIKEMBALIKAN', return_date = current_date where id = p_loan_id;
  update items set stok = stok + v_qty where id = v_item_id;
  return true;
end;
$$;

-- 7. DATA CONTOH AWAL
insert into items (code, name, category, stok, description) values
  ('PRJ-01', 'Proyektor Epson EB-X51 (3800 Lumens)', 'Display & Audio', 2, 'Kabel power dan remote ada di dalam tas hitam'),
  ('HDMI-01', 'Kabel HDMI to HDMI 5 Meter Braided', 'Kabel & Aksesoris', 5, 'Kabel warna merah dengan gold-plated connector'),
  ('HDMI-02', 'Dongle USB Type-C to HDMI 4K Ugreen', 'Kabel & Aksesoris', 3, 'Support 4K 60Hz untuk Macbook & Laptop'),
  ('MIC-01', 'Wireless Mic Dual Receiver Shure', 'Display & Audio', 2, 'Lengkap dengan baterai cadangan dan pouch'),
  ('PTR-01', 'Presenter Laser Pointer Logitech R400', 'Presentasi', 4, 'Laser pointer wireless dengan usb receiver'),
  ('ROL-01', 'Kabel Rol 4 Lubang 10M Uticon', 'Listrik & Daya', 4, 'Dilengkapi saklar on/off pengaman overload')
on conflict (code) do nothing;`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d121d] text-slate-100 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Panduan Setup Supabase
                {isCloudConnected ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                    ✓ Terhubung
                  </span>
                ) : (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium">
                    Mode Lokal / Offline
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Langkah cepat menghubungkan database Supabase Cloud ke aplikasi ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step list */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm mb-2.5">
                1
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Buat Project Supabase</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buka{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
                , daftar gratis, lalu klik <strong>New Project</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm mb-2.5">
                2
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Jalankan SQL Schema</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih menu <strong>SQL Editor</strong> di sidebar Supabase, buat New Query, tempel skrip di bawah, dan klik <strong>Run</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm mb-2.5">
                3
              </div>
              <h3 className="font-semibold text-sm text-white mb-1">Salin API Keys ke .env</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Masuk ke <strong>Project Settings → API</strong>. Salin Project URL & anon public key ke file <code>.env.local</code>.
              </p>
            </div>
          </div>

          {/* Code Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Skrip SQL Supabase (Lengkap dengan RLS & Validasi Atomik)
              </label>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Semua SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl border border-white/10 bg-[#06080e] p-4 max-h-72 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
              <pre>{sqlScript}</pre>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 File skrip ini juga telah disimpan di root proyek Anda dengan nama file{" "}
              <code className="text-cyan-300 font-mono bg-white/5 px-1 py-0.5 rounded">
                supabase_schema.sql
              </code>
            </p>
          </div>

          {/* Important Rules Recap */}
          <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 text-xs text-cyan-200/90 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-4 h-4" />
              Fitur Keamanan & Validasi Otomatis yang Disertakan:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li>
                <strong>Pengecekan Stok:</strong> Peminjaman otomatis ditolak jika stok barang kurang dari jumlah yang diminta.
              </li>
              <li>
                <strong>Pengurangan & Pemulihan Stok:</strong> Stok otomatis berkurang saat pinjam, dan pulih kembali saat barang dikembalikan.
              </li>
              <li>
                <strong>Anti-Duplikasi Pengembalian:</strong> Sistem menolak pengembalian ulang pada catatan yang sudah berstatus <code>DIKEMBALIKAN</code>.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10 bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
