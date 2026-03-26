import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // proses logout
    logout();

    // delay kecil biar UX halus
    const timer = setTimeout(() => {
      navigate("/");
    }, 1200);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4 
                      bg-slate-800/80 backdrop-blur-xl 
                      border border-slate-700
                      p-8 rounded-2xl shadow-xl">
        <div className="p-4 rounded-full bg-red-500/20">
          <LogOut size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white">
          Keluar dari Akun
        </h1>
        <p className="text-slate-400 text-sm text-center">
          Anda telah berhasil logout
        </p>
      </div>
    </div>
  );
};

export default Logout;