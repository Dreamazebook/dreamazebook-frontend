import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const UnderlineIcon = () => (
  <svg 
    className="absolute bottom-[-4px] left-0 w-full" 
    height="4" 
    viewBox="0 0 100 4" 
    preserveAspectRatio="none"
  >
    <line 
      x1="0" 
      y1="2" 
      x2="100" 
      y2="2" 
      stroke="#012CCE" 
      strokeWidth="4"
    />
  </svg>
);

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="max-w-5xl mx-auto flex items-center justify-between p-4">
      <button className="text-2xl md:hidden">☰ {/* Hamburger Icon */}</button>
      <Logo />
      <nav className="hidden md:flex space-x-4">
        <Link 
          className="text-lg relative" 
          href="/books"
        >
          Our Books
          {pathname?.includes('/books') && <UnderlineIcon />}
        </Link>
        <Link 
          className="text-lg relative" 
          href="/categories/1"
        >
          Mother's Day
          {pathname?.includes('/categories/1') && <UnderlineIcon />}
        </Link>
        <Link 
          className="text-lg relative" 
          href="/about"
        >
          About Us
          {pathname === '/about' && <UnderlineIcon />}
        </Link>
      </nav>
      <div className="flex items-center space-x-4">
        <button className="text-2xl">🔍 {/* Search Icon */}</button>
        <button className="text-2xl">🛒 {/* Cart Icon */}</button>
      </div>
    </header>
  );
};

export default Header;
