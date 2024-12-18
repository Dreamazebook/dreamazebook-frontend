import React from "react";

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4">
      <button className="text-2xl">☰ {/* Hamburger Icon */}</button>
      <span>Logo</span>
      <div className="flex items-center space-x-4">
        <button className="text-2xl">🔍 {/* Search Icon */}</button>
        <button className="text-2xl">🛒 {/* Cart Icon */}</button>
      </div>
    </header>
  );
};

export default Header;
