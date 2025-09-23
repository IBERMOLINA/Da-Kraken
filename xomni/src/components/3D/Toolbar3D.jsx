import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import styled from 'styled-components';
import { 
  DevelopSymbol,
  OptimizeSymbol,
  EditSymbol,
  TestSymbol,
  DeploySymbol,
  PackageSymbol
} from './Symbol3D';

const Toolbar3DContainer = styled.div`
  width: 280px;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: relative;
`;

const ToolsCanvasContainer = styled.div`
  width: 240px;
  height: 400px;
  margin-top: 20px;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: 18px;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 10px ${props => props.theme.colors.glow};
`;

const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
  border-radius: 15px;
`;

export const Toolbar3D = ({ onToolClick }) => {
  const tools = [
    { 
      key: 'develop', 
      Component: DevelopSymbol, 
      position: [-1.5, 2, 0],
      title: 'Develop'
    },
    { 
      key: 'optimize', 
      Component: OptimizeSymbol, 
      position: [1.5, 2, 0],
      title: 'Optimize'
    },
    { 
      key: 'edit', 
      Component: EditSymbol, 
      position: [-1.5, 0, 0],
      title: 'Edit'
    },
    { 
      key: 'test', 
      Component: TestSymbol, 
      position: [1.5, 0, 0],
      title: 'Test'
    },
    { 
      key: 'deploy', 
      Component: DeploySymbol, 
      position: [-1.5, -2, 0],
      title: 'Deploy'
    },
    { 
      key: 'package', 
      Component: PackageSymbol, 
      position: [1.5, -2, 0],
      title: 'Package'
    }
  ];

  return (
    <Toolbar3DContainer>
      <SectionTitle>Tools</SectionTitle>
      
      <ToolsCanvasContainer>
        <StyledCanvas>
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            
            {/* Ambient lighting for the toolbar */}
            <ambientLight intensity={0.3} />
            
            {/* Directional light from top */}
            <directionalLight
              position={[2, 4, 2]}
              intensity={0.6}
              color="#ffffff"
              castShadow
            />
            
            {/* Under-lighting effects */}
            <spotLight
              position={[0, -4, 4]}
              angle={Math.PI / 2}
              penumbra={0.8}
              intensity={1.2}
              color="#00ff88"
              castShadow
            />
            
            {/* Side rim lighting */}
            <spotLight
              position={[-4, 0, 2]}
              angle={Math.PI / 4}
              penumbra={0.5}
              intensity={0.5}
              color="#4ecdc4"
            />
            <spotLight
              position={[4, 0, 2]}
              angle={Math.PI / 4}
              penumbra={0.5}
              intensity={0.5}
              color="#ff6b6b"
            />
            
            {/* Environment for reflections */}
            <Environment preset="studio" />
            
            {/* Tool symbols arranged in a grid */}
            {tools.map(({ key, Component, position, title }) => (
              <Component
                key={key}
                position={position}
                scale={0.7}
                onClick={() => onToolClick && onToolClick(key)}
                glowIntensity={0.8}
                floatSpeed={Math.random() * 0.5 + 0.5}
                floatRotationIntensity={Math.random() * 0.5 + 0.5}
                floatFloatIntensity={Math.random() * 0.5 + 0.5}
              />
            ))}
          </Suspense>
        </StyledCanvas>
      </ToolsCanvasContainer>
      
      {/* Floating particles effect */}
      <FloatingParticles />
    </Toolbar3DContainer>
  );
};

// Simple floating particles component for ambient effect
const FloatingParticles = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      background: `
        radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.1) 1px, transparent 1px),
        radial-gradient(circle at 80% 40%, rgba(78, 205, 196, 0.1) 1px, transparent 1px),
        radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px, 30px 30px, 70px 70px',
      animation: 'float 20s ease-in-out infinite'
    }} />
  );
};