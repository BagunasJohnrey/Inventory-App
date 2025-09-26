import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigate } from "react-router-dom";

function Scanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [stock, setStock] = useState("");
  const [costprice, setCostPrice] = useState("");
  const [sellingprice, setSellingPrice] = useState("");
  const [items, setItems] = useState([]);
  const [existingItem, setExistingItem] = useState(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const codeReaderRef = useRef(null);
  const streamRef = useRef(null);
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
  }, []);

  useEffect(() => {
    if (!scanning) return;

    const startScanning = async () => {
      try {
        setError(null);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (res, err) => {
            if (res) {
              const scanned = { text: res.text };
              setResult(scanned);

              const found = items.find((item) => item.barcode === scanned.text);
              if (found) {
                setExistingItem(found);
                setProductName(found.name);
                setProductCategory(found.category);
                setStock(found.stock.toString());
                setCostPrice(found.costprice.toString());
                setSellingPrice(found.sellingprice.toString());
              } else {
                setExistingItem(null);
                setProductName("");
                setProductCategory("");
                setStock("");
                setCostPrice("");
                setSellingPrice("");
              }

              // Freeze frame
              if (videoRef.current && canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
              }

              // Stop decoding & camera
              if (codeReaderRef.current) codeReaderRef.current.reset();
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
              }

              setScanning(false);
            }

            if (err && err.name !== "NotFoundException") {
              console.error("Scanning error:", err);
            }
          }
        );
      } catch (err) {
        console.error("Camera error:", err);
        setError(err.message || "Failed to access camera.");
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [scanning, items]);

  const handleCancel = () => {
    setScanning(false);
    setResult(null);
    setExistingItem(null);
    setProductName("");
    setProductCategory("");
    setStock("");
    setSellingPrice("");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const saveItem = async () => {
    const res = await fetch("http://localhost:5000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        category: productCategory,
        stock: parseInt(stock, 10),
        costprice: parseFloat(costprice),
        sellingprice: parseFloat(sellingprice),
        barcode: result.text,
      }),
    });
    return res.json();
  };

  const updateItem = async () => {
    const res = await fetch(`http://localhost:5000/items/${existingItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: productName,
        stock: parseInt(stock, 10),
        category: productCategory,
        costprice: parseFloat(costprice),
        sellingprice: parseFloat(sellingprice),
        barcode: existingItem.barcode,
      }),
    });
    return res.json();
  };

  const handleSaveOrUpdate = async () => {
    if (!productName || !stock || !productCategory || !costprice || !sellingprice || !result) {
      alert("Please fill all fields and scan a barcode.");
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

      // reset form
      setResult(null);
      setProductName("");
      setProductCategory("");
      setStock("");
      setCostPrice("");
      setSellingPrice("");
      setExistingItem(null);
    } catch (err) {
      console.error("Error saving/updating item:", err);
      alert("Failed to save/update item.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">📷 Barcode Scanner</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="relative bg-black rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            className={`w-full h-64 object-cover ${result ? "hidden" : ""}`}
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className={`w-full h-64 object-cover ${result ? "" : "hidden"}`}
          />
          {scanning && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-4 border-red-500 rounded-lg"></div>
            </div>
          )}
        </div>

        {!scanning && !result && (
          <button
            onClick={() => setScanning(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg w-full"
          >
            Start Scanning
          </button>
        )}

        {result && (
          <>
            <div className="bg-green-50 border border-green-400 text-green-700 p-4 rounded-xl">
              <h3 className="font-semibold text-lg mb-2">✅ Item Detected</h3>
              <p><span className="font-medium">Data:</span> {result.text}</p>
            </div>

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
                placeholder="Cost Price"
                value={costprice}
                onChange={(e) => setCostPrice(e.target.value)}
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

              <button
                onClick={handleCancel}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg w-full"
              >
                Cancel / Reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Scanner;
