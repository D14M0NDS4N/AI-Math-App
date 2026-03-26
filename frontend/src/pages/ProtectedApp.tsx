import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import App from "../App";

const ProtectedApp = () => {
  const { user } = useAuth();

  // Jika belum login → balik ke halaman login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ISI APLIKASI */}
      <main>
        <App />
      </main>

    </div>
  );
};

export default ProtectedApp;