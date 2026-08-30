import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import BottomNav from "./BottomNav";

function AppLayout() {
  return (
    <div className="cv-app-layout">
      <Navbar />
      <main className="cv-app-main">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

export default AppLayout;
