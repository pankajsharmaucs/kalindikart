"use client"; // Fixed the hyphen to a space

import React from 'react';

const FloatingSocialButtons = () => {
  const buttonStyle = {
    width: '55px',
    height: '55px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    textDecoration: 'none',
    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
    transition: '0.3s',
    border: '2px solid #00739D', 
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.filter = 'brightness(1.1)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.filter = 'brightness(1)';
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
      }}
    >
      {/* Telegram */}
      <a
        href="https://t.me/yourusername"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ ...buttonStyle, backgroundColor: '#01A9E6', fontSize: '26px' }}
      >
        <i className="fab fa-telegram-plane"></i>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ ...buttonStyle, backgroundColor: '#25D366', fontSize: '28px' }}
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
};

export default FloatingSocialButtons;