import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import MainInterface from './components/MainInterface';
import AgentPanel from './components/AgentPanel';
import SymbolDictionary from './components/SymbolDictionary';
import StackManager from './components/StackManager';
import MechanicalSymbol from './components/MechanicalSymbol';
import { DarkTheme } from './utils/themes';
import { GlobalStyles } from './utils/globalStyles';

const GlobalStyle = createGlobalStyle`${GlobalStyles}`;

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  overflow: hidden;
  position: relative;
`;

const Header = styled.header`
  height: 60px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      ${props => props.theme.colors.primary}, 
      ${props => props.theme.colors.secondary}, 
      ${props => props.theme.colors.accent}, 
      ${props => props.theme.colors.primary});
    background-size: 200% 100%;
    animation: shimmer 3s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  .logo-text {
    background: linear-gradient(135deg, 
      ${props => props.theme.colors.primary}, 
      ${props => props.theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const NavButton = styled.button`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 8px;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const MainContent = styled.div`
  display: flex;
  height: calc(100vh - 60px);
  position: relative;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(180deg, 
      transparent, 
      ${props => props.theme.colors.primary}, 
      transparent);
    opacity: 0.3;
  }
`;

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 20px;
`;

const ToolButton = styled.button`
  aspect-ratio: 1;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
        return <SymbolDictionary />;
      case 'stacks':
        return <StackManager />;
      default:
        return <MainInterface isOnline={isOnline} />;
    }
  };

  return (
    <ThemeProvider theme={DarkTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header className="mechanical-panel">
          <Logo>
            <MechanicalSymbol 
              type="gear" 
              size="40px" 
              rotating={true}
              color="#00ff88"
            />
            <span className="logo-text">xomni</span>
          </Logo>
          <div style={{ display: 'flex', gap: '12px' }}>
            <NavButton onClick={() => setCurrentView('main')}>
              <MechanicalSymbol type="folder" size="28px" />
            </NavButton>
            <NavButton onClick={() => setCurrentView('agent')}>
              <MechanicalSymbol type="robot" size="28px" rotating={currentView === 'agent'} />
            </NavButton>
            <NavButton onClick={() => setCurrentView('symbols')}>
              <MechanicalSymbol type="gear" size="28px" rotating={currentView === 'symbols'} />
            </NavButton>
            <NavButton onClick={() => setCurrentView('stacks')}>
              <MechanicalSymbol type="bolt" size="28px" />
            </NavButton>
          </div>
        </Header>
        
        <MainContent>
          <Sidebar className="mechanical-panel">
            {/* Navigation and tools sidebar */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                color: '#00ff88', 
                textAlign: 'center', 
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '14px'
              }}>
                Tools
              </h3>
              <ToolGrid>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="bolt" size="40px" />
                </ToolButton>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="gear" size="40px" rotating={true} />
                </ToolButton>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="folder" size="40px" />
                </ToolButton>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="cog" size="40px" rotating={true} />
                </ToolButton>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="rocket" size="40px" />
                </ToolButton>
                <ToolButton className="mechanical-element">
                  <MechanicalSymbol type="search" size="40px" />
                </ToolButton>
              </ToolGrid>
            </div>
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