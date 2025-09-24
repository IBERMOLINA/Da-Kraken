# MATLAB Development Container
# Note: This uses GNU Octave as a MATLAB-compatible alternative
# For official MATLAB, you would need a valid license

FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV CONTAINER_TYPE=matlab-development
ENV LANGUAGES="matlab,octave"
ENV DISPLAY=:0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    octave \
    octave-dev \
    octave-signal \
    octave-statistics \
    octave-image \
    octave-control \
    octave-symbolic \
    octave-parallel \
    octave-optim \
    python3 \
    python3-pip \
    python3-dev \
    python3-numpy \
    python3-scipy \
    python3-matplotlib \
    python3-pandas \
    python3-sympy \
    python3-scikit-learn \
    jupyter \
    jupyter-notebook \
    git \
    curl \
    wget \
    vim \
    nano \
    build-essential \
    cmake \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libfftw3-dev \
    libhdf5-dev \
    libnetcdf-dev \
    gnuplot \
    ghostscript \
    texlive-latex-base \
    texlive-latex-extra \
    x11-apps \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Create working directory
WORKDIR /workspace

# Create directory structure for MATLAB/Octave projects
RUN mkdir -p /workspace/{src,data,scripts,functions,classes,tests,docs,examples,toolboxes,output}

# Install additional Python packages for scientific computing
RUN pip3 install --no-cache-dir \
    octave-kernel \
    matlab-kernel \
    numpy \
    scipy \
    matplotlib \
    pandas \
    scikit-learn \
    sympy \
    seaborn \
    plotly \
    jupyter-lab \
    ipywidgets \
    notebook

# Install Octave packages
RUN octave --eval "pkg install -forge io statistics signal image control symbolic parallel optim"

# Copy configuration and template files
COPY octaverc /workspace/.octaverc
COPY matlab-startup.m /workspace/startup.m
COPY matlab-template.m /templates/template.m
COPY matlab-class-template.m /templates/class_template.m
COPY matlab-function-template.m /templates/function_template.m
COPY matlab-test-template.m /templates/test_template.m

# Create Jupyter configuration
RUN jupyter kernelspec install /usr/local/share/jupyter/kernels/octave --sys-prefix || true

# Create MATLAB/Octave utilities
COPY matlab-utils.py /usr/local/bin/matlab-utils
RUN chmod +x /usr/local/bin/matlab-utils

# Set up startup script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose Jupyter port
EXPOSE 8888 8889

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["octave", "--gui", "--persist"]