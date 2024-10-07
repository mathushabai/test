import React from "react";
import './Header.css';

function Header() {
  return (
    <header className="home-header">
        <img src="/app-logo-blue.png" alt="App Logo" className="home-logo" />
        <h1>SlotSage</h1>
        <button className="settings-btn" onClick="#">
        ⚙️ Settings
        </button>
    </header>
  );
}

export default Header;