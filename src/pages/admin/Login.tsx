import { useState } from "react";
import { adminLogin } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

interface LoginProps {
  onSuccess: () => void;
  onExit: () => void;
}

export default function AdminLogin({ onSuccess, onExit }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminLogin(email, password);
      login(data.accessToken, data.refreshToken);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blessing-backoffice min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#f7f1e7] border border-[#d8cfc0] p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl">Order book</h1>
          <button onClick={onExit} className="text-[12px] font-bold text-muted-foreground hover:text-foreground">
            Back to the shop
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[12px] font-semibold p-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px]"
              placeholder="admin@blessing.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-widest uppercase text-muted-foreground mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold text-[12px] tracking-widest uppercase rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
