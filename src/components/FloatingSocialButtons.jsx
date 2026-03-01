"use client";

import React from "react";

const FloatingSocialButtons = () => {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.filter = "brightness(1.1)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.filter = "brightness(1)";
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "68px",
        right: "-15px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        zIndex: 9999,
      }}
    >

      {/* WhatsApp */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "55px",
          height: "47px",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textDecoration: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          transition: "0.3s",
          backgroundColor: "rgb(37, 211, 102)",
          fontSize: "24px",
          transform: "scale(1)",
          filter: "brightness(1)",
          paddingRight: "10px",
        }}
      >
        <i className="fab fa-whatsapp"></i>
      </a>

      {/* Telegram */}
      <a
        href="https://t.me/yourusername"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "39px",
          height: "49px",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textDecoration: "none",
          boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          transition: "0.3s",
          backgroundColor: "rgb(1, 169, 230)",
          fontSize: "24px",
          transform: "scale(1)",
          filter: "brightness(1)",
          paddingLeft: "8px",
        }}
      >
        <i className="fab fa-telegram-plane"></i>
      </a>


    </div>
  );
};

export default FloatingSocialButtons;