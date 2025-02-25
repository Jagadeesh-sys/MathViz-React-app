import React, { useState, useEffect, useCallback } from "react";
import Keyboard from "./Keyboard"; // Import Keyboard component
import "../styles/Inputbar.css"; // Ensure CSS reflects desired styles
// Add logo import
import logo from '../images/mathviz-logo.png';

const InputBar = ({ equations, onInputSubmit, onEquationDelete, onEquationEdit }) => {
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState(null); // Track which equation is being edited
  const [errors, setErrors] = useState([]);

  const handleInputChange = (newInputValue) => {
    setInputValue(newInputValue);
    setErrors([]); // Clear errors when input is changed
  };

  const handleAddEquation = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) {
      setErrors(["Please enter a valid equation."]);
      return;
    }
    try {
      onInputSubmit(trimmedValue); // Pass parsed equation to parent
      setInputValue(""); // Clear input
    } catch (error) {
      console.error("Equation parsing error:", error);
      setErrors(["Invalid equation format."]);
    }
  }, [inputValue, onInputSubmit]);

  const handleDeleteEquation = (index) => {
    onEquationDelete(index); // Notify parent component to delete equation
  };

  const handleStartEditingEquation = (index) => {
    setEditingIndex(index); // Set the equation index to edit
    setInputValue(equations[index].value); // Set the input field to the current value
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const trimmedValue = inputValue.trim();
      if (!trimmedValue) {
        setErrors(["Please enter a valid equation."]);
        return;
      }
      onEquationEdit(editingIndex, trimmedValue); // Update the equation in the parent state
      setEditingIndex(null); // Exit editing mode
      setInputValue(""); // Clear the input
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null); // Exit editing mode
    setInputValue(""); // Clear the input
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        handleAddEquation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleAddEquation]);

  return (
    <div className="input-bar">
      <div className="equation-input">
        <button
          type="button"
          onClick={handleAddEquation}
          aria-label="Add equation"
          className="add-button"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={editingIndex !== null ? "Edit equation" : "Enter equation (e.g., x^2, sin(x))"}
          aria-label={editingIndex !== null ? "Edit equation" : "Input equation"}
        />
      </div>

      {errors.length > 0 && <div className="error-message">{errors[0]}</div>}

      <div className="equation-list">
        {equations.map((equation, index) => (
          <div key={index} className="equation-item">
            <span>{equation.value}</span>
            <div className="equation-actions">
              <button
                type="button"
                onClick={() => handleDeleteEquation(index)}
                aria-label="Delete equation"
                className="action-button"
              >
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                onClick={() => handleStartEditingEquation(index)}
                aria-label="Edit equation"
                className="action-button"
              >
                <i className="fa fa-edit" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingIndex !== null && (
        <div className="edit-buttons">
          <button
            onClick={handleSaveEdit}
            aria-label="Save edited equation"
            className="action-button"
          >
            <i className="fa fa-save" aria-hidden="true"></i>
          </button>
          <button
            onClick={handleCancelEdit}
            aria-label="Cancel edit"
            className="action-button"
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
      )}

      <div className="keyboard-wrapper">
        <Keyboard setInputValue={handleInputChange} onSubmit={handleAddEquation} />
      </div>

      {/* Add watermark div */}
      <div className="watermark">
        <img src={logo} alt="MathViz Watermark" />
      </div>
    </div>
  );
};

export default InputBar;
