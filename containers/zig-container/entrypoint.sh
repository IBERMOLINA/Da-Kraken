#!/bin/bash
set -e

echo "⚡ Starting Zig Development Environment"

# Create project structure if it doesn't exist
if [ ! -f "/workspace/build.zig" ]; then
    echo "📁 Setting up Zig project structure..."
    
    # Copy templates
    cp /workspace/build-template.zig /workspace/build.zig 2>/dev/null || true
    
    # Create main.zig if it doesn't exist
    if [ ! -f "/workspace/src/main.zig" ]; then
        mkdir -p /workspace/src
        cat > /workspace/src/main.zig << 'EOF'
const std = @import("std");
const print = std.debug.print;

pub fn main() !void {
    print("⚡ Hello from Zig in Da-Kraken!\n");
    print("Zig Version: {s}\n", .{@import("builtin").zig_version_string});
    
    // Bridge orchestrator health check
    const allocator = std.heap.page_allocator;
    
    // Simple HTTP client example (requires additional setup)
    print("🌉 Bridge Endpoint: {s}\n", .{std.posix.getenv("BRIDGE_ENDPOINT") orelse "Not configured"});
    
    // Example of Zig's compile-time features
    comptime var i: u32 = 0;
    inline while (i < 3) : (i += 1) {
        print("Compile-time loop iteration: {}\n", .{i});
    }
    
    // Runtime example
    var runtime_array = [_]i32{ 1, 2, 3, 4, 5 };
    print("Runtime array sum: {}\n", .{sum(&runtime_array)});
}

fn sum(array: []const i32) i32 {
    var total: i32 = 0;
    for (array) |value| {
        total += value;
    }
    return total;
}
EOF
    fi
    
    # Create tests
    if [ ! -f "/workspace/src/tests.zig" ]; then
        cat > /workspace/src/tests.zig << 'EOF'
const std = @import("std");
const testing = std.testing;

test "basic addition" {
    try testing.expect(add(3, 7) == 10);
}

test "basic multiplication" {
    try testing.expect(multiply(3, 7) == 21);
}

fn add(a: i32, b: i32) i32 {
    return a + b;
}

fn multiply(a: i32, b: i32) i32 {
    return a * b;
}
EOF
    fi
fi

# Set up cache directory
mkdir -p /workspace/zig-cache
mkdir -p /workspace/zig-out

echo "🔧 Zig Development Environment Ready!"
echo "📍 Working Directory: /workspace"
echo "⚡ Zig Version: $(zig version)"
echo "🌉 Bridge Endpoint: ${BRIDGE_ENDPOINT:-Not configured}"

echo
echo "🚀 Quick Commands:"
echo "  Build:      zig build"
echo "  Run:        zig build run"
echo "  Test:       zig build test"
echo "  Format:     zig fmt src/"
echo "  Check:      zig build check"
echo
echo "🛠️  Development Server Commands:"
echo "  Start dev server:  cd /workspace && http-server -p 8087"
echo "  View docs:         zig build docs && http-server zig-out/docs -p 8088"

# Start in interactive mode if no command specified
exec "$@"