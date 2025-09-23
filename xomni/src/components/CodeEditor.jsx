import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';

const EditorContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.surface};
`;

const EditorHeader = styled.div`
  height: 40px;
  background: ${props => props.theme.colors.surfaceLight};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const FileTabs = styled.div`
  display: flex;
  gap: 4px;
  overflow-x: auto;
`;

const FileTab = styled(motion.button)`
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.background : props.theme.colors.textSecondary};
  border: none;
  padding: 8px 16px;
  border-radius: 4px 4px 0 0;
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  white-space: nowrap;
  min-width: 120px;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
`;

const LanguageSelector = styled.select`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 4px 8px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
`;

const EditorActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 6px 10px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EditorContent = styled.div`
  flex: 1;
  position: relative;
`;

const StatusBar = styled.div`
  height: 24px;
  background: ${props => props.theme.colors.surfaceLight};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textMuted};
`;

const CodeEditor = ({ activeFile, onContentChange }) => {
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'App.js',
      language: 'javascript',
      content: `import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: \${props => props.theme.colors.background};
  color: \${props => props.theme.colors.text};
\`;

function App() {
  return (
    <Container>
      <h1>Welcome to xomni</h1>
      <p>Your universal coding environment</p>
    </Container>
  );
}

export default App;`
    },
    {
      id: 2,
      name: 'styles.css',
      language: 'css',
      content: `.app {
  font-family: 'JetBrains Mono', monospace;
  background: #0a0a0a;
  color: #ffffff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}`
    }
  ]);
  
  const [currentFile, setCurrentFile] = useState(files[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' }
  ];

  useEffect(() => {
    if (activeFile && files.find(f => f.id === activeFile.id)) {
      setCurrentFile(activeFile);
    }
  }, [activeFile, files]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure dark theme for Monaco
    monaco.editor.defineTheme('xomni-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
        { token: 'variable', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editor.selectionBackground': '#264f78',
        'editorCursor.foreground': '#ffffff',
        'editorWhitespace.foreground': '#404040',
      }
    });
    
    monaco.editor.setTheme('xomni-dark');
  };

  const handleFileChange = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      setCurrentFile(file);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setFiles(prev => prev.map(file => 
      file.id === currentFile.id 
        ? { ...file, language: newLanguage }
        : file
    ));
    setCurrentFile(prev => ({ ...prev, language: newLanguage }));
  };

  const handleContentChange = (value) => {
    setFiles(prev => prev.map(file => 
      file.id === currentFile.id 
        ? { ...file, content: value }
        : file
    ));
    setCurrentFile(prev => ({ ...prev, content: value }));
    onContentChange?.(value);
  };

  const handleNewFile = () => {
    const newFile = {
      id: Date.now(),
      name: `Untitled-${files.length + 1}`,
      language: 'javascript',
      content: '// New file\n\n'
    };
    setFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);
  };

  const handleSaveFile = () => {
    // Implementation for saving file
    console.log('Saving file:', currentFile.name);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!currentFile) {
    return (
      <EditorContainer>
        <EditorContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: props => props.theme.colors.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div>Select a file to start editing</div>
          </div>
        </EditorContent>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorHeader>
        <FileTabs>
          {files.map((file) => (
            <FileTab
              key={file.id}
              active={currentFile.id === file.id}
              onClick={() => handleFileChange(file.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {file.name}
            </FileTab>
          ))}
        </FileTabs>
        
        <EditorActions>
          <LanguageSelector
            value={currentFile.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </LanguageSelector>
          
          <ActionButton onClick={handleNewFile} title="New File">
            ➕
          </ActionButton>
          <ActionButton onClick={handleSaveFile} title="Save File">
            💾
          </ActionButton>
          <ActionButton onClick={handleToggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? '🪟' : '⛶'}
          </ActionButton>
        </EditorActions>
      </EditorHeader>

      <EditorContent>
        <Editor
          height="100%"
          language={currentFile.language}
          value={currentFile.content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: true,
            hover: true,
            contextmenu: true,
            mouseWheelZoom: true,
            folding: true,
            foldingHighlight: true,
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            fontLigatures: true,
          }}
        />
      </EditorContent>

      <StatusBar>
        <div>
          {currentFile.name} • {currentFile.language} • Line {1} • Col {1}
        </div>
        <div>
          UTF-8 • CRLF • {currentFile.content.split('\n').length} lines
        </div>
      </StatusBar>
    </EditorContainer>
  );
};

export default CodeEditor;