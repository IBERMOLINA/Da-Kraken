import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const PaletteContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  padding: 20px;
`;

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ToolCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px ${props => props.theme.colors.shadow};
  }
`;

const ToolIcon = styled.div`
  font-size: 32px;
  text-align: center;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 8px ${props => props.theme.colors.shadow});
`;

const ToolName = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-bottom: 8px;
  text-align: center;
`;

const ToolDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: 12px;
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  padding: 10px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.secondary};
    transform: translateY(-1px);
  }
`;

const ConsoleOutput = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  overflow-y: auto;
  margin-top: 20px;
`;

const ConsoleLine = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => 
    props.type === 'error' ? props.theme.colors.error :
    props.type === 'warning' ? props.theme.colors.warning :
    props.type === 'success' ? props.theme.colors.success :
    props.type === 'info' ? props.theme.colors.info :
    props.theme.colors.text
  };
  margin-bottom: 4px;
  padding: 4px 0;
`;

const ToolPalette = ({ mode, onAction }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);

  const tools = {
    test: [
      {
        id: 'jest',
        name: 'Jest Testing',
        icon: '🧪',
        description: 'Run unit tests with Jest',
        action: 'run-jest-tests'
      },
      {
        id: 'cypress',
        name: 'Cypress E2E',
        icon: '🌐',
        description: 'End-to-end testing with Cypress',
        action: 'run-cypress-tests'
      },
      {
        id: 'coverage',
        name: 'Test Coverage',
        icon: '📊',
        description: 'Generate test coverage reports',
        action: 'generate-coverage'
      },
      {
        id: 'lint',
        name: 'ESLint',
        icon: '🔍',
        description: 'Run code linting checks',
        action: 'run-eslint'
      }
    ],
    optimize: [
      {
        id: 'webpack',
        name: 'Bundle Analyzer',
        icon: '📦',
        description: 'Analyze bundle size and dependencies',
        action: 'analyze-bundle'
      },
      {
        id: 'compress',
        name: 'Image Optimizer',
        icon: '🖼️',
        description: 'Optimize images for web',
        action: 'optimize-images'
      },
      {
        id: 'minify',
        name: 'Code Minifier',
        icon: '⚡',
        description: 'Minify JavaScript and CSS',
        action: 'minify-code'
      },
      {
        id: 'cdn',
        name: 'CDN Optimizer',
        icon: '☁️',
        description: 'Optimize assets for CDN delivery',
        action: 'optimize-cdn'
      }
    ],
    deploy: [
      {
        id: 'vercel',
        name: 'Deploy to Vercel',
        icon: '▲',
        description: 'Deploy application to Vercel',
        action: 'deploy-vercel'
      },
      {
        id: 'netlify',
        name: 'Deploy to Netlify',
        icon: '🌐',
        description: 'Deploy application to Netlify',
        action: 'deploy-netlify'
      },
      {
        id: 'docker',
        name: 'Docker Build',
        icon: '🐳',
        description: 'Build Docker container',
        action: 'build-docker'
      },
      {
        id: 'github',
        name: 'GitHub Actions',
        icon: '🔧',
        description: 'Set up CI/CD with GitHub Actions',
        action: 'setup-github-actions'
      }
    ]
  };

  const handleToolAction = (tool) => {
    setSelectedTool(tool);
    
    // Simulate tool execution
    const outputs = {
      'run-jest-tests': [
        { type: 'info', content: 'Running Jest tests...' },
        { type: 'success', content: '✅ All tests passed (15/15)' },
        { type: 'info', content: 'Test execution time: 2.3s' }
      ],
      'run-cypress-tests': [
        { type: 'info', content: 'Starting Cypress E2E tests...' },
        { type: 'success', content: '✅ 8 tests completed successfully' },
        { type: 'warning', content: '⚠️ 1 test has warnings' }
      ],
      'generate-coverage': [
        { type: 'info', content: 'Generating test coverage report...' },
        { type: 'success', content: '✅ Coverage report generated' },
        { type: 'info', content: 'Lines: 85% | Functions: 92% | Branches: 78%' }
      ],
      'run-eslint': [
        { type: 'info', content: 'Running ESLint...' },
        { type: 'warning', content: '⚠️ Found 3 linting issues' },
        { type: 'info', content: 'Issues fixed automatically' }
      ],
      'analyze-bundle': [
        { type: 'info', content: 'Analyzing bundle size...' },
        { type: 'info', content: 'Main bundle: 245KB (gzipped: 89KB)' },
        { type: 'warning', content: '⚠️ Large dependencies detected' }
      ],
      'optimize-images': [
        { type: 'info', content: 'Optimizing images...' },
        { type: 'success', content: '✅ Optimized 12 images' },
        { type: 'info', content: 'Total size reduction: 1.2MB' }
      ],
      'minify-code': [
        { type: 'info', content: 'Minifying JavaScript and CSS...' },
        { type: 'success', content: '✅ Code minified successfully' },
        { type: 'info', content: 'Size reduction: 45%' }
      ],
      'optimize-cdn': [
        { type: 'info', content: 'Optimizing for CDN delivery...' },
        { type: 'success', content: '✅ CDN optimization complete' },
        { type: 'info', content: 'Assets ready for global distribution' }
      ],
      'deploy-vercel': [
        { type: 'info', content: 'Deploying to Vercel...' },
        { type: 'success', content: '✅ Deployment successful!' },
        { type: 'info', content: 'URL: https://my-app.vercel.app' }
      ],
      'deploy-netlify': [
        { type: 'info', content: 'Deploying to Netlify...' },
        { type: 'success', content: '✅ Site deployed successfully!' },
        { type: 'info', content: 'URL: https://my-app.netlify.app' }
      ],
      'build-docker': [
        { type: 'info', content: 'Building Docker image...' },
        { type: 'success', content: '✅ Docker image built' },
        { type: 'info', content: 'Image size: 156MB' }
      ],
      'setup-github-actions': [
        { type: 'info', content: 'Setting up GitHub Actions...' },
        { type: 'success', content: '✅ CI/CD pipeline configured' },
        { type: 'info', content: 'Workflow will run on every push' }
      ]
    };

    const output = outputs[tool.action] || [
      { type: 'info', content: `Executing ${tool.name}...` },
      { type: 'success', content: '✅ Operation completed' }
    ];

    setConsoleOutput(output);
    onAction?.(`Running ${tool.name}...`);
  };

  const currentTools = tools[mode] || [];

  return (
    <PaletteContainer>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          color: props => props.theme.colors.primary, 
          marginBottom: '20px',
          textAlign: 'center' 
        }}
      >
        {mode === 'test' && '🧪 Testing Tools'}
        {mode === 'optimize' && '🔧 Optimization Tools'}
        {mode === 'deploy' && '🚀 Deployment Tools'}
      </motion.h2>

      <ToolGrid>
        <AnimatePresence>
          {currentTools.map((tool) => (
            <ToolCard
              key={tool.id}
              onClick={() => handleToolAction(tool)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ToolIcon>{tool.icon}</ToolIcon>
              <ToolName>{tool.name}</ToolName>
              <ToolDescription>{tool.description}</ToolDescription>
              <ActionButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleToolAction(tool);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Run Tool
              </ActionButton>
            </ToolCard>
          ))}
        </AnimatePresence>
      </ToolGrid>

      <ConsoleOutput>
        <h4 style={{ color: props => props.theme.colors.primary, marginBottom: '12px' }}>
          Console Output
        </h4>
        {consoleOutput.length === 0 ? (
          <div style={{ color: props => props.theme.colors.textMuted, textAlign: 'center' }}>
            No output yet. Select a tool to see results.
          </div>
        ) : (
          consoleOutput.map((line, index) => (
            <ConsoleLine key={index} type={line.type}>
              {line.content}
            </ConsoleLine>
          ))
        )}
      </ConsoleOutput>
    </PaletteContainer>
  );
};

export default ToolPalette;