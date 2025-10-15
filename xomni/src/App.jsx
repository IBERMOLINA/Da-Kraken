import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { Home, Cpu, Binary, Layers, Zap, Wrench, FileText, TestTube, Rocket, Box } from 'lucide-react';

import MainInterface from './components/MainInterface';
import AgentPanel from './components/AgentPanel';
import SymbolDictionary from './components/SymbolDictionary';
import StackManager from './components/StackManager';
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
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Nav = styled.nav`
  display: flex;
  gap: 10px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.text};
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-grow: 1;
  position: relative;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
`;

const ToolButton = styled(NavButton)`
  width: 100%;
  justify-content: flex-start;
`;

const ContentArea = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const WelcomeMessage = styled.div`
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  h2 {
    font-size: 28px;
    margin-bottom: 16px;
    color: ${props => props.theme.colors.primary};
  }

  p {
    font-size: 18px;
    max-width: 600px;
    line-height: 1.6;
  }
`;

function App() {
  const [currentView, setCurrentView] = useState('welcome');
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
      case 'main':
        return <MainInterface isOnline={isOnline} />;
      case 'agent':
        return <AgentPanel isOnline={isOnline} />;
      case 'symbols':
        return <SymbolDictionary />;
      case 'stacks':
        return <StackManager />;
      case 'welcome':
        return (
          <WelcomeMessage>
            <h2>Welcome to xomni</h2>
            <p>Your universal environment for creating digital tools. Start by exploring the tools on the left, or jump right into the main interface to begin building.</p>
          </WelcomeMessage>
        );
      default:
        return <MainInterface isOnline={isOnline} />;
    }
  };

  const navItems = [
    { id: 'main', icon: Home, label: 'Home' },
    { id: 'agent', icon: Cpu, label: 'Agent' },
    { id: 'symbols', icon: Binary, label: 'Symbols' },
    { id: 'stacks', icon: Layers, label: 'Stacks' },
  ];

  const toolItems = [
    { id: 'tool1', icon: Zap, label: 'Actions' },
    { id: 'tool2', icon: Wrench, label: 'Tools' },
    { id: 'tool3', icon: FileText, label: 'Templates' },
    { id: 'tool4', icon: TestTube, label: 'Tests' },
    { id: 'tool5', icon: Rocket, label: 'Deploy' },
    { id: 'tool6', icon: Box, label: 'Packages' },
  ];

  return (
    <ThemeProvider theme={DarkTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Logo>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Home />
            </motion.div>
            xomni
          </Logo>
          <Nav>
            {navItems.map(item => (
              <NavButton 
                key={item.id} 
                onClick={() => setCurrentView(item.id)}
                active={currentView === item.id}
              >
                <item.icon size={20} />
                {item.label}
              </NavButton>
            ))}
          </Nav>
        </Header>
        
        <MainContent>
          <Sidebar>
            <h3>Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {toolItems.map(tool => (
                <ToolButton key={tool.id}>
                  <tool.icon size={20} />
                  {tool.label}
                </ToolButton>
              ))}
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