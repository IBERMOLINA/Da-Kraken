import { css, keyframes } from 'styled-components';

const mechanicalPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
`;

const mechanicalSpin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const mechanicalFloat = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const mechanicalGlow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 5px rgba(0, 255, 136, 0.3)); }
  50% { filter: drop-shadow(0 0 15px rgba(0, 255, 136, 0.8)); }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
`;

export const GlobalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    font-family: ${props => props.theme.typography.fontFamily};
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    overflow: hidden;
    user-select: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: ${props => props.theme.colors.border} ${props => props.theme.colors.background};
  }

  *::-webkit-scrollbar {
    width: 8px;
  }

  *::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  *::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }

  *::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.borderLight};
  }

  button {
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border-radius: ${props => props.theme.borderRadius.md};
    cursor: pointer;
    font-family: inherit;
    font-size: ${props => props.theme.typography.fontSize.sm};
    transition: all ${props => props.theme.transitions.fast};
    position: relative;
    overflow: hidden;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2), transparent);
      transition: left 0.5s;
    }
    
    &:hover {
      background: ${props => props.theme.colors.surfaceLight};
      border-color: ${props => props.theme.colors.primary};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px ${props => props.theme.colors.shadow};
      
      &:before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    &:focus {
      outline: 2px solid ${props => props.theme.colors.primary};
      outline-offset: 2px;
    }
  }

  input, textarea, select {
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    border-radius: ${props => props.theme.borderRadius.md};
    font-family: inherit;
    font-size: ${props => props.theme.typography.fontSize.sm};
    transition: all ${props => props.theme.transitions.fast};
    
    &:focus {
      outline: 2px solid ${props => props.theme.colors.primary};
      outline-offset: 2px;
      border-color: ${props => props.theme.colors.borderLight};
    }

    &::placeholder {
      color: ${props => props.theme.colors.textMuted};
    }
  }

  h1, h2, h3, h4, h5, h6 {
    color: ${props => props.theme.colors.text};
    margin-bottom: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }

  h1 { font-size: ${props => props.theme.typography.fontSize.xxl}; }
  h2 { font-size: ${props => props.theme.typography.fontSize.xl}; }
  h3 { font-size: ${props => props.theme.typography.fontSize.lg}; }
  h4 { font-size: ${props => props.theme.typography.fontSize.md}; }
  h5 { font-size: ${props => props.theme.typography.fontSize.sm}; }
  h6 { font-size: ${props => props.theme.typography.fontSize.xs}; }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  .glow {
    box-shadow: 0 0 20px ${props => props.theme.colors.glow};
  }

  .neon-border {
    border: 1px solid ${props => props.theme.colors.primary};
    box-shadow: 0 0 10px ${props => props.theme.colors.shadow};
  }

  .glass {
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(51, 51, 51, 0.3);
  }

  .symbol-button {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all ${props => props.theme.transitions.normal};
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    position: relative;
    overflow: hidden;
    
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
      transition: all ${props => props.theme.transitions.normal};
      transform: translate(-50%, -50%);
      border-radius: 50%;
    }
    
    &:hover {
      transform: translateY(-3px) scale(1.05);
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 
        0 8px 16px rgba(0, 0, 0, 0.4),
        0 0 20px ${props => props.theme.colors.shadow},
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: ${mechanicalPulse} 2s infinite;
      
      &:before {
        width: 100%;
        height: 100%;
      }
    }
    
    &:active {
      transform: translateY(-1px) scale(1.02);
      animation: none;
    }
  }

  .mechanical-element {
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, 
        ${props => props.theme.colors.mechanical.darkMetal} 0%,
        ${props => props.theme.colors.mechanical.metal} 25%,
        ${props => props.theme.colors.mechanical.lightMetal} 50%,
        ${props => props.theme.colors.mechanical.metal} 75%,
        ${props => props.theme.colors.mechanical.darkMetal} 100%);
      border-radius: inherit;
      z-index: -1;
      opacity: 0;
      transition: opacity ${props => props.theme.transitions.normal};
    }
    
    &:hover:before {
      opacity: 0.3;
    }
  }

  .floating-element {
    animation: ${mechanicalFloat} 3s ease-in-out infinite;
  }

  .spinning-element {
    animation: ${mechanicalSpin} 10s linear infinite;
  }

  .glowing-element {
    animation: ${mechanicalGlow} 2s ease-in-out infinite alternate;
  }

  .spark-effect {
    position: relative;
    
    &:after {
      content: '✨';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 12px;
      animation: ${sparkle} 2s ease-in-out infinite;
      pointer-events: none;
    }
  }

  .mechanical-panel {
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.lg};
    position: relative;
    overflow: hidden;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent, 
        ${props => props.theme.colors.primary}, 
        transparent);
      opacity: 0.5;
    }
    
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent, 
        ${props => props.theme.colors.mechanical.metal}, 
        transparent);
      opacity: 0.3;
    }
  }

  .metal-texture {
    background: linear-gradient(145deg, 
      ${props => props.theme.colors.mechanical.darkMetal} 0%,
      ${props => props.theme.colors.mechanical.metal} 50%,
      ${props => props.theme.colors.mechanical.lightMetal} 100%);
    background-size: 100px 100px;
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          45deg,
          transparent,
          transparent 2px,
          rgba(255, 255, 255, 0.03) 2px,
          rgba(255, 255, 255, 0.03) 4px
        );
    }
  }
`;