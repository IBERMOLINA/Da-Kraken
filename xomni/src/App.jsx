import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
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
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 10px;
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
        <Header>
          <Logo>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.div>
            xomni
          </Logo>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCurrentView('main')}>🏠</button>
            <button onClick={() => setCurrentView('agent')}>🤖</button>
            <button onClick={() => setCurrentView('symbols')}>🔣</button>
            <button onClick={() => setCurrentView('stacks')}>📚</button>
          </div>
        </Header>
        
        <MainContent>
          <Sidebar>
            {/* Navigation and tools sidebar */}
            <div style={{ padding: '20px' }}>
              <h3>Tools</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                <button>⚡</button>
                <button>🔧</button>
                <button>📝</button>
                <button>🧪</button>
                <button>🚀</button>
                <button>📦</button>
              </div>
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