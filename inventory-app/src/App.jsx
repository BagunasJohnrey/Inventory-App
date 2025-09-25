import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Scanner from "./components/Scanner";
import "./index.css";
import "./App.css";

function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", stock: "" });

  // Fetch items from backend
  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/items");
      if (!res.ok) throw new Error(`Failed to fetch items (status: ${res.status})`);
      const data = await res.json();
      // Ensure all ids and stocks are numbers (safeguard against type issues)
      const normalizedData = data.map(item => ({
        ...item,
        id: Number(item.id),
        stock: Number(item.stock)
      }));
      setItems(normalizedData);
    } catch (err) {
      console.error("Error fetching items:", err);
      alert("Failed to load items. Please try refreshing.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Delete item (from table)
  const handleDelete = async (id) => {
    const numId = Number(id); // Coerce to number for consistency
    console.log("ID before delete (table):", numId, typeof numId); // Debug
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`http://localhost:5000/items/${numId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete item (status: ${res.status})`);
      setItems((prev) => prev.filter((item) => Number(item.id) !== numId)); // Coerce for comparison
      await fetchItems(); // Reload to ensure DB sync
      alert("Item deleted successfully!");
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(`Failed to delete item: ${err.message}. Please try again.`);
    }
  };

  // Open edit modal
  const handleEdit = (item) => {
    const numId = Number(item.id); // Ensure number
    console.log("Editing item ID:", numId, typeof numId); // Debug
    setEditingItem({ ...item, id: numId });
    setEditForm({ name: item.name, stock: item.stock.toString() }); // Ensure string for input
  };

  // Save edit
  const saveEdit = async () => {
    if (!editForm.name.trim() || !editForm.stock.trim()) {
      alert("Please fill in name and stock.");
      return;
    }
    const stockInt = parseInt(editForm.stock, 10);
    if (isNaN(stockInt) || stockInt < 0) {
      alert("Stock must be a non-negative integer.");
      return;
    }
    const numId = Number(editingItem.id); // Coerce to number
    console.log("ID before update:", numId, typeof numId); // Debug
    try {
      const res = await fetch(`http://localhost:5000/items/${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          stock: stockInt,
        }),
      });
      if (!res.ok) throw new Error(`Failed to update item (status: ${res.status})`);
      const updated = await res.json();
      // Coerce id to number in response (safeguard)
      const normalizedUpdated = { ...updated, id: Number(updated.id) };
      console.log("Updated item ID:", normalizedUpdated.id, typeof normalizedUpdated.id); // Debug
      setItems((prev) =>
        prev.map((i) => (Number(i.id) === numId ? { ...i, ...normalizedUpdated } : i))
      );
      setEditingItem(null);
      setEditForm({ name: "", stock: "" });
      await fetchItems(); // Reload to ensure DB sync
      alert("Item updated successfully!");
    } catch (err) {
      console.error("Error updating item:", err);
      alert(`Failed to update item: ${err.message}. Please try again.`);
    }
  };

  // Delete from modal
  const deleteFromModal = async () => {
    const numId = Number(editingItem.id); // Coerce to number
    console.log("ID before delete (modal):", numId, typeof numId); // Debug
    if (!window.confirm("Delete this item permanently?")) return;
    try {
      const res = await fetch(`http://localhost:5000/items/${numId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Failed to delete item (status: ${res.status})`);
      setItems((prev) => prev.filter((i) => Number(i.id) !== numId)); // Coerce for comparison
      setEditingItem(null);
      setEditForm({ name: "", stock: "" });
      await fetchItems(); // Reload to ensure DB sync
      alert("Item deleted successfully!");
    } catch (err) {
      console.error("Error deleting item:", err);
      alert(`Failed to delete item: ${err.message}. Please try again.`);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">📦 Inventory Dashboard</h1>
          <button
            onClick={() => navigate("/scanner")}
            className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-200"
          >
            Open Scanner
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Inventory Items</h2>
            <button
              onClick={fetchItems}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Refresh
            </button>
          </div>

          {/* Table */}
          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border text-left">ID</th>
                    <th className="px-4 py-2 border text-left">Name</th>
                    <th className="px-4 py-2 border text-center">Stock</th>
                    <th className="px-4 py-2 border text-left">Barcode</th>
                    <th className="px-4 py-2 border text-left">Format</th>
                    <th className="px-4 py-2 border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{item.id}</td>
                      <td className="px-4 py-2 border">{item.name}</td>
                      <td className="px-4 py-2 border text-center">{item.stock}</td>
                      <td className="px-4 py-2 border">{item.barcode}</td>
                      <td className="px-4 py-2 border">{item.format}</td>
                      <td className="px-4 py-2 border text-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No items found. Start scanning to add some!</p>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit Item</h3>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Item Name"
              className="w-full border rounded p-2 mb-3"
            />
            <input
              type="number"
              min="0"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm({ ...editForm, stock: e.target.value })
              }
              placeholder="Stock"
              className="w-full border rounded p-2 mb-3"
            />
            <div className="flex justify-between gap-2">
              <button
                onClick={() => {
                  setEditingItem(null);
                  setEditForm({ name: "", stock: "" });
                }}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteFromModal}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
              <button
                onClick={saveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
      </Routes>
    </Router>
  );
}

export default App;
