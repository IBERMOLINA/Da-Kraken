import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const ProductionContainer = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
  overflow-y: auto;
`;

const ProductionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
`;

const LineStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const ProductionLine = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding: 20px 0;
`;

const ProductionStation = styled(motion.div)`
  min-width: 280px;
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => {
    if (props.active) return props.theme.colors.primary;
    if (props.hasItems) return props.theme.colors.success;
    return props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

const StationHeader = styled.div`
  background: ${props => {
    if (props.active) return props.theme.colors.primary;
    if (props.hasItems) return props.theme.colors.success;
    return props.theme.colors.surfaceLight;
  }};
  color: ${props => props.active || props.hasItems ? props.theme.colors.background : props.theme.colors.text};
  padding: 16px 20px;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StationContent = styled.div`
  flex: 1;
  padding: 20px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WorkItem = styled(motion.div)`
  background: ${props => props.theme.colors.backgroundLight};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => props.theme.colors.shadow};
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ItemTitle = styled.h4`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin: 0;
`;

const ItemStatus = styled.span`
  background: ${props => {
    switch(props.status) {
      case 'ready': return props.theme.colors.success;
      case 'processing': return props.theme.colors.warning;
      case 'blocked': return props.theme.colors.error;
      default: return props.theme.colors.info;
    }
  }};
  color: ${props => props.theme.colors.background};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ConveyorBelt = styled.div`
  height: 4px;
  background: ${props => props.theme.colors.border};
  margin: 0 20px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
`;

const ConveyorMotion = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    ${props => props.theme.colors.primary} 0px,
    ${props => props.theme.colors.primary} 10px,
    transparent 10px,
    transparent 20px
  );
  width: 100%;
`;

const MetricsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const MetricCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 20px;
  text-align: center;
`;

const MetricValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ProductionLineManager = ({ stacks = [] }) => {
  const [activeStation, setActiveStation] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [workItems, setWorkItems] = useState({});
  const [metrics, setMetrics] = useState({
    throughput: 0,
    processed: 0,
    inProgress: 0,
    quality: 98.5
  });

  const stations = [
    {
      id: 'design',
      name: 'Design Studio',
      icon: '🎨',
      description: 'UI/UX Design & Planning',
      color: '#8B5CF6'
    },
    {
      id: 'develop',
      name: 'Development Lab',
      icon: '⚡',
      description: 'Code Implementation',
      color: '#06B6D4'
    },
    {
      id: 'test',
      name: 'Testing Facility',
      icon: '🧪',
      description: 'Quality Assurance',
      color: '#F59E0B'
    },
    {
      id: 'build',
      name: 'Build Factory',
      icon: '🏗️',
      description: 'Package & Optimize',
      color: '#10B981'
    },
    {
      id: 'deploy',
      name: 'Launch Pad',
      icon: '🚀',
      description: 'Deployment & Release',
      color: '#EF4444'
    }
  ];

  useEffect(() => {
    // Initialize work items from stacks
    const initialItems = {};
    stations.forEach(station => {
      initialItems[station.id] = [];
    });
    
    // Add some sample work items in different stations
    if (stacks.length > 0) {
      initialItems.design = stacks.slice(0, 2).map((stack, idx) => ({
        id: `design-${idx}`,
        title: `${stack.name} Design`,
        status: 'ready',
        type: 'design',
        stack: stack.name,
        progress: Math.floor(Math.random() * 100),
        priority: idx === 0 ? 'high' : 'normal'
      }));
      
      initialItems.develop = stacks.slice(2, 4).map((stack, idx) => ({
        id: `dev-${idx}`,
        title: `${stack.name} Development`,
        status: 'processing',
        type: 'development',
        stack: stack.name,
        progress: Math.floor(Math.random() * 80),
        priority: 'normal'
      }));
    }
    
    setWorkItems(initialItems);
  }, [stacks]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          throughput: Math.floor(Math.random() * 10) + 5,
          processed: prev.processed + Math.floor(Math.random() * 3),
          inProgress: Object.values(workItems).flat().length
        }));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning, workItems]);

  const handleStartProduction = () => {
    setIsRunning(!isRunning);
  };

  const moveItemToNextStation = (itemId, fromStationId) => {
    const currentStationIndex = stations.findIndex(s => s.id === fromStationId);
    const nextStation = stations[currentStationIndex + 1];
    
    if (nextStation) {
      setWorkItems(prev => {
        const item = prev[fromStationId].find(i => i.id === itemId);
        const newItems = { ...prev };
        newItems[fromStationId] = prev[fromStationId].filter(i => i.id !== itemId);
        newItems[nextStation.id] = [...prev[nextStation.id], {
          ...item,
          status: 'ready',
          type: nextStation.id
        }];
        return newItems;
      });
    }
  };

  return (
    <ProductionContainer>
      <ProductionHeader>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: 'inherit' }}>Manufacturing Production Line</h2>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>
            Automated app development pipeline with quality control
          </p>
        </div>
        <LineStatus>
          <motion.button
            onClick={handleStartProduction}
            style={{
              background: isRunning ? '#EF4444' : '#10B981',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? '🛑 Stop Production' : '▶️ Start Production'}
          </motion.button>
          <div style={{ 
            color: isRunning ? '#10B981' : '#6B7280',
            fontWeight: 'bold'
          }}>
            {isRunning ? '🟢 Running' : '🔴 Stopped'}
          </div>
        </LineStatus>
      </ProductionHeader>

      <MetricsPanel>
        <MetricCard>
          <MetricValue>{metrics.throughput}/hr</MetricValue>
          <MetricLabel>Throughput Rate</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{metrics.processed}</MetricValue>
          <MetricLabel>Items Processed</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{metrics.inProgress}</MetricValue>
          <MetricLabel>In Progress</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{metrics.quality}%</MetricValue>
          <MetricLabel>Quality Score</MetricLabel>
        </MetricCard>
      </MetricsPanel>

      <ProductionLine>
        <AnimatePresence>
          {stations.map((station, index) => {
            const items = workItems[station.id] || [];
            const isActive = activeStation === index;
            const hasItems = items.length > 0;
            
            return (
              <React.Fragment key={station.id}>
                <ProductionStation
                  active={isActive}
                  hasItems={hasItems}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveStation(index)}
                >
                  <StationHeader active={isActive} hasItems={hasItems}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '24px' }}>{station.icon}</div>
                      <div>
                        <div>{station.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          {station.description}
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '12px', 
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {items.length}
                    </div>
                  </StationHeader>
                  
                  <StationContent>
                    <AnimatePresence>
                      {items.map(item => (
                        <WorkItem
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          onClick={() => moveItemToNextStation(item.id, station.id)}
                        >
                          <ItemHeader>
                            <ItemTitle>{item.title}</ItemTitle>
                            <ItemStatus status={item.status}>
                              {item.status}
                            </ItemStatus>
                          </ItemHeader>
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'rgba(255,255,255,0.6)',
                            marginBottom: '8px'
                          }}>
                            {item.stack} • Priority: {item.priority}
                          </div>
                          <div style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            height: '4px', 
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <motion.div
                              style={{
                                height: '100%',
                                background: '#10B981',
                                borderRadius: '2px'
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </WorkItem>
                      ))}
                    </AnimatePresence>
                    
                    {items.length === 0 && (
                      <div style={{ 
                        textAlign: 'center', 
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: '40px',
                        fontSize: '14px'
                      }}>
                        No items in queue
                      </div>
                    )}
                  </StationContent>
                </ProductionStation>
                
                {index < stations.length - 1 && (
                  <ConveyorBelt>
                    {isRunning && (
                      <ConveyorMotion
                        animate={{ x: ['0%', '100%'] }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          ease: 'linear' 
                        }}
                      />
                    )}
                  </ConveyorBelt>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </ProductionLine>
      
      <div style={{ 
        textAlign: 'center', 
        color: 'rgba(255,255,255,0.7)',
        fontSize: '14px',
        marginTop: '20px'
      }}>
        💡 Click on work items to move them to the next station
      </div>
    </ProductionContainer>
  );
};

export default ProductionLineManager;