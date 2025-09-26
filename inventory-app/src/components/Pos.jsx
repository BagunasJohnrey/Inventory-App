import { useEffect, useState } from "react";

export default function Pos() {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);

  // Fetch items from backend
  useEffect(() => {
    fetch("http://localhost:5000/items")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // Add item to cart
  const addToCart = (item) => {
    const exists = cart.find((c) => c.id === item.id);
    if (exists) {
      setCart(
        cart.map((c) =>
          c.id === item.id ? { ...c, qty: c.qty + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  // Increase / Decrease qty
  const updateQty = (id, delta) => {
    setCart(
      cart
        .map((c) =>
          c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
        )
        .filter((c) => c.qty > 0)
    );
  };

  // Compute totals
  const total = cart.reduce((sum, c) => sum + c.sellingprice * c.qty, 0);

  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      {/* Products */}
      <div className="col-span-2 bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-4">🛒 Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border p-3 rounded hover:shadow cursor-pointer"
              onClick={() => addToCart(item)}
            >
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-500">{item.category}</p>
              <p className="text-green-600 font-bold">₱{item.sellingprice}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white shadow rounded p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">🛍️ Cart</h2>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {cart.length === 0 && <p className="text-gray-500">No items in cart</p>}
          {cart.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-gray-500">₱{c.sellingprice}</p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => updateQty(c.id, -1)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{c.qty}</span>
                  <button
                    onClick={() => updateQty(c.id, 1)}
                    className="px-2 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₱{(c.qty * c.sellingprice).toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(c.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout */}
        <div className="mt-4 border-t pt-2">
          <p className="text-lg font-bold">Total: ₱{total.toFixed(2)}</p>
          <button
            disabled={cart.length === 0}
            className={`w-full mt-2 py-2 rounded text-white font-semibold ${
              cart.length === 0 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => {
              alert("Checkout successful!");
              setCart([]);
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
