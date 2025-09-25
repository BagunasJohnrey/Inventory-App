import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

function Scanner() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [productName, setProductName] = useState('');
    const [stock, setStock] = useState('');
    const [savedItems, setSavedItems] = useState([]);
    const videoRef = useRef(null);
    const codeReaderRef = useRef(null);

    useEffect(() => {
        codeReaderRef.current = new BrowserMultiFormatReader();
        return () => {
            if (codeReaderRef.current) {
                codeReaderRef.current.reset();
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            setResult(null);
            setIsScanning(true);

            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            await codeReaderRef.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result, error) => {
                    if (result) {
                        setResult({
                            text: result.text,
                            format: result.format
                        });
                        setIsScanning(false);
                        if (stream) stream.getTracks().forEach(track => track.stop());
                        codeReaderRef.current.reset();
                    }
                    if (error && error.name !== 'NotFoundException') {
                        console.error('Scanning error:', error);
                    }
                }
            );
        } catch (err) {
            console.error('Camera error:', err);
            setError(err.message || 'Failed to start camera. Please make sure you have granted camera permissions.');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);
        if (codeReaderRef.current) codeReaderRef.current.reset();
    };

    const startNewScan = () => {
        setResult(null);
        setProductName('');
        setStock('');
        startScanning();
    };

    const saveItem = () => {
        if (!productName || !stock || !result) {
            alert("Please fill product name, stock, and scan a barcode.");
            return;
        }
        setSavedItems(prev => [...prev, {
            name: productName,
            stock: stock,
            barcode: result.text,
            format: result.format
        }]);
        setProductName('');
        setStock('');
        setResult(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Barcode Scanner</h2>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {!isScanning && !result && (
                <div className="space-y-4">
                    <p className="text-gray-600">Click the button below to start scanning barcodes</p>
                    <button
                        onClick={startScanning}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Start Scanning
                    </button>
                </div>
            )}

            {isScanning && (
                <div className="space-y-4">
                    <p className="text-blue-600 font-medium">Scanning... Point your camera at a barcode</p>
                    <div className="relative bg-black rounded-lg overflow-hidden">
                        <video 
                            ref={videoRef}
                            className="w-full h-64 object-cover"
                            playsInline
                            muted
                        />
                        <div className="absolute inset-0 border-2 border-blue-400 rounded-lg pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-red-400 rounded"></div>
                        </div>
                    </div>
                    <button
                        onClick={stopScanning}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                    >
                        Stop Scanning
                    </button>
                </div>
            )}

            {result && (
                <div className="space-y-4 text-left">
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        <h3 className="font-semibold text-lg mb-2">Barcode Detected!</h3>
                        <p><span className="font-medium">Format:</span> {result.format}</p>
                        <p><span className="font-medium">Data:</span></p>
                        <div className="bg-white p-3 rounded border break-all font-mono text-sm">
                            {result.text}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={productName}
                            onChange={e => setProductName(e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                        <input
                            type="number"
                            placeholder="Stock Quantity"
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            className="border p-2 w-full rounded"
                        />
                        <button
                            onClick={saveItem}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full"
                        >
                            Save Item
                        </button>
                    </div>

                    <button
                        onClick={startNewScan}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors w-full"
                    >
                        Scan Another
                    </button>
                </div>
            )}

            {savedItems.length > 0 && (
                <div className="mt-4 text-left">
                    <h3 className="font-semibold text-lg mb-2">Saved Items:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {savedItems.map((item, index) => (
                            <li key={index}>
                                <span className="font-medium">{item.name}</span> - Stock: {item.stock}, Barcode: {item.barcode}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!isScanning && !result && !error && (
                <div className="mt-4 text-sm text-gray-500">
                    <p>Supports QR codes, barcodes (UPC, EAN), and more</p>
                </div>
            )}
        </div>
    );
}

export default Scanner;
