import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

const footerMenus = [
  {
    title: 'Get Help',
    items: [
      { label: 'FAQ', href: '#' },
      { label: 'Help Center', href: '#' },
      { label: 'Return Policy', href: '#' },
      { label: 'Shipping Info', href: '#' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Log In', href: '#' },
      { label: 'Sign Up', href: '#' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About us', href: '#' },
      { label: '参与', href: '#' },
    ],
  },
];

const socialLinks = [
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
  { icon: FaTwitter, label: 'Twitter', href: '#' },
];

const Footer = () => {
  const renderMenuSection = (menu: typeof footerMenus[0]) => (
    <div key={menu.title}>
      <h3 className="text-xl font-semibold mb-4 lg:mb-6">{menu.title}</h3>
      <ul className="space-y-3 lg:space-y-4">
        {menu.items.map((item) => (
          <li key={item.label}>
            <a href={item.href} className="text-gray-300 hover:text-white transition-colors duration-200">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="flex space-x-4">
      {socialLinks.map(({ icon: Icon, label, href }) => (
        <a
          key={label}
          href={href}
          className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
          aria-label={label}
        >
          <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
        </a>
      ))}
    </div>
  );

  return (
    <footer className="bg-neutral-800 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Logo and Social Icons */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo-white.png" alt="logo" width={124} height={48} />
            {renderSocialLinks()}
          </div>

          {/* Footer Links */}
          <div className="space-y-8">
            {footerMenus.map(renderMenuSection)}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Footer Links - Left Side */}
            <div className="col-span-8 grid grid-cols-3 gap-12">
              {footerMenus.map(renderMenuSection)}
            </div>

            {/* Logo and Social Icons - Right Side */}
            <div className="col-span-4 flex flex-col items-end">
              <Image src="/logo-white.png" alt="logo" width={124} height={48} />
              {renderSocialLinks()}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;