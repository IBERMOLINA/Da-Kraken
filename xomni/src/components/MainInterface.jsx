import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './CodeEditor';
import ProjectExplorer from './ProjectExplorer';
import Terminal from './Terminal';
import ToolPalette from './ToolPalette';

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
`;

const PanelTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
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
    { id: 'develop', name: 'Develop', icon: '⚡' },
    { id: 'test', name: 'Test', icon: '🧪' },
    { id: 'optimize', name: 'Optimize', icon: '🔧' },
    { id: 'deploy', name: 'Deploy', icon: '🚀' },
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
      <PanelHeader>
        <div style={{ display: 'flex', gap: '10px' }}>
          {modes.map(mode => (
            <motion.button
              key={mode.id}
              onClick={() => setCurrentMode(mode.id)}
              style={{
                background: currentMode === mode.id ? props => props.theme.colors.primary : 'transparent',
                color: currentMode === mode.id ? props => props.theme.colors.background : props => props.theme.colors.text,
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mode.icon} {mode.name}
            </motion.button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <div className="symbol-button">📁</div>
          <div className="symbol-button">🔍</div>
          <div className="symbol-button">⚙️</div>
        </div>
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