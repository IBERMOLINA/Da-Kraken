import React from 'react';
import styled from 'styled-components';
import { 
  DevelopSymbol,
  OptimizeSymbol,
  EditSymbol,
  TestSymbol,
  DeploySymbol,
  PackageSymbol
} from './FloatingSymbols';

const ToolbarContainer = styled.div`
  width: 280px;
  height: 100%;
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: relative;
  overflow: hidden;
  
  /* Add subtle gradient overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 255, 136, 0.05) 0%,
      rgba(78, 205, 196, 0.03) 50%,
      rgba(255, 107, 107, 0.05) 100%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: 18px;
  margin: 0 0 30px 0;
  text-align: center;
  text-shadow: 0 0 10px ${props => props.theme.colors.glow};
  position: relative;
  z-index: 1;
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
`;

const FloatingParticles = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: 
    radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 80% 40%, rgba(78, 205, 196, 0.1) 1px, transparent 1px),
    radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.1) 1.5px, transparent 1.5px);
  background-size: 50px 50px, 30px 30px, 70px 70px;
  animation: float 20s ease-in-out infinite;
  z-index: 0;
`;

export const SymbolicToolbar = ({ onToolClick }) => {
  const tools = [
    { key: 'develop', Component: DevelopSymbol },
    { key: 'optimize', Component: OptimizeSymbol },
    { key: 'edit', Component: EditSymbol },
    { key: 'test', Component: TestSymbol },
    { key: 'deploy', Component: DeploySymbol },
    { key: 'package', Component: PackageSymbol }
  ];

  return (
    <ToolbarContainer>
      <FloatingParticles />
      <SectionTitle>Tools</SectionTitle>
      
      <ToolsGrid>
        {tools.map(({ key, Component }) => (
          <Component
            key={key}
            onClick={() => onToolClick && onToolClick(key)}
          />
        ))}
      </ToolsGrid>
    </ToolbarContainer>
  );
};