import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import ProtectedApp from "./pages/ProtectedApp";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <BrowserRouter>
    <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<ProtectedApp />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
    </AuthProvider>
      </BrowserRouter>
  </React.StrictMode>
);