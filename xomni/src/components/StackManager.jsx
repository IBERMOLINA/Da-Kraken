import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const StackContainer = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
`;

const StackGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StackCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 20px;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: 0 12px 24px ${props => props.theme.colors.shadow};
  }
`;

const StackIcon = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 10px ${props => props.theme.colors.shadow});
`;

const StackName = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: 8px;
  text-align: center;
`;

const StackDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: center;
  margin-bottom: 16px;
`;

const StackTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  justify-content: center;
`;

const Tag = styled.span`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const StackActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme.colors.surfaceLight};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 8px 12px;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.xs};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.background};
  }
`;

const CreateStackSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 20px;
  margin-bottom: 20px;
`;

const CreateButton = styled(motion.button)`
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.background};
  border: none;
  padding: 12px 24px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px ${props => props.theme.colors.shadow};
  }
`;

const StackManager = () => {
  const [selectedStack, setSelectedStack] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const predefinedStacks = [
    {
      id: 1,
      name: 'React Web App',
      icon: '⚛️',
      description: 'Modern React application with TypeScript',
      tags: ['React', 'TypeScript', 'Vite', 'Tailwind'],
      components: ['Authentication', 'Dashboard', 'API Integration', 'Testing']
    },
    {
      id: 2,
      name: 'Full-Stack Node',
      icon: '🟢',
      description: 'Complete full-stack application with Node.js',
      tags: ['Node.js', 'Express', 'MongoDB', 'React'],
      components: ['Backend API', 'Database', 'Frontend', 'Deployment']
    },
    {
      id: 3,
      name: 'Mobile Flutter',
      icon: '📱',
      description: 'Cross-platform mobile application',
      tags: ['Flutter', 'Dart', 'Firebase', 'iOS', 'Android'],
      components: ['UI Components', 'State Management', 'Backend', 'Testing']
    },
    {
      id: 4,
      name: 'Python Data Science',
      icon: '🐍',
      description: 'Data analysis and machine learning stack',
      tags: ['Python', 'Pandas', 'TensorFlow', 'Jupyter'],
      components: ['Data Processing', 'ML Models', 'Visualization', 'API']
    },
    {
      id: 5,
      name: 'Game Development',
      icon: '🎮',
      description: '2D/3D game development environment',
      tags: ['Unity', 'C#', 'Blender', 'WebGL'],
      components: ['Game Engine', 'Assets', 'Physics', 'Multiplayer']
    },
    {
      id: 6,
      name: 'Desktop Electron',
      icon: '💻',
      description: 'Cross-platform desktop application',
      tags: ['Electron', 'React', 'Node.js', 'Windows', 'macOS', 'Linux'],
      components: ['UI Framework', 'Native APIs', 'Packaging', 'Updates']
    }
  ];

  const handleCreateStack = () => {
    // Implementation for creating new stack
    console.log('Creating new stack...');
  };

  const handleDeployStack = (stackId) => {
    // Implementation for deploying stack
    console.log('Deploying stack:', stackId);
  };

  const handleDownloadStack = (stackId) => {
    // Implementation for downloading stack
    console.log('Downloading stack:', stackId);
  };

  return (
    <StackContainer>
      <CreateStackSection>
        <CreateButton
          onClick={handleCreateStack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🆕 Create New Stack
        </CreateButton>
      </CreateStackSection>

      <StackGrid>
        <AnimatePresence>
          {predefinedStacks.map((stack) => (
            <StackCard
              key={stack.id}
              onClick={() => setSelectedStack(stack)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <StackIcon>{stack.icon}</StackIcon>
              <StackName>{stack.name}</StackName>
              <StackDescription>{stack.description}</StackDescription>
              
              <StackTags>
                {stack.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </StackTags>
              
              <StackActions>
                <ActionButton onClick={(e) => { e.stopPropagation(); handleDeployStack(stack.id); }}>
                  🚀 Deploy
                </ActionButton>
                <ActionButton onClick={(e) => { e.stopPropagation(); handleDownloadStack(stack.id); }}>
                  💾 Download
                </ActionButton>
              </StackActions>
            </StackCard>
          ))}
        </AnimatePresence>
      </StackGrid>

      {/* Selected Stack Details Modal could go here */}
      {selectedStack && (
        <motion.div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedStack(null)}
        >
          <motion.div
            style={{
              background: props => props.theme.colors.surface,
              borderRadius: props => props.theme.borderRadius.lg,
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>{selectedStack.icon}</div>
              <h2 style={{ color: props => props.theme.colors.primary }}>{selectedStack.name}</h2>
              <p style={{ color: props => props.theme.colors.textSecondary }}>{selectedStack.description}</p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Technologies:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedStack.tags.map((tag, index) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '10px' }}>Components:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {selectedStack.components.map((component, index) => (
                  <div key={index} style={{ 
                    padding: '8px', 
                    background: props => props.theme.colors.surfaceLight,
                    borderRadius: '4px',
                    textAlign: 'center'
                  }}>
                    {component}
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <ActionButton onClick={() => handleDeployStack(selectedStack.id)}>
                🚀 Deploy Stack
              </ActionButton>
              <ActionButton onClick={() => handleDownloadStack(selectedStack.id)}>
                💾 Download Stack
              </ActionButton>
              <ActionButton onClick={() => setSelectedStack(null)}>
                ❌ Close
              </ActionButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </StackContainer>
  );
};

export default StackManager;