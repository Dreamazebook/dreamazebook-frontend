import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

interface Menus {
  title: string;
  items: {
    title: string;
  }[];
}

const MENUS:Menus[] = [
  {
    title: 'Get Help',
    items: [
      {title:'FAQ'},
      {title:'Help Center'},
      {title:'Return Policy'},
      {title:'Shipping Info'},
    ],
  },
  {
    title: 'Account',
    items: [
      {title:'Login'},
      {title:'Sign Up'},
    ],
  },
  {
    title: 'Company',
    items: [
      {title:'About us'},
    ],
  }
]

const Footer = () => {
  return (
    <footer style={{backgroundColor: 'rgba(51, 51, 51, 1)'}} className="border-t border-gray-200">
      <div className='flex items-center justify-between pt-4 pr-4'>
        <Image src="/logo-white.png" alt="logo" width={124} height={48} />
        <div className="flex gap-4">
          <a href="#" className="text-gray-600 hover:text-black">
            <FaFacebookF className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-600 hover:text-black">
            <FaTwitter className="w-6 h-6" />
          </a>
          <a href="#" className="text-gray-600 hover:text-black">
            <FaInstagram className="w-6 h-6" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 p-4">


        {MENUS.map((menu) => ( 
          <div key={menu.title}>
            <h4 className="font-medium mb-3 text-sm text-white">{menu.title}</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              {menu.items.map((item) => (
                <li key={item.title} className="text-white[0.6] hover:text-black cursor-pointer">{item.title}</li>
              ))}
            </ul>
          </div>
        ))}


        
      </div>
      <div className="mt-8 text-center text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} Your Bookstore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
