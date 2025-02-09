import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/GraphArea.css";
import {
  drawPoint,
  drawLine,
  drawSegment,
  drawPolygon,
  drawCircle,
} from "../tools/BasicTools";
import {
  selectObject,
  deleteObject,
  labelObject,
  toggleObjectVisibility,
} from "../tools/EditTools";
import {
  drawTangents,
  drawPerpendicularLine,
  drawParallelLine,
  drawAngleBisector,
  drawMidpoint,
} from "../tools/ConstructTools";
import { FaPalette, FaTrashAlt, FaSearchPlus, FaSearchMinus, FaExpand, FaCompress, FaCog } from "react-icons/fa";
import * as math from 'mathjs';
import PropTypes from 'prop-types';

const ELEMENT_COLORS = {
  Point: "blue",
  Line: "blue",
  Segment: "blue",
  Polygon: "blue",
  Circle: "blue",
};

// Update SCALE_INTERVALS to match GeoGebra's grid intervals
const SCALE_INTERVALS = [
  0.01, 0.02, 0.05,        // Extremely zoomed out
  0.1, 0.2, 0.5,           // Very zoomed out
  1, 2, 5,                 // Normal range
  10, 20, 50,             // Zoomed in
  100, 200, 500,          // Very zoomed in
];

const GraphArea = ({ selectedTool, equations = [], onExportPreview, tableData = [] }) => {
  const [drawnElements, setDrawnElements] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [midpointPoints, setMidpointPoints] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastOffset, setLastOffset] = useState({ x: 0, y: 0 });
  const [gridScale] = useState(50);

  const drawGridAndAxes = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    // Adjust origin based on offset
    const originX = width / 2 + offset.x;
    const originY = height / 2 + offset.y;

    // Calculate scaled grid spacing
    const baseGridSpacing = gridScale / scale; // Invert scale to make grid grow when zooming out
    
    // Define getGridInterval inside useCallback
    const getGridInterval = (currentScale) => {
      const baseInterval = currentScale;  // Remove inversion to match scale direction
      return SCALE_INTERVALS.reduce((prev, curr) => {
        return Math.abs(curr - baseInterval) < Math.abs(prev - baseInterval) ? curr : prev;
      });
    };
    
    // Get appropriate grid interval
    const gridInterval = getGridInterval(scale);
    const minorGridInterval = gridInterval / 5;

    // Draw minor grid lines
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    // Calculate grid boundaries
    const leftBound = -Math.ceil(originX / baseGridSpacing);
    const rightBound = Math.ceil((width - originX) / baseGridSpacing);
    const topBound = Math.ceil(originY / baseGridSpacing);
    const bottomBound = -Math.ceil((height - originY) / baseGridSpacing);

    // Draw minor grid lines
    for (let i = Math.floor(leftBound / minorGridInterval); 
         i <= Math.ceil(rightBound / minorGridInterval); 
         i++) {
      const x = i * minorGridInterval;
      const pixelX = originX + x * baseGridSpacing;
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.stroke();
    }

    for (let i = Math.floor(bottomBound / minorGridInterval); 
         i <= Math.ceil(topBound / minorGridInterval); 
         i++) {
      const y = i * minorGridInterval;
      const pixelY = originY - y * baseGridSpacing;
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.stroke();
    }

    // Draw major grid lines
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 0.8;

    // Calculate decimal places for labels
    const decimalPlaces = Math.max(0, -Math.floor(Math.log10(gridInterval)));
    
    // Draw vertical major grid lines and labels
    for (let i = Math.floor(leftBound); i <= Math.ceil(rightBound); i++) {
      const x = i * gridInterval;
      const pixelX = originX + x * baseGridSpacing;
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(pixelX, 0);
      ctx.lineTo(pixelX, height);
      ctx.stroke();

      // Draw label if not at origin
      if (Math.abs(x) > gridInterval / 1000) {
        const label = x.toFixed(decimalPlaces);
        ctx.font = "12px Arial";
        ctx.fillStyle = "#666666";
        ctx.textAlign = "center";
        ctx.fillText(label, pixelX, originY + 20);
      }
    }

    // Draw horizontal major grid lines and labels
    for (let i = Math.floor(bottomBound); i <= Math.ceil(topBound); i++) {
      const y = i * gridInterval;
      const pixelY = originY - y * baseGridSpacing;
      
      // Draw line
      ctx.beginPath();
      ctx.moveTo(0, pixelY);
      ctx.lineTo(width, pixelY);
      ctx.stroke();

      // Draw label if not at origin
      if (Math.abs(y) > gridInterval / 1000) {
        const label = y.toFixed(decimalPlaces);
        ctx.font = "12px Arial";
        ctx.fillStyle = "#666666";
        ctx.textAlign = "right";
        ctx.fillText(label, originX - 10, pixelY);
      }
    }

    // Draw axes
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5;

    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Draw origin (0,0)
    ctx.fillStyle = "#000000";
    ctx.textAlign = "right";
    ctx.fillText("0", originX - 5, originY + 15);

    // Display current scale and grid interval
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "left";
    ctx.fillText(`Scale: ${scale.toFixed(2)}x`, 10, 20);
    ctx.fillText(`Grid Unit: ${gridInterval}`, 10, 40);
  }, [offset, scale, gridScale]);

  // Get next available label
  const getNextLabel = useCallback(() => {
    const usedLabels = drawnElements
      .filter(el => (el.type === "Point" && !el.isTemporary) || 
                   (el.type === "Polygon" && el.points))
      .flatMap(el => {
        if (el.type === "Point") return el.label;
        if (el.type === "Polygon") return el.points.map(p => p.label);
        return [];
      });
    
    // Find first unused label from A to Z
    for (let i = 0; i < 26; i++) {
      const label = String.fromCharCode(65 + i);
      if (!usedLabels.includes(label)) {
        return label;
      }
    }
    // If all labels are used, start with AA, AB, etc.
    return 'A';
  }, [drawnElements]);

  // Function to draw mathematical functions
  const drawFunction = useCallback((ctx, equation) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const scaleX = 50; // pixels per unit on x-axis
    const scaleY = 50; // pixels per unit on y-axis
    const originX = width / 2;
    const originY = height / 2;

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    try {
      // Compile the equation using mathjs
      const compiledEquation = math.compile(equation);

      for (let pixelX = 0; pixelX < width; pixelX++) {
        const x = (pixelX - originX) / scaleX;
        try {
          const y = compiledEquation.evaluate({ x });
          const pixelY = originY - (y * scaleY);
          
          if (pixelX === 0) {
            ctx.moveTo(pixelX, pixelY);
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
        } catch (error) {
          // Skip invalid points
          continue;
        }
      }
      
      ctx.stroke();
    } catch (error) {
      console.error("Error drawing function:", error);
    }
  }, []);

  // Effect to redraw canvas when equations change
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      
      // Clear canvas and draw grid
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawGridAndAxes(ctx);
      
      // Draw all equations
      equations.forEach(eq => {
        if (eq.value) {
          drawFunction(ctx, eq.value);
        }
      });
      
      // Draw all elements
      drawnElements.forEach(element => {
        if (!element.isDeleted) {
          const isSelected = selectedElement && selectedElement.id === element.id;
          
          // Set style based on element state
          ctx.strokeStyle = isSelected ? "#ff4444" : element.color;
          ctx.fillStyle = isSelected ? "#ff4444" : element.color;
          
          switch (element.type) {
            case "Point":
              // Draw outer circle
              ctx.beginPath();
              ctx.arc(element.x, element.y, 8, 0, 2 * Math.PI);
              ctx.strokeStyle = isSelected ? "#cccccc" : "lightgray";
              ctx.lineWidth = isSelected ? 2 : 1.5;
              ctx.stroke();
              ctx.closePath();

              // Draw point
              ctx.beginPath();
              ctx.arc(element.x, element.y, 4, 0, 2 * Math.PI);
              ctx.fill();
              ctx.closePath();

              // Draw label
              if (element.label) {
                ctx.font = "14px Arial";
                ctx.fillStyle = "black";
                ctx.fillText(element.label, element.x + 14, element.y - 14);
              }
              break;

            case "Line":
              // Draw the infinite line using extended points
              ctx.beginPath();
              ctx.moveTo(element.extendedStart.x, element.extendedStart.y);
              ctx.lineTo(element.extendedEnd.x, element.extendedEnd.y);
              ctx.lineWidth = isSelected ? 3 : 2;
              ctx.stroke();
              ctx.closePath();

              // Draw the points at both ends
              [element.start, element.end].forEach(point => {
                // Draw outer circle
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.strokeStyle = isSelected ? "#cccccc" : "lightgray";
                ctx.lineWidth = isSelected ? 2 : 1.5;
                ctx.stroke();
                ctx.closePath();

                // Draw point
                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = isSelected ? "#ff4444" : ELEMENT_COLORS.Point;
                ctx.fill();
                ctx.closePath();

                // Draw label
                if (point.label) {
                  ctx.font = "14px Arial";
                  ctx.fillStyle = "black";
                  ctx.fillText(point.label, point.x + 14, point.y - 14);
                }
              });
              break;

            case "Segment":
              ctx.beginPath();
              ctx.moveTo(element.start.x, element.start.y);
              ctx.lineTo(element.end.x, element.end.y);
              ctx.lineWidth = isSelected ? 3 : 2;
              ctx.stroke();
              ctx.closePath();

              // Draw points at both ends
              [element.start, element.end].forEach(point => {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                ctx.strokeStyle = isSelected ? "#cccccc" : "lightgray";
                ctx.lineWidth = isSelected ? 2 : 1.5;
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = isSelected ? "#ff4444" : ELEMENT_COLORS.Point;
                ctx.fill();
                ctx.closePath();

                if (point.label) {
                  ctx.font = "14px Arial";
                  ctx.fillStyle = "black";
                  ctx.fillText(point.label, point.x + 14, point.y - 14);
                }
              });
              break;

            case "Polygon":
              if (element.points && element.points.length > 2) {
                ctx.beginPath();
                ctx.moveTo(element.points[0].x, element.points[0].y);
                element.points.forEach((point, index) => {
                  if (index > 0) {
                    ctx.lineTo(point.x, point.y);
                  }
                });
                ctx.closePath();
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.stroke();
                
                // Fill polygon with semi-transparent color
                const baseColor = isSelected ? "#ff4444" : element.color;
                ctx.fillStyle = baseColor + "33"; // Add 20% opacity
                ctx.fill();

                // Draw points and labels for each vertex
                element.points.forEach(point => {
                  ctx.beginPath();
                  ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
                  ctx.strokeStyle = isSelected ? "#cccccc" : "lightgray";
                  ctx.lineWidth = isSelected ? 2 : 1.5;
                  ctx.stroke();
                  ctx.closePath();

                  ctx.beginPath();
                  ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                  ctx.fillStyle = isSelected ? "#ff4444" : ELEMENT_COLORS.Point;
                  ctx.fill();
                  ctx.closePath();

                  if (point.label) {
                    ctx.font = "14px Arial";
                    ctx.fillStyle = "black";
                    ctx.fillText(point.label, point.x + 14, point.y - 14);
                  }
                });
              }
              break;

            case "Circle":
              ctx.beginPath();
              ctx.arc(element.x, element.y, element.radius || 50, 0, 2 * Math.PI);
              ctx.lineWidth = isSelected ? 3 : 2;
              ctx.stroke();
              ctx.closePath();
              break;

            default:
              break;
          }
        }
      });
    }
  }, [equations, drawnElements, drawGridAndAxes, drawFunction, selectedElement, polygonPoints]);

  // Only reset necessary states when switching tools
  useEffect(() => {
    setSelectedElement(null);
    setContextMenu({ visible: false, x: 0, y: 0 });
    
    // If switching away from Polygon tool and we have a complete polygon (3+ points)
    if (selectedTool !== "Polygon" && polygonPoints.length > 2) {
      // Create the complete polygon but keep the points
      const polygon = {
        type: "Polygon",
        points: polygonPoints.map(point => ({
          x: point.x,
          y: point.y,
          label: point.label,
          color: point.color
        })),
        color: "blue",
        id: Date.now(),
        isDeleted: false
      };
      setDrawnElements(prev => [...prev, polygon]);
      // Don't remove the points - keep them visible
      setPolygonPoints([]); // Only reset the polygon points array
    }
    
    if (selectedTool !== "Midpoint") {
      setMidpointPoints([]);
    }
  }, [selectedTool, polygonPoints]);

  // Add effect to handle table data points
  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const newPoints = tableData.map((point, index) => ({
        type: "Point",
        x: point.x * 50 + canvasRef.current.width / 2,
        y: canvasRef.current.height / 2 - point.y * 50,
        color: ELEMENT_COLORS.Point,
        id: `table-point-${index}`,
        label: point.label || String.fromCharCode(65 + index),
        isDeleted: false
      }));

      setDrawnElements(prev => {
        const filteredElements = prev.filter(el => !el.id.startsWith('table-point-'));
        return [...filteredElements, ...newPoints];
      });
    }
  }, [tableData]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu on canvas click

    // Check if clicked on an existing point
    const clickedPoint = drawnElements.find(
      (el) =>
        !el.isDeleted &&
        el.type === "Point" &&
        Math.sqrt((el.x - x) ** 2 + (el.y - y) ** 2) < 5
    );

    if (clickedPoint) {
      setSelectedElement(clickedPoint);
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
      return;
    }

    switch (selectedTool) {
      case "Point":
        drawPoint(ctx, x, y, setDrawnElements, getNextLabel(), drawnElements);
        break;
      case "Line":
        drawLine(ctx, x, y, drawnElements, setDrawnElements, getNextLabel());
        break;
      case "Segment":
        drawSegment(ctx, x, y, drawnElements, setDrawnElements, getNextLabel());
        break;
      case "Polygon":
        drawPolygon(ctx, x, y, polygonPoints, setPolygonPoints, getNextLabel(), setDrawnElements);
        break;
      case "Circle":
        drawCircle(ctx, x, y, drawnElements, setDrawnElements);
        break;
      case "Select":
        selectObject(x, y, drawnElements, setSelectedElement, setContextMenu);
        break;
      case "Delete":
        deleteObject(x, y, drawnElements, setDrawnElements);
        break;
      case "Label":
        labelObject(selectedElement, setDrawnElements);
        break;
      case "Show/Hide":
        toggleObjectVisibility(selectedElement, setDrawnElements);
        break;
      case "Midpoint":
        drawMidpoint(
          ctx,
          x,
          y,
          midpointPoints,
          setMidpointPoints,
          setDrawnElements,
          getNextLabel()
        );
        break;
        
      case "Perpendicular Line":
        drawPerpendicularLine(ctx, drawnElements);
        break;
      case "Parallel Line":
        drawParallelLine(ctx, drawnElements);
        break;
      case "Angle Bisector":
        drawAngleBisector(ctx, drawnElements);
        break;
      case "Tangents":
        drawTangents(ctx, drawnElements);
        break;
      default:
        break;
    }
  };

  const handleContextMenuAction = (action) => {
    if (!selectedElement) return; // Ensure an element is selected
  
    switch (action) {
      case "Change Color":
        setContextMenu({ ...contextMenu, showColors: true });
        break;
  
      case "Delete":
        setDrawnElements((prevElements) =>
          prevElements.filter((el) => el.id !== selectedElement.id)
        );
        setSelectedElement(null); // Clear the selected element
        setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu
        break;
  
      default:
        break;
    }
  };
  

  const handleColorChange = (color) => {
    if (!selectedElement) return;

    setDrawnElements((prevElements) =>
      prevElements.map((el) =>
        el.id === selectedElement.id ? { ...el, color } : el
      )
    );
    setSelectedElement((prev) => ({ ...prev, color })); // Update selectedElement's color
    setContextMenu({ ...contextMenu, showColors: false });
  };

  const handleMouseDown = useCallback((e) => {
    if (e.button === 1 || selectedTool === "Move") { // Middle mouse button or Move tool
      e.preventDefault(); // Prevent default dragging behavior
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setLastOffset({ ...offset });
    }
  }, [selectedTool, offset]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const newOffset = {
        x: lastOffset.x + (e.clientX - rect.left - dragStart.x),
        y: lastOffset.y + (e.clientY - rect.top - dragStart.y)
      };
      setOffset(newOffset);
    }
  }, [isDragging, dragStart, lastOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setScale(prevScale => {
      const newScale = Math.min(Math.max(prevScale * zoomFactor, 0.01), 50);
      
      // Adjust offset to zoom towards mouse position
      const scaleDiff = newScale - prevScale;
      setOffset(prev => ({
        x: prev.x - (mouseX - canvas.width / 2) * scaleDiff,
        y: prev.y - (mouseY - canvas.height / 2) * scaleDiff
      }));
      
      return newScale;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);
      canvas.addEventListener("wheel", handleWheel);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
        canvas.removeEventListener("wheel", handleWheel);
      };
    }
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  // Add zoom functions
  const handleZoomIn = () => {
    setScale(prevScale => {
        const newScale = Math.min(prevScale * 1.2, 5);
        return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale(prevScale => {
        const newScale = Math.max(prevScale / 1.2, 0.2);
        return newScale;
    });
  };

  // Add fullscreen functions
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current.parentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Add export handler using useCallback
  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Fill white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the original canvas content
    tempCtx.drawImage(canvas, 0, 0);

    // Convert to data URL
    const dataUrl = tempCanvas.toDataURL('image/png');
    onExportPreview(dataUrl);
  }, [onExportPreview]);

  // Register export handler
  useEffect(() => {
    if (onExportPreview) {
      onExportPreview(handleExport);
    }
    return () => {
      if (onExportPreview) {
        onExportPreview(null);
      }
    };
  }, [onExportPreview, handleExport]);

  // Add settings handler
  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Set canvas dimensions to match container
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        
        // Redraw everything after resize
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawGridAndAxes(ctx);
      }
    };

    // Initial setup
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [drawGridAndAxes]);

  return (
    <div className="geometry-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ 
          cursor: isDragging ? 'grabbing' : (selectedTool === 'Move' ? 'grab' : 'default')
        }}
      />
      
      <div className="graph-controls">
      <button className="control-btn settings-btn" onClick={handleSettings} title="Settings">
        <FaCog />
      </button>
        <button className="control-btn" onClick={handleZoomIn} title="Zoom In">
          <FaSearchPlus />
        </button>
        <button className="control-btn" onClick={handleZoomOut} title="Zoom Out">
          <FaSearchMinus />
        </button>
        <button className="control-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
      {showSettings && (
        <div className="settings-panel">
          <h3>Graph Settings</h3>
          <div className="settings-content">
            {/* Add settings options here */}
          </div>
        </div>
      )}
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="context-menu-item icon color-icon"
            onClick={() => handleContextMenuAction("Change Color")}
          >
            <FaPalette />
          </button>
          <button
            className="context-menu-item icon delete-icon"
            onClick={() => handleContextMenuAction("Delete")}
          >
            <FaTrashAlt />
          </button>
        </div>
      )}
      {contextMenu.showColors && (
        <div
          className="color-picker"
          style={{ top: contextMenu.y + 40, left: contextMenu.x }}
        >
          {["red", "blue", "green", "yellow", "black"].map((color) => (
            <button
              key={color}
              className="color-option"
              style={{
                backgroundColor: color,
                width: 40,
                height: 40,
                borderRadius: "50%",
              }}
              onClick={() => handleColorChange(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

GraphArea.propTypes = {
  selectedTool: PropTypes.string,
  equations: PropTypes.array,
  onExportPreview: PropTypes.func,
  tableData: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    label: PropTypes.string
  }))
};

export default GraphArea;
