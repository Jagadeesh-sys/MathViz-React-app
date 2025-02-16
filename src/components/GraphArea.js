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
import { 
  FaPalette, 
  FaTrashAlt, 
  FaSearchPlus, 
  FaSearchMinus, 
  FaExpand, 
  FaCompress, 
  FaCog,
  FaPlus,         // For axes
  FaThLarge,      // For grid
  FaMagnet        // For snap to grid
} from "react-icons/fa";
import * as math from 'mathjs';
import PropTypes from 'prop-types';

const ELEMENT_COLORS = {
  Point: "blue",
  Line: "blue",
  Segment: "blue",
  Polygon: "blue",
  Circle: "blue",
};

// eslint-disable-next-line no-unused-vars
const SCALE_INTERVALS = [
  0.01, 0.02, 0.05,        // Extremely zoomed out
  0.1, 0.2, 0.5,           // Very zoomed out
  1, 2, 5,                 // Normal range
  10, 20, 50,100,             // Zoomed in
  200, 500,1000,          // Very zoomed in
];

const getNiceNumber = (x, round) => {
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  let nf;
  
  if (round) {
    if (f < 1.5) nf = 1;
    else if (f < 3) nf = 2;
    else if (f < 7) nf = 5;
    else nf = 10;
  } else {
    if (f <= 1) nf = 1;
    else if (f <= 2) nf = 2;
    else if (f <= 5) nf = 5;
    else nf = 10;
  }
  return nf * Math.pow(10, exp);
};

const getGridSpacing = (viewportSize, pixelsPerUnit) => {
  const minPixelsBetweenLines = 50; // Minimum pixels between grid lines
  const rawSpacing = minPixelsBetweenLines / pixelsPerUnit;
  return getNiceNumber(rawSpacing, true);
};

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
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastOffset, setLastOffset] = useState({ x: 0, y: 0 });
  const [gridScale] = useState(50);
  const [showGrid, setShowGrid] = useState(true);
  const [gridType, setGridType] = useState("major-minor");
  const [showAxes, setShowAxes] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const drawGridAndAxes = useCallback((ctx) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    
    const originX = width / 2 + offset.x;
    const originY = height / 2 + offset.y;
    
    // Calculate pixels per unit based on scale
    const pixelsPerUnit = gridScale * scale;
    
    // Get dynamic grid spacing
    const majorSpacing = getGridSpacing(Math.min(width, height), pixelsPerUnit);
    const minorSpacing = majorSpacing / 5;

    // Calculate view bounds
    const xMin = (0 - originX) / pixelsPerUnit;
    const xMax = (width - originX) / pixelsPerUnit;
    const yMin = (originY - height) / pixelsPerUnit;
    const yMax = originY / pixelsPerUnit;

    if (showGrid) {
      // Function to draw grid lines
      const drawGridLines = (spacing, isMinor) => {
        const lineWidth = isMinor ? 0.5 : 1;
        const strokeStyle = isMinor ? '#E8E8E8' : '#D3D3D3';
        
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = strokeStyle;
        
        // Calculate start and end positions
        const xStart = Math.floor(xMin / spacing) * spacing;
        const xEnd = Math.ceil(xMax / spacing) * spacing;
        const yStart = Math.floor(yMin / spacing) * spacing;
        const yEnd = Math.ceil(yMax / spacing) * spacing;

        // Draw vertical lines
        for (let x = xStart; x <= xEnd; x += spacing) {
          if (isMinor && Math.abs(x % majorSpacing) < spacing / 10) continue;
          
          const pixelX = originX + x * pixelsPerUnit;
          ctx.beginPath();
          ctx.moveTo(pixelX, 0);
          ctx.lineTo(pixelX, height);
          ctx.stroke();
          
          // Draw labels for major lines
          if (!isMinor && Math.abs(x) > spacing / 10) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'center';
            ctx.fillText(x.toFixed(Math.max(0, -Math.floor(Math.log10(spacing)))), 
                        pixelX, originY + 20);
          }
        }

        // Draw horizontal lines
        for (let y = yStart; y <= yEnd; y += spacing) {
          if (isMinor && Math.abs(y % majorSpacing) < spacing / 10) continue;
          
          const pixelY = originY - y * pixelsPerUnit;
          ctx.beginPath();
          ctx.moveTo(0, pixelY);
          ctx.lineTo(width, pixelY);
          ctx.stroke();
          
          // Draw labels for major lines
          if (!isMinor && Math.abs(y) > spacing / 10) {
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'right';
            ctx.fillText(y.toFixed(Math.max(0, -Math.floor(Math.log10(spacing)))), 
                        originX - 10, pixelY + 4);
          }
        }
      };

      // Draw grid based on type
      if (gridType === "major-minor") {
        drawGridLines(minorSpacing, true);
      }
      if (gridType === "major-minor" || gridType === "major") {
        drawGridLines(majorSpacing, false);
      }
    }

    // Draw axes
    if (showAxes) {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 1;
      
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

      // Draw arrows
      const arrowSize = 10;
      
      // X-axis arrow
      ctx.beginPath();
      ctx.moveTo(width - arrowSize, originY - arrowSize/2);
      ctx.lineTo(width, originY);
      ctx.lineTo(width - arrowSize, originY + arrowSize/2);
      ctx.stroke();

      // Y-axis arrow
      ctx.beginPath();
      ctx.moveTo(originX - arrowSize/2, arrowSize);
      ctx.lineTo(originX, 0);
      ctx.lineTo(originX + arrowSize/2, arrowSize);
      ctx.stroke();

      // Origin label
      ctx.font = '12px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'right';
      ctx.fillText('0', originX - 5, originY + 15);
    }

    // Scale info
    ctx.font = '12px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'left';
    ctx.fillText(`Scale: ${scale.toFixed(2)}x`, 10, 20);
    if (showGrid) {
      ctx.fillText(`Grid Unit: ${majorSpacing}`, 10, 40);
    }
  }, [offset, scale, gridScale, showGrid, gridType, showAxes]);

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

  // Add this helper function to detect extrema
  const isExtremum = (x, equation, step = 0.01) => {
    try {
      const compiledEquation = math.compile(equation);
      const y = compiledEquation.evaluate({ x });
      const yLeft = compiledEquation.evaluate({ x: x - step });
      const yRight = compiledEquation.evaluate({ x: x + step });
      
      // Check if it's a local maximum or minimum
      return (y > yLeft && y > yRight) || (y < yLeft && y < yRight);
    } catch (error) {
      return false;
    }
  };

  // Function to draw mathematical functions
  const drawFunction = useCallback((ctx, equation) => {
    const canvas = canvasRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const pixelsPerUnit = gridScale * scale; // Use consistent scaling
    const originX = width / 2 + offset.x;
    const originY = height / 2 + offset.y;

    // Calculate view bounds
    const xMin = (0 - originX) / pixelsPerUnit;
    const xMax = (width - originX) / pixelsPerUnit;
    const step = (xMax - xMin) / width; // Adjust step size based on zoom level

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    try {
        const compiledEquation = math.compile(equation);
        const isTrigFunction = equation.toLowerCase().includes('sin') || 
                             equation.toLowerCase().includes('cos');
        
        let isFirstPoint = true;
        for (let x = xMin; x <= xMax; x += step) {
            try {
                const y = compiledEquation.evaluate({ x });
                const pixelX = originX + (x * pixelsPerUnit);
                const pixelY = originY - (y * pixelsPerUnit); // Note the negative sign
                
                if (isFirstPoint) {
                    ctx.moveTo(pixelX, pixelY);
                    isFirstPoint = false;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            } catch (error) {
                continue;
            }
        }
        
        ctx.stroke();
        
        // Update dot drawing for trig functions
        if (isTrigFunction) {
            const piStep = Math.PI/2;
            const startX = Math.ceil(xMin / piStep) * piStep;
            const endX = Math.floor(xMax / piStep) * piStep;
            
            for (let x = startX; x <= endX; x += piStep) {
                try {
                    if (isExtremum(x, equation)) {
                        const y = compiledEquation.evaluate({ x });
                        const pixelX = originX + (x * pixelsPerUnit);
                        const pixelY = originY - (y * pixelsPerUnit);
                        
                        // Draw outer white circle with green border
                        ctx.beginPath();
                        ctx.arc(pixelX, pixelY, 6, 0, 2 * Math.PI);
                        ctx.fillStyle = "white";
                        ctx.fill();
                        ctx.strokeStyle = "#4CAF50"; // Green color
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Draw inner green dot
                        ctx.beginPath();
                        ctx.arc(pixelX, pixelY, 3, 0, 2 * Math.PI);
                        ctx.fillStyle = "#4CAF50"; // Green color
                        ctx.fill();
                        
                        // Store extremum point data
                        const extremumPoint = {
                            type: "ExtremumPoint",
                            x: pixelX,
                            y: pixelY,
                            realX: x,
                            realY: y,
                            dotSize: 6,
                            id: `extremum-${x}`
                        };
                        
                        // Add to drawn elements
                        setDrawnElements(prev => [...prev.filter(el => el.id !== extremumPoint.id), extremumPoint]);
                    }
                } catch (error) {
                    continue;
                }
            }
        }
    } catch (error) {
        console.error("Error drawing function:", error);
    }
}, [scale, offset, gridScale]);

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
        const pixelsPerUnit = gridScale * scale;
        const newPoints = tableData.map((point, index) => ({
            type: "Point",
            x: point.x * pixelsPerUnit + canvasRef.current.width / 2 + offset.x,
            y: canvasRef.current.height / 2 - point.y * pixelsPerUnit + offset.y,
            originalX: point.x, // Store original coordinates
            originalY: point.y,
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
  }, [tableData, scale, offset, gridScale]);

  // Add this new effect to update point positions when scaling/panning
  useEffect(() => {
    setDrawnElements(prev => prev.map(element => {
        if (element.id.startsWith('table-point-') && 'originalX' in element && 'originalY' in element) {
            const pixelsPerUnit = gridScale * scale;
            return {
                ...element,
                x: element.originalX * pixelsPerUnit + canvasRef.current.width / 2 + offset.x,
                y: canvasRef.current.height / 2 - element.originalY * pixelsPerUnit + offset.y
            };
        }
        return element;
    }));
  }, [scale, offset, gridScale]);

  const handleCanvasClick = useCallback((e) => {
    if (isDraggingCanvas) {
      return; // Don't handle clicks while dragging
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");

    setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu on canvas click

    // Check for extremum points
    const clickedExtremum = drawnElements.find(
        (el) =>
            el.type === "ExtremumPoint" &&
            Math.sqrt((el.x - x) ** 2 + (el.y - y) ** 2) < el.dotSize
    );

    if (clickedExtremum) {
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            type: "extremum",
            point: {
                x: clickedExtremum.realX,
                y: clickedExtremum.realY
            }
        });
        return;
    }

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
  }, [
    isDraggingCanvas,
    selectedTool,
    drawnElements,
    polygonPoints,
    midpointPoints,
    getNextLabel,
    selectedElement
  ]);

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
    if (e.button === 0) { // Left mouse button
      e.preventDefault();
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setLastOffset({ ...offset });
    }
  }, [offset]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (isDraggingCanvas) {
      // Calculate the change in position
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      // Update the offset based on the drag movement
      setOffset({
        x: lastOffset.x + deltaX,
        y: lastOffset.y + deltaY
      });

      // Update cursor style
      canvas.style.cursor = 'grabbing';
    } else {
      // Show grab cursor when not dragging
      canvas.style.cursor = 'grab';
    }
  }, [isDraggingCanvas, dragStart, lastOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingCanvas) {
      setIsDraggingCanvas(false);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = 'grab';
      }
    }
  }, [isDraggingCanvas]);

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

  const handleGridOptionChange = (newGridType) => {
    if (newGridType === "none") {
      setShowGrid(false);
      setGridType("none");
    } else {
      setShowGrid(true);
      setGridType(newGridType);
    }
    setShowSettings(false); // Close settings after selection
  };

  return (
    <div className="geometry-container">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'grab' }} // Default cursor style
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
          <div className="settings-option">
            <label title="Show Axes">
              <FaPlus className="settings-icon" />
              <input
                type="checkbox"
                checked={showAxes}
                onChange={(e) => {
                  setShowAxes(e.target.checked);
                  setShowSettings(false);
                }}
              />
              Show Axes
            </label>
          </div>
          
          <div className="settings-option grid-options">
            <label title="No Grid">
              <FaThLarge className="settings-icon" style={{ opacity: 0.3 }} />
              <input
                type="radio"
                name="gridType"
                checked={!showGrid}
                onChange={() => handleGridOptionChange("none")}
              />
              No Grid
            </label>
            
            <label title="Major Gridlines">
              <FaThLarge className="settings-icon" style={{ opacity: 0.6 }} />
              <input
                type="radio"
                name="gridType"
                checked={showGrid && gridType === "major"}
                onChange={() => handleGridOptionChange("major")}
              />
              Major Gridlines
            </label>
            
            <label title="Major and Minor Gridlines">
              <FaThLarge className="settings-icon" />
              <input
                type="radio"
                name="gridType"
                checked={showGrid && gridType === "major-minor"}
                onChange={() => handleGridOptionChange("major-minor")}
              />
              Major and Minor Gridlines
            </label>
          </div>

          <div className="settings-option">
            <label title="Snap to Grid">
              <FaMagnet className="settings-icon" />
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => {
                  setSnapToGrid(e.target.checked);
                  setShowSettings(false);
                }}
              />
              Snap to Grid
            </label>
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
      {contextMenu.visible && contextMenu.type === "extremum" && (
        <div
            className="extremum-tooltip"
            style={{
                position: 'absolute',
                top: contextMenu.y - 40,
                left: contextMenu.x + 10,
                backgroundColor: 'white',
                border: '1px solid #ccc',
                padding: '5px 10px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                zIndex: 1000,
                fontSize: '12px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap'
            }}
        >
            <div>Extremum</div>
            <div>({contextMenu.point.x.toFixed(2)}, {contextMenu.point.y.toFixed(2)})</div>
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
