import React, { useState } from "react";

function Sidebar({ setActiveOption, activeOption, navItems }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOptionClick = (option) => {
    setActiveOption(option);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav
        className={`w-64 mt-20 bg-gray-800 text-white p-6 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static fixed inset-y-0 left-0 z-30 overflow-y-auto`}
      >
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item}>
              <button
                onClick={() => handleOptionClick(item)}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeOption === item
                    ? "bg-gray-500 text-white"
                    : "text-white hover:bg-gray-500 bg-gray-700"
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-1 flex flex-col">
        {/* <header className="bg-white border-b p-4 flex items-center justify-between md:justify-end">
          <button
            className="md:hidden text-2xl focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className="text-xl font-semibold">{activeOption}</h1>
        </header> */}
        {/* <main className="flex-1 p-8 overflow-auto bg-gray-100">
          <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{activeOption}</h2>
            <p className="text-gray-600">
              You are viewing the {activeOption} section.
            </p>
          </div>
        </main> */}
      </div>
    </div>
  );
}

export default Sidebar;
