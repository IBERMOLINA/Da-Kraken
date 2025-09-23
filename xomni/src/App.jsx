import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import MainInterface from './components/MainInterface';
import AgentPanel from './components/AgentPanel';
import SymbolDictionary from './components/SymbolDictionary';
import EnhancedSymbolDictionary from './components/EnhancedSymbolDictionary';
import StackManager from './components/StackManager';
import { SymbolicLogo } from './components/SymbolicLogo';
import { SymbolicNavigation } from './components/SymbolicNavigation';
import { SymbolicToolbar } from './components/SymbolicToolbar';
import { DarkTheme } from './utils/themes';
import { GlobalStyles } from './utils/globalStyles';

// Floating particles animation
const floatParticles = keyframes`
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  25% {
    transform: translateY(-10px) translateX(5px);
  }
  50% {
    transform: translateY(-5px) translateX(-3px);
  }
  75% {
    transform: translateY(-15px) translateX(8px);
  }
`;

const GlobalStyle = createGlobalStyle`
  ${GlobalStyles}
  
  /* Add floating particles animation */
  @keyframes float {
    ${floatParticles}
  }
`;

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  position: relative;
  
  /* Add subtle ambient glow effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 255, 136, 0.05) 0%,
      rgba(78, 205, 196, 0.03) 50%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  height: 60px;
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  position: relative;
  
  /* Add subtle glow effect */
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(0, 255, 136, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MainContent = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  position: relative;
  z-index: 1;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  /* Add subtle glow effect */
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
`;

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'agent':
        return <AgentPanel isOnline={isOnline} />;
      case 'symbols':
        return <EnhancedSymbolDictionary />;
      case 'stacks':
        return <StackManager />;
      default:
        return <MainInterface isOnline={isOnline} />;
    }
  };

  const handleToolClick = (toolKey) => {
    console.log(`Tool clicked: ${toolKey}`);
    // Add tool-specific functionality here
  };

  return (
    <ThemeProvider theme={DarkTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>
            <SymbolicLogo />
          </Logo>
          <SymbolicNavigation 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </Header>
        
        <MainContent>
          <Sidebar>
            <SymbolicToolbar onToolClick={handleToolClick} />
          </Sidebar>
          
          <ContentArea>
            {renderContent()}
          </ContentArea>
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;