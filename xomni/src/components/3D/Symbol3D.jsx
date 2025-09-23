import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Base 3D Symbol component with floating animations and lighting
export const Symbol3D = ({ 
  type = 'cube', 
  color = '#00ff88', 
  position = [0, 0, 0], 
  scale = 1,
  onClick,
  hoverColor = '#4ecdc4',
  floatSpeed = 1,
  floatRotationIntensity = 1,
  floatFloatIntensity = 1,
  glowIntensity = 0.5,
  ...props 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);

  // Dynamic material with glow effect
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: hovered ? hoverColor : color,
      emissive: hovered ? new THREE.Color(hoverColor).multiplyScalar(glowIntensity) : new THREE.Color(color).multiplyScalar(glowIntensity * 0.3),
      emissiveIntensity: hovered ? 0.4 : 0.2,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
  }, [color, hoverColor, hovered, glowIntensity]);

  // Animation frame updates
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Subtle pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.9;
      material.emissiveIntensity = hovered ? 0.4 * pulse : 0.2 * pulse;
    }
  });

  // Render different geometries based on type
  const renderGeometry = () => {
    switch (type) {
      case 'sphere':
        return <sphereGeometry args={[1, 32, 32]} />;
      case 'cube':
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case 'pyramid':
        return <coneGeometry args={[1, 2, 4]} />;
      case 'crystal':
        return <octahedronGeometry args={[1.2]} />;
      case 'torus':
        return <torusGeometry args={[1, 0.4, 16, 32]} />;
      case 'wobble':
        return <sphereGeometry args={[1, 16, 16]} />;
      case 'distort':
        return <icosahedronGeometry args={[1, 2]} />;
      case 'ring':
        return <ringGeometry args={[0.5, 1.2, 32]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1]} />;
      case 'tetrahedron':
        return <tetrahedronGeometry args={[1.2]} />;
      default:
        return <boxGeometry args={[1.5, 1.5, 1.5]} />;
    }
  };

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={floatRotationIntensity}
      floatIntensity={floatFloatIntensity}
    >
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? scale * 1.1 : scale}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        material={material}
        {...props}
      >
        {renderGeometry()}
      </mesh>
      
      {/* Ambient lighting effect around the symbol */}
      <pointLight
        position={[position[0], position[1] + 2, position[2] + 1]}
        color={color}
        intensity={hovered ? 0.8 : 0.4}
        distance={8}
        decay={2}
      />
    </Float>
  );
};

// Specific symbol components with predefined meanings
export const HomeSymbol = (props) => (
  <Symbol3D 
    type="cube" 
    color="#00ff88" 
    hoverColor="#4ecdc4"
    {...props} 
  />
);

export const AgentSymbol = (props) => (
  <Symbol3D 
    type="sphere" 
    color="#ff6b6b" 
    hoverColor="#ff8a80"
    floatSpeed={1.5}
    {...props} 
  />
);

export const SymbolsSymbol = (props) => (
  <Symbol3D 
    type="crystal" 
    color="#4ecdc4" 
    hoverColor="#26c6da"
    floatRotationIntensity={2}
    {...props} 
  />
);

export const StacksSymbol = (props) => (
  <Symbol3D 
    type="pyramid" 
    color="#ffa500" 
    hoverColor="#ffb74d"
    floatFloatIntensity={2}
    {...props} 
  />
);

export const DevelopSymbol = (props) => (
  <Symbol3D 
    type="wobble" 
    color="#9c27b0" 
    hoverColor="#ba68c8"
    {...props} 
  />
);

export const TestSymbol = (props) => (
  <Symbol3D 
    type="tetrahedron" 
    color="#ff9800" 
    hoverColor="#ffb74d"
    floatSpeed={2}
    {...props} 
  />
);

export const OptimizeSymbol = (props) => (
  <Symbol3D 
    type="dodecahedron" 
    color="#03dac6" 
    hoverColor="#4dd0e1"
    {...props} 
  />
);

export const DeploySymbol = (props) => (
  <Symbol3D 
    type="torus" 
    color="#ff5722" 
    hoverColor="#ff7043"
    floatRotationIntensity={3}
    {...props} 
  />
);

export const EditSymbol = (props) => (
  <Symbol3D 
    type="ring" 
    color="#2196f3" 
    hoverColor="#42a5f5"
    {...props} 
  />
);

export const PackageSymbol = (props) => (
  <Symbol3D 
    type="distort" 
    color="#795548" 
    hoverColor="#8d6e63"
    floatSpeed={0.5}
    {...props} 
  />
);