-- ==============================================================================
-- SOLUSI CEPAT UNTUK TABEL YANG SUDAH ANDA BUAT SEBELUMNYA:
-- Jika tabel items dan loans sudah ada di Supabase, cukup jalankan 2 baris ini:
-- ==============================================================================
alter table items add column if not exists description text;

drop policy if exists "loans_access" on loans;
create policy "loans_access" on loans for all to anon using (true) with check (true);

-- ==============================================================================
-- SKEMA LENGKAP (JIKA MEMBUAT BARU DARI NOL):
-- ==============================================================================

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

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
alter table items enable row level security;
alter table loans enable row level security;

-- 4. POLICIES UNTUK AKSES ANON (Frontend Web App)
drop policy if exists "items_access" on items;
create policy "items_access" on items
  for all to anon
  using (true)
  with check (true);

drop policy if exists "loans_access" on loans;
create policy "loans_access" on loans
  for all to anon
  using (true)
  with check (true);

-- 5. FUNCTION ATOMIK: PINJAM BARANG (Cegah balapan & tolak jika stok kurang)
create or replace function borrow_item_rpc(
  p_item_id uuid,
  p_borrower_name text,
  p_qty int
)
returns uuid
language plpgsql
as $$
declare
  v_current_stock int;
  v_loan_id uuid;
begin
  -- Kunci row item untuk hindari race condition
  select stok into v_current_stock
  from items
  where id = p_item_id
  for update;

  if not found then
    raise exception 'Barang tidak ditemukan!';
  end if;

  -- Tolak jika stok kurang
  if v_current_stock < p_qty then
    raise exception 'Stok tidak mencukupi! Tersedia hanya: % unit', v_current_stock;
  end if;

  -- Kurangi stok barang
  update items
  set stok = stok - p_qty
  where id = p_item_id;

  -- Catat peminjaman dengan status DIPINJAM
  insert into loans (items_id, borrower_name, qty, loan_date, status)
  values (p_item_id, p_borrower_name, p_qty, current_date, 'DIPINJAM')
  returning id into v_loan_id;

  return v_loan_id;
end;
$$;

-- 6. FUNCTION ATOMIK: KEMBALIKAN BARANG (Tolak kembalikan ulang & tambah stok kembali)
create or replace function return_item_rpc(
  p_loan_id uuid
)
returns boolean
language plpgsql
as $$
declare
  v_item_id uuid;
  v_qty int;
  v_status varchar(20);
begin
  -- Kunci row loan
  select items_id, qty, status
  into v_item_id, v_qty, v_status
  from loans
  where id = p_loan_id
  for update;

  if not found then
    raise exception 'Data peminjaman tidak ditemukan!';
  end if;

  -- Tolak pengembalian ulang pada catatan yang sudah berstatus dikembalikan
  if v_status = 'DIKEMBALIKAN' then
    raise exception 'Barang pada catatan ini sudah pernah dikembalikan sebelumnya!';
  end if;

  -- Perbarui status dan return_date
  update loans
  set status = 'DIKEMBALIKAN',
      return_date = current_date
  where id = p_loan_id;

  -- Kembalikan stok barang
  update items
  set stok = stok + v_qty
  where id = v_item_id;

  return true;
end;
$$;

-- 7. SEED DATA AWAL (Contoh barang umum organisasi: Proyektor, HDMI, dll)
insert into items (code, name, category, stok, description)
values
  ('PRJ-01', 'Proyektor Epson EB-X51 (3800 Lumens)', 'Display & Audio', 2, 'Tas hitam, kabel power, remote, dan kabel HDMI 1.5m'),
  ('HDMI-01', 'Kabel HDMI to HDMI 5 Meter Braided', 'Kabel & Aksesoris', 5, 'Kabel tebal gold-plated warna merah hitam'),
  ('HDMI-02', 'Dongle USB Type-C to HDMI 4K Ugreen', 'Kabel & Aksesoris', 3, 'Cocok untuk MacBook, iPad, dan laptop tanpa port HDMI'),
  ('MIC-01', 'Wireless Microphone Dual Receiver Shure', 'Display & Audio', 2, 'Lengkap dengan 2 mic pegang dan baterai rechargeable'),
  ('PTR-01', 'Wireless Presenter Laser Pointer Logitech R400', 'Presentasi', 4, 'Laser merah dengan receiver USB di kompartemen baterai'),
  ('ROL-01', 'Kabel Rol 4 Lubang 10 Meter Uticon', 'Listrik & Daya', 4, 'Dilengkapi saklar on/off dan perlindungan overload')
on conflict (code) do nothing;
