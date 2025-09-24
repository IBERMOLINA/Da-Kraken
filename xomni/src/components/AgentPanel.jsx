import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import ClaudeService from '../services/claudeService';

const AgentContainer = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
`;

const AgentHeader = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const AgentAvatar = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: ${props => props.theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 16px;
  box-shadow: 0 0 20px ${props => props.theme.colors.glow};
`;

const AgentStatus = styled.div`
  color: ${props => props.theme.colors.success};
  font-size: ${props => props.theme.typography.fontSize.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: ${props => props.theme.colors.success};
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const PromptInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  font-family: inherit;
  font-size: ${props => props.theme.typography.fontSize.sm};
  padding: 16px;
  resize: vertical;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.shadow};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  padding: 12px 16px;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceLight};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${props => props.theme.colors.shadow};
  }
`;

const ResponseArea = styled.div`
  flex: 1;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 16px;
  overflow-y: auto;
`;

const ResponseMessage = styled(motion.div)`
  margin-bottom: 16px;
  padding: 12px;
  background: ${props => props.isUser ? props.theme.colors.primary : props.theme.colors.surfaceLight};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.isUser ? props.theme.colors.background : props.theme.colors.text};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  max-width: 80%;
`;

const AgentPanel = ({ isOnline }) => {
  const [prompt, setPrompt] = useState('');
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'agent',
      content: 'Hello! I\'m your xomni AI agent powered by Claude. I can help you create frameworks, scaffolding, and manage your development stacks. What would you like to build today?',
      timestamp: new Date()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [claudeService] = useState(new ClaudeService());
  const [isClaudeAvailable, setIsClaudeAvailable] = useState(false);

  useEffect(() => {
    setIsClaudeAvailable(claudeService.isAvailable());
  }, [claudeService]);

  const quickActions = [
    { icon: '🏗️', label: 'Framework', action: 'create-framework' },
    { icon: '📦', label: 'Scaffold', action: 'create-scaffolding' },
    { icon: '📚', label: 'Stack', action: 'create-stack' },
    { icon: '🎯', label: 'Template', action: 'create-template' },
    { icon: '🔧', label: 'Optimize', action: 'optimize-code' },
    { icon: '🧪', label: 'Test', action: 'run-tests' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsProcessing(true);

    try {
      // Try to use Claude API if available
      if (isClaudeAvailable && isOnline) {
        const response = await claudeService.sendMessage(currentPrompt, conversation);
        
        let agentResponse;
        if (response.success) {
          agentResponse = {
            id: Date.now() + 1,
            type: 'agent',
            content: response.content,
            timestamp: new Date(),
            source: 'claude'
          };
        } else {
          // Use fallback response from Claude service
          agentResponse = {
            id: Date.now() + 1,
            type: 'agent',
            content: response.fallbackResponse,
            timestamp: new Date(),
            source: 'fallback',
            error: response.error
          };
        }
        
        setConversation(prev => [...prev, agentResponse]);
      } else {
        // Use local simulation
        setTimeout(() => {
          const agentResponse = generateResponse(currentPrompt);
          setConversation(prev => [...prev, agentResponse]);
          setIsProcessing(false);
        }, 1500);
        return; // Early return to avoid setting isProcessing(false) twice
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const agentResponse = generateResponse(currentPrompt);
      setConversation(prev => [...prev, agentResponse]);
    }
    
    setIsProcessing(false);
  };

  const generateResponse = (userPrompt) => {
    const responses = [
      'I understand you want to create a framework. Let me help you set up the structure.',
      'I\'ll scaffold that project for you. What specific features do you need?',
      'Great! I\'ll create a stack configuration for your requirements.',
      'I\'ve optimized your code structure. The performance improvements are ready.',
      'All tests are passing. Your code is ready for deployment.',
      'I\'ve created a template based on your specifications.',
    ];

    return {
      id: Date.now(),
      type: 'agent',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date()
    };
  };

  const handleQuickAction = (action) => {
    const prompts = {
      'create-framework': 'Create a new framework for a web application',
      'create-scaffolding': 'Set up project scaffolding for a React app',
      'create-stack': 'Build a full-stack application stack',
      'create-template': 'Generate a template for a mobile app',
      'optimize-code': 'Optimize the current codebase for performance',
      'run-tests': 'Run comprehensive tests on the project'
    };

    setPrompt(prompts[action]);
  };

  return (
    <AgentContainer>
      <AgentHeader>
        <AgentAvatar
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          🤖
        </AgentAvatar>
        <h2 style={{ color: props => props.theme.colors.primary, marginBottom: '8px' }}>
          xomni Agent {isClaudeAvailable ? '✨' : '🤖'}
        </h2>
        <AgentStatus>
          {isOnline ? 
            (isClaudeAvailable ? 'Claude AI Ready' : 'Online (Simulation Mode)') : 
            'Offline Mode'}
        </AgentStatus>
      </AgentHeader>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <PromptInput
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you'd like to build..."
          disabled={isProcessing}
        />
        
        <ActionButtons>
          {quickActions.map((action, index) => (
            <ActionButton
              key={index}
              onClick={() => handleQuickAction(action.action)}
              disabled={isProcessing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action.icon} {action.label}
            </ActionButton>
          ))}
        </ActionButtons>
      </form>

      <ResponseArea>
        <AnimatePresence>
          {conversation.map((message) => (
            <ResponseMessage
              key={message.id}
              isUser={message.type === 'user'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ marginBottom: '8px', fontSize: '12px', opacity: 0.7 }}>
                {message.type === 'user' ? 'You' : 
                  (message.source === 'claude' ? 'Claude AI' : 
                   message.source === 'fallback' ? 'Agent (Fallback)' : 'Agent')} • {message.timestamp.toLocaleTimeString()}
                {message.error && (
                  <span style={{ color: 'orange', marginLeft: '8px' }} title={message.error}>⚠️</span>
                )}
              </div>
              {message.content}
            </ResponseMessage>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '20px', color: props => props.theme.colors.primary }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
            Processing...
          </motion.div>
        )}
      </ResponseArea>
    </AgentContainer>
  );
};

export default AgentPanel;