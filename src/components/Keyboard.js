import React, { useState } from "react";
import "../styles/Keyboard.css";

const Keyboard = ({ setInputValue, onSubmit }) => {
  const [tab, setTab] = useState("123");
  const [isVisible, setIsVisible] = useState(false);

  const toggleKeyboard = () => {
    setIsVisible(!isVisible);
  };

  const handleKeyPress = (key) => {
    if (key === "⌫") {
      setInputValue((prev) => prev.slice(0, -1)); // Remove the last character
    } else if (key === "↩") {
      console.log("↩ pressed, submitting equation...");
      if (!onSubmit()) {
        console.log("Invalid equation, no graph will be drawn.");
      } else {
        console.log("Valid equation, submitting for graphing.");
      }
    } else {
      setInputValue((prev) => prev + key); // Append the key to the current input value
    }
  };

  return (
    <div className="app-container">
      {/* Toggle Button */}
      {!isVisible && (
        <button className="toggle-button" onClick={toggleKeyboard}>
          <i className="fas fa-keyboard"></i> {/* Font Awesome Icon */}
        </button>
      )}

      {/* Keyboard Container */}
      {isVisible && (
        <div className="keyboard-container">
          <button className="close-button" onClick={toggleKeyboard}>
            ✕
          </button>

          <div className="keyboard-tabs">
            {["123", "f(x)", "ABC", "#&¬"].map((item) => (
              <button
                key={item}
                className={tab === item ? "active" : ""}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="keyboard-content">
            {tab === "123" && (
              <div className="keyboard-grid">
                {[
                  "x", "y", "π", "e", "7", "8", "9", "×", "÷", 
                  "x²", "xⁿ", "√", "∫", "4", "5", "6", "+", "−",
                  "<", ">", "⌈⌉", "⌊⌋", "1", "2", "3", "=", "⌫",
                  "ans", ",", "(", ")", "0", ".", "◀", "▶", "↩"
                ].map((key) => (
                  <button
                    className="key"
                    key={key}
                    onClick={() => handleKeyPress(key)} // Handle key press
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {tab === "f(x)" && (
              <div className="keyboard-grid">
                {[
                  "f(x)", "sin", "cos", "tan", "log", "ln", "e^x", "x^2", "x^3",
                  "x^n", "√", "∫", "∑", "π", "e", "(", ")", "±", "→", "∞"
                ].map((key) => (
                  <button
                    className="key"
                    key={key}
                    onClick={() => handleKeyPress(key)} // Handle key press
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {tab === "ABC" && (
              <div className="keyboard-grid">
                {[
                  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
                  "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", 
                  "y", "z", "(", ")", "+", "-", "×", "÷"
                ].map((key) => (
                  <button
                    className="key"
                    key={key}
                    onClick={() => handleKeyPress(key)} // Handle key press
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            {tab === "#&¬" && (
              <div className="keyboard-grid">
                {[
                  "#", "&", "¬", "!", "@", "$", "%", "^", "&", "*", "-", "+", "=",
                  "~", "|", "<", ">", "[", "]", "{", "}", ",", ".", ":", ";", "?"
                ].map((key) => (
                  <button
                    className="key"
                    key={key}
                    onClick={() => handleKeyPress(key)} // Handle key press
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Keyboard;