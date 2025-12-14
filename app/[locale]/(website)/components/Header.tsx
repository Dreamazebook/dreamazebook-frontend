"use client";

import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import { usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import useUserStore from "@/stores/userStore";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

const UnderlineIcon = ({ color = "#012CCE" }: { color?: string }) => (
  <svg
    className="absolute bottom-[-4px] left-0 w-full"
    height="4"
    viewBox="0 0 100 4"
    preserveAspectRatio="none"
  >
    <line x1="0" y1="2" x2="100" y2="2" stroke={color} strokeWidth="4" />
  </svg>
);

const menuItems = [
  {
    label: "Our Books",
    href: "/books",
    isActive: (pathname: string) => pathname?.includes("/books"),
  },
  {
    label: "Christmas Special",
    href: "/christmas",
    isActive: (pathname: string) => pathname === "/christmas",
  },
  {
    label: "About Us",
    href: "/about-us",
    isActive: (pathname: string) => pathname === "/about-us",
  },
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const { user, toggleLoginModal } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLanguageChange = (language: string) => {
    router.replace(pathname, { locale: language as any });
  };

  return (
    <header className="relative z-50 max-w-[1200px] mx-auto flex items-center justify-between p-[24px] bg-white md:bg-transparent">
      <button
        className="text-2xl md:hidden z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
      {/* Mobile Logo - always use normal version */}
      <div className="md:hidden">
        <Logo useWhite={false} />
      </div>
      {/* Desktop Logo */}
      <div className="hidden md:block">
        <Logo useWhite={false} />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-[48px]">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            className="text-[16px] font-medium relative"
            href={item.href}
          >
            {item.label}
            {item.isActive(pathname) && <UnderlineIcon color="#012CCE" />}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-100"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white z-100 shadow-xl"
            >
              <motion.nav
                className="flex flex-col items-start p-6 pt-20 h-full"
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                  },
                  closed: {
                    transition: { staggerChildren: 0.05, staggerDirection: -1 },
                  },
                }}
              >
                <div className="space-y-6 flex-1">
                  {menuItems.map((item) => (
                    <motion.div
                      key={item.href}
                      variants={{
                        open: { x: 0, opacity: 1 },
                        closed: { x: -20, opacity: 0 },
                      }}
                    >
                      <Link
                        className="text-xl relative block"
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                        {item.isActive(pathname) && (
                          <UnderlineIcon color="#012CCE" />
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* User Section */}
                <motion.div
                  className="border-t border-gray-200 pt-6 mt-6 w-full space-y-4"
                  variants={{
                    open: { y: 0, opacity: 1 },
                    closed: { y: 20, opacity: 0 },
                  }}
                >
                  {mounted && user ? (
                    <>
                      <Link
                        href={
                          user.user_type === "admin" ? "/admin" : "/profile"
                        }
                        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Image
                          src={"/header/profile.svg"}
                          alt="Profile"
                          width={24}
                          height={24}
                        />
                        <span className="text-lg">My Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          router.push("/");
                          useUserStore.getState().logout();
                        }}
                        className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 w-full"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="text-lg">Logout</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center space-x-3 text-gray-700 hover:text-gray-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Image
                        src={"/header/profile.svg"}
                        alt="Login"
                        width={24}
                        height={24}
                      />
                      <span className="text-lg">Login</span>
                    </Link>
                  )}
                </motion.div>
              </motion.nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex items-center space-x-6">
        {/* Search icon next to cart, opens books page and reveals search */}
        <div className="relative group">
          <Image
            src={"/header/language.svg"}
            alt="language"
            width={48}
            height={24}
            className="cursor-pointer"
          />
          <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md p-2 z-50">
            <button
              className={`block w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                locale === "en" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => handleLanguageChange("en")}
            >
              English
            </button>
            <button
              className={`block w-full text-left px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                locale === "fr" ? "bg-gray-100 font-semibold" : ""
              }`}
              onClick={() => handleLanguageChange("fr")}
            >
              French
            </button>
          </div>
        </div>

        <Link
          href={"/books?showSearch=1"}
          className="text-2xl"
          aria-label="Search books"
        >
          <Image
            src={"/header/search.svg"}
            alt="Search"
            width={28}
            height={28}
            className="cursor-pointer"
          />
        </Link>
        <Link
          href={
            mounted && user
              ? "/shopping-cart"
              : "/login?redirect=/shopping-cart"
          }
          className="text-2xl"
        >
          <Image
            src={"/header/cart.svg"}
            alt="Shopping Cart"
            width={28}
            height={28}
            className="cursor-pointer"
          />
        </Link>
        <Link
          className="hidden md:block"
          href={
            mounted && user
              ? user.user_type === "admin"
                ? "/admin"
                : "/profile"
              : "/login"
          }
        >
          <Image
            src={"/header/profile.svg"}
            alt="Login"
            width={28}
            height={28}
            className="cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
