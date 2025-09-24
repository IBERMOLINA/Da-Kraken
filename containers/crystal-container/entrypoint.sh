#!/bin/bash
set -e

echo "💎 Starting Crystal Development Environment"

# Create project structure if it doesn't exist
if [ ! -f "/workspace/shard.yml" ]; then
    echo "📁 Setting up Crystal project structure..."
    
    # Create main application file
    if [ ! -f "/workspace/src/da_kraken.cr" ]; then
        mkdir -p /workspace/src
        cat > /workspace/src/da_kraken.cr << 'EOF'
require "http/client"
require "json"
require "option_parser"

module DaKraken
  VERSION = "0.1.0"

  # Main application class
  class App
    def initialize
      puts "💎 Crystal Application in Da-Kraken!"
      puts "Crystal version: #{Crystal::VERSION}"
      
      # Bridge orchestrator health check
      if bridge_endpoint = ENV["BRIDGE_ENDPOINT"]?
        puts "🌉 Bridge endpoint: #{bridge_endpoint}"
        check_bridge_health(bridge_endpoint)
      else
        puts "⚠️  Bridge endpoint not configured"
      end
      
      demonstrate_crystal_features
    end

    private def check_bridge_health(endpoint : String)
      begin
        response = HTTP::Client.get "#{endpoint}/health"
        if response.status_code == 200
          puts "✅ Bridge orchestrator is healthy"
        else
          puts "⚠️  Bridge orchestrator returned status: #{response.status_code}"
        end
      rescue ex
        puts "❌ Failed to connect to bridge orchestrator: #{ex.message}"
      end
    end

    private def demonstrate_crystal_features
      puts "\n🚀 Crystal Features Demonstration:"
      
      # Type inference and compile-time checks
      numbers = [1, 2, 3, 4, 5]
      sum = numbers.sum
      puts "Array sum: #{sum}"
      
      # Blocks and iterators
      doubled = numbers.map { |n| n * 2 }
      puts "Doubled numbers: #{doubled}"
      
      # Pattern matching with case
      case sum
      when 15
        puts "Perfect sum!"
      else
        puts "Sum is #{sum}"
      end
      
      # Macros and metaprogramming
      puts "Compile-time macro result: #{compile_time_info}"
      
      # Concurrency with fibers
      demonstrate_concurrency
    end

    # Macro example
    macro compile_time_info
      "Built at: #{`date`.strip}"
    end

    private def demonstrate_concurrency
      puts "\n🔄 Concurrency with Fibers:"
      
      channel = Channel(String).new
      
      spawn do
        sleep 0.1
        channel.send("Hello from fiber 1!")
      end
      
      spawn do
        sleep 0.2
        channel.send("Hello from fiber 2!")
      end
      
      2.times do
        message = channel.receive
        puts "Received: #{message}"
      end
    end
  end

  # HTTP Server example
  class Server
    def self.start(port : Int32 = 8094)
      server = HTTP::Server.new do |context|
        case context.request.path
        when "/"
          context.response.content_type = "text/plain"
          context.response.print "💎 Crystal Server in Da-Kraken!\n\nVersion: #{VERSION}\nCrystal: #{Crystal::VERSION}"
        when "/health"
          context.response.content_type = "application/json"
          health_data = {
            status: "healthy",
            version: VERSION,
            crystal_version: Crystal::VERSION,
            bridge_endpoint: ENV["BRIDGE_ENDPOINT"]? || "not configured",
            timestamp: Time.utc.to_s
          }
          context.response.print health_data.to_json
        when "/api/math"
          if context.request.method == "POST"
            begin
              body = context.request.body.try &.gets_to_end
              if body
                data = JSON.parse(body)
                a = data["a"].as_i
                b = data["b"].as_i
                operation = data["operation"].as_s
                
                result = case operation
                when "add"
                  a + b
                when "multiply"
                  a * b
                when "subtract"
                  a - b
                when "divide"
                  b != 0 ? a / b : nil
                else
                  nil
                end
                
                if result
                  response = {result: result, operation: operation}
                  context.response.content_type = "application/json"
                  context.response.print response.to_json
                else
                  context.response.status_code = 400
                  context.response.print "Invalid operation or division by zero"
                end
              else
                context.response.status_code = 400
                context.response.print "No body provided"
              end
            rescue ex
              context.response.status_code = 400
              context.response.print "Invalid JSON: #{ex.message}"
            end
          else
            context.response.status_code = 405
            context.response.print "Method not allowed"
          end
        else
          context.response.status_code = 404
          context.response.print "Not found"
        end
      end

      puts "🚀 Starting Crystal server on port #{port}"
      server.bind_tcp port
      server.listen
    end
  end
end

# CLI interface
if ARGV.includes?("server")
  DaKraken::Server.start
else
  DaKraken::App.new
end
EOF
    fi
    
    # Create spec file
    if [ ! -f "/workspace/spec/da_kraken_spec.cr" ]; then
        mkdir -p /workspace/spec
        cat > /workspace/spec/da_kraken_spec.cr << 'EOF'
require "./spec_helper"

describe DaKraken do
  it "has correct version" do
    DaKraken::VERSION.should eq("0.1.0")
  end

  describe "math operations" do
    it "adds numbers correctly" do
      (2 + 3).should eq(5)
    end

    it "multiplies numbers correctly" do
      (4 * 5).should eq(20)
    end

    it "handles arrays" do
      numbers = [1, 2, 3, 4, 5]
      numbers.sum.should eq(15)
      numbers.map(&.*(2)).should eq([2, 4, 6, 8, 10])
    end
  end

  describe "JSON handling" do
    it "parses JSON correctly" do
      json_string = %({"name": "Crystal", "version": "1.10.1"})
      data = JSON.parse(json_string)
      data["name"].as_s.should eq("Crystal")
      data["version"].as_s.should eq("1.10.1")
    end
  end
end
EOF
    fi
    
    # Create spec helper
    if [ ! -f "/workspace/spec/spec_helper.cr" ]; then
        cat > /workspace/spec/spec_helper.cr << 'EOF'
require "spec"
require "../src/da_kraken"
EOF
    fi
fi

# Install dependencies if shard.yml exists
if [ -f "/workspace/shard.yml" ]; then
    echo "📦 Installing Shard dependencies..."
    shards install || echo "Some dependencies may need to be added"
fi

echo "🚀 Crystal Development Environment Ready!"
echo "📍 Working Directory: /workspace"
echo "💎 Crystal Version: $(crystal --version | head -1)"
echo "🌉 Bridge Endpoint: ${BRIDGE_ENDPOINT:-Not configured}"

echo
echo "🚀 Quick Commands:"
echo "  Build:      crystal build src/da_kraken.cr"
echo "  Run:        crystal run src/da_kraken.cr"
echo "  Server:     crystal run src/da_kraken.cr -- server"
echo "  Test:       crystal spec"
echo "  Format:     crystal tool format"
echo "  Deps:       shards install"
echo
echo "🛠️  Development Server Commands:"
echo "  HTTP Server: crystal run src/da_kraken.cr -- server"
echo "  Live reload: live-server . -p 8095"

# Start in interactive mode if no command specified
exec "$@"