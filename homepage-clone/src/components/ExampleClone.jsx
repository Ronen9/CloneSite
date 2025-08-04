import React from 'react';

const ExampleClone = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Example Domain
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          This domain is for use in illustrative examples in documents. 
          You may use this domain in literature without prior coordination 
          or asking for permission.
        </p>
        <a 
          href="https://www.iana.org/domains/example"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          More information...
        </a>
      </div>
    </div>
  );
};

export default ExampleClone;