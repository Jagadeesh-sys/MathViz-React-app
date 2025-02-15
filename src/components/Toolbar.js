import React from "react";
import { drawPoint, drawLine, drawSegment, drawPolygon, drawCircle } from "../tools/BasicTools";
import { selectObject, deleteObject, labelObject, toggleObjectVisibility } from "../tools/EditTools";
import { drawTangents, drawPerpendicularLine, drawParallelLine, drawAngleBisector, drawMidpoint } from "../tools/ConstructTools";

import "../styles/Toolbar.css";

// Importing images
import pointIcon from "../images/point.png";
import lineIcon from "../images/line.png";
import segmentIcon from "../images/segment.png";
import polygonIcon from "../images/polygon.png";
import circleIcon from "../images/circle.png";
import parallelIcon from "../images/parallel.png";
import perpendicularIcon from "../images/perpendicular.png";
import angleBisectorIcon from "../images/Anglebisector.png";
import midpointIcon from "../images/midpoint.png";
import tangentIcon from "../images/tangent.png";
import selectIcon from "../images/select.png";
import deleteIcon from "../images/delete.png";
import labelIcon from "../images/label.png";
import showHideIcon from "../images/hide object.png";

const toolSections = [
  {
    section: "Basic Tools",
    tools: [
      { name: "Point", icon: pointIcon, action: drawPoint },
      { name: "Line", icon: lineIcon, action: drawLine },
      { name: "Segment", icon: segmentIcon, action: drawSegment },
      { name: "Polygon", icon: polygonIcon, action: drawPolygon },
      { name: "Circle", icon: circleIcon, action: drawCircle },
    ],
  },
  {
    section: "Edit Tools",
    tools: [
      { name: "Select", icon: selectIcon, action: selectObject },
      { name: "Delete", icon: deleteIcon, action: deleteObject },
      { name: "Label", icon: labelIcon, action: labelObject },
      { name: "Show/Hide", icon: showHideIcon, action: toggleObjectVisibility },
    ],
  },
  {
    section: "Construct Tools",
    tools: [
      { name: "Midpoint", icon: midpointIcon, action: drawMidpoint },
      { name: "Perpendicular Line", icon: perpendicularIcon, action: drawPerpendicularLine },
      { name: "Parallel Line", icon: parallelIcon, action: drawParallelLine },
      { name: "Angle Bisector", icon: angleBisectorIcon, action: drawAngleBisector },
      { name: "Tangents", icon: tangentIcon, action: drawTangents },
    ],
  },
];

const Toolbar = ({ selectedTool, onSelectTool, onToolAction }) => {
  const handleToolSelect = (toolName, toolAction) => {
    onSelectTool(toolName);
    if (onToolAction && toolAction) {
      onToolAction(toolAction);
    }
  };

  return (
    <div className="toolbar">
      <h3 className="toolbar-title">Tools</h3>
      {toolSections.map((section) => (
        <div key={section.section} className="toolbar-section">
          <h4 className="section-title">{section.section}</h4>
          <div className="tools-container">
            {section.tools.map((tool) => (
              <div
                key={tool.name}
                className={`tool-icon ${selectedTool === tool.name ? "active" : ""}`}
                onClick={() => handleToolSelect(tool.name, tool.action)}
                title={tool.name}
              >
                <span className="icon">
                  <img src={tool.icon} alt={tool.name} className="tool-image" />
                </span>
                <span className="name">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toolbar;