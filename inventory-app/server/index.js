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
  const { name, stock, category, sellingprice, barcode } = req.body;

  // Basic validation
  if (!name || stock == null || category == null || sellingprice == null || !barcode) {
    return res.status(400).json({ error: "Missing required fields: name, stock, sellingprice, barcode" });
  }
  if (isNaN(stock) || isNaN(sellingprice)) {
    return res.status(400).json({ error: "Stock and sellingprice must be valid numbers" });
  }

  db.run(
    "INSERT INTO items (name, stock, category, sellingprice, barcode) VALUES (?, ?, ?, ?, ?)",
    [name, stock, category, sellingprice, barcode],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, stock, category, sellingprice, barcode });
    }
  );
});

// API: Update item (allow partial updates)
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { name, stock, category, sellingprice } = req.body;

  db.get("SELECT * FROM items WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Item not found" });

    const updatedName = name ?? row.name;
    const updatedStock = stock ?? row.stock;
    const updatedCategory = category ?? row.category;
    const updatedPrice = sellingprice ?? row.sellingprice;

    db.run(
      "UPDATE items SET name = ?, stock = ?, category = ?, sellingprice = ? WHERE id = ?",
      [updatedName, updatedStock, updatedCategory, updatedPrice, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, name: updatedName, stock: updatedStock, category: updatedCategory, sellingprice: updatedPrice });
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
