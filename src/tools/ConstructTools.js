import { ELEMENT_COLORS } from './BasicTools';

export const drawMidpoint = (
  ctx,
  x,
  y,
  midpointPoints,
  setMidpointPoints,
  setDrawnElements,
  nextLabel
) => {
  // Create a new point with label
  const newPoint = {
    type: "Point",
    x,
    y,
    label: nextLabel,
    color: ELEMENT_COLORS.Point,
    id: Date.now(),
    isDeleted: false,
    isTemporary: false
  };

  // Add point to drawn elements immediately
  setDrawnElements(prev => [...prev, newPoint]);

  // Draw the point
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, 2 * Math.PI);
  ctx.strokeStyle = "lightgray";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(x, y, 4, 0, 2 * Math.PI);
  ctx.fillStyle = ELEMENT_COLORS.Point;
  ctx.fill();
  ctx.closePath();

  ctx.font = "14px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(newPoint.label, x + 14, y - 14);

  // Add point to midpoint points
  const newPoints = [...midpointPoints, newPoint];
  setMidpointPoints(newPoints);

  // If we have two points, calculate and draw the midpoint
  if (newPoints.length === 2) {
    const point1 = newPoints[0];
    const point2 = newPoints[1];

    // Calculate midpoint coordinates
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;

    // Create midpoint with next label
    const midpoint = {
      type: "Point",
      x: midX,
      y: midY,
      label: String.fromCharCode(65 + (nextLabel.charCodeAt(0) - 65 + 1)),
      color: "#FF4444", // Red color for midpoint
      id: Date.now() + 1,
      isDeleted: false,
      isMidpoint: true,
      parentPoints: [point1.id, point2.id] // Store parent point IDs
    };

    // Draw dashed lines to midpoint
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(point1.x, point1.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(point2.x, point2.y);
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]); // Reset line style

    // Draw midpoint
    ctx.beginPath();
    ctx.arc(midX, midY, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(midX, midY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF4444";
    ctx.fill();
    ctx.closePath();

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(midpoint.label, midX + 14, midY - 14);

    // Add only the midpoint to drawn elements (points are already added)
    setDrawnElements(prev => [...prev, midpoint]);

    // Clear midpoint points for next operation
    setMidpointPoints([]);
  }
};

export const drawPerpendicularLine = (ctx, drawnElements) => {
  const point = drawnElements.find((el) => el.type === "Point");
  if (!point) {
    alert("Please create a point first to draw a perpendicular line.");
    return;
  }

  // Calculate extended points for infinite line
  const extendFactor = 1000; // Length to extend the line
  const extendedStart = {
    x: point.x,
    y: point.y - extendFactor
  };

  const extendedEnd = {
    x: point.x,
    y: point.y + extendFactor
  };

  // Draw the infinite line
  ctx.beginPath();
  ctx.moveTo(extendedStart.x, extendedStart.y);
  ctx.lineTo(extendedEnd.x, extendedEnd.y);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Create start and end points
  const start = {
    x: point.x,
    y: point.y - 50,
    label: String.fromCharCode(65 + drawnElements.length),
    color: "blue"
  };

  const end = {
    x: point.x,
    y: point.y + 50,
    label: String.fromCharCode(66 + drawnElements.length),
    color: "blue"
  };

  // Draw points at the original positions
  [start, end].forEach(point => {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // Draw label
    if (point.label) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(point.label, point.x + 14, point.y - 14);
    }
  });

  return {
    type: "Line",
    start,
    end,
    extendedStart,
    extendedEnd,
    color: "blue",
    id: Date.now(),
    isDeleted: false
  };
};

export const drawParallelLine = (ctx, drawnElements) => {
  const line = drawnElements.find((el) => el.type === "Line");
  if (!line || !line.start || !line.end) {
    alert("Please create a line first to draw a parallel line.");
    return;
  }

  // Calculate the offset for the parallel line (50 pixels perpendicular)
  const dx = line.end.x - line.start.x;
  const dy = line.end.y - line.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Calculate perpendicular offset
  const offsetX = (-dy / length) * 50;
  const offsetY = (dx / length) * 50;

  // Create parallel line points
  const parallelStart = {
    x: line.start.x + offsetX,
    y: line.start.y + offsetY,
    label: String.fromCharCode(65 + drawnElements.length),
    color: "blue"
  };

  const parallelEnd = {
    x: line.end.x + offsetX,
    y: line.end.y + offsetY,
    label: String.fromCharCode(66 + drawnElements.length),
    color: "blue"
  };

  // Calculate extended points for infinite line
  const extendFactor = 1000; // Length to extend the line
  const extendedStart = {
    x: parallelStart.x - (dx / length) * extendFactor,
    y: parallelStart.y - (dy / length) * extendFactor
  };

  const extendedEnd = {
    x: parallelEnd.x + (dx / length) * extendFactor,
    y: parallelEnd.y + (dy / length) * extendFactor
  };

  // Draw the infinite line
  ctx.beginPath();
  ctx.moveTo(extendedStart.x, extendedStart.y);
  ctx.lineTo(extendedEnd.x, extendedEnd.y);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Draw points at the original positions
  [parallelStart, parallelEnd].forEach(point => {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // Draw label
    if (point.label) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(point.label, point.x + 14, point.y - 14);
    }
  });

  return {
    type: "Line",
    start: parallelStart,
    end: parallelEnd,
    extendedStart,
    extendedEnd,
    color: "blue",
    id: Date.now(),
    isDeleted: false
  };
};

export const drawAngleBisector = (ctx, drawnElements) => {
  const points = drawnElements.filter((el) => el.type === "Point");
  if (points.length < 2) {
    alert("Please create at least two points to draw an angle bisector.");
    return;
  }
  const [p1, p2] = points;

  // Calculate angle and extend the line
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const extendFactor = 1000;

  // Calculate extended points
  const extendedStart = {
    x: p1.x - (dx / length) * extendFactor,
    y: p1.y - (dy / length) * extendFactor
  };

  const extendedEnd = {
    x: p2.x + (dx / length) * extendFactor,
    y: p2.y + (dy / length) * extendFactor
  };

  // Draw the infinite line
  ctx.beginPath();
  ctx.moveTo(extendedStart.x, extendedStart.y);
  ctx.lineTo(extendedEnd.x, extendedEnd.y);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Create start and end points with labels
  const start = {
    x: p1.x,
    y: p1.y,
    label: String.fromCharCode(65 + drawnElements.length),
    color: "blue"
  };

  const end = {
    x: p2.x,
    y: p2.y,
    label: String.fromCharCode(66 + drawnElements.length),
    color: "blue"
  };

  // Draw points at both ends
  [start, end].forEach(point => {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // Draw label
    if (point.label) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(point.label, point.x + 14, point.y - 14);
    }
  });

  return {
    type: "Line",
    start,
    end,
    extendedStart,
    extendedEnd,
    color: "blue",
    id: Date.now(),
    isDeleted: false
  };
};

export const drawTangents = (ctx, drawnElements) => {
  const circle = drawnElements.find((el) => el.type === "Circle");
  if (!circle) {
    alert("Please create a circle first to draw tangent lines.");
    return;
  }
  const { x, y, radius } = circle;

  // Calculate extended points for infinite lines
  const extendFactor = 1000;
  
  // Create top tangent points
  const topPoint = {
    x: x,
    y: y - radius,
    label: String.fromCharCode(65 + drawnElements.length),
    color: "blue"
  };

  // Create bottom tangent points
  const bottomPoint = {
    x: x,
    y: y + radius,
    label: String.fromCharCode(66 + drawnElements.length),
    color: "blue"
  };

  // Calculate extended points for horizontal tangent lines
  const topExtendedStart = {
    x: x - extendFactor,
    y: y - radius
  };
  const topExtendedEnd = {
    x: x + extendFactor,
    y: y - radius
  };
  const bottomExtendedStart = {
    x: x - extendFactor,
    y: y + radius
  };
  const bottomExtendedEnd = {
    x: x + extendFactor,
    y: y + radius
  };

  // Draw the infinite lines
  ctx.beginPath();
  ctx.moveTo(topExtendedStart.x, topExtendedStart.y);
  ctx.lineTo(topExtendedEnd.x, topExtendedEnd.y);
  ctx.moveTo(bottomExtendedStart.x, bottomExtendedStart.y);
  ctx.lineTo(bottomExtendedEnd.x, bottomExtendedEnd.y);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  // Draw points at tangent points
  [topPoint, bottomPoint].forEach(point => {
    // Draw outer circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // Draw label
    if (point.label) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(point.label, point.x + 14, point.y - 14);
    }
  });

  // Return both tangent lines as separate elements
  return [
    {
      type: "Line",
      start: topPoint,
      end: { ...topPoint, x: topPoint.x + 100 }, // Reference point for the line
      extendedStart: topExtendedStart,
      extendedEnd: topExtendedEnd,
      color: "blue",
      id: Date.now(),
      isDeleted: false
    },
    {
      type: "Line",
      start: bottomPoint,
      end: { ...bottomPoint, x: bottomPoint.x + 100 }, // Reference point for the line
      extendedStart: bottomExtendedStart,
      extendedEnd: bottomExtendedEnd,
      color: "blue",
      id: Date.now() + 1,
      isDeleted: false
    }
  ];
};
