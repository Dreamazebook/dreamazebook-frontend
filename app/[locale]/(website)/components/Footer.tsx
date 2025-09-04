import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Logo and Social Icons */}
          <div className="flex flex-col items-center mb-8">
            <Image src="/logo-white.png" alt="logo" width={124} height={48} />
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Get Help</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Return Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Shipping Info
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Account</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Log In
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                    参与
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8">
            {/* Footer Links - Left Side */}
            <div className="col-span-8 grid grid-cols-3 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-6">Get Help</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Return Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Shipping Info
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">Account</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Log In
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      Sign Up
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-6">About us</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      About us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                      参与
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Logo and Social Icons - Right Side */}
            <div className="col-span-4 flex flex-col items-end">
              <Image src="/logo-white.png" alt="logo" width={124} height={48} />
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <FaInstagram className="w-6 h-6" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <FaFacebookF className="w-6 h-6" />
                </a>
                <a 
                  href="#" 
                  className="bg-gray-600 p-3 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;