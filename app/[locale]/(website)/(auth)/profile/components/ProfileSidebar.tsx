"use client";
import { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import useUserStore from "@/stores/userStore";
import { useTranslations } from "next-intl";

export default function ProfileSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("profileSidebar");

  const navItems = [
    { href: "/profile", translationKey: "home" },
    { href: "/profile/order-history", translationKey: "orderHistory" },
    { href: "/profile/detail", translationKey: "accountDetails" },
    // { href: "#", translationKey: "loyalty" },
  ];

  // Add admin navigation item if user has admin in email
  if (user?.email?.includes("admin")) {
    navItems.push({ href: "/admin", translationKey: "admin" });
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile Horizontal Menu */}
      <div className="md:hidden bg-white overflow-x-auto">
        <div className="flex justify-around px-2 py-3 whitespace-nowrap">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 text-sm rounded ${
                pathname.endsWith(item.href)
                  ? "text-[#012CCE] font-medium"
                  : "text-[#222222] hover:text-gray-600"
              }`}
            >
              {t(item.translationKey)}
            </Link>
          ))}
          <button
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            {t("logout")}
          </button>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="flex gap-[48px]">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-56 bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 overflow-hidden">
                <img
                  src={user?.avatar || "/favicon-32x32.png"}
                  alt="Augustine"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-[28px] font-semibold text-[#222222]">
                {user?.name || user?.email.split('@')[0]}
              </h2>
            </div>

            <nav className="space-y-[24px]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 text-center py-2 ${
                    pathname.endsWith(item.href)
                      ? "text-[#012CCE] font-medium text-[18px]"
                      : "text-[#222222] hover:bg-gray-50"
                  }`}
                >
                  {t(item.translationKey)}
                </Link>
              ))}
            </nav>

            <div className="mt-12">
              <button
                className="text-gray-600 cursor-pointer text-center w-full hover:text-gray-800 text-sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                {t("logout")}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
