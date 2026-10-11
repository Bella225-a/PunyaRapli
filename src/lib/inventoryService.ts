import { supabase, isSupabaseConfigured } from "./supabase";
import { Item, Loan, ItemFormData, LoanFormData } from "@/types/inventory";

const LOCAL_STORAGE_ITEMS_KEY = "inventaris_items_v1";
const LOCAL_STORAGE_LOANS_KEY = "inventaris_loans_v1";

const SEED_ITEMS: Item[] = [
  {
    id: "item-1",
    code: "PRJ-01",
    name: "Proyektor Epson EB-X51 (3800 Lumens)",
    category: "Display & Audio",
    stok: 2,
    description: "Tas hitam, kabel power, remote, dan kabel HDMI 1.5m",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "item-2",
    code: "HDMI-01",
    name: "Kabel HDMI to HDMI 5 Meter Braided",
    category: "Kabel & Aksesoris",
    stok: 5,
    description: "Kabel tebal gold-plated warna merah hitam",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "item-3",
    code: "HDMI-02",
    name: "Dongle USB Type-C to HDMI 4K Ugreen",
    category: "Kabel & Aksesoris",
    stok: 3,
    description: "Cocok untuk MacBook, iPad, dan laptop tanpa port HDMI",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "item-4",
    code: "MIC-01",
    name: "Wireless Microphone Dual Receiver Shure",
    category: "Display & Audio",
    stok: 2,
    description: "Lengkap dengan 2 mic pegang dan baterai rechargeable",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "item-5",
    code: "PTR-01",
    name: "Wireless Presenter Laser Pointer Logitech R400",
    category: "Presentasi",
    stok: 4,
    description: "Laser merah dengan dongle USB receiver di dalam kompartemen baterai",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "item-6",
    code: "ROL-01",
    name: "Kabel Rol 4 Lubang 10 Meter Uticon",
    category: "Listrik & Daya",
    stok: 4,
    description: "Dilengkapi saklar on/off dan sekring proteksi kelebihan beban",
    created_at: new Date().toISOString(),
  },
];

const SEED_LOANS: Loan[] = [
  {
    id: "loan-seed-1",
    items_id: "item-1",
    borrower_name: "Andi (Divisi Acara)",
    qty: 1,
    loan_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    return_date: null,
    status: "DIPINJAM",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "loan-seed-2",
    items_id: "item-2",
    borrower_name: "Budi (Divisi Humas)",
    qty: 1,
    loan_date: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    return_date: new Date(Date.now() - 86400000 * 1).toISOString().split("T")[0],
    status: "DIKEMBALIKAN",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// Helper Local Storage (Fallback bila Supabase belum dihubungkan)
function getLocalItems(): Item[] {
  if (typeof window === "undefined") return SEED_ITEMS;
  const stored = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(SEED_ITEMS));
    return SEED_ITEMS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return SEED_ITEMS;
  }
}

function saveLocalItems(items: Item[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
}

function getLocalLoans(): Loan[] {
  if (typeof window === "undefined") return SEED_LOANS;
  const stored = localStorage.getItem(LOCAL_STORAGE_LOANS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_LOANS_KEY, JSON.stringify(SEED_LOANS));
    return SEED_LOANS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return SEED_LOANS;
  }
}

function saveLocalLoans(loans: Loan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_LOANS_KEY, JSON.stringify(loans));
}

export const InventoryService = {
  isCloudConnected(): boolean {
    return isSupabaseConfigured;
  },

  // 1. Ambil Semua Item
  async getItems(): Promise<{ data: Item[]; source: "cloud" | "local" }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("items")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          return { data: data as Item[], source: "cloud" };
        }
        console.warn("Supabase fetch items error, fallback to local:", error?.message);
      } catch (err) {
        console.warn("Supabase connection error:", err);
      }
    }
    return { data: getLocalItems(), source: "local" };
  },

  // 2. Tambah Barang Baru
  async addItem(formData: ItemFormData): Promise<{ success: boolean; data?: Item; error?: string }> {
    const cleanCode = formData.code.trim().toUpperCase();
    const cleanName = formData.name.trim();
    const cleanCategory = formData.category.trim();
    const cleanStok = Number(formData.stok);

    if (!cleanCode || !cleanName || !cleanCategory) {
      return { success: false, error: "Kode, Nama barang, dan Kategori wajib diisi!" };
    }
    if (isNaN(cleanStok) || cleanStok < 0) {
      return { success: false, error: "Stok harus berupa angka 0 atau lebih!" };
    }

    if (isSupabaseConfigured) {
      try {
        const payload: Record<string, any> = {
          code: cleanCode,
          name: cleanName,
          category: cleanCategory,
          stok: cleanStok,
        };
        if (formData.description?.trim()) {
          payload.description = formData.description.trim();
        }

        let { data, error } = await supabase
          .from("items")
          .insert([payload])
          .select()
          .single();

        // Fallback otomatis: jika kolom 'description' belum ada di tabel items Supabase (PGRST204)
        if (error && (error.code === "PGRST204" || error.message?.includes("description"))) {
          delete payload.description;
          const retry = await supabase
            .from("items")
            .insert([payload])
            .select()
            .single();
          data = retry.data;
          error = retry.error;
        }

        if (error) {
          if (error.code === "23505") {
            return { success: false, error: `Kode barang "${cleanCode}" sudah terdaftar!` };
          }
          return { success: false, error: error.message };
        }
        return { success: true, data: data as Item };
      } catch (err: unknown) {
        return { success: false, error: (err as Error)?.message || "Gagal menghubungi Supabase" };
      }
    }

    // Local Mode
    const items = getLocalItems();
    if (items.some((i) => i.code.toLowerCase() === cleanCode.toLowerCase())) {
      return { success: false, error: `Kode barang "${cleanCode}" sudah digunakan!` };
    }

    const newItem: Item = {
      id: "item-" + Date.now(),
      code: cleanCode,
      name: cleanName,
      category: cleanCategory,
      stok: cleanStok,
      description: formData.description?.trim() || undefined,
      created_at: new Date().toISOString(),
    };
    saveLocalItems([newItem, ...items]);
    return { success: true, data: newItem };
  },

  // 3. Catat Peminjaman Barang
  async borrowItem(formData: LoanFormData): Promise<{ success: boolean; error?: string; loan?: Loan }> {
    const qty = Number(formData.qty);
    const borrower = formData.borrower_name.trim();

    if (!borrower) {
      return { success: false, error: "Nama peminjam wajib diisi!" };
    }
    if (!formData.items_id) {
      return { success: false, error: "Silakan pilih barang yang ingin dipinjam!" };
    }
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: "Jumlah pinjam minimal 1 unit!" };
    }

    if (isSupabaseConfigured) {
      try {
        // Coba panggil RPC jika tersedia di database
        const { data: rpcLoanId, error: rpcError } = await supabase.rpc("borrow_item_rpc", {
          p_item_id: formData.items_id,
          p_borrower_name: borrower,
          p_qty: qty,
        });

        if (!rpcError && rpcLoanId) {
          return { success: true };
        }

        // Fallback transaksi manual jika RPC belum dibuat di Supabase
        const { data: itemData, error: itemError } = await supabase
          .from("items")
          .select("id, stok, name")
          .eq("id", formData.items_id)
          .single();

        if (itemError || !itemData) {
          return { success: false, error: "Barang tidak ditemukan di database!" };
        }

        // ATURAN RUANG LINGKUP: Jika stok kurang, peminjaman ditolak!
        if (itemData.stok < qty) {
          return {
            success: false,
            error: `Peminjaman DITOLAK: Stok ${itemData.name} tidak mencukupi! Tersedia hanya ${itemData.stok} unit.`,
          };
        }

        // Kurangi stok barang
        const newStock = itemData.stok - qty;
        const { error: updateError } = await supabase
          .from("items")
          .update({ stok: newStock })
          .eq("id", formData.items_id);

        if (updateError) {
          return { success: false, error: `Gagal memperbarui stok: ${updateError.message}` };
        }

        // Simpan data peminjaman
        const todayStr = new Date().toISOString().split("T")[0];
        const { data: newLoan, error: loanError } = await supabase
          .from("loans")
          .insert([
            {
              items_id: formData.items_id,
              borrower_name: borrower,
              qty: qty,
              loan_date: todayStr,
              status: "DIPINJAM",
            },
          ])
          .select()
          .single();

        if (loanError) {
          if (loanError.code === "42501") {
            // RLS pada tabel loans di Supabase belum memiliki policy izin anon.
            // Jangan batalkan pemotongan stok karena stok di Supabase sudah berhasil dikurangi!
            // Simpan catatan peminjaman ke penyimpanan lokal tersinkronisasi agar pengguna TIDAK terblokir:
            const loans = getLocalLoans();
            const fallbackLoan: Loan = {
              id: "loan-" + Date.now(),
              items_id: formData.items_id,
              borrower_name: borrower,
              qty: qty,
              loan_date: todayStr,
              return_date: null,
              status: "DIPINJAM",
              created_at: new Date().toISOString(),
              item: itemData as Item,
            };
            saveLocalLoans([fallbackLoan, ...loans]);
            return {
              success: true,
              loan: fallbackLoan,
            };
          }

          // Rollback stok bila simpan loan gagal karena alasan lain
          await supabase.from("items").update({ stok: itemData.stok }).eq("id", formData.items_id);
          return { success: false, error: `Gagal mencatat peminjaman: ${loanError.message}` };
        }

        return { success: true, loan: newLoan as Loan };
      } catch (err: unknown) {
        return { success: false, error: (err as Error)?.message || "Terjadi kesalahan sistem" };
      }
    }

    // Local Mode
    const items = getLocalItems();
    const itemIndex = items.findIndex((i) => i.id === formData.items_id);
    if (itemIndex === -1) {
      return { success: false, error: "Barang tidak ditemukan!" };
    }

    const targetItem = items[itemIndex];
    // Validasi stok
    if (targetItem.stok < qty) {
      return {
        success: false,
        error: `Peminjaman DITOLAK: Stok "${targetItem.name}" tidak mencukupi! Sisa saat ini hanya ${targetItem.stok} unit.`,
      };
    }

    // Kurangi stok
    targetItem.stok -= qty;
    items[itemIndex] = targetItem;
    saveLocalItems(items);

    // Simpan pinjaman baru
    const loans = getLocalLoans();
    const todayStr = new Date().toISOString().split("T")[0];
    const newLoan: Loan = {
      id: "loan-" + Date.now(),
      items_id: targetItem.id,
      borrower_name: borrower,
      qty: qty,
      loan_date: todayStr,
      return_date: null,
      status: "DIPINJAM",
      created_at: new Date().toISOString(),
      item: targetItem,
    };

    saveLocalLoans([newLoan, ...loans]);
    return { success: true, loan: newLoan };
  },

  // 4. Proses Pengembalian Barang
  async returnItem(loanId: string | number): Promise<{ success: boolean; error?: string }> {
    if (loanId === undefined || loanId === null) return { success: false, error: "ID peminjaman tidak valid" };

    if (isSupabaseConfigured) {
      try {
        // Coba panggil RPC jika ada
        const { error: rpcError } = await supabase.rpc("return_item_rpc", {
          p_loan_id: loanId,
        });

        if (!rpcError) {
          return { success: true };
        }

        // Cek data pinjaman dari cloud atau local storage
        let loan: any = null;
        let isLocalLoan = false;

        const { data: cloudLoan } = await supabase
          .from("loans")
          .select("id, items_id, qty, status")
          .eq("id", loanId)
          .single();

        if (cloudLoan) {
          loan = cloudLoan;
        } else {
          const localLoans = getLocalLoans();
          const localMatch = localLoans.find((l) => String(l.id) === String(loanId));
          if (localMatch) {
            loan = localMatch;
            isLocalLoan = true;
          }
        }

        if (!loan) {
          return { success: false, error: "Catatan peminjaman tidak ditemukan!" };
        }

        // ATURAN RUANG LINGKUP: Menolak pengembalian ulang pada catatan yang sudah berstatus dikembalikan
        if (loan.status === "DIKEMBALIKAN") {
          return {
            success: false,
            error: "Pengembalian DITOLAK: Barang pada catatan ini sudah berstatus DIKEMBALIKAN sebelumnya!",
          };
        }

        // Ambil stok item saat ini di database Supabase
        const { data: itemData, error: itemErr } = await supabase
          .from("items")
          .select("id, stok")
          .eq("id", loan.items_id)
          .single();

        const todayStr = new Date().toISOString().split("T")[0];

        // Jika ada di cloud loans, update di Supabase
        if (!isLocalLoan) {
          await supabase
            .from("loans")
            .update({
              status: "DIKEMBALIKAN",
              return_date: todayStr,
            })
            .eq("id", loanId);
        }

        // Update juga di local loans
        const localLoans = getLocalLoans();
        const lIndex = localLoans.findIndex((l) => String(l.id) === String(loanId));
        if (lIndex !== -1) {
          localLoans[lIndex].status = "DIKEMBALIKAN";
          localLoans[lIndex].return_date = todayStr;
          saveLocalLoans(localLoans);
        }

        // Tambah stok kembali di database Supabase
        if (itemData) {
          const newStock = itemData.stok + loan.qty;
          await supabase.from("items").update({ stok: newStock }).eq("id", loan.items_id);
        }

        return { success: true };
      } catch (err: unknown) {
        return { success: false, error: (err as Error)?.message || "Gagal memproses pengembalian" };
      }
    }

    // Local Mode
    const loans = getLocalLoans();
    const loanIndex = loans.findIndex((l) => String(l.id) === String(loanId));
    if (loanIndex === -1) {
      return { success: false, error: "Catatan peminjaman tidak ditemukan!" };
    }

    const targetLoan = loans[loanIndex];
    // Tolak jika sudah dikembalikan
    if (targetLoan.status === "DIKEMBALIKAN") {
      return {
        success: false,
        error: "Pengembalian DITOLAK: Barang ini sudah pernah dikembalikan sebelumnya!",
      };
    }

    // Kembalikan stok item
    const items = getLocalItems();
    const itemIndex = items.findIndex((i) => String(i.id) === String(targetLoan.items_id));
    if (itemIndex !== -1) {
      items[itemIndex].stok += targetLoan.qty;
      saveLocalItems(items);
    }

    // Update status loan
    const todayStr = new Date().toISOString().split("T")[0];
    targetLoan.status = "DIKEMBALIKAN";
    targetLoan.return_date = todayStr;
    loans[loanIndex] = targetLoan;
    saveLocalLoans(loans);

    return { success: true };
  },

  // 5. Ambil Riwayat Peminjaman
  async getLoans(): Promise<{ data: Loan[]; source: "cloud" | "local" }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("loans")
          .select(`
            id,
            items_id,
            borrower_name,
            qty,
            loan_date,
            return_date,
            status,
            created_at,
            item:items (
              id,
              code,
              name,
              category,
              stok
            )
          `)
          .order("created_at", { ascending: false });

        const localLoans = getLocalLoans();
        if (!error && data) {
          // format join
          const formatted = (data as unknown[]).map((d: any) => ({
            ...d,
            item: Array.isArray(d.item) ? d.item[0] : d.item,
          }));
          // Gabungkan catatan pinjaman lokal dengan cloud
          const combined = [
            ...localLoans.filter((l) => !formatted.some((f) => String(f.id) === String(l.id))),
            ...formatted,
          ];
          return { data: combined as Loan[], source: "cloud" };
        }
        console.warn("Supabase fetch loans error, fallback to local:", error?.message);
      } catch (err) {
        console.warn("Supabase connection error:", err);
      }
    }

    const localLoans = getLocalLoans();
    const localItems = getLocalItems();
    const populated = localLoans.map((loan) => ({
      ...loan,
      item: localItems.find((i) => i.id === loan.items_id) || loan.item,
    }));

    return { data: populated, source: "local" };
  },
};
