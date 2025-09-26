import { useState, useEffect, useMemo } from "react";
import Layout from "../components/Layout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A"];

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

  // === Business Calculations ===
  const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);
  const lowStock = items.filter((i) => i.stock < 5);

  const totalRevenue = items.reduce((sum, i) => sum + (i.sellingprice - 0) * (i.stock || 0), 0);
  const totalCost = items.reduce((sum, i) => sum + (i.costprice - 0) * (i.stock || 0), 0);
  const totalProfit = totalRevenue - totalCost;

  // === Charts Data ===
  const categoryData = useMemo(() => {
    const grouped = {};
    items.forEach((i) => {
      const cat = i.category || "Misc";
      const cost = (i.costprice || 0) * (i.stock || 0);
      const revenue = (i.sellingprice || 0) * (i.stock || 0);
      const profit = revenue - cost;

      if (!grouped[cat]) grouped[cat] = { category: cat, cost: 0, revenue: 0, profit: 0 };
      grouped[cat].cost += cost;
      grouped[cat].revenue += revenue;
      grouped[cat].profit += profit;
    });
    return Object.values(grouped);
  }, [items]);

  // === Best & Worst Performing Items ===
  const performanceData = useMemo(() => {
    return items.map((i) => {
      const revenue = (i.sellingprice || 0) * (i.stock || 0);
      const profit = revenue - (i.costprice || 0) * (i.stock || 0);
      return {
        id: i.id,
        name: i.name,
        category: i.category,
        revenue,
        profit,
      };
    });
  }, [items]);

  const topProducts = [...performanceData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const worstProducts = [...performanceData]
    .sort((a, b) => a.revenue - b.revenue)
    .slice(0, 5);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">📊 Reports & Profit Analysis</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <span className="text-sm text-gray-500">Total Items</span>
          <span className="block text-2xl font-semibold">{items.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <span className="text-sm text-gray-500">Total Stock</span>
          <span className="block text-2xl font-semibold">{totalStock}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <span className="text-sm text-gray-500">💰 Total Revenue</span>
          <span className="block text-2xl font-semibold text-green-600">
            ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <span className="text-sm text-gray-500">📈 Total Profit</span>
          <span className="block text-2xl font-semibold text-blue-600">
            ₱{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Revenue, Cost & Profit by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#FF4D4F" name="Cost" />
              <Bar dataKey="revenue" fill="#00C49F" name="Revenue" />
              <Bar dataKey="profit" fill="#0088FE" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Profit Contribution by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="profit"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Section */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h3 className="font-semibold mb-2">⚠️ Low Stock List</h3>
        {lowStock.length > 0 ? (
          <ul className="list-disc ml-6 space-y-1">
            {lowStock.map((i) => (
              <li key={i.id}>
                {i.name} (Stock: {i.stock}, Profit per Unit: ₱
                {(i.sellingprice - i.costprice).toFixed(2)})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-600">All items are sufficiently stocked.</p>
        )}
      </div>

      {/* Best & Worst Products Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Sellers */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">🔥 Top 5 Best-Selling Products</h3>
          <ul className="list-decimal ml-6 space-y-1">
            {topProducts.map((p) => (
              <li key={p.id}>
                {p.name} - Revenue: ₱
                {p.revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} | Profit: ₱
                {p.profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </li>
            ))}
          </ul>
        </div>

        {/* Worst Sellers */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-2">🐢 Bottom 5 Least-Selling Products</h3>
          <ul className="list-decimal ml-6 space-y-1">
            {worstProducts.map((p) => (
              <li key={p.id}>
                {p.name} - Revenue: ₱
                {p.revenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} | Profit: ₱
                {p.profit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
