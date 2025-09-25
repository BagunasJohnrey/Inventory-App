import { useState, useEffect } from "react";
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

  // Auto-hide notification after 3s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.barcode && i.barcode.includes(search))
  );

  return (
    <Layout>
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Inventory Items</h2>
          <button
            onClick={fetchItems}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Refresh
          </button>
        </div>

        <SearchBar search={search} setSearch={setSearch} />

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

        {/* Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fadeIn">
            {notification}
          </div>
        )}
      </div>
    </Layout>
  );
}
