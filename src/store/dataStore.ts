import { create } from "zustand";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  uom: string;
  low_stock_threshold: number;
  initial_stock: number;
}

interface Location {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
}

interface DataState {
  products: Product[];
  locations: Location[];
  warehouses: any[];

  setProducts: (p: Product[]) => void;
  setLocations: (l: Location[]) => void;
  setWarehouses: (w: any[]) => void;
}

export const useDataStore = create<DataState>((set) => ({
  products: [],
  locations: [],
  warehouses: [],

  setProducts: (products) => set({ products }),
  setLocations: (locations) => set({ locations }),
  setWarehouses: (warehouses) => set({ warehouses }),
}));
