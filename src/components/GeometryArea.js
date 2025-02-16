import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/GeometryArea.css";
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
import { FaPalette, FaTrashAlt } from "react-icons/fa";
import * as math from 'mathjs';
import PropTypes from 'prop-types';

const ELEMENT_COLORS = {
  Point: "blue",
  Line: "blue",
  Segment: "blue",
  Polygon: "blue",
  Circle: "blue",
};

const GeometryArea = ({ selectedTool, equations = [], onExportPreview }) => {
  const [drawnElements, setDrawnElements] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [midpointPoints, setMidpointPoints] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const canvasRef = useRef(null);
  const startDrag = useRef(null);
  const [isMoving, setIsMoving] = useState(false);

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
    ctx.strokeStyle = "green"; // Changed to green to match image
    ctx.lineWidth = 2;

    const points = []; // Store points for later drawing
    
    try {
      const compiledEquation = math.compile(equation);
      const isTrigFunction = equation.toLowerCase().includes('sin') || equation.toLowerCase().includes('cos');
      
      // Calculate points with smaller step size for smooth curve
      for (let pixelX = 0; pixelX < width; pixelX += 2) {
        const x = (pixelX - originX) / scaleX;
        try {
          const y = compiledEquation.evaluate({ x });
          const pixelY = originY - (y * scaleY);
          
          if (pixelX === 0) {
            ctx.moveTo(pixelX, pixelY);
          } else {
            ctx.lineTo(pixelX, pixelY);
          }
          
          // Store points for trig functions at π/2 intervals
          if (isTrigFunction) {
            const xInPi = x * Math.PI;
            // Check if x is close to a multiple of π/2
            if (Math.abs(xInPi % (Math.PI/2)) < 0.01) {
              points.push({ x: pixelX, y: pixelY });
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      // Draw the continuous line
      ctx.stroke();
      
      // Draw points only for trig functions
      if (isTrigFunction) {
        points.forEach(point => {
          // Draw outer circle (white fill with black border)
          ctx.beginPath();
          ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = "white";
          ctx.fill();
          ctx.strokeStyle = "black";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.closePath();

          // Draw inner circle (solid black fill)
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "black";
          ctx.fill();
          ctx.closePath();
        });
      }
      
    } catch (error) {
      console.error("Error drawing function:", error);
    }
  }, []);

  // Draw plain background
  const drawGrid = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with plain white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }, []);

  // Effect to redraw canvas when equations change
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      
      // Clear canvas and draw grid
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawGrid(ctx);
      
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
  }, [equations, drawnElements, drawGrid, drawFunction, selectedElement, polygonPoints]);

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

  const handleMouseDown = useCallback(
    (e) => {
      if (selectedTool === "Move" && selectedElement) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        startDrag.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        setIsMoving(true);
      }
    },
    [selectedTool, selectedElement]
  );

  const moveElement = (id, newX, newY, drawnElements, setDrawnElements) => {
    setDrawnElements((prevElements) =>
      prevElements.map((element) =>
        element.id === id ? { ...element, x: newX, y: newY } : element
      )
    );
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isMoving && selectedElement) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        moveElement(
          selectedElement.id,
          x,
          y,
          drawnElements,
          setDrawnElements
        );
        startDrag.current = { x, y };
      }
    },
    [isMoving, selectedElement, drawnElements]
  );

  const handleMouseUp = () => {
    setIsMoving(false);
    startDrag.current = null;
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
      };
    }
  }, [handleMouseDown, handleMouseMove]);

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

  return (
    <div className="geometry-container">
      <canvas
        ref={canvasRef}
        width={1400}
        height={600}
        onClick={handleCanvasClick}
      ></canvas>
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

GeometryArea.propTypes = {
  selectedTool: PropTypes.string,
  equations: PropTypes.array,
  onExportPreview: PropTypes.func,
};

export default GeometryArea;
