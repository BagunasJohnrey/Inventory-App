import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import SearchBar from "../components/SearchBar";
import Table from "../components/Table";
import EditModal from "../components/EditModal";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", stock: "" });
  const [notification, setNotification] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
      setNotification("⚠️ Failed to fetch items");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Notification auto-clear
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Stats
  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalStock = items.reduce((s, i) => s + (i.stock || 0), 0);
    const lowStock = items.filter((i) => i.stock <= 5).length;
    const categories = Array.from(new Set(items.map((i) => i.format || "Misc")));
    return { totalItems, totalStock, lowStock, categories };
  }, [items]);

  // Filtering
  const filteredItems = useMemo(() => {
    let out = items.filter((i) => {
      const q = search.toLowerCase();
      if (q && !(i.name.toLowerCase().includes(q) || (i.barcode || "").includes(q))) return false;
      if (categoryFilter !== "All" && i.format !== categoryFilter) return false;
      return true;
    });

    out.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });
    return out;
  }, [items, search, sortBy, categoryFilter]);

  // Export CSV
  function exportCSV() {
    const header = ["id", "name", "stock", "barcode", "format"];
    const rows = [header.join(","), ...items.map((r) => header.map((c) => r[c]).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Sports Inventory Dashboard</h2>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-2 rounded-lg bg-white border hover:shadow"
            >
              Export CSV
            </button>
            <button
              onClick={fetchItems}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-500">Total unique products</span>
            <span className="text-2xl font-semibold">{stats.totalItems}</span>
            <span className="text-xs text-gray-400 mt-2">Formats: {stats.categories.join(", ")}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-500">Total units in stock</span>
            <span className="text-2xl font-semibold">{stats.totalStock}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow flex flex-col">
            <span className="text-sm text-gray-500">Low stock alerts (≤ 5)</span>
            <span className="text-2xl font-semibold text-rose-600">{stats.lowStock}</span>
          </div>
        </div>

        {/* Search + filters */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-3 items-center mb-6">
          <SearchBar search={search} setSearch={setSearch} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option>All</option>
            {stats.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="name">Sort: Name</option>
            <option value="stock">Sort: Stock (desc)</option>
          </select>
        </div>

        {/* Items Table */}
        <Table
          items={filteredItems}
          onEdit={(item) => {
            setEditingItem(item);
            setEditForm({ name: item.name, stock: item.stock.toString() });
          }}
          onDelete={async (id) => {
            await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
            fetchItems();
            setNotification("🗑️ Item deleted");
          }}
        />

        {/* Edit Modal */}
        {editingItem && (
          <EditModal
            editForm={editForm}
            setEditForm={setEditForm}
            onCancel={() => {
              setEditingItem(null);
              setNotification("❌ Edit cancelled");
            }}
            onDelete={async () => {
              await fetch(`http://localhost:5000/items/${editingItem.id}`, { method: "DELETE" });
              setEditingItem(null);
              fetchItems();
              setNotification("🗑️ Item deleted");
            }}
            onSave={async () => {
              await fetch(`http://localhost:5000/items/${editingItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...editForm,
                  stock: parseInt(editForm.stock, 10),
                }),
              });
              setEditingItem(null);
              fetchItems();
              setNotification("✅ Item updated");
            }}
          />
        )}

        {/* Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
            {notification}
          </div>
        )}
      </div>
    </Layout>
  );
}
