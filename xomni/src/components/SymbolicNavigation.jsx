import React from 'react';
import styled from 'styled-components';
import { 
  HomeSymbol, 
  AgentSymbol, 
  SymbolsSymbol, 
  StacksSymbol 
} from './FloatingSymbols';

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const SymbolWrapper = styled.div`
  position: relative;
  
  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${props.theme.colors.primary}, transparent);
      border-radius: 1px;
      box-shadow: 0 0 10px ${props.theme.colors.primary};
    }
  `}
`;

export const SymbolicNavigation = ({ currentView, onViewChange }) => {
  const navigationItems = [
    { 
      key: 'main', 
      Component: HomeSymbol,
      size: currentView === 'main' ? '70px' : '60px'
    },
    { 
      key: 'agent', 
      Component: AgentSymbol,
      size: currentView === 'agent' ? '70px' : '60px'
    },
    { 
      key: 'symbols', 
      Component: SymbolsSymbol,
      size: currentView === 'symbols' ? '70px' : '60px'
    },
    { 
      key: 'stacks', 
      Component: StacksSymbol,
      size: currentView === 'stacks' ? '70px' : '60px'
    }
  ];

  return (
    <NavigationContainer>
      {navigationItems.map(({ key, Component, size }) => (
        <SymbolWrapper key={key} active={currentView === key}>
          <Component
            size={size}
            onClick={() => onViewChange(key)}
            floatDuration={currentView === key ? '2s' : '3s'}
          />
        </SymbolWrapper>
      ))}
    </NavigationContainer>
  );
};