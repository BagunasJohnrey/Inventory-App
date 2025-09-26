import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigate } from "react-router-dom";

function Scanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [stock, setStock] = useState("");
  const [sellingprice, setSellingPrice] = useState("");
  const [items, setItems] = useState([]);
  const [existingItem, setExistingItem] = useState(null);
  const [scanning, setScanning] = useState(true);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const navigate = useNavigate();

  // Fetch items from DB
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
    codeReaderRef.current = new BrowserMultiFormatReader();
    fetchItems();

    const startScanning = async () => {
      try {
        setError(null);
        if (!scanning) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (res, err) => {
            if (res) {
              const scanned = { text: res.text, format: res.format };
              setResult(scanned);

              const found = items.find((item) => item.barcode === scanned.text);
              if (found) {
                setExistingItem(found);
                setProductName(found.name);
                setProductCategory(found.category);
                setStock(found.stock.toString());
                setSellingPrice(found.sellingprice.toString());
              } else {
                setExistingItem(null);
                setProductName("");
                setProductCategory("");
                setStock("");
                setSellingPrice("");
              }

              setScanning(false);
              codeReaderRef.current.reset();
            }
            if (err && err.name !== "NotFoundException") {
              console.error("Scanning error:", err);
            }
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setError(err.message || "Failed to access camera.");
      }
    };

    startScanning();

    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
    };
  }, [scanning, items]);

  // Save new item
  const saveItem = async () => {
    const res = await fetch("http://localhost:5000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        category: productCategory,
        stock: parseInt(stock, 10),
        sellingprice: parseFloat(sellingprice),
        barcode: result.text,
        format: result.format,
      }),
    });
    return res.json();
  };

  // Update existing item
  const updateItem = async () => {
    const res = await fetch(`http://localhost:5000/items/${existingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        stock: parseInt(stock, 10),
        category: productCategory,
        sellingprice: parseFloat(sellingprice),
        barcode: existingItem.barcode,
        format: existingItem.format,
      }),
    });
    return res.json();
  };

  const handleSaveOrUpdate = async () => {
    if (!productName || !stock || !productCategory || !sellingprice || !result) {
      alert("Please fill product name, stock, category, selling price, and scan a barcode.");
      return;
    }
    try {
      if (existingItem) {
        await updateItem();
        alert("Item updated!");
      } else {
        await saveItem();
        alert("Item saved!");
      }
      await fetchItems();

      // reset & resume scanning
      setResult(null);
      setProductName("");
      setProductCategory("");
      setStock("");
      setSellingPrice("");
      setExistingItem(null);
      setScanning(true);
    } catch (err) {
      console.error("Error saving/updating item:", err);
      alert("Failed to save/update item.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            📷 Barcode Scanner
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Dashboard
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Camera Feed */}
        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          {scanning && (
            <div className="absolute inset-0 border-2 border-blue-400 rounded-xl pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-400 rounded-lg"></div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">✅ Item Detected</h3>
              <p>
                <span className="font-medium">Format:</span> {result.format}
              </p>
              <p>
                <span className="font-medium">Data:</span>
              </p>
              <div className="bg-white p-3 rounded border break-all font-mono text-sm">
                {result.text}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
              />
              <input
                type="text"
                placeholder="Product Category"
                value={productCategory}
                onChange={(e) => setProductCategory(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
              />
              <input
                type="number"
                placeholder="Selling Price"
                value={sellingprice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="border p-3 w-full rounded-lg focus:ring focus:ring-blue-200"
              />

              <button
                onClick={handleSaveOrUpdate}
                className={`${
                  existingItem
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-semibold py-3 px-6 rounded-lg transition w-full`}
              >
                {existingItem ? "Update Item" : "Save Item"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scanner;
