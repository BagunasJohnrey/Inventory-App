import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import EditModal from "../components/EditModal";


// Recharts imports
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  Legend as PieLegend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as BarTooltip,
  Legend as BarLegend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", category:"", stock: "", costprice: "", sellingprice: "" });
  const [notification, setNotification] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Fetch items
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

  // Auto-clear notifications
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
    const categories = Array.from(new Set(items.map((i) => i.category || "Misc")));
    return { totalItems, totalStock, lowStock, categories };
  }, [items]);

  // Filtering + Sorting
  const filteredItems = useMemo(() => {
    let out = items.filter((i) => {
      const q = search.toLowerCase();
      if (q && !(i.name.toLowerCase().includes(q) || (i.barcode || "").includes(q))) return false;
      if (categoryFilter !== "All" && i.category !== categoryFilter) return false;
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
  if (!items || items.length === 0) {
    alert("No items to export.");
    return;
  }

  const headers = ["id", "name", "stock", "category", "costprice", "sellingprice", "barcode"];
  const headerLabels = ["ID", "Product Name", "Stock", "Category", "Cost Price", "Selling Price", "Barcode"];

  // Generate CSV rows
  const csvRows = [
    headerLabels.join(","), // Header row
    ...items.map(item =>
      headers.map(key => {
        let val = item[key] != null ? item[key].toString() : "";
        // Escape quotes and commas
        val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(",")
    )
  ];

  // Create and download CSV
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


  // Recharts Data
  const pieData = useMemo(() => {
    const grouped = {};
    items.forEach((i) => {
      const key = i.category || "Misc";
      grouped[key] = (grouped[key] || 0) + (i.stock || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [items]);

  const barData = useMemo(() => {
    const grouped = {};
    items.forEach((i) => {
      const key = i.category || "Misc";
      if (i.stock <= 5) grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped).map(([category, lowStockCount]) => ({
      category,
      lowStockCount,
    }));
  }, [items]);

  return (
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
            <span className="text-xs text-gray-400 mt-2">
              Categories: {stats.categories.join(", ")}
            </span>
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

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Stock Distribution by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <PieTooltip />
                <PieLegend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-2">Low Stock Items by Categories (≤5)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <BarTooltip />
                <BarLegend />
                <Bar dataKey="lowStockCount" fill="#FF4D4F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search items by name or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            {stats.categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500"
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
            setEditForm({
              name: item.name,
              category: item.category,
              stock: item.stock.toString(),
              costprice: item.costprice.toString(),
              sellingprice: item.sellingprice.toString(),
            });
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
              await fetch(`http://localhost:5000/items/${editingItem.id}`, {
                method: "DELETE",
              });
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
  );
}
