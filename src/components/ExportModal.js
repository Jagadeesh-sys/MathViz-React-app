import React, { useEffect, useState } from "react";

const ExportModal = ({ isOpen, onClose, targetContainerId }) => {
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    if (isOpen) {
      const container = document.getElementById(targetContainerId);
      if (container) {
        html2canvas(container).then((canvas) => {
          setImageURL(canvas.toDataURL("image/png"));
        });
      }
    }
  }, [isOpen, targetContainerId]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "exported_image.png";
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Export Image</h2>
        {imageURL ? <img src={imageURL} alt="Preview" /> : <p>Loading...</p>}
        <div className="modal-actions">
          <button onClick={handleDownload}>Download</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
