import React, { useState } from 'react';
import '../styles/ShareModal.css';
import { FaTimes, FaLink, FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, graphName }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const title = `Check out my ${graphName || 'graph'} on MathViz!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`
  };

  const openShareWindow = (url) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Share Graph</h2>
        
        <div className="share-link-container">
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            className="share-link-input"
          />
          <button 
            className="copy-link-button" 
            onClick={copyToClipboard}
          >
            <FaLink />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="share-buttons">
          <button 
            className="share-button twitter" 
            onClick={() => openShareWindow(shareLinks.twitter)}
          >
            <FaTwitter /> Twitter
          </button>
          <button 
            className="share-button facebook" 
            onClick={() => openShareWindow(shareLinks.facebook)}
          >
            <FaFacebook /> Facebook
          </button>
          <button 
            className="share-button linkedin" 
            onClick={() => openShareWindow(shareLinks.linkedin)}
          >
            <FaLinkedin /> LinkedIn
          </button>
          <button 
            className="share-button whatsapp" 
            onClick={() => openShareWindow(shareLinks.whatsapp)}
          >
            <FaWhatsapp /> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
