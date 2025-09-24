# PHP Development Container for Da-Kraken
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    vim \
    nano \
    htop \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install popular PHP tools
RUN composer global require friendsofphp/php-cs-fixer phpunit/phpunit

# Set working directory
WORKDIR /workspace

# Copy template files
COPY composer-template.json /workspace/composer.json
COPY php-template.ini /usr/local/etc/php/conf.d/99-custom.ini

# Enable Apache modules
RUN a2enmod rewrite
RUN a2enmod headers

# Update Apache configuration
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /workspace/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Create public directory
RUN mkdir -p /workspace/public

# Copy startup script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose ports
# 80: Apache web server
# 8000: PHP built-in server
# 9000: Xdebug
EXPOSE 80 8000 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["apache2-foreground"]