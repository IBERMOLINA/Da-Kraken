import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ExplorerContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.surface};
`;

const ExplorerHeader = styled.div`
  height: 40px;
  background: ${props => props.theme.colors.surfaceLight};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const HeaderTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  padding: 4px;
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.primary};
  }
`;

const FileTree = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
`;

const FileItem = styled(motion.div)`
  display: flex;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  user-select: none;
  border-left: 3px solid transparent;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-left-color: ${props => props.theme.colors.borderLight};
  }
  
  ${props => props.isActive && `
    background: ${props.theme.colors.primary}20;
    border-left-color: ${props.theme.colors.primary};
    color: ${props.theme.colors.primary};
  `}
`;

const FileIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const FileName = styled.span`
  flex: 1;
  font-size: ${props => props.theme.typography.fontSize.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ExpandIcon = styled.span`
  margin-right: 4px;
  font-size: 12px;
  transform: ${props => props.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const ProjectExplorer = ({ files, activeFile, onFileSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState(['src', 'components', 'utils', 'assets']);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock file tree structure
  const fileTree = {
    name: 'xomni',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          {
            name: 'components',
            type: 'folder',
            children: [
              { name: 'App.jsx', type: 'file', language: 'javascript' },
              { name: 'MainInterface.jsx', type: 'file', language: 'javascript' },
              { name: 'AgentPanel.jsx', type: 'file', language: 'javascript' },
              { name: 'SymbolDictionary.jsx', type: 'file', language: 'javascript' },
              { name: 'StackManager.jsx', type: 'file', language: 'javascript' },
              { name: 'CodeEditor.jsx', type: 'file', language: 'javascript' },
              { name: 'ProjectExplorer.jsx', type: 'file', language: 'javascript' },
              { name: 'Terminal.jsx', type: 'file', language: 'javascript' },
              { name: 'ToolPalette.jsx', type: 'file', language: 'javascript' },
            ]
          },
          {
            name: 'utils',
            type: 'folder',
            children: [
              { name: 'themes.js', type: 'file', language: 'javascript' },
              { name: 'globalStyles.js', type: 'file', language: 'javascript' },
              { name: 'helpers.js', type: 'file', language: 'javascript' },
            ]
          },
          {
            name: 'assets',
            type: 'folder',
            children: [
              { name: 'symbols.svg', type: 'file', language: 'svg' },
              { name: 'icons', type: 'folder', children: [] },
            ]
          },
          { name: 'main.jsx', type: 'file', language: 'javascript' },
          { name: 'index.css', type: 'file', language: 'css' },
        ]
      },
      { name: 'package.json', type: 'file', language: 'json' },
      { name: 'vite.config.js', type: 'file', language: 'javascript' },
      { name: 'README.md', type: 'file', language: 'markdown' },
      { name: '.gitignore', type: 'file', language: 'text' },
    ]
  };

  const getFileIcon = (fileName, type) => {
    if (type === 'folder') {
      return expandedFolders.includes(fileName) ? '📁' : '📂';
    }
    
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
      py: '🐍', java: '☕', cpp: '⚙️', cs: '🔷',
      html: '🌐', css: '🎨', scss: '💅', json: '📋',
      md: '📝', yml: '📄', yaml: '📄', svg: '🎨',
      png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🎞️'
    };
    
    return icons[ext] || '📄';
  };

  const toggleFolder = (folderName) => {
    setExpandedFolders(prev =>
      prev.includes(folderName)
        ? prev.filter(name => name !== folderName)
        : [...prev, folderName]
    );
  };

  const renderFileItem = (item, level = 0) => {
    const isExpanded = expandedFolders.includes(item.name);
    const isActive = activeFile && activeFile.name === item.name;

    return (
      <div key={item.name}>
        <FileItem
          isActive={isActive}
          style={{ paddingLeft: `${16 + level * 16}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.name);
            } else {
              onFileSelect(item);
            }
          }}
        >
          {item.type === 'folder' && (
            <ExpandIcon isExpanded={isExpanded}>
              ▶
            </ExpandIcon>
          )}
          <FileIcon>{getFileIcon(item.name, item.type)}</FileIcon>
          <FileName>{item.name}</FileName>
          {item.language && (
            <span style={{ fontSize: '10px', color: props => props.theme.colors.textMuted }}>
              {item.language}
            </span>
          )}
        </FileItem>
        
        {item.type === 'folder' && isExpanded && item.children && (
          <AnimatePresence>
            {item.children.map(child => renderFileItem(child, level + 1))}
          </AnimatePresence>
        )}
      </div>
    );
  };

  const handleNewFile = () => {
    console.log('Creating new file...');
  };

  const handleNewFolder = () => {
    console.log('Creating new folder...');
  };

  const handleRefresh = () => {
    console.log('Refreshing project...');
  };

  return (
    <ExplorerContainer>
      <ExplorerHeader>
        <HeaderTitle>Project Explorer</HeaderTitle>
        <HeaderActions>
          <ActionButton onClick={handleNewFile} title="New File">
            ➕
          </ActionButton>
          <ActionButton onClick={handleNewFolder} title="New Folder">
            📁
          </ActionButton>
          <ActionButton onClick={handleRefresh} title="Refresh">
            🔄
          </ActionButton>
        </HeaderActions>
      </ExplorerHeader>

      <FileTree>
        {renderFileItem(fileTree)}
      </FileTree>
    </ExplorerContainer>
  );
};

export default ProjectExplorer;