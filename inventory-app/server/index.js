import express from "express";
import sqlite3pkg from "sqlite3";
import cors from "cors";

const sqlite3 = sqlite3pkg.verbose();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Connect to SQLite (creates file if not exists)
const db = new sqlite3.Database("./inventory.db", (err) => {
  if (err) console.error("DB connection error:", err.message);
  else console.log("Connected to SQLite database.");
});

// Create table if not exists (without format)
db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL,
  costprice REAL NOT NULL,
  sellingprice REAL NOT NULL, 
  barcode TEXT NOT NULL
)`);

// API: Get all items
app.get("/items", (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Add new item
app.post("/items", (req, res) => {
  const { name, stock, category, costprice, sellingprice, barcode } = req.body;

  // Basic validation
  if (!name || stock == null || category == null || costprice == null || sellingprice == null || !barcode) {
    return res.status(400).json({ error: "Missing required fields: name, stock, costprice, sellingprice, barcode" });
  }
  if (isNaN(stock) || isNaN(costprice) || isNaN(sellingprice)) {
    return res.status(400).json({ error: "Stock, costprice, and sellingprice must be valid numbers" });
  }

  db.run(
    "INSERT INTO items (name, stock, category, costprice, sellingprice, barcode) VALUES (?, ?, ?, ?, ?, ?)",
    [name, stock, category, costprice, sellingprice, barcode],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, stock, category, costprice, sellingprice, barcode });
    }
  );
});

// API: Update item (allow partial updates)
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { name, stock, category, costprice, sellingprice } = req.body;

  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Item not found" });

    const updatedName = name ?? row.name;
    const updatedStock = stock ?? row.stock;
    const updatedCategory = category ?? row.category;
    const updatedCostPrice = costprice ?? row.costprice;
    const updatedSellingPrice = sellingprice ?? row.sellingprice;

    db.run(
      "UPDATE items SET name = ?, stock = ?, category = ?, costprice = ?, sellingprice = ? WHERE id = ?",
      [updatedName, updatedStock, updatedCategory, updatedCostPrice, updatedSellingPrice, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name: updatedName, stock: updatedStock, category: updatedCategory, costprice: updatedCostPrice, sellingprice: updatedSellingPrice });
      }
    );
  });
});

// API: Delete item
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully", id });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
