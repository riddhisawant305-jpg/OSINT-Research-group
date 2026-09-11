import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

function AppLayout() {
  const { user } = useAuth();
  return (
    <div className="cv-app-layout">
      <Navbar />
      <main className="cv-app-main">
        <Outlet />
      </main>
      <Footer />
      {user && <BottomNav />}
    </div>
  );
}

export default AppLayout;
