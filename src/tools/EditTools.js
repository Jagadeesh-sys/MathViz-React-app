export const selectObject = (x, y, drawnElements, setSelectedElement, setContextMenu) => {
  const selected = drawnElements.find(
    (element) => 
      !element.isDeleted && 
      Math.abs(element.x - x) < 5 && 
      Math.abs(element.y - y) < 5
  );

  if (selected) {
    setSelectedElement(selected);
    setContextMenu({ visible: true, x: x, y: y }); // Show context menu
  } else {
    setSelectedElement(null);
    setContextMenu({ visible: false, x: 0, y: 0 }); // Hide context menu
  }
};

export const deleteObject = (x, y, drawnElements, setDrawnElements, canvasRef) => {
  setDrawnElements(prev => prev.map(element => {
    if (element.type === "Point") {
      if (Math.abs(element.x - x) < 5 && Math.abs(element.y - y) < 5) {
        return { ...element, isDeleted: true, needsUpdate: true };
      }
    } else if (element.type === "Segment" || element.type === "Line") {
      // Check if click is near the line/segment
      const x1 = element.x1 || element.start?.x;
      const y1 = element.y1 || element.start?.y;
      const x2 = element.x2 || element.end?.x;
      const y2 = element.y2 || element.end?.y;
      
      if (x1 && y1 && x2 && y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) param = dot / len_sq;

        let xx, yy;
        if (param < 0) {
          xx = x1;
          yy = y1;
        } else if (param > 1) {
          xx = x2;
          yy = y2;
        } else {
          xx = x1 + param * C;
          yy = y1 + param * D;
        }

        const distance = Math.sqrt((x - xx) * (x - xx) + (y - yy) * (y - yy));
        if (distance < 5) {
          return { ...element, isDeleted: true, needsUpdate: true };
        }
      }
    } else if (element.type === "Circle") {
      const distance = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
      if (Math.abs(distance - (element.radius || 50)) < 5) {
        return { ...element, isDeleted: true, needsUpdate: true };
      }
    }
    return element;
  }));
};

export const labelObject = (selectedElement, setDrawnElements) => {
  if (selectedElement && !selectedElement.isDeleted) {
    const newLabel = prompt("Enter new label:", selectedElement.label);
    if (newLabel !== null) {
      setDrawnElements(prev => prev.map(element => 
        element.id === selectedElement.id 
          ? { ...element, label: newLabel, needsUpdate: true }
          : element
      ));
    }
  }
};

export const toggleObjectVisibility = (element, setDrawnElements) => {
  if (element) {
    setDrawnElements(prev => prev.map(el => 
      el.id === element.id 
        ? { ...el, isHidden: !el.isHidden, needsUpdate: true }
        : el
    ));
  }
};
