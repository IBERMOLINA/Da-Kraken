import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import styled from 'styled-components';
import { 
  HomeSymbol, 
  AgentSymbol, 
  SymbolsSymbol, 
  StacksSymbol 
} from './Symbol3D';

const Navigation3DContainer = styled.div`
  width: 400px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
`;

export const Navigation3D = ({ currentView, onViewChange }) => {
  const navigationItems = [
    { 
      key: 'main', 
      Component: HomeSymbol, 
      position: [-3, 0, 0],
      title: 'Home'
    },
    { 
      key: 'agent', 
      Component: AgentSymbol, 
      position: [-1, 0, 0],
      title: 'Agent'
    },
    { 
      key: 'symbols', 
      Component: SymbolsSymbol, 
      position: [1, 0, 0],
      title: 'Symbols'
    },
    { 
      key: 'stacks', 
      Component: StacksSymbol, 
      position: [3, 0, 0],
      title: 'Stacks'
    }
  ];

  return (
    <Navigation3DContainer>
      <StyledCanvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          
          {/* Ambient lighting */}
          <ambientLight intensity={0.2} />
          
          {/* Main directional light */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.5}
            color="#ffffff"
            castShadow
          />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {/* Navigation symbols */}
          {navigationItems.map(({ key, Component, position, title }) => (
            <Component
              key={key}
              position={position}
              scale={currentView === key ? 0.8 : 0.6}
              onClick={() => onViewChange(key)}
              glowIntensity={currentView === key ? 1.2 : 0.5}
              floatSpeed={currentView === key ? 1.5 : 1}
            />
          ))}
          
          {/* Under-lighting effect */}
          <spotLight
            position={[0, -2, 2]}
            angle={Math.PI / 3}
            penumbra={0.5}
            intensity={0.8}
            color="#00ff88"
            castShadow
          />
          
          <OrbitControls 
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Suspense>
      </StyledCanvas>
    </Navigation3DContainer>
  );
};