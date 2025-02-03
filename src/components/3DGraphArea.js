import React, { useRef, useEffect, useCallback, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { evaluate } from "mathjs";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import PropTypes from "prop-types";
import "../styles/3DGraphArea.css";

const GraphArea3D = ({ equations, onExportPreview }) => {
  const graphContainerRef = useRef(null);
  const [renderer, setRenderer] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);

  // Handle export with proper scene rendering
  const handleExport = useCallback(() => {
    if (!renderer || !scene || !camera) return;

    // Ensure the scene is rendered
    renderer.render(scene, camera);

    // Get the data URL
    const dataUrl = renderer.domElement.toDataURL('image/png');
    onExportPreview(dataUrl);
  }, [renderer, scene, camera, onExportPreview]);

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

  useEffect(() => {
    const container = graphContainerRef.current;
    if (!container) return;

    // Scene setup
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0xffffff); // White background
    setScene(newScene);

    // Camera setup
    const newCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    newCamera.position.set(5, 5, 10);
    setCamera(newCamera);

    // Renderer setup
    const newRenderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true, // Important for taking screenshots
      alpha: true // Enable transparency
    });
    newRenderer.setPixelRatio(window.devicePixelRatio); // For sharp rendering
    newRenderer.setClearColor(0xffffff, 1); // White background
    newRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Controls
    const controls = new OrbitControls(newCamera, newRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;

    // Add lights for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    newScene.add(directionalLight);

    // Grid helper with lighter color
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    newScene.add(gridHelper);

    // Axes with better colors
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.geometry.attributes.color.array.set([
      1, 0, 0, 1, 0, 0,  // X axis - red
      0, 0.7, 0, 0, 0.7, 0,  // Y axis - green
      0, 0, 1, 0, 0, 1   // Z axis - blue
    ]);
    axesHelper.geometry.attributes.color.needsUpdate = true;
    newScene.add(axesHelper);

    // Load font for labels
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font) => {
        // X-Axis Label
        const xGeometry = new TextGeometry("X", {
          font: font,
          size: 0.5,
          height: 0.1,
        });
        const xMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const xLabel = new THREE.Mesh(xGeometry, xMaterial);
        xLabel.position.set(10, 0, 0); // Position at the end of X-axis
        newScene.add(xLabel);

        // Y-Axis Label
        const yGeometry = new TextGeometry("Y", {
          font: font,
          size: 0.5,
          height: 0.1,
        });
        const yMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const yLabel = new THREE.Mesh(yGeometry, yMaterial);
        yLabel.position.set(0, 10, 0); // Position at the end of Y-axis
        newScene.add(yLabel);

        // Z-Axis Label (optional)
        const zGeometry = new TextGeometry("Z", {
          font: font,
          size: 0.5,
          height: 0.1,
        });
        const zMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const zLabel = new THREE.Mesh(zGeometry, zMaterial);
        zLabel.position.set(0, 0, 10); // Position at the end of Z-axis
        newScene.add(zLabel);
      }
    );

    const darkColors = [
      new THREE.Color(0x00008b),
      new THREE.Color(0x8b0000),
      new THREE.Color(0x006400),
      new THREE.Color(0x000000),
    ];

    const plot3DGraph = (equation, color) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const size = 7;
      const step = 0.1;

      try {
        for (let x = -size; x <= size; x += step) {
          for (let z = -size; z <= size; z += step) {
            const y = evaluate(equation, { x, z });
            vertices.push(x, y, z);
          }
        }

        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vertices, 3)
        );

        const material = new THREE.PointsMaterial({ color: color, size: 0.1 });
        const points = new THREE.Points(geometry, material);
        newScene.add(points);
      } catch (error) {
        console.error("Error plotting graph: ", error);
      }
    };

    equations.forEach((eq, index) => {
      const color = darkColors[index % darkColors.length];
      plot3DGraph(eq.value, color);
    });

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      newRenderer.render(newScene, newCamera);
    };

    animate();

    return () => {
      controls.dispose();
      while (container.firstChild) {
        container.firstChild.remove();
      }
      newRenderer.dispose();
    };
  }, [equations]);

  return <div ref={graphContainerRef} className="graph-area-3d" />;
};

GraphArea3D.propTypes = {
  equations: PropTypes.array,
  onExportPreview: PropTypes.func,
};

export default GraphArea3D;
