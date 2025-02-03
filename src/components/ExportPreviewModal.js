import React, { useState } from 'react';
import '../styles/ExportPreviewModal.css';

const ExportPreviewModal = ({ isOpen, onClose, imageData, onDownload, graphName }) => {
  const [selectedFormat, setSelectedFormat] = useState('png');
  
  if (!isOpen || !imageData) return null;

  const handleDownload = () => {
    onDownload(selectedFormat);
  };

  const getFormatDescription = (format) => {
    const descriptions = {
      'png': 'High-quality raster image, best for web and presentations',
      'jpeg': 'Compressed image format, smaller file size',
      'pdf': 'Document format, best for printing and sharing',
      'json': 'Raw data format, for data analysis and processing',
      'svg': 'Vector format, scalable without quality loss',
      'csv': 'Spreadsheet format, for data analysis in Excel',
      'xlsx': 'Excel format, with formatted spreadsheet',
      'webp': 'Modern web image format, best compression',
      'eps': 'Vector format, for professional printing'
    };
    return descriptions[format] || '';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-content">
            <h2>Export Graph</h2>
            {graphName && <p className="graph-name">Graph Type: {graphName}</p>}
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="preview-container">
          <img src={imageData} alt="Preview" className="preview-image" />
        </div>
        <div className="format-selector">
          <label htmlFor="format-select">Export Format:</label>
          <select 
            id="format-select" 
            value={selectedFormat} 
            onChange={(e) => setSelectedFormat(e.target.value)}
          >
            <option value="png">PNG Image</option>
            <option value="jpeg">JPEG Image</option>
            <option value="webp">WebP Image</option>
            <option value="svg">SVG Vector</option>
            <option value="eps">EPS Vector</option>
            <option value="pdf">PDF Document</option>
            <option value="json">JSON Data</option>
            <option value="csv">CSV Data</option>
            <option value="xlsx">Excel Spreadsheet</option>
          </select>
          <p className="format-description">{getFormatDescription(selectedFormat)}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button cancel-button" onClick={onClose}>
            CANCEL
          </button>
          <button className="modal-button download-button" onClick={handleDownload}>
            DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPreviewModal;
