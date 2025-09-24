#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧮 Starting MATLAB/Octave Development Container${NC}"
echo -e "${BLUE}Scientific Computing and Data Analysis Environment${NC}"

# Initialize workspace if not already done
if [ ! -f "/workspace/.initialized" ]; then
    echo -e "${YELLOW}📦 Initializing MATLAB/Octave workspace...${NC}"
    
    # Copy templates to workspace
    cp -r /templates/* /workspace/ 2>/dev/null || true
    
    # Create project structure
    mkdir -p /workspace/{algorithms,data_analysis,signal_processing,image_processing,control_systems,optimization,machine_learning,visualization}
    
    # Create .gitignore for MATLAB projects
    cat > /workspace/.gitignore << 'EOF'
# MATLAB/Octave files
*.asv
*.m~
*.mex*
*.p
*.slx.autosave
*.slxc
slprj/
*.slx.original

# Octave specific
octave-workspace
.octave_hist

# Data files
*.mat
*.h5
*.hdf5
*.nc

# Output files
*.fig
*.eps
*.pdf
*.png
*.jpg
*.jpeg
*.svg
*.tiff

# Log files
*.log
diary

# Compiled MEX files
*.mexa64
*.mexglx
*.mexmaci64
*.mexw32
*.mexw64

# Simulink cache
*.slxc
slprj/

# Code generation
codegen/
*.prj

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
*~

# Backup files
*.bak
*.backup
*.orig

# Temporary files
tmp/
temp/
EOF

    # Create main MATLAB script
    cat > /workspace/main.m << 'EOF'
%% Main MATLAB/Octave Script
% Scientific Computing and Data Analysis Workspace
% Da-Kraken Development Environment

%% Clear workspace
clear; clc; close all;

%% Display welcome message
fprintf('🧮 Welcome to MATLAB/Octave Development Environment\n');
fprintf('📊 Scientific Computing • Data Analysis • Visualization\n\n');

%% Check if running in Octave or MATLAB
if exist('OCTAVE_VERSION', 'builtin')
    fprintf('Running in GNU Octave %s\n', OCTAVE_VERSION);
    software = 'Octave';
else
    fprintf('Running in MATLAB %s\n', version);
    software = 'MATLAB';
end

%% Load required packages (Octave)
if strcmp(software, 'Octave')
    pkg load statistics
    pkg load signal
    pkg load image
    pkg load control
    pkg load symbolic
    pkg load parallel
    pkg load optim
    fprintf('📦 Loaded Octave packages\n');
end

%% Add paths
addpath('src');
addpath('functions');
addpath('classes');
addpath('algorithms');
addpath('data_analysis');
addpath('visualization');

%% Set default figure properties
set(0, 'DefaultFigureWindowStyle', 'docked');
set(0, 'DefaultAxesFontSize', 12);
set(0, 'DefaultTextFontSize', 12);

%% Example: Basic data analysis and visualization
fprintf('\n📈 Running example data analysis...\n');

% Generate sample data
t = linspace(0, 4*pi, 1000);
signal1 = sin(t) + 0.5*sin(3*t) + 0.2*randn(size(t));
signal2 = cos(t) + 0.3*cos(2*t) + 0.1*randn(size(t));

% Create visualization
figure('Name', 'Sample Data Analysis');

subplot(2,2,1);
plot(t, signal1, 'b-', 'LineWidth', 1.5);
title('Signal 1: Sine Wave with Noise');
xlabel('Time'); ylabel('Amplitude');
grid on;

subplot(2,2,2);
plot(t, signal2, 'r-', 'LineWidth', 1.5);
title('Signal 2: Cosine Wave with Noise');
xlabel('Time'); ylabel('Amplitude');
grid on;

subplot(2,2,3);
histogram(signal1, 30, 'FaceColor', 'blue', 'FaceAlpha', 0.7);
title('Signal 1 Distribution');
xlabel('Amplitude'); ylabel('Frequency');

subplot(2,2,4);
scatter(signal1, signal2, 20, t, 'filled');
title('Signal Correlation');
xlabel('Signal 1'); ylabel('Signal 2');
colorbar; colormap('jet');

% Statistics
fprintf('📊 Signal Statistics:\n');
fprintf('   Signal 1: Mean=%.3f, Std=%.3f\n', mean(signal1), std(signal1));
fprintf('   Signal 2: Mean=%.3f, Std=%.3f\n', mean(signal2), std(signal2));
fprintf('   Correlation: %.3f\n', corr(signal1', signal2'));

%% Save workspace
save('workspace_data.mat');
fprintf('\n💾 Workspace saved to workspace_data.mat\n');

%% Display available functions
fprintf('\n🔧 Available utility functions:\n');
fprintf('   • demo_signal_processing() - Signal processing examples\n');
fprintf('   • demo_data_analysis() - Data analysis examples\n');
fprintf('   • demo_visualization() - Advanced plotting examples\n');
fprintf('   • demo_machine_learning() - ML algorithms\n');
fprintf('   • demo_optimization() - Optimization examples\n');

fprintf('\n🚀 Ready for scientific computing!\n');
EOF

    # Create utility functions
    mkdir -p /workspace/functions
    
    # Signal processing demo
    cat > /workspace/functions/demo_signal_processing.m << 'EOF'
function demo_signal_processing()
%DEMO_SIGNAL_PROCESSING Demonstrate signal processing capabilities
    
    fprintf('🔊 Signal Processing Demo\n');
    
    % Generate test signals
    fs = 1000; % Sampling frequency
    t = 0:1/fs:1-1/fs; % Time vector
    
    % Original signal
    f1 = 50; % Frequency 1
    f2 = 120; % Frequency 2
    signal = sin(2*pi*f1*t) + 0.5*sin(2*pi*f2*t) + 0.2*randn(size(t));
    
    % Apply filters
    % Low-pass filter
    [b_low, a_low] = butter(4, 80/(fs/2), 'low');
    signal_low = filter(b_low, a_low, signal);
    
    % High-pass filter
    [b_high, a_high] = butter(4, 80/(fs/2), 'high');
    signal_high = filter(b_high, a_high, signal);
    
    % FFT analysis
    N = length(signal);
    f = fs*(0:(N/2))/N;
    Y = fft(signal);
    P2 = abs(Y/N);
    P1 = P2(1:N/2+1);
    P1(2:end-1) = 2*P1(2:end-1);
    
    % Visualization
    figure('Name', 'Signal Processing Demo');
    
    subplot(2,3,1);
    plot(t(1:200), signal(1:200));
    title('Original Signal');
    xlabel('Time (s)'); ylabel('Amplitude');
    
    subplot(2,3,2);
    plot(t(1:200), signal_low(1:200));
    title('Low-pass Filtered');
    xlabel('Time (s)'); ylabel('Amplitude');
    
    subplot(2,3,3);
    plot(t(1:200), signal_high(1:200));
    title('High-pass Filtered');
    xlabel('Time (s)'); ylabel('Amplitude');
    
    subplot(2,3,4);
    plot(f, P1);
    title('Frequency Spectrum');
    xlabel('Frequency (Hz)'); ylabel('Magnitude');
    
    subplot(2,3,5);
    spectrogram(signal, 128, 120, 128, fs, 'yaxis');
    title('Spectrogram');
    
    subplot(2,3,6);
    pwelch(signal, [], [], [], fs);
    title('Power Spectral Density');
    
    fprintf('✅ Signal processing demo completed\n');
end
EOF

    # Data analysis demo
    cat > /workspace/functions/demo_data_analysis.m << 'EOF'
function demo_data_analysis()
%DEMO_DATA_ANALYSIS Demonstrate data analysis capabilities
    
    fprintf('📊 Data Analysis Demo\n');
    
    % Generate sample dataset
    n = 1000;
    x1 = randn(n, 1);
    x2 = 2*x1 + randn(n, 1)*0.5;
    x3 = x1.^2 + randn(n, 1)*0.3;
    y = 3*x1 + 2*x2 + 0.5*x3 + randn(n, 1)*0.1;
    
    data = [x1, x2, x3, y];
    var_names = {'X1', 'X2', 'X3', 'Y'};
    
    % Statistical analysis
    fprintf('📈 Dataset Statistics:\n');
    fprintf('   Size: %d x %d\n', size(data, 1), size(data, 2));
    fprintf('   Variables: %s\n', strjoin(var_names, ', '));
    
    % Correlation analysis
    R = corr(data);
    fprintf('\n🔗 Correlation Matrix:\n');
    for i = 1:length(var_names)
        fprintf('   %s: ', var_names{i});
        fprintf('%.3f ', R(i, :));
        fprintf('\n');
    end
    
    % Linear regression
    X = [ones(n, 1), x1, x2, x3]; % Add intercept
    beta = X \ y; % Least squares solution
    y_pred = X * beta;
    r_squared = 1 - sum((y - y_pred).^2) / sum((y - mean(y)).^2);
    
    fprintf('\n📐 Linear Regression Results:\n');
    fprintf('   R² = %.4f\n', r_squared);
    fprintf('   Coefficients: [%.3f, %.3f, %.3f, %.3f]\n', beta);
    
    % Visualization
    figure('Name', 'Data Analysis Demo');
    
    subplot(2,3,1);
    histogram(y, 30);
    title('Target Variable Distribution');
    xlabel('Y'); ylabel('Frequency');
    
    subplot(2,3,2);
    scatter(y, y_pred);
    hold on; plot([min(y), max(y)], [min(y), max(y)], 'r--');
    title(sprintf('Predicted vs Actual (R² = %.3f)', r_squared));
    xlabel('Actual'); ylabel('Predicted');
    
    subplot(2,3,3);
    imagesc(R); colorbar; colormap('cool');
    title('Correlation Matrix');
    set(gca, 'XTickLabel', var_names, 'YTickLabel', var_names);
    
    subplot(2,3,4);
    boxplot(data, var_names);
    title('Variable Distributions');
    ylabel('Value');
    
    subplot(2,3,5);
    residuals = y - y_pred;
    scatter(y_pred, residuals);
    hold on; yline(0, 'r--');
    title('Residual Plot');
    xlabel('Predicted'); ylabel('Residuals');
    
    subplot(2,3,6);
    qqplot(residuals);
    title('Q-Q Plot of Residuals');
    
    fprintf('✅ Data analysis demo completed\n');
end
EOF

    # Machine learning demo
    cat > /workspace/functions/demo_machine_learning.m << 'EOF'
function demo_machine_learning()
%DEMO_MACHINE_LEARNING Demonstrate machine learning capabilities
    
    fprintf('🤖 Machine Learning Demo\n');
    
    % Generate classification dataset
    n = 500;
    
    % Class 1
    mu1 = [2, 2];
    sigma1 = [1, 0.5; 0.5, 1];
    X1 = mvnrnd(mu1, sigma1, n/2);
    y1 = ones(n/2, 1);
    
    % Class 2
    mu2 = [-1, -1];
    sigma2 = [1.5, -0.3; -0.3, 1.2];
    X2 = mvnrnd(mu2, sigma2, n/2);
    y2 = -ones(n/2, 1);
    
    % Combine data
    X = [X1; X2];
    y = [y1; y2];
    
    % Split into training and testing
    idx = randperm(n);
    train_idx = idx(1:floor(0.7*n));
    test_idx = idx(floor(0.7*n)+1:end);
    
    X_train = X(train_idx, :);
    y_train = y(train_idx);
    X_test = X(test_idx, :);
    y_test = y(test_idx);
    
    % K-means clustering
    k = 2;
    [cluster_idx, centroids] = kmeans(X, k);
    
    % Simple linear classifier (perceptron-like)
    w = pinv([ones(length(train_idx), 1), X_train]) * y_train;
    y_pred = sign([ones(length(test_idx), 1), X_test] * w);
    
    % Calculate accuracy
    accuracy = mean(y_pred == y_test) * 100;
    
    fprintf('🎯 Classification Results:\n');
    fprintf('   Training samples: %d\n', length(train_idx));
    fprintf('   Testing samples: %d\n', length(test_idx));
    fprintf('   Accuracy: %.1f%%\n', accuracy);
    
    % Visualization
    figure('Name', 'Machine Learning Demo');
    
    subplot(2,2,1);
    scatter(X1(:,1), X1(:,2), 'bo'); hold on;
    scatter(X2(:,1), X2(:,2), 'ro');
    title('Original Dataset');
    xlabel('Feature 1'); ylabel('Feature 2');
    legend('Class 1', 'Class 2');
    
    subplot(2,2,2);
    gscatter(X(:,1), X(:,2), cluster_idx, 'rb', 'o');
    hold on;
    scatter(centroids(:,1), centroids(:,2), 100, 'kx', 'LineWidth', 3);
    title('K-means Clustering');
    xlabel('Feature 1'); ylabel('Feature 2');
    
    subplot(2,2,3);
    scatter(X_train(y_train==1,1), X_train(y_train==1,2), 'bo'); hold on;
    scatter(X_train(y_train==-1,1), X_train(y_train==-1,2), 'ro');
    
    % Plot decision boundary
    x_range = linspace(min(X(:,1)), max(X(:,1)), 100);
    decision_boundary = -(w(1) + w(2)*x_range) / w(3);
    plot(x_range, decision_boundary, 'k--', 'LineWidth', 2);
    
    title('Training Data + Decision Boundary');
    xlabel('Feature 1'); ylabel('Feature 2');
    legend('Class 1', 'Class 2', 'Decision Boundary');
    
    subplot(2,2,4);
    scatter(X_test(y_test==1,1), X_test(y_test==1,2), 'bo'); hold on;
    scatter(X_test(y_test==-1,1), X_test(y_test==-1,2), 'ro');
    scatter(X_test(y_pred~=y_test,1), X_test(y_pred~=y_test,2), 100, 'kx', 'LineWidth', 2);
    title(sprintf('Test Results (Accuracy: %.1f%%)', accuracy));
    xlabel('Feature 1'); ylabel('Feature 2');
    legend('Class 1', 'Class 2', 'Misclassified');
    
    fprintf('✅ Machine learning demo completed\n');
end
EOF

    # Create README
    cat > /workspace/README.md << 'EOF'
# MATLAB/Octave Development Environment

## 🧮 Scientific Computing and Data Analysis

This workspace provides a comprehensive environment for MATLAB/Octave development with focus on:

### Core Capabilities
- **Scientific Computing**: Advanced mathematical operations and algorithms
- **Data Analysis**: Statistical analysis, regression, and data exploration
- **Signal Processing**: Digital signal processing, filtering, and spectral analysis
- **Image Processing**: Image manipulation, enhancement, and computer vision
- **Machine Learning**: Classification, clustering, and regression algorithms
- **Visualization**: Advanced plotting and data visualization
- **Optimization**: Numerical optimization and mathematical programming

### Software Stack
- **GNU Octave**: MATLAB-compatible scientific computing language
- **Python Integration**: NumPy, SciPy, Matplotlib for extended functionality
- **Jupyter Notebooks**: Interactive development and documentation
- **Scientific Libraries**: Statistics, Signal Processing, Image Processing, Control Systems

### Getting Started

1. **Basic Usage:**
   ```octave
   % Start Octave
   octave
   
   % Run main script
   main
   ```

2. **Run Demos:**
   ```octave
   % Signal processing examples
   demo_signal_processing()
   
   % Data analysis examples
   demo_data_analysis()
   
   % Machine learning examples
   demo_machine_learning()
   ```

3. **Jupyter Notebook:**
   ```bash
   # Start Jupyter server
   jupyter notebook --ip=0.0.0.0 --port=8888 --allow-root
   ```

### Project Structure

```
/workspace/
├── src/                    # Source code
├── functions/              # Custom functions
├── classes/                # Object-oriented code
├── algorithms/             # Algorithm implementations
├── data_analysis/          # Data analysis scripts
├── signal_processing/      # DSP algorithms
├── image_processing/       # Image processing code
├── machine_learning/       # ML implementations
├── visualization/          # Plotting utilities
├── data/                   # Data files
├── tests/                  # Unit tests
├── docs/                   # Documentation
└── examples/               # Example code
```

### Key Features

#### Signal Processing
- Digital filtering (Butterworth, Chebyshev, Elliptic)
- FFT and spectral analysis
- Wavelet transforms
- Time-frequency analysis
- Filter design and implementation

#### Data Analysis
- Descriptive statistics
- Linear and nonlinear regression
- Time series analysis
- Principal component analysis
- Correlation and covariance analysis

#### Machine Learning
- Classification algorithms
- Clustering (K-means, hierarchical)
- Regression techniques
- Cross-validation
- Feature selection

#### Visualization
- 2D and 3D plotting
- Statistical plots
- Interactive visualizations
- Publication-quality figures
- Animation and movies

### Available Packages (Octave)
- statistics
- signal
- image
- control
- symbolic
- parallel
- optim

### Tips and Best Practices

1. **Code Organization:**
   - Use functions for reusable code
   - Comment your code thoroughly
   - Follow MATLAB naming conventions

2. **Performance:**
   - Vectorize operations when possible
   - Preallocate arrays
   - Use built-in functions

3. **Debugging:**
   - Use keyboard for interactive debugging
   - Add breakpoints with dbstop
   - Check variable types and sizes

4. **Documentation:**
   - Write clear function headers
   - Include examples in comments
   - Use publish for documentation

### Ports
- **8888**: Jupyter Notebook server
- **8889**: Alternative Jupyter port

### Example Commands

```octave
% Basic operations
A = rand(100);
B = A * A';
[V, D] = eig(B);

% Signal processing
t = 0:0.01:1;
x = sin(2*pi*10*t) + 0.5*sin(2*pi*25*t);
[b, a] = butter(4, 0.3);
y = filter(b, a, x);

% Data analysis
data = randn(1000, 5);
mu = mean(data);
sigma = std(data);
R = corr(data);

% Machine learning
X = [randn(50,2)+1; randn(50,2)-1];
idx = kmeans(X, 2);
```

Happy computing! 🚀
EOF

    touch /workspace/.initialized
    echo -e "${GREEN}✅ MATLAB/Octave workspace initialized!${NC}"
fi

# Start virtual display for GUI applications
if [ -z "$DISPLAY" ]; then
    export DISPLAY=:99
    Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
fi

# Display container information
echo ""
echo -e "${BLUE}📊 MATLAB/Octave Container Status:${NC}"
if command -v octave &> /dev/null; then
    echo "  🧮 GNU Octave $(octave --version | head -n1 | cut -d' ' -f4)"
else
    echo "  ❌ Octave not found"
fi

if command -v python3 &> /dev/null; then
    echo "  🐍 Python $(python3 --version | cut -d' ' -f2)"
    echo "  📊 NumPy, SciPy, Matplotlib available"
fi

if command -v jupyter &> /dev/null; then
    echo "  📓 Jupyter Notebook available"
fi

echo ""
echo -e "${YELLOW}🔧 Available Commands:${NC}"
echo "  • octave              - Start Octave interpreter"
echo "  • octave --gui        - Start Octave with GUI"
echo "  • jupyter notebook    - Start Jupyter server"
echo "  • matlab-utils        - MATLAB/Octave utilities"
echo ""
echo -e "${YELLOW}🎯 Quick Start:${NC}"
echo "  • cd /workspace && octave"
echo "  • Run: main"
echo "  • Try: demo_signal_processing()"
echo ""

# Execute the passed command or start Octave
if [ $# -eq 0 ]; then
    exec octave --persist
else
    exec "$@"
fi