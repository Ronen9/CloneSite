import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Your Logo
            </h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
              Services
            </a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </nav>
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;