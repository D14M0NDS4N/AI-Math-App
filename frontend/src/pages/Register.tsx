import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, User, Mail, Lock, UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // sementara simulasi register sukses
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">

      {/* BACKGROUND ORBS */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>

      {/* REGISTER CARD */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl 
                      bg-slate-800/80 backdrop-blur-xl 
                      border border-slate-700 shadow-2xl">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Buat Akun Baru
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Mulai perjalanan belajarmu bersama AI
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
                name="username"
                placeholder="Nama pengguna"
                value={form.username}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl 
                           bg-slate-900 text-white 
                           border border-slate-600
                           focus:outline-none focus:border-purple-500
                           transition-colors"
                required
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl 
                           bg-slate-900 text-white 
                           border border-slate-600
                           focus:outline-none focus:border-blue-500
                           transition-colors"
                required
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
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl 
                           bg-slate-900 text-white 
                           border border-slate-600
                           focus:outline-none focus:border-cyan-500
                           transition-colors"
                required
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2
                       py-3 rounded-xl font-bold text-white
                       bg-gradient-to-r from-purple-500 to-blue-500
                       hover:from-purple-400 hover:to-blue-400
                       transition-all shadow-lg shadow-purple-500/30
                       active:scale-95"
          >
            <UserPlus size={18} />
            Daftar Akun
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Sudah punya akun?{" "}
          <Link
            to="/"
            className="text-purple-400 font-bold hover:underline"
          >
            Masuk
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;