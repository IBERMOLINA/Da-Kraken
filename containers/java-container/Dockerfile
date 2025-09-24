# Use OpenJDK 21 as base image
FROM openjdk:21-jdk-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    maven \
    gradle \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Copy build templates
COPY pom-template.xml /workspace/pom.xml
COPY build-template.gradle /workspace/build.gradle
COPY gradle.properties /workspace/gradle.properties

# Create project structure
RUN mkdir -p /workspace/src/main/java/com/xomni \
             /workspace/src/test/java/com/xomni \
             /workspace/src/main/resources \
             /workspace/target \
             /workspace/generated

# Install development tools
RUN curl -s "https://get.sdkman.io" | bash
RUN bash -c "source ~/.sdkman/bin/sdkman-init.sh && sdk install kotlin"

# Set up git
RUN git config --global user.name "Container User" && \
    git config --global user.email "container@xomni.dev"

# Expose common development ports
EXPOSE 8080 8081 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD java --version || exit 1

# Set default command
CMD ["mvn", "spring-boot:run"]