# PHP Development Environment for Da-Kraken

This container provides a complete PHP development environment with Apache, Composer, and popular PHP tools.

## Features

- **PHP 8.3** with Apache
- **Composer** for dependency management
- **PHPUnit** for testing
- **PHP-CS-Fixer** for code formatting
- **Psalm** for static analysis
- **Xdebug** ready for debugging

## Ports

- **8085**: Apache web server (main port)
- **8086**: PHP built-in development server
- **9003**: Xdebug port

## Quick Start

1. Start the PHP container:
   ```bash
   ./manage-containers.sh start php
   ```

2. Access your application:
   - Web: http://localhost:8085
   - Dev server: http://localhost:8086

## Development Workflow

### Installing Dependencies
```bash
./manage-containers.sh exec php-container composer install
```

### Running Tests
```bash
./manage-containers.sh exec php-container composer test
```

### Code Formatting
```bash
./manage-containers.sh exec php-container composer fix
```

### Static Analysis
```bash
./manage-containers.sh exec php-container composer analyze
```

### Using PHP Built-in Server
```bash
./manage-containers.sh exec php-container composer dev
```

## Project Structure

When you create a new PHP project, the recommended structure is:

```
/workspace/
├── public/           # Web-accessible files
│   └── index.php     # Entry point
├── src/              # Application source code
├── tests/            # Test files
├── vendor/           # Composer dependencies
├── composer.json     # Composer configuration
├── phpunit.xml       # PHPUnit configuration
└── .env              # Environment variables
```

## Template Files

The container includes several template files:
- `composer-template.json` - Basic Composer setup
- `phpunit-template.xml` - PHPUnit configuration
- `env-template` - Environment variables template
- `gitignore-template` - Git ignore patterns

## Environment Variables

- `BRIDGE_ENDPOINT`: Connection to Da-Kraken bridge orchestrator
- `PHP_INI_SCAN_DIR`: PHP configuration directory

## Bridge Integration

The PHP container is configured to work with the Da-Kraken bridge orchestrator for:
- Code generation requests
- Inter-service communication
- Shared resource access