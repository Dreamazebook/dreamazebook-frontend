"use client"

import React from "react";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import Image from "next/image";
import useUserStore from "@/stores/userStore";
import { Link } from "@/i18n/routing";

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

  const {user, toggleLoginModal} = useUserStore();

  if (pathname === '/login') return null;

  if (pathname === '/register') {
    return (
      <header className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <Logo />
        <button 
          className="text-2xl" 
          onClick={toggleLoginModal}
        >
          Log In
        </button>
      </header>
    );}

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
          Mother&apos;s Day
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
        <div className="relative group">
          <Image src={'/header/language.svg'} alt="language" width={48} height={24} className="cursor-pointer" />
          <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50">
            <button 
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${pathname?.startsWith('/en') ? 'bg-gray-100 font-semibold' : ''}`} 
              onClick={() => window.location.href = window.location.pathname.replace(/\/(en|fr)/, '/en')}
            >
              English
            </button>
            <button 
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${pathname?.startsWith('/fr') ? 'bg-gray-100 font-semibold' : ''}`} 
              onClick={() => window.location.href = window.location.pathname.replace(/\/(en|fr)/, '/fr')}
            >
              French
            </button>
          </div>
        </div>

        <Link href={"/shopping-cart"} className="text-2xl">
          <Image src={'/header/cart.svg'} alt="Shopping Cart" width={28} height={28} className="cursor-pointer" />
        </Link>
        {user ? (
          <Link href={user.role === 'admin' ? "/admin" : "/profile"}>
            <Image src={'/header/profile.svg'} alt="Profile" width={28} height={28} className="cursor-pointer" />
          </Link>
        ) : (
          <Image src={'/header/profile.svg'} alt="Profile" width={28} height={28} className="cursor-pointer" onClick={toggleLoginModal} />
        )}
      </div>
    </header>
  );
};

export default Header;