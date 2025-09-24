# Zig Development Environment for Da-Kraken

This container provides a complete Zig development environment with the latest stable Zig compiler, Zig Language Server (ZLS), and development tools.

## Features

- **Zig 0.11.0** (latest stable)
- **Zig Language Server (ZLS)** for IDE support
- **Build system** with comprehensive build.zig template
- **Testing framework** integration
- **Documentation generation**
- **Development server** for web projects
- **Bridge orchestrator** integration

## Ports

- **8087**: Development server (main)
- **8088**: Documentation server  
- **8089**: Test runner server

## Quick Start

1. Start the Zig container:
   ```bash
   ./manage-containers.sh start zig
   ```

2. Access your development environment:
   - Shell: `./manage-containers.sh exec zig-container bash`
   - Web: http://localhost:8087

## Development Workflow

### Basic Commands
```bash
# Build the project
./manage-containers.sh exec zig-container zig build

# Run the application
./manage-containers.sh exec zig-container zig build run

# Run tests
./manage-containers.sh exec zig-container zig build test

# Format code
./manage-containers.sh exec zig-container zig fmt src/

# Check syntax
./manage-containers.sh exec zig-container zig build check
```

### Advanced Commands
```bash
# Build with optimization
./manage-containers.sh exec zig-container zig build -Doptimize=ReleaseFast

# Generate documentation
./manage-containers.sh exec zig-container zig build docs

# Run benchmarks
./manage-containers.sh exec zig-container zig build bench

# Start development server
./manage-containers.sh exec zig-container zig build serve
```

## Project Structure

When you create a new Zig project, the recommended structure is:

```
/workspace/
├── build.zig           # Build configuration
├── build.zig.zon       # Package manifest
├── src/                # Source code
│   ├── main.zig        # Main entry point
│   └── tests.zig       # Unit tests
├── tests/              # Integration tests
├── examples/           # Example code
├── docs/               # Documentation
├── zig-cache/          # Build cache
└── zig-out/            # Build output
```

## Template Files

The container includes several template files:
- `build-template.zig` - Comprehensive build configuration
- `src-template/main.zig` - Application template with examples
- `zon-template` - Package manifest template
- `gitignore-template` - Zig-specific git ignore patterns

## Language Features

Zig provides:
- **Memory Safety** without garbage collection
- **Compile-time Code Execution** for metaprogramming  
- **Cross-compilation** to any target
- **C Interoperability** without FFI
- **Error Handling** with explicit error types
- **Generic Programming** with comptime
- **No Hidden Control Flow** - what you see is what you get

## Bridge Integration

The Zig container is configured to work with the Da-Kraken bridge orchestrator for:
- Code generation requests
- Inter-service communication  
- Shared resource access
- API integration

## Environment Variables

- `ZIG_GLOBAL_CACHE_DIR`: Global Zig cache directory
- `BRIDGE_ENDPOINT`: Connection to Da-Kraken bridge orchestrator
- `PATH`: Includes Zig compiler and tools

## Examples

### Hello World
```zig
const std = @import("std");

pub fn main() !void {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Hello, Da-Kraken! ⚡\n");
}
```

### HTTP Client
```zig
const std = @import("std");
const http = std.http;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    
    const allocator = gpa.allocator();
    
    var client = http.Client{ .allocator = allocator };
    defer client.deinit();
    
    const uri = try std.Uri.parse("http://bridge-orchestrator:4000/health");
    
    var headers = http.Headers{ .allocator = allocator };
    defer headers.deinit();
    
    var req = try client.open(.GET, uri, headers, .{});
    defer req.deinit();
    
    try req.send(.{});
    try req.wait();
    
    const body = try req.reader().readAllAlloc(allocator, 1024);
    defer allocator.free(body);
    
    std.debug.print("Response: {s}\n", .{body});
}
```

## Performance

Zig is designed for performance:
- **Zero-cost abstractions**
- **Compile-time optimizations**
- **Manual memory management**  
- **No runtime overhead**
- **Predictable performance**

Perfect for systems programming, web servers, and performance-critical applications in the Da-Kraken ecosystem.