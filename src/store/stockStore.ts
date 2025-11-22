import { create } from 'zustand';

export interface StockLevel {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  products?: {
    id: string;
    name: string;
    sku: string;
  };
  locations?: {
    id: string;
    name: string;
    warehouse_id: string;
  };
}

interface StockState {
  stockLevels: StockLevel[];
  loading: boolean;
  error: string | null;
  setStockLevels: (levels: StockLevel[]) => void;
  updateStockLevel: (productId: string, locationId: string, quantity: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStockStore = create<StockState>((set) => ({
  stockLevels: [],
  loading: false,
  error: null,
  setStockLevels: (stockLevels) => set({ stockLevels }),
  updateStockLevel: (productId, locationId, quantity) =>
    set((state) => ({
      stockLevels: state.stockLevels.map((level) =>
        level.product_id === productId && level.location_id === locationId
          ? { ...level, quantity }
          : level
      ),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));


