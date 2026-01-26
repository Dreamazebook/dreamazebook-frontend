"use client";
import { Link } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/routing";
import useUserStore from "@/stores/userStore";
import { useTranslations } from "next-intl";
import { getUserName, getUserInitials } from "@/types/user";

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
      <div className="md:hidden bg-white overflow-x-auto p-[12px] relative">
        <img
          src="/profile/profile-bg.png"
          alt="Background"
          className="w-full -mt-[80px] absolute inset-0 z-0"
        />
        {/* User Avatar Section */}
        <div className="flex items-center gap-[24px] mt-[40px] relative z-1">
        <div className="flex items-center justify-center">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-[80px] h-[80px] rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-[80px] h-[80px] rounded-full bg-primary text-white flex items-center justify-center text-[32px] font-semibold border-4 border-white">
              {getUserInitials(user)}
            </div>
          )}
        </div>
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold capitalize text-[#222222]">
            {getUserName(user)}
          </h2>
        </div>
        </div>
        <div className="flex justify-around py-[12px] whitespace-nowrap">
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
          <div className="hidden relative w-[30%] max-w-[417px] bg-white rounded md:flex flex-col justify-between shadow p-6 h-screen">
            {/* Background Image */}
              <img
                src="/profile/profile-bg.png"
                alt="Background"
                className="w-full absolute inset-0 z-0"
              />
            <div className="text-center mt-[50px]">
              <div className="w-[120px] h-[120px] rounded mx-auto mb-[24px] overflow-hidden">
                {/* Avatar or Initials */}
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white"
                  />
                ) : (
                  <div className="relative z-10 w-full h-full bg-primary text-white rounded-full flex items-center justify-center text-[48px] font-semibold">
                    {getUserInitials(user)}
                  </div>
                )}
              </div>
              <h2 className="text-[28px] font-semibold text-[#222222]">
                {getUserName(user)}
              </h2>

              <nav className="flex flex-col gap-[24px] mt-[48px]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 text-center py-2 ${
                    pathname.endsWith(item.href)
                      ? "text-[#012CCE] font-medium text-[16px]"
                      : "text-[#222222] hover:bg-gray-50"
                  }`}
                >
                  {t(item.translationKey)}
                </Link>
              ))}
            </nav>
            </div>

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
          <div className="flex-1 min-w-0 p-[12px] md:p-0 mt-[28px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
