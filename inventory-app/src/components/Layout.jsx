import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">📦 Inventory System</h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <Link to="/reports" className="hover:underline">Reports</Link>
            <Link to="/scanner" className="hover:underline">Scanner</Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow bg-gray-100 p-6">{children}</main>
    </div>
  );
}
