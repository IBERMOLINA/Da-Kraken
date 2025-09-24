import Config

# Configure the application
config :da_kraken,
  bridge_endpoint: System.get_env("BRIDGE_ENDPOINT", "http://bridge-orchestrator:4000")

# Configure logging
config :logger,
  level: :info,
  format: "$time $metadata[$level] $message\n"

# Configure Phoenix endpoint if using Phoenix
if Code.ensure_loaded?(Phoenix) do
  config :da_kraken, DaKrakenWeb.Endpoint,
    url: [host: "localhost"],
    http: [port: 4000],
    secret_key_base: "development_secret_key_base_change_in_production",
    render_errors: [view: DaKrakenWeb.ErrorView, accepts: ~w(html json)],
    pubsub_server: DaKraken.PubSub,
    live_view: [signing_salt: "development_salt"]
end

# Import environment specific config
import_config "#{config_env()}.exs"