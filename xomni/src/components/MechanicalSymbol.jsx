import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 3px rgba(0, 255, 136, 0.3)); }
  50% { filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.8)); }
`;

const SymbolContainer = styled(motion.div)`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 8px 16px rgba(0, 0, 0, 0.4),
      0 0 20px ${props => props.theme.colors.shadow};
    
    &:before {
      left: 100%;
    }
    
    .symbol-icon {
      animation: ${glow} 2s ease-in-out infinite;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
`;

const SymbolIcon = styled.div`
  font-size: ${props => {
    const sizeNum = parseInt(props.size) || 40;
    return `${Math.floor(sizeNum * 0.6)}px`;
  }};
  color: ${props => props.color || props.theme.colors.primary};
  transition: all ${props => props.theme.transitions.normal};
  animation: ${props => props.rotating ? rotate : 'none'} 10s linear infinite;
  filter: drop-shadow(0 0 3px rgba(0, 255, 136, 0.3));
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
`;

// Enhanced mechanical symbols mapping
const symbolMap = {
  gear: '⚙️',
  cog: '🔧', 
  bolt: '⚡',
  folder: '📁',
  search: '🔍',
  rocket: '🚀',
  settings: '⚙️',
  develop: '⚡',
  test: '🧪',
  optimize: '🔧',
  deploy: '🚀',
  // Additional mechanical symbols
  wrench: '🔧',
  hammer: '🔨',
  screwdriver: '🪛',
  nut: '🔩',
  chain: '⛓️',
  spring: '🌀',
  piston: '🔌',
  engine: '🏭',
  factory: '🏭',
  robot: '🤖',
  circuit: '🔌',
  battery: '🔋',
  electric: '⚡',
  mechanical: '⚙️',
  industrial: '🏭',
  automation: '🤖',
};

const MechanicalSymbol = ({ 
  type = 'gear', 
  size = '40px', 
  color, 
  rotating = false, 
  onClick,
  className = '',
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const symbol = symbolMap[type] || symbolMap.gear;
  
  return (
    <SymbolContainer
      size={size}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`mechanical-symbol ${className}`}
      {...props}
    >
      <SymbolIcon 
        className="symbol-icon"
        size={size}
        color={color}
        rotating={rotating || isHovered}
      >
        {symbol}
      </SymbolIcon>
    </SymbolContainer>
  );
};

export default MechanicalSymbol;