// Statistics.js
import React, { useState } from 'react';
import Papa from 'papaparse'; // Use PapaParse for CSV parsing
import '../styles/Statistics.css'; // Ensure this path is correct

const Statistics = () => {
  const [setLoadedData] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parseCSVFile(file);
      } else {
        alert("The uploaded file is not in .csv format.");
      }
    } else {
      alert("No file selected.");
    }
  };

  const parseCSVFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const rows = Papa.parse(csvData, { header: true }).data; // Use PapaParse to parse CSV
      setLoadedData(rows);
      alert("Dataset has been loaded."); // Alert message
      console.log("Loaded Dataset:", rows); // Log the loaded dataset to the console
    };
    reader.readAsText(file);
  };

  return (
    <div className="statistics-container">
      <div className="button-container">
        <button className='upload-button' onClick={() => document.getElementById('fileInput').click()}>Load Dataset</button>
        <input type="file" id="fileInput" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default Statistics;
