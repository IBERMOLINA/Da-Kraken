# Use the official Node.js 20 image as base
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=development
ENV CONTAINER_TYPE=web-development
ENV LANGUAGES="html,css,javascript,typescript"

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    wget \
    bash \
    vim \
    nano \
    build-base \
    python3 \
    py3-pip \
    chromium \
    chromium-chromedriver

# Set Chrome/Chromium environment variables
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

# Create working directory
WORKDIR /workspace

# Create directory structure
RUN mkdir -p /workspace/{src,dist,public,assets,components,styles,scripts,tests,docs,examples}

# Install global Node.js packages for web development
RUN npm install -g \
    @angular/cli \
    @vue/cli \
    create-react-app \
    vite \
    webpack \
    webpack-cli \
    parcel \
    rollup \
    gulp-cli \
    grunt-cli \
    nodemon \
    live-server \
    http-server \
    serve \
    eslint \
    prettier \
    typescript \
    ts-node \
    sass \
    less \
    stylus \
    postcss-cli \
    autoprefixer \
    babel-cli \
    @babel/core \
    @babel/preset-env \
    @babel/preset-react \
    jest \
    cypress \
    playwright \
    puppeteer \
    @storybook/cli \
    lerna \
    nx \
    yarn \
    pnpm

# Install Python packages for web scraping and automation
RUN pip3 install --no-cache-dir \
    selenium \
    beautifulsoup4 \
    requests \
    flask \
    django \
    fastapi \
    uvicorn

# Create package.json template
COPY package-template.json /templates/package.json

# Create various configuration templates
COPY webpack-template.config.js /templates/webpack.config.js
COPY vite-template.config.js /templates/vite.config.js
COPY tsconfig-template.json /templates/tsconfig.json
COPY eslint-template.config.js /templates/.eslintrc.js
COPY prettier-template.config.js /templates/.prettierrc.js
COPY babel-template.config.js /templates/babel.config.js
COPY jest-template.config.js /templates/jest.config.js
COPY cypress-template.config.js /templates/cypress.config.js

# Create HTML5 boilerplate
COPY html5-template.html /templates/index.html
COPY css-template.css /templates/styles.css
COPY js-template.js /templates/app.js

# Create framework-specific templates
RUN mkdir -p /templates/{react,vue,angular,vanilla,components}

# Create React template
COPY react-component-template.jsx /templates/react/Component.jsx
COPY react-app-template.jsx /templates/react/App.jsx

# Create Vue template
COPY vue-component-template.vue /templates/vue/Component.vue
COPY vue-app-template.vue /templates/vue/App.vue

# Create modern CSS templates
COPY css-reset-template.css /templates/reset.css
COPY css-variables-template.css /templates/variables.css
COPY css-grid-template.css /templates/grid.css
COPY css-flexbox-template.css /templates/flexbox.css

# Set up Git configuration
RUN git config --global init.defaultBranch main

# Create startup script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create development utilities script
COPY dev-utils.sh /usr/local/bin/dev-utils
RUN chmod +x /usr/local/bin/dev-utils

# Expose common web development ports
EXPOSE 3000 3001 4200 5000 5173 8000 8080 8081 9000

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command
CMD ["bash"]