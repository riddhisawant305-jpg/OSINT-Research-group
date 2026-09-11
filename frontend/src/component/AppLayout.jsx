import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

function AppLayout() {
  return (
    <div className="cv-app-layout">
      <Navbar />
      <main className="cv-app-main">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

export default AppLayout;
