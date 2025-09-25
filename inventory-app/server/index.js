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

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL,
  barcode TEXT NOT NULL,
  format TEXT NOT NULL
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
  const { name, stock, barcode, format } = req.body;
  db.run(
    "INSERT INTO items (name, stock, barcode, format) VALUES (?, ?, ?, ?)",
    [name, stock, barcode, format],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, stock, barcode, format });
    }
  );
});

// API: Update item (allow partial updates)
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { name, stock } = req.body;

  db.run(
    "UPDATE items SET name = ?, stock = ? WHERE id = ?",
    [name, stock, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Item not found" });
      res.json({ id, name, stock });
    }
  );
});

// ✅ API: Delete item
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM items WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted successfully", id });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
