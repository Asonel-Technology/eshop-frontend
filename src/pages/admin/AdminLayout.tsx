import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import CategoriesManager from "./CategoriesManager";

interface AdminLayoutProps {
  onExit: () => void;
}

export default function AdminLayout({ onExit }: AdminLayoutProps) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "products", label: "Products", icon: "🥩" },
    { id: "categories", label: "Categories", icon: "📂" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-border flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-serif text-lg font-bold text-foreground">Blessing Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === item.id 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <button 
            onClick={onExit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            Go to Shop
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="h-16 bg-white border-b border-border flex items-center px-6 md:px-10 sticky top-0 z-10">
          <h2 className="font-serif text-xl font-bold">
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>
        </div>

        <div className="p-6 md:p-10">
          {activeTab === "dashboard" && (
            <div>
              <p className="text-muted-foreground">Welcome to the Blessing Admin Dashboard.</p>
              {/* Coming soon: Stats widgets */}
            </div>
          )}
          {activeTab === "orders" && <p>Orders management coming soon...</p>}
          {activeTab === "products" && <p>Products management coming soon...</p>}
          {activeTab === "categories" && <CategoriesManager />}
          {activeTab === "settings" && <p>Store settings management coming soon...</p>}
        </div>
      </main>
    </div>
  );
}
