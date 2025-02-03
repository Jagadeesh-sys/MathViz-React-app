export const ELEMENT_COLORS = {
  Point: "#2196F3", // Blue
  Line: "#000000",  // Black
  Segment: "#4CAF50", // Green
  Polygon: "#9C27B0", // Purple border
  PolygonFill: "rgba(156, 39, 176, 0.2)", // Light purple fill with transparency
  Circle: "#FF5722"  // Orange
};

export const drawPoint = (
  ctx,
  x,
  y,
  setDrawnElements,
  nextLabel,
  drawnElements = [],
  selectedElementColor = ELEMENT_COLORS.Point,
  customLabel = null
) => {
  const label = customLabel || nextLabel;

  // Check if a point already exists at these coordinates
  const existingPoint = drawnElements.find(
    point => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
  );

  if (existingPoint) {
    // Update existing point instead of creating a new one
    setDrawnElements(prev => prev.map(point => {
      if (point.id === existingPoint.id) {
        return { ...point, color: selectedElementColor };
      }
      return point;
    }));
    return;
  }

  const animationDuration = 500;
  const initialPointRadius = 3;
  const finalPointRadius = 4;
  const circleRadius = 8;

  let startTime = null;

  const animatePoint = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / animationDuration, 1);

    // Save current canvas state
    ctx.save();

    // Draw existing elements first
    drawnElements.forEach((element) => {
      if (!element.isDeleted) {
        // Draw point
        ctx.beginPath();
        ctx.arc(element.x, element.y, circleRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "lightgray";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(element.x, element.y, finalPointRadius, 0, 2 * Math.PI);
        ctx.fillStyle = element.color || ELEMENT_COLORS.Point;
        ctx.fill();
        ctx.closePath();

        if (element.label) {
          ctx.font = "14px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(element.label, element.x + 14, element.y - 14);
        }
      }
    });

    // Draw the new point animation
    const pointRadius = initialPointRadius + (finalPointRadius - initialPointRadius) * progress;

    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, 2 * Math.PI);
    ctx.fillStyle = selectedElementColor;
    ctx.fill();
    ctx.closePath();

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(label, x + 14, y - 14);

    // Restore canvas state
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animatePoint);
    } else {
      const newPoint = {
        type: "Point",
        x,
        y,
        label,
        color: selectedElementColor,
        id: Date.now(),
        isDeleted: false
      };
      setDrawnElements(prev => [...prev, newPoint]);
    }
  };

  requestAnimationFrame(animatePoint);
};

export const drawLine = (
  ctx,
  x,
  y,
  drawnElements,
  setDrawnElements,
  nextLabel
) => {
  // Get only the temporary points for the current line
  const tempPoints = drawnElements.filter(el => el.isTemporary && el.type === "Point");

  // If this is the first point of the line
  if (tempPoints.length === 0) {
    const startPoint = {
      type: "Point",
      x,
      y,
      label: nextLabel,
      color: ELEMENT_COLORS.Point,
      id: Date.now(),
      isDeleted: false,
      isTemporary: true
    };
    
    // Add temporary point
    setDrawnElements(prev => [...prev, startPoint]);
    
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
    ctx.fillText(startPoint.label, x + 14, y - 14);
    
    return;
  }

  // If this is the second point, draw the line
  if (tempPoints.length === 1) {
    const startPoint = tempPoints[0];
    
    // Create end point
    const endPoint = {
      type: "Point",
      x,
      y,
      label: nextLabel,
      color: ELEMENT_COLORS.Point,
      id: Date.now(),
      isDeleted: false
    };

    // Calculate line extension points
    const angle = Math.atan2(y - startPoint.y, x - startPoint.x);
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    const diagonal = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);

    const extendedStart = {
      x: startPoint.x - diagonal * Math.cos(angle),
      y: startPoint.y - diagonal * Math.sin(angle)
    };

    const extendedEnd = {
      x: startPoint.x + diagonal * Math.cos(angle),
      y: startPoint.y + diagonal * Math.sin(angle)
    };

    // Create line
    const line = {
      type: "Line",
      start: { x: startPoint.x, y: startPoint.y, label: startPoint.label },
      end: { x, y, label: endPoint.label },
      extendedStart,
      extendedEnd,
      color: ELEMENT_COLORS.Line,
      id: Date.now() + 1,
      isDeleted: false
    };

    // Update drawn elements: remove temporary point and add end point and line
    setDrawnElements(prev => [
      ...prev.filter(el => !el.isTemporary), // Remove temporary points
      { ...startPoint, isTemporary: false }, // Convert start point to permanent
      endPoint,
      line
    ]);

    // Draw the complete line
    ctx.beginPath();
    ctx.moveTo(extendedStart.x, extendedStart.y);
    ctx.lineTo(extendedEnd.x, extendedEnd.y);
    ctx.strokeStyle = ELEMENT_COLORS.Line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw the end point
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
    ctx.fillText(endPoint.label, x + 14, y - 14);
  }
};

export const drawSegment = (
  ctx,
  x,
  y,
  drawnElements,
  setDrawnElements,
  nextLabel
) => {
  // Get only the temporary points for the current segment
  const tempPoints = drawnElements.filter(el => el.isTemporary);

  // If this is the first point of the segment
  if (tempPoints.length === 0) {
    const startPoint = {
      type: "Point",
      x,
      y,
      label: nextLabel,
      color: ELEMENT_COLORS.Point,
      id: Date.now(),
      isDeleted: false,
      isTemporary: true
    };
    
    // Add temporary point
    setDrawnElements(prev => [...prev, startPoint]);
    
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
    ctx.fillText(startPoint.label, x + 14, y - 14);
    
    return;
  }

  // If this is the second point, draw the segment
  if (tempPoints.length === 1) {
    const startPoint = tempPoints[0];
    
    // Create end point
    const endPoint = {
      type: "Point",
      x,
      y,
      label: nextLabel,
      color: ELEMENT_COLORS.Point,
      id: Date.now(),
      isDeleted: false
    };

    // Create segment
    const segment = {
      type: "Segment",
      start: { x: startPoint.x, y: startPoint.y, label: startPoint.label },
      end: { x, y, label: endPoint.label },
      color: ELEMENT_COLORS.Segment,
      id: Date.now() + 1,
      isDeleted: false
    };

    // Update drawn elements: remove temporary point and add end point and segment
    setDrawnElements(prev => [
      ...prev.filter(el => !el.isTemporary), // Remove temporary points
      { ...startPoint, isTemporary: false }, // Convert start point to permanent
      endPoint,
      segment
    ]);

    // Draw the complete segment
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = ELEMENT_COLORS.Segment;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    // Draw the end point
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
    ctx.fillText(endPoint.label, x + 14, y - 14);
  }
};

export const drawPolygon = (
  ctx,
  x,
  y,
  polygonPoints,
  setPolygonPoints,
  nextLabel,
  setDrawnElements
) => {
  // Check if we're closing the polygon (clicking near the first point)
  if (polygonPoints.length > 2) {
    const firstPoint = polygonPoints[0];
    const distanceToFirst = Math.sqrt(
      Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
    );
    
    if (distanceToFirst < 10) {
      // Close the polygon
      const polygon = {
        type: "Polygon",
        points: [...polygonPoints],
        color: ELEMENT_COLORS.Polygon,
        fillColor: ELEMENT_COLORS.PolygonFill,
        id: Date.now(),
        isDeleted: false,
        isVisible: true,
        label: nextLabel
      };
      
      setDrawnElements(prev => [...prev, polygon]);
      setPolygonPoints([]); // Reset points for next polygon
      return;
    }
  }

  // Create new point for polygon vertex
  const newPoint = {
    type: "Point",
    x,
    y,
    label: `${nextLabel}_${polygonPoints.length + 1}`,
    color: ELEMENT_COLORS.Point,
    id: Date.now(),
    isDeleted: false,
    isVisible: true
  };

  // Add point to polygon points and drawn elements
  const newPoints = [...polygonPoints, newPoint];
  setPolygonPoints(newPoints);
  
  // Add the point and temporary polygon to drawn elements immediately
  setDrawnElements(prev => {
    // Remove any temporary elements from previous preview
    const filtered = prev.filter(el => !el.isTemporary);
    const elements = [...filtered];

    // If we have at least 2 points, create a temporary polygon
    if (newPoints.length >= 2) {
      const tempPolygon = {
        type: "Polygon",
        points: [...newPoints],
        color: ELEMENT_COLORS.Polygon,
        fillColor: ELEMENT_COLORS.PolygonFill,
        id: Date.now() + 2,
        isDeleted: false,
        isVisible: true,
        isTemporary: true,
        label: nextLabel + "_temp"
      };
      elements.push(tempPolygon);
    }

    // Add all points
    newPoints.forEach(point => {
      elements.push(point);
    });

    // Add lines between points
    for (let i = 1; i < newPoints.length; i++) {
      const line = {
        type: "Segment",
        start: newPoints[i-1],
        end: newPoints[i],
        color: ELEMENT_COLORS.Polygon,
        id: Date.now() + i,
        isDeleted: false,
        isVisible: true,
        isTemporary: false
      };
      elements.push(line);
    }
    
    return elements;
  });

  // Draw the current state
  // First draw fill if we have at least 2 points
  if (newPoints.length >= 2) {
    ctx.beginPath();
    ctx.moveTo(newPoints[0].x, newPoints[0].y);
    for (let i = 1; i < newPoints.length; i++) {
      ctx.lineTo(newPoints[i].x, newPoints[i].y);
    }
    ctx.lineTo(x, y); // Add current mouse position
    ctx.closePath();
    
    // Fill with semi-transparent color
    ctx.fillStyle = ELEMENT_COLORS.PolygonFill;
    ctx.fill();
  }

  // Draw all points and lines
  newPoints.forEach((point, index) => {
    // Draw point
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = ELEMENT_COLORS.Point;
    ctx.fill();
    ctx.closePath();
    
    // Draw label
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(point.label, point.x + 10, point.y - 10);
    
    // Draw lines between points
    if (index > 0) {
      const prevPoint = newPoints[index - 1];
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = ELEMENT_COLORS.Polygon;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  
  // Draw preview line from last point to current mouse position
  if (newPoints.length > 0) {
    const lastPoint = newPoints[newPoints.length - 1];
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(x, y);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = ELEMENT_COLORS.Polygon;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // Draw closing preview when near first point
  if (newPoints.length > 2) {
    const firstPoint = newPoints[0];
    const distanceToFirst = Math.sqrt(
      Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2)
    );
    
    if (distanceToFirst < 10) {
      ctx.beginPath();
      ctx.arc(firstPoint.x, firstPoint.y, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = ELEMENT_COLORS.Polygon;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
};

export const drawCircle = (ctx, x, y, drawnElements, setDrawnElements) => {
  // Check if there's an existing center point (first point)
  const lastElement = drawnElements[drawnElements.length - 1];

  if (!lastElement || lastElement.type !== "Point") {
    // First click: Draw the center point
    const centerPoint = { type: "Point", x, y, label: "Center" };

    // Draw the center point on the canvas immediately
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI); // Small point at the center
    ctx.fillStyle = ELEMENT_COLORS.Circle;
    ctx.fill();
    ctx.closePath();

    // Add center point to drawn elements
    setDrawnElements((prev) => [...prev, centerPoint]);
  } else {
    // Second click: Calculate the radius and draw the circle
    const centerX = lastElement.x;
    const centerY = lastElement.y;
    const radius = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)); // Calculate distance from center to second point

    // Draw the circle with the calculated radius
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = ELEMENT_COLORS.Circle;
    ctx.stroke();
    ctx.closePath();

    // Store the circle in drawn elements
    const circle = { type: "Circle", x: centerX, y: centerY, radius };

    // Add the circle to drawn elements
    setDrawnElements((prev) => [...prev, circle]);
  }
};
