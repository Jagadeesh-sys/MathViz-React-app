import React, { useEffect, useState } from "react";
import "../styles/Sidebar.css";

const sidebarOptions = {
  graphing: ['Algebra', 'Tools', 'Table', 'Spreadsheet'],
  geometry: ['Algebra', 'Tools'],
  "3dgraph": ['Algebra', 'Tools'],
  distribution: ['Distribution', 'Table']
};

const Sidebar = ({ selectedOption, onAlgebraClick, onToolsClick, onDistributionClick, onTableClick, onSpreadsheetClick }) => {
  const [currentOptions, setCurrentOptions] = useState([]);

  useEffect(() => {
    setCurrentOptions(sidebarOptions[selectedOption] || []);
  }, [selectedOption]);

  return (
    <div className="sidebar">
      {currentOptions.includes('Algebra') && (
        <button className="sidebar-button" onClick={onAlgebraClick}>
          <i className="fas fa-calculator"></i>
          <span>Algebra</span>
        </button>
      )}
      {currentOptions.includes('Tools') && (
        <button className="sidebar-button" onClick={onToolsClick}>
          <i className="fas fa-tools"></i>
          <span>Tools</span>
        </button>
      )}
      {currentOptions.includes('Distribution') && (
        <button className="sidebar-button" onClick={onDistributionClick}>
          <i className="fas fa-chart-line"></i>
          <span>Distribution</span>
        </button>
      )}
      {currentOptions.includes('Table') && (
        <button className="sidebar-button" onClick={onTableClick}>
          <i className="fas fa-table"></i>
          <span>Table</span>
        </button>
      )}
      {currentOptions.includes('Spreadsheet') && (
        <button className="sidebar-button" onClick={onSpreadsheetClick}>
          <i className="fas fa-file-excel"></i>
          <span>Spreadsheet</span>
        </button>
      )}
    </div>
  );
};

export default Sidebar;
