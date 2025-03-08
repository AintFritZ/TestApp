'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 250) {
        setIsSidebarVisible(true);
      } else if (isSidebarVisible && e.clientX > 300) {
        setIsSidebarVisible(false);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isSidebarVisible]);

  return (
    <>
      {/* Sidebar */}
      <div 
        style={{
          position: "fixed",
          left: isSidebarVisible ? "0" : "-250px",
          top: "0",
          width: "250px",
          height: "100vh",
          background: "#222",
          color: "white",
          transition: "left 0.3s ease-in-out",
          zIndex: "9999",
          padding: "20px",
          boxShadow: isSidebarVisible ? "2px 0 5px rgba(0,0,0,0.2)" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <Image src="/NEULogo.png" alt="Neu Logo" width={50} height={50} />
          <span style={{ marginLeft: "10px", fontSize: "18px", fontWeight: "bold" }}>
            Admin Dashboard
          </span>
        </div>

        <nav>
          <ul style={{ listStyle: "none", padding: "0" }}>
            <li style={{ marginBottom: "10px" }}>
              <Link href="/Views/AdminDashboard" style={{ 
                color: "white", 
                textDecoration: "none", 
                display: "block",
                padding: "8px",
                borderRadius: "4px",
                hover: { background: "#333" }
              }}>
                  Admin Dashboard
              </Link>
            </li>
            <li>
              <Link href="/Views/AddReplaceRemoveDashboard" style={{ 
                color: "white", 
                textDecoration: "none", 
                display: "block",
                padding: "8px",
                borderRadius: "4px",
                hover: { background: "#333" }
              }}>
                  File Manager
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Conditional hover trigger - only when sidebar is hidden */}
      {!isSidebarVisible && (
        <div 
          style={{
            position: "fixed",
            left: "0",
            top: "0",
            width: "250px",
            height: "100vh",
            background: "transparent",
            cursor: "pointer",
            zIndex: "10000",
          }}
        />
      )}
    </>
  );
}