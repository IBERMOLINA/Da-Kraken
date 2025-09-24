#!/bin/bash
set -e

echo "💧 Starting Elixir Development Environment"

# Create project structure if it doesn't exist
if [ ! -f "/workspace/mix.exs" ]; then
    echo "📁 Setting up Elixir project structure..."
    
    # Create main application module
    if [ ! -f "/workspace/lib/da_kraken.ex" ]; then
        mkdir -p /workspace/lib
        cat > /workspace/lib/da_kraken.ex << 'EOF'
defmodule DaKraken do
  @moduledoc """
  DaKraken - Main application module for Da-Kraken Elixir development.
  
  This module provides the main application functionality and demonstrates
  key Elixir/OTP features including GenServers, Supervisors, and more.
  """

  use Application

  def start(_type, _args) do
    IO.puts("💧 Starting Da-Kraken Elixir Application!")
    IO.puts("Elixir version: #{System.version()}")
    IO.puts("OTP version: #{System.otp_release()}")
    
    # Bridge orchestrator health check
    case System.get_env("BRIDGE_ENDPOINT") do
      nil -> IO.puts("⚠️  Bridge endpoint not configured")
      endpoint -> 
        IO.puts("🌉 Bridge endpoint: #{endpoint}")
        # You can add HTTP client here with HTTPoison or Req
    end

    children = [
      # Add your supervised processes here
      {DaKraken.Counter, name: DaKraken.Counter},
      {DaKraken.WebServer, []}
    ]

    opts = [strategy: :one_for_one, name: DaKraken.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @doc """
  Demonstrates pattern matching and guards.
  """
  def classify_number(n) when is_integer(n) and n > 0, do: :positive
  def classify_number(n) when is_integer(n) and n < 0, do: :negative  
  def classify_number(0), do: :zero
  def classify_number(_), do: :not_an_integer

  @doc """
  Demonstrates pipe operator and Enum functions.
  """
  def process_numbers(numbers) do
    numbers
    |> Enum.filter(&(&1 > 0))
    |> Enum.map(&(&1 * 2))
    |> Enum.sum()
  end
end
EOF
    fi
    
    # Create a GenServer example
    if [ ! -f "/workspace/lib/da_kraken/counter.ex" ]; then
        mkdir -p /workspace/lib/da_kraken
        cat > /workspace/lib/da_kraken/counter.ex << 'EOF'
defmodule DaKraken.Counter do
  @moduledoc """
  A simple GenServer that maintains a counter state.
  Demonstrates OTP GenServer behavior.
  """
  
  use GenServer

  # Client API
  def start_link(opts) do
    GenServer.start_link(__MODULE__, 0, opts)
  end

  def get(pid) do
    GenServer.call(pid, :get)
  end

  def increment(pid) do
    GenServer.cast(pid, :increment)
  end

  def add(pid, value) do
    GenServer.cast(pid, {:add, value})
  end

  # Server Callbacks
  @impl true
  def init(initial_value) do
    {:ok, initial_value}
  end

  @impl true
  def handle_call(:get, _from, state) do
    {:reply, state, state}
  end

  @impl true
  def handle_cast(:increment, state) do
    {:noreply, state + 1}
  end

  @impl true
  def handle_cast({:add, value}, state) do
    {:noreply, state + value}
  end
end
EOF
    fi
    
    # Create a simple web server with Plug
    if [ ! -f "/workspace/lib/da_kraken/web_server.ex" ]; then
        cat > /workspace/lib/da_kraken/web_server.ex << 'EOF'
defmodule DaKraken.WebServer do
  @moduledoc """
  Simple web server using Plug and Cowboy.
  """
  
  use Plug.Router

  plug :match
  plug :dispatch

  def child_spec(opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, [opts]}
    }
  end

  def start_link(_opts) do
    Plug.Cowboy.http(__MODULE__, [], port: 4000)
  end

  get "/" do
    send_resp(conn, 200, """
    💧 Da-Kraken Elixir Server
    
    Elixir: #{System.version()}
    OTP: #{System.otp_release()}
    Node: #{Node.self()}
    
    Available endpoints:
    - GET /health - Health check
    - GET /counter - Get counter value
    - POST /counter/increment - Increment counter
    """)
  end

  get "/health" do
    bridge_status = case System.get_env("BRIDGE_ENDPOINT") do
      nil -> "not configured"
      _endpoint -> "configured"
    end
    
    response = %{
      status: "healthy",
      elixir_version: System.version(),
      otp_version: System.otp_release(),
      bridge_status: bridge_status,
      timestamp: DateTime.utc_now()
    }
    
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(response))
  end

  get "/counter" do
    count = DaKraken.Counter.get(DaKraken.Counter)
    
    response = %{count: count}
    
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(response))
  end

  post "/counter/increment" do
    DaKraken.Counter.increment(DaKraken.Counter)
    count = DaKraken.Counter.get(DaKraken.Counter)
    
    response = %{count: count, action: "incremented"}
    
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(response))
  end

  match _ do
    send_resp(conn, 404, "Not found")
  end
end
EOF
    fi
    
    # Create tests
    if [ ! -f "/workspace/test/da_kraken_test.exs" ]; then
        mkdir -p /workspace/test
        cat > /workspace/test/da_kraken_test.exs << 'EOF'
defmodule DaKrakenTest do
  use ExUnit.Case
  doctest DaKraken

  test "classify_number/1 with positive number" do
    assert DaKraken.classify_number(5) == :positive
  end

  test "classify_number/1 with negative number" do
    assert DaKraken.classify_number(-3) == :negative
  end

  test "classify_number/1 with zero" do
    assert DaKraken.classify_number(0) == :zero
  end

  test "process_numbers/1 filters, doubles, and sums" do
    assert DaKraken.process_numbers([1, -2, 3, -4, 5]) == 18
  end
end
EOF
    fi
    
    # Create test helper
    if [ ! -f "/workspace/test/test_helper.exs" ]; then
        cat > /workspace/test/test_helper.exs << 'EOF'
ExUnit.start()
EOF
    fi
fi

# Install dependencies if mix.exs exists
if [ -f "/workspace/mix.exs" ]; then
    echo "📦 Installing Mix dependencies..."
    mix deps.get || echo "Some dependencies may need to be added"
    mix compile || echo "Compilation may need dependency resolution"
fi

echo "🚀 Elixir Development Environment Ready!"
echo "📍 Working Directory: /workspace"
echo "💧 Elixir Version: $(elixir --version | head -1)"
echo "🏗️  OTP Version: $(elixir --version | tail -1)"
echo "🌉 Bridge Endpoint: ${BRIDGE_ENDPOINT:-Not configured}"

echo
echo "🚀 Quick Commands:"
echo "  Compile:    mix compile"
echo "  Run:        mix run"
echo "  Test:       mix test"
echo "  Server:     mix phx.server"
echo "  Console:    iex -S mix"
echo "  Format:     mix format"
echo "  Deps:       mix deps.get"
echo
echo "🛠️  Development Server Commands:"
echo "  Phoenix:    mix phx.server (port 4000)"
echo "  IEx:        iex -S mix"

# Start in interactive mode if no command specified
exec "$@"