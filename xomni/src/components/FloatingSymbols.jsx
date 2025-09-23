import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Floating animation keyframes
const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(5deg);
  }
  50% {
    transform: translateY(-4px) rotate(-3deg);
  }
  75% {
    transform: translateY(-12px) rotate(8deg);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px currentColor;
  }
  50% {
    box-shadow: 0 0 40px currentColor, 0 0 60px currentColor;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Base Symbol Component with CSS-based 3D effects
const SymbolContainer = styled.div`
  position: relative;
  width: ${props => props.size || '60px'};
  height: ${props => props.size || '60px'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  
  &:hover .symbol-shape {
    animation: ${pulse} 0.3s ease-in-out;
    transform: scale(1.1) rotateY(15deg);
  }
`;

const SymbolShape = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: ${float} ${props => props.floatDuration || '3s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  transition: all 0.3s ease;
  
  ${props => props.shape === 'cube' && css`
    background: linear-gradient(45deg, ${props.color}, ${props.hoverColor});
    border-radius: 8px;
    box-shadow: 
      0 0 20px ${props.color}40,
      inset 0 0 20px ${props.color}20;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, ${props.color}, ${props.hoverColor});
      border-radius: 10px;
      z-index: -1;
      filter: blur(8px);
      opacity: 0.7;
    }
  `}
  
  ${props => props.shape === 'sphere' && css`
    background: radial-gradient(circle at 30% 30%, ${props.hoverColor}, ${props.color});
    border-radius: 50%;
    box-shadow: 
      0 0 30px ${props.color}60,
      inset -10px -10px 20px ${props.color}40;
    
    &::before {
      content: '';
      position: absolute;
      top: 15%;
      left: 25%;
      width: 30%;
      height: 30%;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      filter: blur(4px);
    }
  `}
  
  ${props => props.shape === 'pyramid' && css`
    background: linear-gradient(135deg, ${props.color}, ${props.hoverColor});
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    box-shadow: 
      0 0 25px ${props.color}50,
      inset 0 -10px 20px ${props.color}30;
  `}
  
  ${props => props.shape === 'crystal' && css`
    background: linear-gradient(45deg, ${props.color}, ${props.hoverColor});
    clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    box-shadow: 
      0 0 35px ${props.color}70,
      inset 0 0 20px rgba(255, 255, 255, 0.2);
  `}
  
  ${props => props.shape === 'ring' && css`
    background: conic-gradient(${props.color}, ${props.hoverColor}, ${props.color});
    border-radius: 50%;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 25%;
      left: 25%;
      width: 50%;
      height: 50%;
      background: ${props.theme.colors.background};
      border-radius: 50%;
      box-shadow: inset 0 0 20px ${props.color}40;
    }
  `}
  
  ${props => props.shape === 'diamond' && css`
    background: linear-gradient(45deg, ${props.color}, ${props.hoverColor});
    transform: rotate(45deg);
    border-radius: 8px;
    box-shadow: 
      0 0 30px ${props.color}60,
      inset 0 0 15px rgba(255, 255, 255, 0.2);
  `}
`;

const UnderLighting = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 10px;
  background: radial-gradient(ellipse, ${props => props.color}40, transparent);
  border-radius: 50%;
  animation: ${glow} 2s ease-in-out infinite;
  filter: blur(8px);
`;

export const FloatingSymbol = ({ 
  shape = 'cube',
  color = '#00ff88',
  hoverColor = '#4ecdc4',
  size = '60px',
  onClick,
  floatDuration = '3s',
  delay = '0s',
  title = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <SymbolContainer 
      size={size}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      title={title}
      {...props}
    >
      <SymbolShape
        className="symbol-shape"
        shape={shape}
        color={color}
        hoverColor={hoverColor}
        floatDuration={floatDuration}
        delay={delay}
        isHovered={isHovered}
      />
      <UnderLighting color={isHovered ? hoverColor : color} />
    </SymbolContainer>
  );
};

// Specific symbol components
export const HomeSymbol = (props) => (
  <FloatingSymbol 
    shape="cube" 
    color="#00ff88" 
    hoverColor="#4ecdc4"
    title="Home"
    {...props} 
  />
);

export const AgentSymbol = (props) => (
  <FloatingSymbol 
    shape="sphere" 
    color="#ff6b6b" 
    hoverColor="#ff8a80"
    title="AI Agent"
    floatDuration="2.5s"
    {...props} 
  />
);

export const SymbolsSymbol = (props) => (
  <FloatingSymbol 
    shape="crystal" 
    color="#4ecdc4" 
    hoverColor="#26c6da"
    title="Symbols"
    delay="0.5s"
    {...props} 
  />
);

export const StacksSymbol = (props) => (
  <FloatingSymbol 
    shape="pyramid" 
    color="#ffa500" 
    hoverColor="#ffb74d"
    title="Stacks"
    delay="1s"
    {...props} 
  />
);

export const DevelopSymbol = (props) => (
  <FloatingSymbol 
    shape="diamond" 
    color="#9c27b0" 
    hoverColor="#ba68c8"
    title="Develop"
    size="50px"
    {...props} 
  />
);

export const TestSymbol = (props) => (
  <FloatingSymbol 
    shape="crystal" 
    color="#ff9800" 
    hoverColor="#ffb74d"
    title="Test"
    size="50px"
    delay="0.3s"
    {...props} 
  />
);

export const OptimizeSymbol = (props) => (
  <FloatingSymbol 
    shape="sphere" 
    color="#03dac6" 
    hoverColor="#4dd0e1"
    title="Optimize"
    size="50px"
    delay="0.6s"
    {...props} 
  />
);

export const DeploySymbol = (props) => (
  <FloatingSymbol 
    shape="ring" 
    color="#ff5722" 
    hoverColor="#ff7043"
    title="Deploy"
    size="50px"
    delay="0.9s"
    {...props} 
  />
);

export const EditSymbol = (props) => (
  <FloatingSymbol 
    shape="diamond" 
    color="#2196f3" 
    hoverColor="#42a5f5"
    title="Edit"
    size="50px"
    delay="1.2s"
    {...props} 
  />
);

export const PackageSymbol = (props) => (
  <FloatingSymbol 
    shape="cube" 
    color="#795548" 
    hoverColor="#8d6e63"
    title="Package"
    size="50px"
    delay="1.5s"
    {...props} 
  />
);