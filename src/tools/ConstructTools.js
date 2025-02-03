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
    console.warn("A point is required to draw a perpendicular line.");
    return;
  }
  ctx.beginPath();
  ctx.moveTo(point.x, point.y - 50);
  ctx.lineTo(point.x, point.y + 50);
  ctx.strokeStyle = "cyan";
  ctx.stroke();
  ctx.closePath();
};

export const drawParallelLine = (ctx, drawnElements) => {
  const line = drawnElements.find((el) => el.type === "Line");
  if (!line || !line.start || !line.end) {
    console.warn("A valid line is required to draw a parallel line.");
    return;
  }
  const offset = 50;
  ctx.beginPath();
  ctx.moveTo(line.start.x, line.start.y + offset);
  ctx.lineTo(line.end.x, line.end.y + offset);
  ctx.strokeStyle = "magenta";
  ctx.stroke();
  ctx.closePath();
};

export const drawAngleBisector = (ctx, drawnElements) => {
  const points = drawnElements.filter((el) => el.type === "Point");
  if (points.length < 2) {
    console.warn("At least two points are required to draw an angle bisector.");
    return;
  }
  const [p1, p2] = points;
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(midX, midY);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = "yellow";
  ctx.stroke();
  ctx.closePath();
};

export const drawTangents = (ctx, drawnElements) => {
  const circle = drawnElements.find((el) => el.type === "Circle");
  if (!circle) {
    console.warn("A circle is required to draw tangents.");
    return;
  }
  const { x, y, radius } = circle;

  ctx.beginPath();
  ctx.moveTo(x - radius, y - radius);
  ctx.lineTo(x + radius, y - radius);
  ctx.moveTo(x - radius, y + radius);
  ctx.lineTo(x + radius, y + radius);
  ctx.strokeStyle = "lime";
  ctx.stroke();
  ctx.closePath();
};
