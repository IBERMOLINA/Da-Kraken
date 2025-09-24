import Config

# Development configuration
config :logger, level: :debug

# Enable live reloading for development
if Code.ensure_loaded?(Phoenix) do
  config :da_kraken, DaKrakenWeb.Endpoint,
    debug_errors: true,
    code_reloader: true,
    check_origin: false,
    watchers: []
    
  config :phoenix, :stacktrace_depth, 20
  config :phoenix, :plug_init_mode, :runtime
end