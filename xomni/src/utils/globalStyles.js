import { css } from 'styled-components';

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
    
    &:hover {
      background: ${props => props.theme.colors.surfaceLight};
      border-color: ${props => props.theme.colors.borderLight};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
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
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    transition: all ${props => props.theme.transitions.fast};
    
    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 15px ${props => props.theme.colors.shadow};
    }
  }
`;