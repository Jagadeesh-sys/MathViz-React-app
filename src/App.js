import React, { useState, useEffect } from "react";
import './App.css';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import GraphArea from './components/GraphArea';
import GeometryArea from './components/GeometryArea';
import HomePage from './components/HomePage';
import InputBar from './components/Inputbar';
import Toolbar from './components/Toolbar';
import ThreeDGraphArea from './components/3DGraphArea';
import DistributionBar from './components/DistributionBar';
import DistributionArea from './components/DistributionArea';
import TableBar from './components/TableBar';
import ExportPreviewModal from './components/ExportPreviewModal';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ThreeDToolbar from './components/3DToolbar';
import SpreadsheetArea from './components/SpreadsheetArea';
import ResourcesPage from './components/ResourcesPage';

const App = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [equations, setEquations] = useState([]);
  const [points, setPoints] = useState([]); // State for points
  const [visibleComponent, setVisibleComponent] = useState("");
  const [selectedArea, setSelectedArea] = useState("graphing");
  const [selectedTool, setSelectedTool] = useState(null);
  const [distributionParams, setDistributionParams] = useState({
    distribution: "Normal",
    parameters: { mean: 0, stdDev: 1 },
    intervals: { start: -3, end: 3 },
  });
  const [exportPreview, setExportPreview] = useState(null);
  const [exportHandler, setExportHandler] = useState(null);
  const [geometryShapes, setGeometryShapes] = useState([]);
  const [tableData, setTableData] = useState([]);

  const handleStartCalculator = () => setShowCalculator(true);

  const handleInputSubmit = (equation) =>
    setEquations([...equations, { value: equation, isEditing: false }]);

  const handleEquationDelete = (index) =>
    setEquations(equations.filter((_, i) => i !== index));

  const handleEquationEdit = (index, newEquation) => {
    const updatedEquations = [...equations];
    updatedEquations[index] = { ...updatedEquations[index], value: newEquation, isEditing: false };
    setEquations(updatedEquations);
  };

  const handleStartEditEquation = (index) => {
    const updatedEquations = [...equations];
    updatedEquations[index].isEditing = true;
    setEquations(updatedEquations);
  };

  const handleAlgebraClick = () =>
    setVisibleComponent(visibleComponent === "inputBar" ? "" : "inputBar");

  const handleToolsClick = () => {
    setVisibleComponent(visibleComponent === "toolbar" ? "" : "toolbar");
  };

  const handleDistributionClick = () =>
    setVisibleComponent(visibleComponent === "distributionBar" ? "" : "distributionBar");

  const handleTableClick = () =>
    setVisibleComponent(visibleComponent === "tableBar" ? "" : "tableBar");

  const handleSpreadsheetClick = () =>
    setVisibleComponent(visibleComponent === "spreadsheet" ? "" : "spreadsheet");

  const handleSelectTool = (toolName) => setSelectedTool(toolName);

  const handleAreaChange = (area) => setSelectedArea(area);

  const handleDistributionUpdate = (distribution, parameters, intervals) =>
    setDistributionParams({ distribution, parameters, intervals });

  const handleAddPoint = (point) => {
    setTableData(prevData => [...prevData, {
      x: point.x,
      y: point.y,
      label: point.label
    }]);
  };

  const handleClearPoints = () => {
    setTableData([]);
  };

  const saveGraphToFile = () => {
    let dataToSave = {};
    let filename = '';

    switch (selectedArea) {
      case 'graphing':
        dataToSave = {
          type: 'graphing',
          equations: equations,
          points: points,
          timestamp: new Date().toISOString()
        };
        filename = 'graph-data.json';
        break;

      case 'geometry':
        dataToSave = {
          type: 'geometry',
          equations: equations,
          shapes: geometryShapes || [],
          timestamp: new Date().toISOString()
        };
        filename = 'geometry-data.json';
        break;

      case '3dgraph':
        dataToSave = {
          type: '3dgraph',
          equations: equations,
          timestamp: new Date().toISOString()
        };
        filename = '3dgraph-data.json';
        break;

      default:
        console.warn('Unknown area type');
        return;
    }

    // Create and trigger download
    const jsonString = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const loadGraphFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data type matches current area
        if (data.type !== selectedArea) {
          alert(`This file is for ${data.type} area. Please switch to the correct area to load it.`);
          return;
        }

        // Load data based on type
        switch (data.type) {
          case 'graphing':
            if (data.equations) setEquations(data.equations);
            if (data.points) setPoints(data.points);
            break;

          case 'geometry':
            if (data.equations) setEquations(data.equations);
            if (data.shapes) setGeometryShapes(data.shapes);
            break;

          case '3dgraph':
            if (data.equations) setEquations(data.equations);
            break;

          default:
            console.warn('Unknown data type in file');
        }
      } catch (error) {
        console.error('Error loading file:', error);
        alert('Error loading file. Please make sure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportPreview = (handler) => {
    if (typeof handler === 'function') {
      setExportHandler(() => handler);
    } else if (handler === null) {
      setExportHandler(null);
    } else {
      setExportPreview(handler);
    }
  };

  const handleClosePreview = () => {
    setExportPreview(null);
  };

  const handleDownloadPreview = () => {
    if (exportPreview) {
      const link = document.createElement("a");
      link.href = exportPreview;
      link.download = `${selectedArea}-export.png`;
      link.click();
      handleClosePreview();
    }
  };

  const onToolAction = (toolName) => {
    if (toolName === "segment") {
      console.log("Segment tool activated.");
    } else {
      console.log(`Tool "${toolName}" selected.`);
    }
  };

  useEffect(() => {
    return () => console.log("Cleanup logic");
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar 
          onCalculatorTypeChange={handleAreaChange}
          onSaveGraph={saveGraphToFile}
          onLoadGraph={loadGraphFromFile}
          onExportPreview={() => {
            if (exportHandler) {
              exportHandler();
            }
          }}
        />
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route
            path="/"
            element={
              showCalculator ? (
                <div className="main-content">
                  <Sidebar
                    selectedOption={selectedArea}
                    onAlgebraClick={handleAlgebraClick}
                    onToolsClick={handleToolsClick}
                    onDistributionClick={handleDistributionClick}
                    onTableClick={handleTableClick}
                    onSpreadsheetClick={handleSpreadsheetClick}
                  />
                  {visibleComponent === "inputBar" && (
                    <InputBar
                      equations={equations}
                      onInputSubmit={handleInputSubmit}
                      onEquationDelete={handleEquationDelete}
                      onEquationEdit={handleEquationEdit}
                      onStartEditEquation={handleStartEditEquation}
                    />
                  )}
                  {selectedArea === "graphing" && (
                    <GraphArea 
                      equations={equations} 
                      selectedTool={selectedTool} 
                      points={points} 
                      tableData={tableData}
                      onAddPoint={handleAddPoint}
                      onClearPoints={handleClearPoints}
                      onExportPreview={handleExportPreview}
                    />
                  )}
                  {selectedArea === "geometry" && (
                    <GeometryArea 
                      selectedTool={selectedTool} 
                      equations={equations}
                      shapes={geometryShapes}
                      onExportPreview={handleExportPreview}
                    />
                  )}
                  {selectedArea === "3dgraph" && (
                    <ThreeDGraphArea 
                      equations={equations}
                      onExportPreview={handleExportPreview}
                    />
                  )}
                  {selectedArea === "distribution" && (
                    <DistributionArea 
                      {...distributionParams}
                      onExportPreview={handleExportPreview}
                    />
                  )}
                  {visibleComponent === "toolbar" && selectedArea !== "3dgraph" && (
                    <Toolbar
                      onSelectTool={handleSelectTool}
                      selectedTool={selectedTool}
                      onToolAction={onToolAction}
                    />
                  )}
                  {visibleComponent === "toolbar" && selectedArea === "3dgraph" && (
                    <ThreeDToolbar
                      onSelectTool={handleSelectTool}
                      selectedTool={selectedTool}
                    />
                  )}
                  {visibleComponent === "distributionBar" && <DistributionBar onUpdate={handleDistributionUpdate} />}
                  {visibleComponent === "tableBar" && (
                    <TableBar 
                      onAddPoint={handleAddPoint} 
                      onClearPoints={handleClearPoints}
                      tableData={tableData}
                    />
                  )}
                  {visibleComponent === "spreadsheet" && (
                    <SpreadsheetArea />
                  )}
                </div>
              ) : (
                <HomePage onStartCalculator={handleStartCalculator} />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {exportPreview && (
          <ExportPreviewModal
            isOpen={!!exportPreview}
            imageData={exportPreview}
            onDownload={handleDownloadPreview}
            onClose={handleClosePreview}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
