import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Scanner from './components/Scanner'
import './index.css'
import './App.css'

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
      <h2 className="text-2xl font-bold text-gray-800">Inventory App</h2>
      <p className="text-gray-600 mt-3">
        Scan barcodes to manage your inventory.
      </p>
      <button
        onClick={() => navigate("/scanner")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Open Scanner
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
      </Routes>
    </Router>
  );
}

export default App;