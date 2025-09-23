import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import MechanicalSymbol from './MechanicalSymbol';

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
    mechanical: {
      title: 'Mechanical & Industrial',
      symbols: [
        { icon: 'gear', name: 'Gear', category: 'mechanical', rotating: true },
        { icon: 'cog', name: 'Cog', category: 'mechanical', rotating: true },
        { icon: 'bolt', name: 'Bolt', category: 'mechanical' },
        { icon: 'wrench', name: 'Wrench', category: 'mechanical' },
        { icon: 'hammer', name: 'Hammer', category: 'mechanical' },
        { icon: 'screwdriver', name: 'Screwdriver', category: 'mechanical' },
        { icon: 'nut', name: 'Nut', category: 'mechanical' },
        { icon: 'chain', name: 'Chain', category: 'mechanical' },
      ]
    },
    navigation: {
      title: 'Navigation',
      symbols: [
        { icon: 'folder', name: 'Folder', category: 'navigation' },
        { icon: 'search', name: 'Search', category: 'navigation' },
        { icon: 'gear', name: 'Settings', category: 'navigation', rotating: true },
        { icon: 'folder', name: 'Projects', category: 'navigation' },
      ]
    },
    development: {
      title: 'Development',
      symbols: [
        { icon: 'bolt', name: 'Develop', category: 'development' },
        { icon: 'cog', name: 'Test', category: 'development', rotating: true },
        { icon: 'gear', name: 'Optimize', category: 'development', rotating: true },
        { icon: 'rocket', name: 'Deploy', category: 'development' },
        { icon: 'gear', name: 'Build', category: 'development', rotating: true },
      ]
    },
    automation: {
      title: 'Automation & AI',
      symbols: [
        { icon: 'robot', name: 'AI Agent', category: 'automation' },
        { icon: 'automation', name: 'Automation', category: 'automation', rotating: true },
        { icon: 'factory', name: 'Factory', category: 'automation' },
        { icon: 'circuit', name: 'Circuit', category: 'automation' },
        { icon: 'battery', name: 'Power', category: 'automation' },
        { icon: 'electric', name: 'Electric', category: 'automation' },
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
    // For mechanical symbols, copy the symbol type instead of emoji
    const symbolText = typeof symbol.icon === 'string' && symbol.icon.length === 1 
      ? symbol.icon 
      : symbol.name;
    navigator.clipboard.writeText(symbolText);
    console.log(`Copied ${symbol.name} to clipboard`);
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
                className="mechanical-element"
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <MechanicalSymbol 
                    type={symbol.icon} 
                    size="48px" 
                    rotating={symbol.rotating}
                  />
                </div>
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
                  className="mechanical-element"
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <MechanicalSymbol 
                      type={symbol.icon} 
                      size="48px" 
                      rotating={symbol.rotating}
                    />
                  </div>
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