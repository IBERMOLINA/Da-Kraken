import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './CodeEditor';
import ProjectExplorer from './ProjectExplorer';
import Terminal from './Terminal';
import ToolPalette from './ToolPalette';
import MechanicalSymbol from './MechanicalSymbol';

const InterfaceContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background};
`;

const Workspace = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 300px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled.div`
  width: 300px;
  background: ${props => props.theme.colors.surface};
  border-left: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
`;

const PanelHeader = styled.div`
  height: 40px;
  background: ${props => props.theme.colors.surfaceLight};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.md};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.theme.colors.primary}, 
      transparent);
    opacity: 0.5;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      ${props => props.theme.colors.mechanical.metal}, 
      transparent);
    opacity: 0.3;
  }
`;

const PanelTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ModeButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.isActive 
    ? `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`
    : `${props.theme.colors.surface}`};
  border: 1px solid ${props => props.isActive 
    ? props.theme.colors.primary 
    : props.theme.colors.border};
  color: ${props => props.isActive 
    ? props.theme.colors.background 
    : props.theme.colors.text};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
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
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: ${props => props.theme.colors.primary};
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const SymbolButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const StatusBar = styled.div`
  height: 30px;
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textMuted};
`;

const MainInterface = ({ isOnline }) => {
  const [activeFile, setActiveFile] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [currentMode, setCurrentMode] = useState('develop');

  const modes = [
    { id: 'develop', name: 'Develop', icon: '⚡', symbol3d: 'bolt' },
    { id: 'test', name: 'Test', icon: '🧪', symbol3d: 'cog' },
    { id: 'optimize', name: 'Optimize', icon: '🔧', symbol3d: 'gear' },
    { id: 'deploy', name: 'Deploy', icon: '🚀', symbol3d: 'rocket' },
  ];

  const addTerminalOutput = (output) => {
    setTerminalOutput(prev => [...prev, { id: Date.now(), content: output, type: 'output' }]);
  };

  const executeCommand = (command) => {
    addTerminalOutput(`$ ${command}`);
    // Simulate command execution
    setTimeout(() => {
      addTerminalOutput('Command executed successfully');
    }, 1000);
  };

  return (
    <InterfaceContainer>
      <PanelHeader className="mechanical-panel">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {modes.map(mode => (
            <ModeButton
              key={mode.id}
              onClick={() => setCurrentMode(mode.id)}
              isActive={currentMode === mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mechanical-element"
            >
              <MechanicalSymbol 
                type={mode.symbol3d} 
                size="24px" 
                rotating={currentMode === mode.id}
                color={currentMode === mode.id ? '#0a0a0a' : undefined}
              />
              {mode.name}
            </ModeButton>
          ))}
        </div>
        
        <SymbolButtonContainer>
          <MechanicalSymbol 
            type="folder" 
            size="32px" 
            className="floating-element"
            onClick={() => console.log('folder clicked')}
          />
          <MechanicalSymbol 
            type="search" 
            size="32px" 
            className="glowing-element"
            onClick={() => console.log('search clicked')}
          />
          <MechanicalSymbol 
            type="settings" 
            size="32px" 
            rotating={true}
            className="spinning-element"
            onClick={() => console.log('settings clicked')}
          />
        </SymbolButtonContainer>
      </PanelHeader>

      <Workspace>
        <LeftPanel>
          <ProjectExplorer 
            files={projectFiles}
            activeFile={activeFile}
            onFileSelect={setActiveFile}
          />
        </LeftPanel>

        <CenterPanel>
          <AnimatePresence mode="wait">
            {currentMode === 'develop' && (
              <motion.div
                key="develop"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <CodeEditor 
                  activeFile={activeFile}
                  onContentChange={(content) => {
                    // Handle file content changes
                  }}
                />
              </motion.div>
            )}

            {currentMode === 'test' && (
              <motion.div
                key="test"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ flex: 1, padding: '20px' }}
              >
                <ToolPalette mode="test" onAction={executeCommand} />
              </motion.div>
            )}

            {currentMode === 'optimize' && (
              <motion.div
                key="optimize"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ flex: 1, padding: '20px' }}
              >
                <ToolPalette mode="optimize" onAction={executeCommand} />
              </motion.div>
            )}

            {currentMode === 'deploy' && (
              <motion.div
                key="deploy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ flex: 1, padding: '20px' }}
              >
                <ToolPalette mode="deploy" onAction={executeCommand} />
              </motion.div>
            )}
          </AnimatePresence>
        </CenterPanel>

        <RightPanel>
          <Terminal 
            output={terminalOutput}
            onCommand={executeCommand}
            isOnline={isOnline}
          />
        </RightPanel>
      </Workspace>

      <StatusBar>
        <div>
          {isOnline ? '🌐 Online' : '📴 Offline'} | Mode: {modes.find(m => m.id === currentMode)?.name}
        </div>
        <div>
          Files: {projectFiles.length} | Active: {activeFile?.name || 'None'}
        </div>
      </StatusBar>
    </InterfaceContainer>
  );
};

export default MainInterface;