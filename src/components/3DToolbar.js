import React from 'react';
import '../styles/Toolbar.css';
import { 
  FaMousePointer,
  FaDotCircle,
  FaCaretUp,
  FaCube,
  FaCircle,
  FaDrawPolygon,
  FaVectorSquare,
  FaLayerGroup,
  FaEye,
  FaFont,
  FaEraser,
  FaCamera,
  FaCrosshairs,
  FaArrowsAlt,
  FaRuler
} from 'react-icons/fa';

const ThreeDToolbar = ({ onSelectTool, selectedTool }) => {
  const toolCategories = [
    {
      title: "Basic Tools",
      tools: [
        { name: 'move', icon: <FaMousePointer />, tooltip: 'Move' },
        { name: 'point', icon: <FaDotCircle />, tooltip: 'Point' },
        { name: 'pyramid', icon: <FaCaretUp />, tooltip: 'Pyramid' },
        { name: 'cube', icon: <FaCube />, tooltip: 'Cube' },
        { name: 'sphere', icon: <FaCircle />, tooltip: 'Sphere: Center & Point' },
        { name: 'plane3points', icon: <FaDrawPolygon />, tooltip: 'Plane through 3 Points' },
        { name: 'intersect', icon: <FaVectorSquare />, tooltip: 'Intersect Two Surfaces' },
        { name: 'net', icon: <FaLayerGroup />, tooltip: 'Net' }
      ]
    },
    {
      title: "Edit",
      tools: [
        { name: 'showLabel', icon: <FaFont />, tooltip: 'Show / Hide Label' },
        { name: 'showObject', icon: <FaEye />, tooltip: 'Show / Hide Object' },
        { name: 'delete', icon: <FaEraser />, tooltip: 'Delete' },
        { name: 'viewFront', icon: <FaCamera />, tooltip: 'View in front of' }
      ]
    },
    {
      title: "Points",
      tools: [
        { name: 'point', icon: <FaDotCircle />, tooltip: 'Point' },
        { name: 'intersectPoint', icon: <FaCrosshairs />, tooltip: 'Intersect' },
        { name: 'midpoint', icon: <FaArrowsAlt />, tooltip: 'Midpoint or Center' },
        { name: 'attachDetach', icon: <FaRuler />, tooltip: 'Attach / Detach Point' }
      ]
    }
  ];

  return (
    <div className="toolbar">
      {toolCategories.map((category, index) => (
        <div key={index} className="toolbar-category">
          <h3>{category.title}</h3>
          <div className="tools-grid">
            {category.tools.map((tool) => (
              <button
                key={tool.name}
                className={`tool-button ${selectedTool === tool.name ? 'selected' : ''}`}
                onClick={() => onSelectTool(tool.name)}
                title={tool.tooltip}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThreeDToolbar; 