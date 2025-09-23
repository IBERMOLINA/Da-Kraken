import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TerminalContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  border-left: 1px solid ${props => props.theme.colors.border};
`;

const TerminalHeader = styled.div`
  height: 40px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const TerminalTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TerminalStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.isOnline ? props.theme.colors.success : props.theme.colors.warning};
`;

const TerminalBody = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const TerminalLine = styled.div`
  margin-bottom: 4px;
  color: ${props => 
    props.type === 'error' ? props.theme.colors.error :
    props.type === 'warning' ? props.theme.colors.warning :
    props.type === 'success' ? props.theme.colors.success :
    props.type === 'input' ? props.theme.colors.primary :
    props.theme.colors.text
  };
  display: flex;
  align-items: flex-start;
`;

const CommandPrompt = styled.span`
  color: ${props => props.theme.colors.primary};
  margin-right: 8px;
  user-select: none;
`;

const CommandInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: inherit;
  outline: none;
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const TerminalInput = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 0;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const Terminal = ({ output, onCommand, isOnline }) => {
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalBodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [output]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!currentCommand.trim()) return;

    const command = currentCommand.trim();
    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    
    onCommand(command);
    setCurrentCommand('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const sampleOutput = [
    { id: 1, content: 'Welcome to xomni Terminal', type: 'info' },
    { id: 2, content: '$ npm install', type: 'input' },
    { id: 3, content: 'Installing dependencies...', type: 'info' },
    { id: 4, content: '✅ Dependencies installed successfully', type: 'success' },
    { id: 5, content: '$ npm run dev', type: 'input' },
    { id: 6, content: 'Starting development server...', type: 'info' },
    { id: 7, content: '🚀 Server running on http://localhost:3000', type: 'success' },
  ];

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalTitle>
          💻 Terminal
          <TerminalStatus isOnline={isOnline}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOnline ? '#00ff88' : '#ffa500' }} />
            {isOnline ? 'Online' : 'Offline'}
          </TerminalStatus>
        </TerminalTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button
            style={{ background: 'transparent', border: 'none', color: props => props.theme.colors.textSecondary, cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            onClick={() => terminalBodyRef.current?.scrollTo(0, 0)}
            title="Scroll to top"
          >
            ⬆️
          </motion.button>
          <motion.button
            style={{ background: 'transparent', border: 'none', color: props => props.theme.colors.textSecondary, cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            onClick={() => terminalBodyRef.current?.scrollTo(0, terminalBodyRef.current.scrollHeight)}
            title="Scroll to bottom"
          >
            ⬇️
          </motion.button>
          <motion.button
            style={{ background: 'transparent', border: 'none', color: props => props.theme.colors.textSecondary, cursor: 'pointer' }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setCommandHistory([])}
            title="Clear history"
          >
            🗑️
          </motion.button>
        </div>
      </TerminalHeader>

      <TerminalBody ref={terminalBodyRef}>
        {sampleOutput.map((line) => (
          <TerminalLine key={line.id} type={line.type}>
            {line.type === 'input' && <CommandPrompt>$</CommandPrompt>}
            {line.content}
          </TerminalLine>
        ))}
        
        {output.map((line) => (
          <TerminalLine key={line.id} type={line.type}>
            {line.type === 'output' && <CommandPrompt>$</CommandPrompt>}
            {line.content}
          </TerminalLine>
        ))}
      </TerminalBody>

      <TerminalInput>
        <form onSubmit={handleCommandSubmit} style={{ flex: 1, display: 'flex' }}>
          <CommandPrompt>$</CommandPrompt>
          <CommandInput
            ref={inputRef}
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            autoFocus
          />
        </form>
      </TerminalInput>
    </TerminalContainer>
  );
};

export default Terminal;