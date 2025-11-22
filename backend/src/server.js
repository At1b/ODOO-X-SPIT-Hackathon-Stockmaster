import express from "express";
import cors from "cors";

import operationsRouter from "./routes/operations.js";
import dataRouter from "./routes/data.js";

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/operations", operationsRouter);
app.use("/api", dataRouter);   // <-- connects products, locations, warehouses

// default
app.get("/", (req, res) => {
  res.send("Backend running...");
});

// START SERVER
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
