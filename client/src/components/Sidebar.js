import React from "react";

function Sidebar({ setActiveOption, activeOption, navItems }) {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        {navItems.map((item) => (
          <a
            key={item}
            href="#"
            className={`block py-2.5 px-4 rounded transition duration-200 ${
              activeOption === item ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
            onClick={() => setActiveOption(item)}
          >
            {item}
          </a>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;

