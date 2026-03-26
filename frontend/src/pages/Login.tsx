import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Brain, LogIn, User, Lock } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) return;

    // simulasi login sukses
    login(username);
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">

      {/* BACKGROUND ORBS */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

      {/* LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl
                      bg-slate-800/80 backdrop-blur-xl
                      border border-slate-700 shadow-2xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            NeuroMath
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Masuk untuk mulai belajar & bermain
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* USERNAME */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Nama Pengguna
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Masukkan nama kamu"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl
                           bg-slate-900 text-white
                           border border-slate-600
                           focus:outline-none focus:border-cyan-500
                           transition-colors"
                required
                autoFocus
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl
                           bg-slate-900 text-white
                           border border-slate-600
                           focus:outline-none focus:border-blue-500
                           transition-colors"
                required
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2
                       py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-cyan-500 to-blue-500
                       hover:from-cyan-400 hover:to-blue-400
                       transition-all shadow-lg shadow-cyan-500/30
                       active:scale-95"
          >
            <LogIn size={18} />
            Masuk
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-cyan-400 font-bold hover:underline"
          >
            Daftar
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;