import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { HiOutlineHome, HiOutlineChartBar, HiOutlineCamera } from "react-icons/hi";

const navItems = [
  { label: "Dashboard", path: "/", icon: <HiOutlineHome /> },
  { label: "Reports", path: "/reports", icon: <HiOutlineChartBar /> },
  { label: "Scanner", path: "/scanner", icon: <HiOutlineCamera /> },
];

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-blue-600 text-white flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        } h-full`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-500">
          {!collapsed && <h1 className="text-xl font-bold">📦 Inventory</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white focus:outline-none text-lg"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="flex-1 mt-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-blue-500 transition-colors text-sm ${
                location.pathname === item.path ? "bg-blue-700" : ""
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-auto">
        <header className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname === "/"
              ? "Dashboard"
              : location.pathname.slice(1).replace("-", " ")}
          </h2>
        </header>
        <main className="flex-1 p-6 bg-gray-100">{children}</main>
      </div>
    </div>
  );
}
