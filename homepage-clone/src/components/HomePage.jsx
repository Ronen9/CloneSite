import React from 'react';

const HomePage = () => {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Our Homepage
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            This is a cloned homepage converted to React with Tailwind CSS
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Content will be replaced with actual HTML content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Content Section
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This section will be populated with the actual content from the cloned HTML
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 1</h3>
              <p className="text-gray-600">Description of feature 1</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 2</h3>
              <p className="text-gray-600">Description of feature 2</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Feature 3</h3>
              <p className="text-gray-600">Description of feature 3</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;