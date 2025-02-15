import React, { useState } from 'react';
import '../styles/SpreadsheetArea.css';

const SpreadsheetArea = ({ onDataChange }) => {
  const ROWS = 1000;  // Numbers 1-100
  const COLS = 26;   // Alphabet A-Z
  const VISIBLE_ROWS = 100;  // Number of rows to render initially
  const VISIBLE_COLS = 26;  // Number of columns to render initially

  // Initialize data array correctly - create ROWS x COLS grid
  const [data, setData] = useState(
    Array(ROWS).fill().map(() => Array(COLS).fill(''))
  );
  
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    if (onDataChange) {
      onDataChange(newData);
    }
  };

  const getColumnLabel = (index) => String.fromCharCode(65 + index);

  return (
    <div className="spreadsheet-container">
      <div className="spreadsheet">
        <table>
          <thead>
            <tr>
              <th></th>
              {Array(VISIBLE_COLS).fill().map((_, index) => (
                <th key={index}>{getColumnLabel(index)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(VISIBLE_ROWS).fill().map((_, rowIndex) => (
              <tr key={rowIndex}>
                <th>{rowIndex + 1}</th>
                {Array(VISIBLE_COLS).fill().map((_, colIndex) => (
                  <td key={colIndex}>
                    <input
                      type="text"
                      value={data[rowIndex][colIndex] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpreadsheetArea; 