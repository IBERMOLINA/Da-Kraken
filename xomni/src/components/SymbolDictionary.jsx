import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DictionaryContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: ${props => props.theme.colors.background};
`;

const SymbolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const SymbolCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px ${props => props.theme.colors.shadow};
  }
`;

const SymbolIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 8px ${props => props.theme.colors.shadow});
`;

const SymbolName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
`;

const SymbolCategory = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textMuted};
`;

const CategorySection = styled.div`
  margin-bottom: 40px;
`;

const CategoryTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: 20px;
  text-align: center;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-bottom: 20px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.shadow};
  }
`;

const SymbolDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const symbolCategories = {
    navigation: {
      title: 'Navigation',
      symbols: [
        { icon: '🏠', name: 'Home', category: 'navigation' },
        { icon: '🔙', name: 'Back', category: 'navigation' },
        { icon: '🔜', name: 'Forward', category: 'navigation' },
        { icon: '📁', name: 'Folder', category: 'navigation' },
        { icon: '🔍', name: 'Search', category: 'navigation' },
        { icon: '⚙️', name: 'Settings', category: 'navigation' },
        { icon: '📊', name: 'Dashboard', category: 'navigation' },
        { icon: '🗂️', name: 'Projects', category: 'navigation' },
      ]
    },
    development: {
      title: 'Development',
      symbols: [
        { icon: '⚡', name: 'Develop', category: 'development' },
        { icon: '🧪', name: 'Test', category: 'development' },
        { icon: '🔧', name: 'Optimize', category: 'development' },
        { icon: '🚀', name: 'Deploy', category: 'development' },
        { icon: '📝', name: 'Edit', category: 'development' },
        { icon: '🐛', name: 'Debug', category: 'development' },
        { icon: '📦', name: 'Package', category: 'development' },
        { icon: '🔄', name: 'Build', category: 'development' },
      ]
    },
    tools: {
      title: 'Tools',
      symbols: [
        { icon: '🤖', name: 'AI Agent', category: 'tools' },
        { icon: '🛠️', name: 'Framework', category: 'tools' },
        { icon: '📚', name: 'Stacks', category: 'tools' },
        { icon: '🎯', name: 'Templates', category: 'tools' },
        { icon: '📈', name: 'Analytics', category: 'tools' },
        { icon: '🔒', name: 'Security', category: 'tools' },
        { icon: '⚡', name: 'Performance', category: 'tools' },
        { icon: '🌐', name: 'Network', category: 'tools' },
      ]
    },
    actions: {
      title: 'Actions',
      symbols: [
        { icon: '▶️', name: 'Play', category: 'actions' },
        { icon: '⏸️', name: 'Pause', category: 'actions' },
        { icon: '⏹️', name: 'Stop', category: 'actions' },
        { icon: '💾', name: 'Save', category: 'actions' },
        { icon: '📤', name: 'Export', category: 'actions' },
        { icon: '📥', name: 'Import', category: 'actions' },
        { icon: '🔄', name: 'Refresh', category: 'actions' },
        { icon: '🗑️', name: 'Delete', category: 'actions' },
      ]
    },
    platforms: {
      title: 'Platforms',
      symbols: [
        { icon: '🌐', name: 'Web', category: 'platforms' },
        { icon: '📱', name: 'Mobile', category: 'platforms' },
        { icon: '💻', name: 'Desktop', category: 'platforms' },
        { icon: '🖥️', name: 'Server', category: 'platforms' },
        { icon: '☁️', name: 'Cloud', category: 'platforms' },
        { icon: '📱', name: 'iOS', category: 'platforms' },
        { icon: '🤖', name: 'Android', category: 'platforms' },
        { icon: '🐧', name: 'Linux', category: 'platforms' },
      ]
    },
    wellness: {
      title: 'Wellness',
      symbols: [
        { icon: '🧘', name: 'Meditate', category: 'wellness' },
        { icon: '💪', name: 'Exercise', category: 'wellness' },
        { icon: '📅', name: 'Habits', category: 'wellness' },
        { icon: '🎯', name: 'Goals', category: 'wellness' },
        { icon: '⏰', name: 'Time', category: 'wellness' },
        { icon: '📈', name: 'Progress', category: 'wellness' },
        { icon: '🧠', name: 'Focus', category: 'wellness' },
        { icon: '⚖️', name: 'Balance', category: 'wellness' },
      ]
    }
  };

  const filteredSymbols = Object.values(symbolCategories)
    .flatMap(category => category.symbols)
    .filter(symbol => 
      symbol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      symbol.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const copyToClipboard = (symbol) => {
    navigator.clipboard.writeText(symbol.icon);
    // Could add a toast notification here
  };

  return (
    <DictionaryContainer>
      <SearchBar
        type="text"
        placeholder="🔍 Search symbols..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {searchTerm ? (
        <div>
          <CategoryTitle>Search Results</CategoryTitle>
          <SymbolGrid>
            {filteredSymbols.map((symbol, index) => (
              <SymbolCard
                key={`${symbol.name}-${index}`}
                onClick={() => copyToClipboard(symbol)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SymbolIcon>{symbol.icon}</SymbolIcon>
                <SymbolName>{symbol.name}</SymbolName>
                <SymbolCategory>{symbol.category}</SymbolCategory>
              </SymbolCard>
            ))}
          </SymbolGrid>
        </div>
      ) : (
        Object.entries(symbolCategories).map(([key, category]) => (
          <CategorySection key={key}>
            <CategoryTitle>{category.title}</CategoryTitle>
            <SymbolGrid>
              {category.symbols.map((symbol, index) => (
                <SymbolCard
                  key={`${symbol.name}-${index}`}
                  onClick={() => copyToClipboard(symbol)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SymbolIcon>{symbol.icon}</SymbolIcon>
                  <SymbolName>{symbol.name}</SymbolName>
                  <SymbolCategory>{symbol.category}</SymbolCategory>
                </SymbolCard>
              ))}
            </SymbolGrid>
          </CategorySection>
        ))
      )}
    </DictionaryContainer>
  );
};

export default SymbolDictionary;