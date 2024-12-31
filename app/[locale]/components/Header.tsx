import React from "react";
import Logo from "./Logo";
import Link from "next/link";

const Header = () => {
  return (
    <header className="max-w-5xl mx-auto flex items-center justify-between p-4">
      <button className="text-2xl md:hidden">☰ {/* Hamburger Icon */}</button>
      <Logo />
      <nav className="hidden md:flex space-x-4">
        <Link className="text-lg" href="/books">Our Books</Link>
        <Link className="text-lg" href="/about">About Us</Link>
      </nav>
      <div className="flex items-center space-x-4">
        <button className="text-2xl">🔍 {/* Search Icon */}</button>
        <button className="text-2xl">🛒 {/* Cart Icon */}</button>
      </div>
    </header>
  );
};

export default Header;
