import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import "../styles/TableBar.css";

const TableBar = ({ onAddPoint, onClearPoints }) => {
  const [rows, setRows] = useState([{ x: "", y: [""] }]);
  const [columnWidths, setColumnWidths] = useState([150]); // Start with a default width for columns
  const [draggingIndex, setDraggingIndex] = useState(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleAddColumn = () => {
    setRows((prevRows) =>
      prevRows.map((row) => ({ ...row, y: [...row.y, ""] })));
    setColumnWidths((prevWidths) => [...prevWidths, 150]); // Add default width for new column
  };

  const handleChange = (index, type, value, yIndex = 0) => {
    const newRows = [...rows];
    if (type === "x") {
      newRows[index].x = value;
    } else {
      newRows[index].y[yIndex] = value;
    }
    setRows(newRows);
  };

  const handleKeyPress = (e, rowIndex) => {
    if (e.key === "Enter") {
      const row = rows[rowIndex];
      if (!isNaN(row.x) && row.y.every((val) => !isNaN(val))) {
        const points = row.y.map((yValue) => ({
          x: parseFloat(row.x),
          y: parseFloat(yValue),
        }));
        points.forEach((point) => onAddPoint(point));
        setRows([...rows, { x: "", y: Array(rows[0].y.length).fill("") }]);
      } else {
        alert("Please enter valid numbers.");
      }
    }
  };

  const handleClear = () => {
    setRows([{ x: "", y: [""] }]);
    onClearPoints(); // Clear points in GraphArea
  };

  // Start dragging the column
  const handleMouseDown = (e, index) => {
    startX.current = e.clientX;
    startWidth.current = columnWidths[index];
    setDraggingIndex(index);
  };

  // Update column width while dragging
  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const delta = e.clientX - startX.current;
      const newWidth = Math.max(50, startWidth.current + delta); // Ensure width doesn't go below 50px
      const newColumnWidths = [...columnWidths];
      newColumnWidths[draggingIndex] = newWidth;
      setColumnWidths(newColumnWidths);
    }
  };

  // Stop dragging the column
  const handleMouseUp = () => {
    setDraggingIndex(null);
  };

  return (
    <div
      className="table-bar"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the table
    >
      <button onClick={handleClear}>Clear Table & Points</button>
      <table>
        <thead>
          <tr>
            <th>X</th>
            {rows[0].y.map((_, i) => (
              <th
                key={`y${i}`}
                style={{ width: `${columnWidths[i] || 150}px` }} // Set column width dynamically
              >
                Y{i + 1}
                {i < rows[0].y.length - 1 && (
                  <div
                    className="resize-handle"
                    onMouseDown={(e) => handleMouseDown(e, i)}
                  />
                )}
              </th>
            ))}
            <th>
              <div
                className="resize-handle"
                onClick={handleAddColumn}
                title="Add Y Column"
              >
                +
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>
                <input
                  type="text"
                  placeholder="Enter X"
                  value={row.x}
                  onChange={(e) => handleChange(rowIndex, "x", e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, rowIndex)}
                />
              </td>
              {row.y.map((value, yIndex) => (
                <td
                  key={`y${rowIndex}-${yIndex}`}
                  style={{ width: `${columnWidths[yIndex] || 150}px` }} // Set column width dynamically
                >
                  <input
                    type="text"
                    placeholder={`Y${yIndex + 1}`}
                    value={value}
                    onChange={(e) =>
                      handleChange(rowIndex, "y", e.target.value, yIndex)
                    }
                    onKeyPress={(e) => handleKeyPress(e, rowIndex)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

TableBar.propTypes = {
  onAddPoint: PropTypes.func.isRequired,
  onClearPoints: PropTypes.func.isRequired,
};

export default TableBar;
