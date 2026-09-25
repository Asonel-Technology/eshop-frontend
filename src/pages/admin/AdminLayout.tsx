import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface AdminLayoutProps {
  onExit: () => void;
}

const NAV = [
  { to: "/admin", label: "Today", end: true },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Stock" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/settings", label: "Shop" },
];

function titleFor(pathname: string) {
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/products")) return "Stock";
  if (pathname.startsWith("/admin/categories")) return "Categories";
  if (pathname.startsWith("/admin/settings")) return "Shop details";
  return "Today";
}

export default function AdminLayout({ onExit }: AdminLayoutProps) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="blessing-backoffice min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-56 md:min-h-screen border-b md:border-b-0 md:border-r border-[#d8cfc0] bg-[#e8dfd0] flex flex-col">
        <div className="px-5 py-5 border-b border-[#d8cfc0]">
          <p className="font-[Newsreader,serif] text-[22px] leading-none">Blessing</p>
          <p className="mt-1 text-[10px] tracking-[0.22em] uppercase text-[#6b6256]">Order book</p>
        </div>

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible px-2 py-3 gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `px-3 py-2.5 text-[13px] tracking-wide whitespace-nowrap ${
                  isActive
                    ? "bg-[#1c1915] text-[#efe8dc]"
                    : "text-[#4a433a] hover:bg-[#ddd3c2]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-3 border-t border-[#d8cfc0] space-y-1">
          <button
            onClick={onExit}
            className="w-full text-left px-3 py-2 text-[12px] text-[#6b6256] hover:text-[#1c1915]"
          >
            Open the shop
          </button>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-[12px] text-[#9a3412] hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 border-b border-[#d8cfc0] bg-[#efe8dc]/90 backdrop-blur px-5 md:px-8 h-14 flex items-center">
          <h1 className="text-[22px]">{titleFor(pathname)}</h1>
        </header>
        <div className="px-5 md:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
