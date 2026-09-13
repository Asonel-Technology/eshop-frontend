import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./Login";
import AdminLayout from "./AdminLayout";

function AdminRouter({ onExit }: { onExit: () => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => {}} onExit={onExit} />;
  }

  return <AdminLayout onExit={onExit} />;
}

export default function AdminApp({ onExit }: { onExit: () => void }) {
  return (
    <AuthProvider>
      <AdminRouter onExit={onExit} />
    </AuthProvider>
  );
}
