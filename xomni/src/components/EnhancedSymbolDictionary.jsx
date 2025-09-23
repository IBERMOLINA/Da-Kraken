import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FloatingSymbol } from './FloatingSymbols';

const DictionaryContainer = styled.div`
  padding: 20px;
  height: 100%;
  overflow-y: auto;
  background: ${props => props.theme.colors.background};
  position: relative;
  
  /* Add ambient particles background */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 255, 136, 0.03) 2px, transparent 2px),
      radial-gradient(circle at 80% 40%, rgba(78, 205, 196, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 40% 80%, rgba(255, 107, 107, 0.03) 1.5px, transparent 1.5px);
    background-size: 60px 60px, 40px 40px, 80px 80px;
    animation: float 25s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
`;

const SymbolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const SymbolCard = styled(motion.div)`
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: rgba(26, 26, 26, 0.9);
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-4px);
    box-shadow: 
      0 12px 24px rgba(0, 0, 0, 0.4),
      0 0 30px ${props => props.theme.colors.primary}30;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      ${props => props.theme.colors.primary}10,
      transparent
    );
    transform: rotate(45deg);
    transition: all 0.5s ease;
    opacity: 0;
  }
  
  &:hover::before {
    opacity: 1;
    transform: rotate(45deg) translate(100%, 100%);
  }
`;

const SymbolWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
`;

const SymbolName = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;
  font-weight: 500;
`;

const SymbolCategory = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CategorySection = styled.div`
  margin-bottom: 50px;
`;

const CategoryTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: 30px;
  text-align: center;
  text-shadow: 0 0 20px ${props => props.theme.colors.glow};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.colors.primary}, transparent);
    border-radius: 1px;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 15px 20px;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-bottom: 30px;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 
      0 0 0 2px ${props => props.theme.colors.primary}30,
      0 0 20px ${props => props.theme.colors.primary}20;
    background: rgba(26, 26, 26, 0.95);
  }
`;

const EnhancedSymbolDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const symbolCategories = {
    navigation: {
      title: 'Navigation & Interface',
      symbols: [
        { shape: 'cube', color: '#00ff88', hoverColor: '#4ecdc4', name: 'Home', category: 'navigation' },
        { shape: 'sphere', color: '#ff6b6b', hoverColor: '#ff8a80', name: 'Agent', category: 'navigation' },
        { shape: 'crystal', color: '#4ecdc4', hoverColor: '#26c6da', name: 'Symbols', category: 'navigation' },
        { shape: 'pyramid', color: '#ffa500', hoverColor: '#ffb74d', name: 'Stacks', category: 'navigation' },
        { shape: 'ring', color: '#9c27b0', hoverColor: '#ba68c8', name: 'Settings', category: 'navigation' },
        { shape: 'diamond', color: '#2196f3', hoverColor: '#42a5f5', name: 'Search', category: 'navigation' },
      ]
    },
    development: {
      title: 'Development Tools',
      symbols: [
        { shape: 'diamond', color: '#9c27b0', hoverColor: '#ba68c8', name: 'Develop', category: 'development' },
        { shape: 'crystal', color: '#ff9800', hoverColor: '#ffb74d', name: 'Test', category: 'development' },
        { shape: 'sphere', color: '#03dac6', hoverColor: '#4dd0e1', name: 'Optimize', category: 'development' },
        { shape: 'ring', color: '#ff5722', hoverColor: '#ff7043', name: 'Deploy', category: 'development' },
        { shape: 'diamond', color: '#2196f3', hoverColor: '#42a5f5', name: 'Edit', category: 'development' },
        { shape: 'cube', color: '#795548', hoverColor: '#8d6e63', name: 'Package', category: 'development' },
      ]
    },
    data: {
      title: 'Data & Storage',
      symbols: [
        { shape: 'cube', color: '#607d8b', hoverColor: '#78909c', name: 'Database', category: 'data' },
        { shape: 'pyramid', color: '#ff9800', hoverColor: '#ffb74d', name: 'Cache', category: 'data' },
        { shape: 'crystal', color: '#4caf50', hoverColor: '#66bb6a', name: 'Backup', category: 'data' },
        { shape: 'ring', color: '#e91e63', hoverColor: '#f06292', name: 'Sync', category: 'data' },
        { shape: 'sphere', color: '#3f51b5', hoverColor: '#5c6bc0', name: 'Analytics', category: 'data' },
        { shape: 'diamond', color: '#ff5722', hoverColor: '#ff7043', name: 'Export', category: 'data' },
      ]
    },
    communication: {
      title: 'Communication',
      symbols: [
        { shape: 'sphere', color: '#2196f3', hoverColor: '#42a5f5', name: 'Message', category: 'communication' },
        { shape: 'ring', color: '#4caf50', hoverColor: '#66bb6a', name: 'Call', category: 'communication' },
        { shape: 'crystal', color: '#ff9800', hoverColor: '#ffb74d', name: 'Video', category: 'communication' },
        { shape: 'pyramid', color: '#9c27b0', hoverColor: '#ba68c8', name: 'Share', category: 'communication' },
        { shape: 'diamond', color: '#f44336', hoverColor: '#ef5350', name: 'Alert', category: 'communication' },
        { shape: 'cube', color: '#00bcd4', hoverColor: '#26c6da', name: 'Collaborate', category: 'communication' },
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
    // For now, just copy the symbol name since we're using abstract shapes
    navigator.clipboard.writeText(symbol.name);
    console.log(`Copied: ${symbol.name}`);
  };

  return (
    <DictionaryContainer>
      <ContentWrapper>
        <SearchBar
          type="text"
          placeholder="🔍 Search floating symbols..."
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
                  <SymbolWrapper>
                    <FloatingSymbol
                      shape={symbol.shape}
                      color={symbol.color}
                      hoverColor={symbol.hoverColor}
                      size="60px"
                      floatDuration={`${2 + Math.random() * 2}s`}
                      delay={`${Math.random() * 2}s`}
                    />
                  </SymbolWrapper>
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
                    <SymbolWrapper>
                      <FloatingSymbol
                        shape={symbol.shape}
                        color={symbol.color}
                        hoverColor={symbol.hoverColor}
                        size="60px"
                        floatDuration={`${2 + Math.random() * 2}s`}
                        delay={`${Math.random() * 2}s`}
                      />
                    </SymbolWrapper>
                    <SymbolName>{symbol.name}</SymbolName>
                    <SymbolCategory>{symbol.category}</SymbolCategory>
                  </SymbolCard>
                ))}
              </SymbolGrid>
            </CategorySection>
          ))
        )}
      </ContentWrapper>
    </DictionaryContainer>
  );
};

export default EnhancedSymbolDictionary;