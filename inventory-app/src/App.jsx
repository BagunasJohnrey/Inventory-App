// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Scanner from "./components/Scanner";
import Reports from "./components/Reports";
import Search from "./components/SearchBar";

import "./index.css";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Inventory Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Scanner Page */}
        <Route path="/scanner" element={<Scanner />} />

        {/* Reports Page */}
        <Route path="/reports" element={<Reports />} />

        {/* Search Page */}
        <Route path="/search" element={<Search />} />
      </Routes>
    </Router>
  );
}

export default App;
