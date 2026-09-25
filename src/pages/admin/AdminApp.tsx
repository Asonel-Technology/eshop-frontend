import { Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./Login";
import AdminLayout from "./AdminLayout";
import Dashboard from "./Dashboard";
import OrdersManager from "./OrdersManager";
import OrderDetail from "./OrderDetail";
import ProductsManager from "./ProductsManager";
import ProductForm from "./ProductForm";
import CategoriesManager from "./CategoriesManager";
import SettingsManager from "./SettingsManager";

function AdminRouter({ onExit }: { onExit: () => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => {}} onExit={onExit} />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout onExit={onExit} />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductForm />} />
        <Route path="categories" element={<CategoriesManager />} />
        <Route path="settings" element={<SettingsManager />} />
      </Route>
    </Routes>
  );
}

export default function AdminApp({ onExit }: { onExit: () => void }) {
  return (
    <AuthProvider>
      <AdminRouter onExit={onExit} />
    </AuthProvider>
  );
}
