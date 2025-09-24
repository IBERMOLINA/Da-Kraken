defmodule DaKraken.MixProject do
  use Mix.Project

  def project do
    [
      app: :da_kraken,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      description: "Da-Kraken Elixir development environment",
      package: package(),
      docs: docs()
    ]
  end

  def application do
    [
      extra_applications: [:logger, :crypto, :ssl],
      mod: {DaKraken, []}
    ]
  end

  defp deps do
    [
      # HTTP client
      {:req, "~> 0.4.0"},
      {:httpoison, "~> 2.0"},
      
      # JSON handling
      {:jason, "~> 1.4"},
      
      # Web server
      {:plug, "~> 1.14"},
      {:plug_cowboy, "~> 2.6"},
      
      # Phoenix framework
      {:phoenix, "~> 1.7.0"},
      {:phoenix_html, "~> 3.3"},
      {:phoenix_live_view, "~> 0.20.0"},
      {:phoenix_live_dashboard, "~> 0.8.0"},
      {:phoenix_ecto, "~> 4.4"},
      
      # Database
      {:ecto_sql, "~> 3.10"},
      {:postgrex, "~> 0.17.0"},
      {:myxql, "~> 0.6.0"},
      {:ecto_sqlite3, "~> 0.12"},
      
      # Development and testing
      {:ex_doc, "~> 0.30", only: :dev, runtime: false},
      {:dialyxir, "~> 1.4", only: [:dev], runtime: false},
      {:credo, "~> 1.7", only: [:dev, :test], runtime: false},
      {:phoenix_live_reload, "~> 1.4", only: :dev},
      
      # Utilities
      {:timex, "~> 3.7"},
      {:uuid, "~> 1.1"},
      {:bcrypt_elixir, "~> 3.0"},
      
      # Async and concurrency
      {:gen_stage, "~> 1.2"},
      {:flow, "~> 1.2"},
      
      # Monitoring and observability
      {:telemetry, "~> 1.2"},
      {:telemetry_metrics, "~> 0.6"},
      {:telemetry_poller, "~> 1.0"}
    ]
  end

  defp package do
    [
      maintainers: ["Da-Kraken Team"],
      licenses: ["MIT"],
      links: %{"GitHub" => "https://github.com/IBERMOLINA/Da-Kraken"}
    ]
  end

  defp docs do
    [
      main: "DaKraken",
      source_url: "https://github.com/IBERMOLINA/Da-Kraken",
      extras: ["README.md"]
    ]
  end
end