import { useState, useEffect } from "react";
import Layout from "../components/Layout";

export default function Reports() {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);
  const lowStock = items.filter((i) => i.stock < 5);

  return (
    <Layout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">📊 Reports</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <span className="text-sm text-gray-500">Total Items</span>
            <span className="block text-2xl font-semibold">{items.length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <span className="text-sm text-gray-500">Total Stock</span>
            <span className="block text-2xl font-semibold">{totalStock}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <span className="text-sm text-gray-500">Low Stock Items</span>
            <span className="block text-2xl font-semibold text-rose-600">
              {lowStock.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">⚠️ Low Stock List</h3>
          {lowStock.length > 0 ? (
            <ul className="list-disc ml-6 space-y-1">
              {lowStock.map((i) => (
                <li key={i.id}>
                  {i.name} (Stock: {i.stock})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-green-600">All items are sufficiently stocked.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
