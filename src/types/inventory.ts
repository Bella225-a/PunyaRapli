export interface Item {
  id: string | number;
  code: string;
  name: string;
  category: string;
  stok: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Loan {
  id: string | number;
  items_id: string | number;
  borrower_name: string;
  qty: number;
  loan_date: string;
  return_date?: string | null;
  status: 'DIPINJAM' | 'DIKEMBALIKAN';
  created_at?: string;
  item?: Item;
}

export interface LoanFormData {
  items_id: string | number;
  borrower_name: string;
  qty: number;
}

export interface ItemFormData {
  code: string;
  name: string;
  category: string;
  stok: number;
  description?: string;
}
