#!/bin/bash
set -e

echo "🦀 Starting Rust Development Environment"

# Create project structure if it doesn't exist
if [ ! -f "/workspace/Cargo.toml" ]; then
    echo "📁 Setting up Rust project structure..."
    
    # Create main.rs if it doesn't exist
    if [ ! -f "/workspace/src/main.rs" ]; then
        mkdir -p /workspace/src
        cat > /workspace/src/main.rs << 'EOF'
use std::env;
use std::process;

fn main() {
    println!("🦀 Rust Application in Da-Kraken!");
    println!("Rust version: {}", env!("CARGO_PKG_VERSION"));
    
    // Bridge orchestrator health check
    if let Ok(bridge_endpoint) = env::var("BRIDGE_ENDPOINT") {
        println!("🌉 Bridge endpoint: {}", bridge_endpoint);
        
        // Example HTTP client (requires reqwest dependency)
        println!("💡 Add reqwest dependency to enable HTTP client");
    } else {
        println!("⚠️  Bridge endpoint not configured");
    }
    
    // Demonstrate Rust features
    demonstrate_rust_features();
}

fn demonstrate_rust_features() {
    println!("\n🚀 Rust Features Demonstration:");
    
    // Memory safety
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Vector sum: {}", sum);
    
    // Pattern matching
    match sum {
        15 => println!("Perfect sum!"),
        _ => println!("Sum is {}", sum),
    }
    
    // Error handling
    match divide(10, 2) {
        Ok(result) => println!("Division result: {}", result),
        Err(e) => println!("Error: {}", e),
    }
    
    // Iterators and closures
    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("Doubled numbers: {:?}", doubled);
}

fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}
EOF
    fi
    
    # Create lib.rs for library projects
    if [ ! -f "/workspace/src/lib.rs" ]; then
        cat > /workspace/src/lib.rs << 'EOF'
//! Da-Kraken Rust Library
//! 
//! This library provides utilities for Rust development in the Da-Kraken ecosystem.

/// Add two numbers together
/// 
/// # Examples
/// 
/// ```
/// use da_kraken_rust::add;
/// 
/// assert_eq!(add(2, 3), 5);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Multiply two numbers
/// 
/// # Examples
/// 
/// ```
/// use da_kraken_rust::multiply;
/// 
/// assert_eq!(multiply(4, 5), 20);
/// ```
pub fn multiply(a: i32, b: i32) -> i32 {
    a * b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn test_multiply() {
        assert_eq!(multiply(3, 4), 12);
        assert_eq!(multiply(0, 5), 0);
    }
}
EOF
    fi
    
    # Create example test
    if [ ! -f "/workspace/tests/integration_test.rs" ]; then
        mkdir -p /workspace/tests
        cat > /workspace/tests/integration_test.rs << 'EOF'
use da_kraken_rust::*;

#[test]
fn test_integration() {
    assert_eq!(add(multiply(2, 3), 4), 10);
}
EOF
    fi
fi

# Install dependencies if Cargo.toml exists
if [ -f "/workspace/Cargo.toml" ]; then
    echo "📦 Installing Cargo dependencies..."
    cargo check || echo "Some dependencies may need to be added"
fi

echo "🚀 Rust Development Environment Ready!"
echo "📍 Working Directory: /workspace"
echo "🦀 Rust Version: $(rustc --version)"
echo "📦 Cargo Version: $(cargo --version)"
echo "🌉 Bridge Endpoint: ${BRIDGE_ENDPOINT:-Not configured}"

echo
echo "🚀 Quick Commands:"
echo "  Build:      cargo build"
echo "  Run:        cargo run"
echo "  Test:       cargo test"
echo "  Format:     cargo fmt"
echo "  Lint:       cargo clippy"
echo "  Watch:      cargo watch -x run"
echo "  Docs:       cargo doc --open"
echo
echo "🛠️  Development Server Commands:"
echo "  Web server: cargo run --bin server"
echo "  Dev server: http-server target/doc -p 8090"

# Start in interactive mode if no command specified
exec "$@"