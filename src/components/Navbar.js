import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
// Add this import
import logo from '../images/mathviz-logo.png';
import {
  FaShareAlt, FaChartLine, FaShapes, FaCube, FaPercentage, FaBars, FaTrash,
  FaFolderOpen, FaSave, FaCloudUploadAlt, FaFileExport, FaPrint,
  FaCalculator, FaCog, FaQuestionCircle, FaSignInAlt, FaTimes
} from 'react-icons/fa';
import ShareModal from './ShareModal';

const Navbar = ({ onCalculatorTypeChange, onSaveGraph, onLoadGraph, onExportPreview, graphName }) => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('graphing');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isSwitchCalculatorVisible, setIsSwitchCalculatorVisible] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault(); // Prevent default button behavior
    console.log('Navigating to sign in...');
    navigate('/signin');
    setIsHamburgerMenuOpen(false);
  };

  const options = [
    { value: 'graphing', label: 'Graphing', icon: <FaChartLine /> },
    { value: 'geometry', label: 'Geometry', icon: <FaShapes /> },
    { value: '3dgraph', label: '3D Graph', icon: <FaCube /> },
    { value: 'distribution', label: 'Probability', icon: <FaPercentage /> },
    { value: 'statistics', label: 'Statistics', icon: <FaCalculator /> },
  ];

  const hamburgerMenuItems = [
    { label: 'Clear All', icon: <FaTrash /> },
    { label: 'Open', icon: <FaFolderOpen />, onClick: () => document.getElementById("file-input").click() },
    { label: 'Save Online', icon: <FaCloudUploadAlt /> },
    { label: 'Save to json', icon: <FaSave />, onClick: onSaveGraph },
    { label: 'Share', icon: <FaShareAlt />, onClick: () => setIsShareModalOpen(true) },
    { label: 'Export  as', icon: <FaFileExport />, onClick: onExportPreview },
    { label: 'Print Preview', icon: <FaPrint />, onClick: () => window.print() },
    { label: 'Switch Calculator', icon: <FaCalculator />, onClick: () => setIsSwitchCalculatorVisible(true) },
    { label: 'Settings', icon: <FaCog /> },
    { label: 'Help & Feedback', icon: <FaQuestionCircle /> },
    { label: 'Sign In', icon: <FaSignInAlt />, onClick: handleSignIn }
  ];

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    onCalculatorTypeChange(value);
    setIsDropdownOpen(false);
    setIsSwitchCalculatorVisible(false); // Close the modal when an option is selected
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoadGraph(file);
    }
  };

  return (
    <nav className="navbar">
      {/* Left Section */}
      <div className="navbar-left">
        <FaBars 
          className="hamburger-icon" 
          onClick={() => setIsHamburgerMenuOpen(!isHamburgerMenuOpen)} 
        />
        <img src={logo} alt="MathViz" className="navbar-logo" />
      </div>

      {/* Center Section */}
      <div className="navbar-center">
        <div className="custom-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div className="dropdown-selected">
            {options.find((opt) => opt.value === selectedOption)?.icon}
            {options.find((opt) => opt.value === selectedOption)?.label}
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="dropdown-item"
                  onClick={() => handleOptionClick(option.value)}
                >
                  <span className="dropdown-icon">{option.icon}</span>
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <FaShareAlt 
          className="share-icon" 
          onClick={() => setIsShareModalOpen(true)} 
        />
        <button 
          className="sign-in-button" 
          onClick={handleSignIn}
          style={{ cursor: 'pointer' }}
        >
          <FaSignInAlt /> SIGN IN
        </button>
      </div>

      {/* Hamburger Menu */}
      {isHamburgerMenuOpen && (
        <div className="hamburger-menu">
          {hamburgerMenuItems.map((item, index) => (
            <div
              key={index}
              className="hamburger-item"
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e);
                }
                setIsHamburgerMenuOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
          <input
            id="file-input"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Switch Calculator Modal */}
      {isSwitchCalculatorVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FaTimes
              className="close-modal-button"
              onClick={() => setIsSwitchCalculatorVisible(false)}
            />
            <h2>Choose MathViz Calculator</h2>
            <div className="calculator-options">
              {options.map((option) => (
                <div
                  key={option.value}
                  className="calculator-option"
                  onClick={() => handleOptionClick(option.value)}
                >
                  <span className="calculator-icon">{option.icon}</span>
                  <p>{option.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        graphName={graphName}
      />
    </nav>
  );
};

export default Navbar;
