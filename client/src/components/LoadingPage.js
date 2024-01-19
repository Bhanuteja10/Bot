import React from 'react';

const logo = require('./PTB_loading.gif');

const LoadingPage = () => {
  return (
    <div
    className="loading-gif" // Add a CSS class for styling
  >
    <img
      src={logo} // Provide the correct path to your GIF file
      alt="Loading..."
      className="loading-gif" // Add a CSS class for additional styling if needed
    />
  </div>
  );
};

export default LoadingPage;
