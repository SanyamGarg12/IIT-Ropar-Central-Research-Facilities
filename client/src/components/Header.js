import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <div 
            className="flex items-center space-x-4 hover:cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <img 
              src="/assets/logo.jpg" 
              alt="College Logo" 
              className="w-16 h-16 object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
              IIT Ropar<br />
              <span className="text-lg md:text-xl text-gray-600">
                Central Research Facility
              </span>
            </h1>
          </div>

          {/* Add navigation menu items here */}
          <div className="hidden md:flex space-x-6">
            <NavItem href="/" text="Home" />
            <NavItem href="/about" text="About" />
            <NavItem href="/facilities" text="Facilities" />
            <NavItem href="/contact" text="Contact" />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600">
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

const NavItem = ({ href, text }) => (
  <a 
    href={href} 
    className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
  >
    {text}
  </a>
);

export default Header;

