import { create } from 'zustand';

export type OperationType = 'receipt' | 'delivery' | 'transfer';
export type OperationStatus = 'draft' | 'waiting' | 'done';

export interface OperationItem {
  id?: string;
  product_id: string;
  quantity: number;
  products?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
    uom?: string;
  };
}

export interface Location {
  id: string;
  name: string;
  warehouse_id: string;
  warehouses?: {
    id: string;
    name: string;
  };
}

export interface Operation {
  id: string;
  type: OperationType;
  status: OperationStatus;
  source_location_id?: string;
  destination_location_id?: string;
  source_location?: Location;
  destination_location?: Location;
  supplier?: string;
  customer?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  operation_items: OperationItem[];
}

interface OperationsState {
  operations: Operation[];
  loading: boolean;
  error: string | null;
  filters: {
    type?: OperationType;
    status?: OperationStatus;
    warehouse_id?: string;
    product_id?: string;
  };

  setOperations: (operations: Operation[]) => void;
  addOperation: (operation: Operation) => void;
  updateOperation: (id: string, operation: Partial<Operation>) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setFilters: (filters: Partial<OperationsState['filters']>) => void;
  clearFilters: () => void;

  fetchOperations: () => Promise<void>;
}

export const useOperationsStore = create<OperationsState>((set) => ({
  operations: [],
  loading: false,
  error: null,
  filters: {},

  setOperations: (operations) => set({ operations }),

  addOperation: (operation) =>
    set((state) => ({
      operations: [operation, ...state.operations],
    })),

  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op
      ),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  // ⭐⭐⭐ FETCH OPERATIONS FROM BACKEND ⭐⭐⭐
  fetchOperations: async () => {
    set({ loading: true, error: null });

    try {
      const baseUrl = "http://localhost:3000/api/operations";

      const [receiptsRes, deliveriesRes, transfersRes] = await Promise.all([
        fetch(`${baseUrl}/receipts`).then((r) => r.json()),
        fetch(`${baseUrl}/deliveries`).then((r) => r.json()),
        fetch(`${baseUrl}/transfers`).then((r) => r.json()),
      ]);

      // Convert to unified format
      const receipts = receiptsRes.map((r: any) => ({
        id: r.receipt_id,
        type: "receipt",
        status: r.status,
        supplier: r.supplier_name,
        created_by: r.created_by ?? "unknown",
        created_at: r.created_at,
        updated_at: r.created_at,
        operation_items: [],
      }));

      const deliveries = deliveriesRes.map((d: any) => ({
        id: d.delivery_id,
        type: "delivery",
        status: d.status,
        customer: d.customer_name,
        created_by: d.created_by ?? "unknown",
        created_at: d.created_at,
        updated_at: d.created_at,
        operation_items: [],
      }));

      const transfers = transfersRes.map((t: any) => ({
        id: t.transfer_id,
        type: "transfer",
        status: t.status,
        source_location_id: t.from_location,
        destination_location_id: t.to_location,
        created_by: "system",
        created_at: t.created_at,
        updated_at: t.created_at,
        operation_items: [],
      }));

      // Merge everything
      const allOps = [...receipts, ...deliveries, ...transfers];

      set({ operations: allOps, loading: false });

    } catch (err: any) {
      console.error("ERROR FETCHING OPS:", err);
      set({ error: "Failed to load operations", loading: false });
    }
  },
}));
