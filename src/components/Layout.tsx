import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  Wallet
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/transactions", icon: Receipt, label: "Transactions" },
  { path: "/budgets", icon: PieChart, label: "Budgets" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/chat", icon: MessageSquare, label: "AI Assistant" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">IntelliFinance</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 font-medium shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
              {user?.displayName?.[0] || user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <span className="font-bold text-gray-900">IntelliFinance</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                    <Wallet size={20} />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900">IntelliFinance</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500">
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? "bg-emerald-50 text-emerald-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon size={22} className={isActive ? "text-emerald-600" : "text-gray-400"} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-4 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                >
                  <LogOut size={22} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
