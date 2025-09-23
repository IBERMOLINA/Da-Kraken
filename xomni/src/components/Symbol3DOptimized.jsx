import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, Cylinder, Sphere, Cone, Torus } from '@react-three/drei';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const SymbolContainer = styled(motion.div)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  position: relative;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 15px ${props => props.theme.colors.shadow};
    transform: scale(1.05);
  }
`;

// Optimized 3D Symbol Components with shared geometry
const MechanicalGear = ({ color = '#00ff88', rotating = true }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (rotating && meshRef.current) {
      meshRef.current.rotation.z += delta * 0.5;
    }
  });

  const gearGeometry = useMemo(() => {
    // Pre-calculate gear tooth positions
    const teeth = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 1.2;
      const y = Math.sin(angle) * 1.2;
      teeth.push({ x, y, angle });
    }
    return teeth;
  }, []);

  return (
    <group ref={meshRef}>
      {/* Main gear body */}
      <Cylinder args={[1, 1, 0.2, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Gear teeth - optimized with fewer teeth */}
      {gearGeometry.map((tooth, i) => (
        <Box key={i} args={[0.2, 0.3, 0.25]} position={[tooth.x, tooth.y, 0]}>
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </Box>
      ))}
      
      {/* Center hole */}
      <Cylinder args={[0.3, 0.3, 0.3, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Cylinder>
    </group>
  );
};

const MechanicalBolt = ({ color = '#00ff88' }) => {
  return (
    <group>
      {/* Bolt head */}
      <Cylinder args={[0.6, 0.6, 0.3, 6]} position={[0, 0, 0.3]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Bolt shaft */}
      <Cylinder args={[0.3, 0.3, 1.5, 6]} position={[0, 0, -0.4]}>
        <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Simplified thread lines */}
      {Array.from({ length: 4 }, (_, i) => (
        <Torus key={i} args={[0.35, 0.02, 3, 6]} position={[0, 0, -0.1 - i * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#333" />
        </Torus>
      ))}
    </group>
  );
};

const MechanicalCog = ({ color = '#00ff88', rotating = true }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (rotating && meshRef.current) {
      meshRef.current.rotation.z -= delta * 0.3;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Outer ring */}
      <Torus args={[1.2, 0.2, 6, 12]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Torus>
      
      {/* Inner spokes - reduced number */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 0.6;
        const y = Math.sin(angle) * 0.6;
        return (
          <Box key={i} args={[0.15, 1.2, 0.2]} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </Box>
        );
      })}
      
      {/* Center hub */}
      <Cylinder args={[0.4, 0.4, 0.3, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
};

const MechanicalFolder = ({ color = '#00ff88' }) => {
  return (
    <group>
      {/* Main folder body */}
      <Box args={[1.6, 1.2, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Folder tab */}
      <Box args={[0.8, 0.3, 0.12]} position={[-0.4, 0.45, 0.05]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Box>
      
      {/* Metal edges */}
      <Box args={[1.7, 0.05, 0.05]} position={[0, -0.6, 0.1]}>
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </Box>
    </group>
  );
};

const MechanicalSearch = ({ color = '#00ff88' }) => {
  return (
    <group>
      {/* Magnifying glass lens */}
      <Torus args={[0.6, 0.1, 6, 12]} position={[-0.2, 0.2, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Torus>
      
      {/* Glass surface */}
      <Cylinder args={[0.6, 0.6, 0.05, 12]} position={[-0.2, 0.2, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </Cylinder>
      
      {/* Handle */}
      <Cylinder args={[0.08, 0.08, 1, 6]} position={[0.6, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
    </group>
  );
};

const MechanicalRocket = ({ color = '#00ff88' }) => {
  return (
    <group>
      {/* Rocket body */}
      <Cylinder args={[0.4, 0.6, 1.5, 6]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cylinder>
      
      {/* Rocket nose cone */}
      <Cone args={[0.4, 0.6, 6]} position={[0, 0, 1.05]}>
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </Cone>
      
      {/* Simplified fins */}
      {Array.from({ length: 3 }, (_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        const x = Math.cos(angle) * 0.6;
        const y = Math.sin(angle) * 0.6;
        return (
          <Box key={i} args={[0.1, 0.5, 0.8]} position={[x, y, -0.6]} rotation={[0, 0, angle]}>
            <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
          </Box>
        );
      })}
      
      {/* Engine bell */}
      <Cone args={[0.3, 0.4, 6]} position={[0, 0, -1.1]} rotation={[Math.PI, 0, 0]}>
        <meshStandardMaterial color="#ff6b6b" metalness={0.9} roughness={0.1} />
      </Cone>
    </group>
  );
};

// Symbol type mapping
const symbolComponents = {
  gear: MechanicalGear,
  cog: MechanicalCog,
  bolt: MechanicalBolt,
  folder: MechanicalFolder,
  search: MechanicalSearch,
  rocket: MechanicalRocket,
  settings: MechanicalGear,
  develop: MechanicalBolt,
  test: MechanicalCog,
  optimize: MechanicalGear,
  deploy: MechanicalRocket,
};

const Symbol3DOptimized = ({ 
  type = 'gear', 
  size = '40px', 
  color, 
  rotating = true, 
  onClick,
  ...props 
}) => {
  const SymbolComponent = symbolComponents[type] || MechanicalGear;
  
  return (
    <SymbolContainer
      size={size}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <Canvas 
        camera={{ position: [0, 0, 3], fov: 50 }}
        gl={{ 
          antialias: false, 
          alpha: true, 
          powerPreference: "low-power",
          preserveDrawingBuffer: false
        }}
        dpr={1}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 2, 1]} intensity={0.8} />
        <pointLight position={[-2, -2, 1]} intensity={0.4} color="#00ff88" />
        
        <SymbolComponent 
          color={color} 
          rotating={rotating}
        />
      </Canvas>
    </SymbolContainer>
  );
};

export default Symbol3DOptimized;