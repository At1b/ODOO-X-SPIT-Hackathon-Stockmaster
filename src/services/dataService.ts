import axios from "./api";

export const fetchProducts = async () => {
  const res = await axios.get("/products");
  return res.data.data || [];
};

export const fetchLocations = async () => {
  const res = await axios.get("/locations");
  return res.data.data || [];
};

// You don't have warehouses table → return empty
export const fetchWarehouses = async () => {
  return [];
};
