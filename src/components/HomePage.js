import React from 'react';
import '../styles/HomePage.css';

const HomePage = ({ onStartCalculator }) => {
  return (
    <div className="home-page">
      <div className="header">
        <h1 className="title">MathViz – Advanced Mathematical Visualization and Calculator</h1>
        <p className="subtitle">
          Unlock the world of math with advanced 2D, 3D graphing, and visualization tools.
        </p>
      </div>

      <div className="button-container">
        <button className="start-button" onClick={onStartCalculator}>Start Calculator</button>
        <button className="resources-button" onClick={() => window.location.href = '/resources'}>
          Explore Math Resources
        </button>
      </div>

      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>Interactive 2D and 3D Graphing</li>
          <li>Mathematical Keyboard with Hotkeys</li>
          <li>Real-Time Calculation and Visualization</li>
          <li>Comprehensive Tools for Algebra, Statistics, and Calculus</li>
        </ul>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
