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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">📊 Reports</h2>
        <p>Total Items: {items.length}</p>
        <p>Total Stock: {totalStock}</p>
        <h3 className="font-semibold mt-4">⚠️ Low Stock Items</h3>
        {lowStock.length > 0 ? (
          <ul className="list-disc ml-6">
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
    </Layout>
  );
}
