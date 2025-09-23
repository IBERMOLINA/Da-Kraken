import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FloatingSymbol } from './FloatingSymbols';

const orbit = keyframes`
  0% { transform: rotate(0deg) translateX(30px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  height: 60px;
`;

const LogoSymbolContainer = styled.div`
  position: relative;
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CentralSymbol = styled.div`
  position: relative;
  z-index: 2;
`;

const OrbitingSymbol = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  animation: ${orbit} ${props => props.duration || '4s'} linear infinite;
  animation-delay: ${props => props.delay || '0s'};
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${props => props.color || '#4ecdc4'};
    border-radius: 50%;
    box-shadow: 0 0 15px currentColor;
  }
`;

const LogoText = styled.div`
  color: ${props => props.theme.colors.primary};
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px ${props => props.theme.colors.glow};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, 
      ${props => props.theme.colors.primary}20,
      ${props => props.theme.colors.accent}20
    );
    border-radius: 8px;
    z-index: -1;
    filter: blur(8px);
  }
`;

export const SymbolicLogo = () => {
  return (
    <LogoContainer>
      <LogoSymbolContainer>
        {/* Central core symbol */}
        <CentralSymbol>
          <FloatingSymbol
            shape="crystal"
            color="#00ff88"
            hoverColor="#4ecdc4"
            size="50px"
            floatDuration="2s"
          />
        </CentralSymbol>
        
        {/* Orbiting particles */}
        <OrbitingSymbol 
          color="#ff6b6b" 
          duration="3s" 
          delay="0s"
        />
        <OrbitingSymbol 
          color="#4ecdc4" 
          duration="4s" 
          delay="1s"
        />
        <OrbitingSymbol 
          color="#ffa500" 
          duration="5s" 
          delay="2s"
        />
      </LogoSymbolContainer>
      
      <LogoText>xomni</LogoText>
    </LogoContainer>
  );
};