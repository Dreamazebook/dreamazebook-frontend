"use client";

import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/routing";
import { CONTACT_US_URL } from "@/constants/links";

const footerMenus = [
  {
    title: "Help & Support",
    items: [
      { label: "Contact Us", href: CONTACT_US_URL },
      { label: "FAQ", href: "/faq" },
      { label: "Delivery Information", href: "/delivery-information" },
    ],
  },
  {
    title: "Legal & Policies",
    items: [
      { label: "Return Policy", href: "/return-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
  {
    title: "Dreamaze",
    items: [
      { label: "About Us", href: "/about-us" },
      { label: "Create With Us", href: "/survey" },
    ],
  },
];

const socialLinks = [
  {
    icon: "/images/common/instagram.png",
    label: "Instagram",
    href: "https://www.instagram.com/dreamaze.book/?hl=en",
  },
  {
    icon: "/images/common/facebook.png",
    label: "Facebook",
    href: "https://www.facebook.com/dreamazebook/",
  },
  // { icon: FaTwitter, label: 'Twitter', href: '#' },
];

const Footer = () => {
  const pathname = usePathname();
  const isChristmasPage =
    pathname === "/christmas" ||
    pathname?.endsWith("/christmas") ||
    pathname?.includes("/christmas");
  const bgColor = isChristmasPage ? "#2F491F" : undefined;

  const renderMenuSection = (menu: (typeof footerMenus)[0]) => (
    <div key={menu.title}>
      <h3 className="text-[16px] font-medium mb-4 lg:mb-6">{menu.title}</h3>
      <ul className="space-y-[4px] lg:space-y-[4px]">
        {menu.items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="text-[#FFFFFF99] text-[14px] hover:text-white transition-colors duration-200"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="flex gap-[24px]">
      {socialLinks.map(({ icon, label, href }) => (
        <a
          key={label}
          href={href}
          className="rounded hover:bg-gray-500 cursor-pointer transition-colors duration-200"
          aria-label={label}
        >
          <img src={icon} className="w-[24px] h-[24px]" />
        </a>
      ))}
    </div>
  );

  return (
    <footer
      className={`${
        isChristmasPage ? "" : "bg-neutral-800"
      } text-white py-[32px] px-[24px] md:py-[64px]`}
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col-reverse md:flex-row md:justify-between gap-[24px]">
          {/* Footer Links - Responsive Layout */}
          <div className="">
            <div className="grid grid-cols-3 gap-3 lg:gap-12">
              {footerMenus.map(renderMenuSection)}
            </div>
          </div>

          {/* Logo and Social Icons - Responsive Layout */}
          <div
            className={`flex items-center lg:flex-col lg:justify-between order-1 lg:order-2 gap-5 lg:gap-0`}
          >
            <img
              src="/images/common/logo-footer.png"
              alt="logo"
              className="w-[124px] h-[48px] -ml-[6px] md:ml-0"
            />
            <div className="ml-auto lg:ml-0 lg:mt-4">{renderSocialLinks()}</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
