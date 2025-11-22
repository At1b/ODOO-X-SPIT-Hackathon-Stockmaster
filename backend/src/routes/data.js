import express from "express";
import {
  getProducts,
  getLocations,
  getWarehouses,
} from "../controllers/dataController.js";

const router = express.Router();

// Routes
router.get("/products", getProducts);
router.get("/locations", getLocations);
router.get("/warehouses", getWarehouses);

export default router;
