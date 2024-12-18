// Packages
import React from "react";
import { Outlet } from "react-router-dom";

// Components
import TitleBar from "./TitleBar";
import Navbar from "./Navbar";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Full Windows Controls */}
      <TitleBar />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="layout-content">
        {children ? children : <Outlet />}
      </main>

      {/* Footer */}
      <footer className="layout-footer">
        <p>© 2024 Your App. All Rights Reserved.</p>
      </footer>
    </>
  );
};

export default Layout;
