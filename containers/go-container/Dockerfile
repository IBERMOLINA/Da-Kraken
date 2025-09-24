# Use Go 1.21 as base image
FROM golang:1.21-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    build-base \
    bash \
    vim

# Create workspace directory
WORKDIR /workspace

# Initialize Go module
RUN go mod init xomni-go-workspace

# Install common Go tools
RUN go install -a github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
    go install -a github.com/air-verse/air@latest && \
    go install -a github.com/swaggo/swag/cmd/swag@latest

# Create project structure
RUN mkdir -p /workspace/cmd \
             /workspace/internal \
             /workspace/pkg \
             /workspace/api \
             /workspace/web \
             /workspace/generated \
             /workspace/tests

# Copy Go module template
COPY go-template.mod /workspace/go.mod
COPY main-template.go /workspace/cmd/main.go

# Set up git
RUN git config --global user.name "Container User" && \
    git config --global user.email "container@xomni.dev"

# Expose common development ports
EXPOSE 8080 8082

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD go version || exit 1

# Set default command
CMD ["go", "run", "cmd/main.go"]