// Enhanced File Manager for Da-Kraken Bridge Orchestrator
// Provides cross-container file fetching and management capabilities

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const Docker = require('dockerode');
const { 
    safeJsonParse, 
    safeJsonStringify, 
    createApiResponse, 
    createErrorResponse,
    sanitizeString 
} = require('./json-safe-encoding');

const execAsync = promisify(exec);

class FileManager {
    constructor(logger) {
        this.logger = logger;
        this.docker = new Docker();
        this.supportedLanguages = {
            'nodejs': { container: 'nodejs-dev', workspacePath: '/workspace' },
            'python': { container: 'python-dev', workspacePath: '/workspace' },
            'java': { container: 'java-dev', workspacePath: '/workspace' },
            'go': { container: 'go-dev', workspacePath: '/workspace' },
            'php': { container: 'php-dev', workspacePath: '/workspace' },
            'zig': { container: 'zig-dev', workspacePath: '/workspace' },
            'rust': { container: 'rust-dev', workspacePath: '/workspace' },
            'elixir': { container: 'elixir-dev', workspacePath: '/workspace' },
            'crystal': { container: 'crystal-dev', workspacePath: '/workspace' },
            'cpp': { container: 'cpp-dev', workspacePath: '/workspace' }
        };
    }

    /**
     * Fetch file from any container
     */
    async fetchFile(containerName, filePath, options = {}) {
        try {
            const { 
                encoding = 'utf8',
                maxSize = 1024 * 1024, // 1MB default
                sanitize = true 
            } = options;

            this.logger.info(`Fetching file ${filePath} from container ${containerName}`);

            const container = this.docker.getContainer(containerName);
            
            // Check if container is running
            const containerInfo = await container.inspect();
            if (!containerInfo.State.Running) {
                throw new Error(`Container ${containerName} is not running`);
            }

            // Execute cat command to read file
            const exec = await container.exec({
                Cmd: ['cat', filePath],
                AttachStdout: true,
                AttachStderr: true
            });

            const stream = await exec.start({ hijack: true, stdin: false });
            
            return new Promise((resolve, reject) => {
                let data = '';
                let error = '';
                let totalSize = 0;

                stream.on('data', (chunk) => {
                    totalSize += chunk.length;
                    if (totalSize > maxSize) {
                        reject(new Error(`File size exceeds maximum limit of ${maxSize} bytes`));
                        return;
                    }
                    
                    // Docker multiplexes stdout/stderr, need to handle the header
                    if (chunk[0] === 1) { // stdout
                        data += chunk.slice(8).toString(encoding);
                    } else if (chunk[0] === 2) { // stderr
                        error += chunk.slice(8).toString(encoding);
                    }
                });

                stream.on('end', () => {
                    if (error) {
                        reject(new Error(`Error reading file: ${error}`));
                    } else {
                        const content = sanitize ? sanitizeString(data) : data;
                        resolve({
                            path: filePath,
                            content: content,
                            size: totalSize,
                            container: containerName,
                            timestamp: new Date().toISOString()
                        });
                    }
                });

                stream.on('error', reject);
            });

        } catch (error) {
            this.logger.error(`Failed to fetch file ${filePath} from ${containerName}:`, error);
            throw error;
        }
    }

    /**
     * List files in container directory
     */
    async listFiles(containerName, directoryPath, options = {}) {
        try {
            const { 
                recursive = false,
                includeHidden = false,
                maxDepth = 3 
            } = options;

            this.logger.info(`Listing files in ${directoryPath} from container ${containerName}`);

            const container = this.docker.getContainer(containerName);
            
            const lsCommand = recursive 
                ? ['find', directoryPath, '-maxdepth', maxDepth.toString(), '-type', 'f']
                : ['ls', '-la', directoryPath];

            const exec = await container.exec({
                Cmd: lsCommand,
                AttachStdout: true,
                AttachStderr: true
            });

            const stream = await exec.start({ hijack: true, stdin: false });
            
            return new Promise((resolve, reject) => {
                let data = '';
                let error = '';

                stream.on('data', (chunk) => {
                    if (chunk[0] === 1) { // stdout
                        data += chunk.slice(8).toString('utf8');
                    } else if (chunk[0] === 2) { // stderr
                        error += chunk.slice(8).toString('utf8');
                    }
                });

                stream.on('end', () => {
                    if (error) {
                        reject(new Error(`Error listing files: ${error}`));
                    } else {
                        const files = this.parseFileList(data, recursive, includeHidden);
                        resolve({
                            directory: directoryPath,
                            files: files,
                            container: containerName,
                            timestamp: new Date().toISOString()
                        });
                    }
                });

                stream.on('error', reject);
            });

        } catch (error) {
            this.logger.error(`Failed to list files in ${directoryPath} from ${containerName}:`, error);
            throw error;
        }
    }

    /**
     * Write file to container
     */
    async writeFile(containerName, filePath, content, options = {}) {
        try {
            const { 
                encoding = 'utf8',
                createDirs = true,
                backup = false 
            } = options;

            this.logger.info(`Writing file ${filePath} to container ${containerName}`);

            const container = this.docker.getContainer(containerName);
            
            // Create directory if needed
            if (createDirs) {
                const dirPath = path.dirname(filePath);
                const mkdirExec = await container.exec({
                    Cmd: ['mkdir', '-p', dirPath],
                    AttachStdout: true,
                    AttachStderr: true
                });
                await mkdirExec.start();
            }

            // Backup existing file if requested
            if (backup) {
                try {
                    const backupExec = await container.exec({
                        Cmd: ['cp', filePath, `${filePath}.backup`],
                        AttachStdout: true,
                        AttachStderr: true
                    });
                    await backupExec.start();
                } catch (e) {
                    // File might not exist, continue
                }
            }

            // Write file using tee command for better handling
            const writeExec = await container.exec({
                Cmd: ['tee', filePath],
                AttachStdin: true,
                AttachStdout: true,
                AttachStderr: true
            });

            const stream = await writeExec.start({ hijack: true, stdin: true });
            
            return new Promise((resolve, reject) => {
                let error = '';

                stream.on('data', (chunk) => {
                    if (chunk[0] === 2) { // stderr
                        error += chunk.slice(8).toString('utf8');
                    }
                });

                stream.on('end', () => {
                    if (error) {
                        reject(new Error(`Error writing file: ${error}`));
                    } else {
                        resolve({
                            path: filePath,
                            size: Buffer.byteLength(content, encoding),
                            container: containerName,
                            timestamp: new Date().toISOString()
                        });
                    }
                });

                stream.on('error', reject);

                // Write content and close stdin
                stream.write(content);
                stream.end();
            });

        } catch (error) {
            this.logger.error(`Failed to write file ${filePath} to ${containerName}:`, error);
            throw error;
        }
    }

    /**
     * Execute npm commands in Node.js container
     */
    async executeNpmCommand(command, options = {}) {
        try {
            const { 
                workingDir = '/workspace',
                timeout = 300000, // 5 minutes
                returnOutput = true 
            } = options;

            this.logger.info(`Executing npm command: ${command}`);

            const container = this.docker.getContainer('nodejs-dev');
            
            // Check if container is running
            const containerInfo = await container.inspect();
            if (!containerInfo.State.Running) {
                throw new Error('Node.js container is not running');
            }

            const npmCommands = {
                'install': ['npm', 'install'],
                'ci': ['npm', 'ci'],
                'test': ['npm', 'test'],
                'prune': ['npm', 'prune'],
                'shrinkwrap': ['npm', 'shrinkwrap'],
                'rebuild': ['npm', 'rebuild'],
                'audit': ['npm', 'audit'],
                'audit-fix': ['npm', 'audit', 'fix'],
                'update': ['npm', 'update'],
                'outdated': ['npm', 'outdated'],
                'list': ['npm', 'list'],
                'install-ci-test': ['npm', 'ci', '&&', 'npm', 'test'],
                'build': ['npm', 'run', 'build'],
                'start': ['npm', 'start'],
                'dev': ['npm', 'run', 'dev']
            };

            const cmd = npmCommands[command] || command.split(' ');

            const exec = await container.exec({
                Cmd: ['sh', '-c', `cd ${workingDir} && ${cmd.join(' ')}`],
                AttachStdout: true,
                AttachStderr: true,
                WorkingDir: workingDir
            });

            const stream = await exec.start({ hijack: true, stdin: false });
            
            return new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';
                
                const timeoutId = setTimeout(() => {
                    reject(new Error(`Command timed out after ${timeout}ms`));
                }, timeout);

                stream.on('data', (chunk) => {
                    if (chunk[0] === 1) { // stdout
                        stdout += chunk.slice(8).toString('utf8');
                    } else if (chunk[0] === 2) { // stderr
                        stderr += chunk.slice(8).toString('utf8');
                    }
                });

                stream.on('end', async () => {
                    clearTimeout(timeoutId);
                    
                    try {
                        const inspectResult = await exec.inspect();
                        const exitCode = inspectResult.ExitCode;
                        
                        resolve({
                            command: command,
                            exitCode: exitCode,
                            stdout: returnOutput ? stdout : '',
                            stderr: returnOutput ? stderr : '',
                            success: exitCode === 0,
                            container: 'nodejs-dev',
                            timestamp: new Date().toISOString()
                        });
                    } catch (inspectError) {
                        reject(inspectError);
                    }
                });

                stream.on('error', (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
            });

        } catch (error) {
            this.logger.error(`Failed to execute npm command ${command}:`, error);
            throw error;
        }
    }

    /**
     * Get project dependencies from package.json across containers
     */
    async getProjectDependencies(language) {
        try {
            const langConfig = this.supportedLanguages[language];
            if (!langConfig) {
                throw new Error(`Unsupported language: ${language}`);
            }

            const dependencyFiles = {
                'nodejs': 'package.json',
                'python': 'requirements.txt',
                'java': 'pom.xml',
                'go': 'go.mod',
                'php': 'composer.json',
                'rust': 'Cargo.toml',
                'elixir': 'mix.exs',
                'crystal': 'shard.yml',
                'zig': 'build.zig.zon'
            };

            const depFile = dependencyFiles[language];
            if (!depFile) {
                throw new Error(`No dependency file defined for ${language}`);
            }

            const filePath = path.join(langConfig.workspacePath, depFile);
            const fileContent = await this.fetchFile(langConfig.container, filePath);

            // Parse dependencies based on file type
            let dependencies = {};
            
            if (depFile.endsWith('.json')) {
                const parsed = safeJsonParse(fileContent.content);
                if (parsed.success) {
                    dependencies = {
                        ...parsed.data.dependencies || {},
                        ...parsed.data.devDependencies || {}
                    };
                }
            }

            return {
                language: language,
                dependencyFile: depFile,
                dependencies: dependencies,
                container: langConfig.container,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error(`Failed to get dependencies for ${language}:`, error);
            throw error;
        }
    }

    /**
     * Parse file listing output
     */
    parseFileList(output, recursive, includeHidden) {
        const lines = output.trim().split('\n');
        const files = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            if (recursive) {
                // Find command output
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('/') && trimmed !== '.') {
                    const fileName = path.basename(trimmed);
                    if (includeHidden || !fileName.startsWith('.')) {
                        files.push({
                            name: fileName,
                            path: trimmed,
                            type: 'file'
                        });
                    }
                }
            } else {
                // ls -la output parsing
                const parts = line.split(/\s+/);
                if (parts.length >= 9) {
                    const permissions = parts[0];
                    const size = parts[4];
                    const name = parts.slice(8).join(' ');
                    
                    if (name !== '.' && name !== '..' && (includeHidden || !name.startsWith('.'))) {
                        files.push({
                            name: name,
                            permissions: permissions,
                            size: size,
                            type: permissions.startsWith('d') ? 'directory' : 'file'
                        });
                    }
                }
            }
        }

        return files;
    }

    /**
     * Health check for all language containers
     */
    async checkContainerHealth() {
        const results = {};
        
        for (const [language, config] of Object.entries(this.supportedLanguages)) {
            try {
                const container = this.docker.getContainer(config.container);
                const info = await container.inspect();
                
                results[language] = {
                    container: config.container,
                    running: info.State.Running,
                    status: info.State.Status,
                    health: info.State.Health?.Status || 'unknown',
                    uptime: info.State.StartedAt
                };
            } catch (error) {
                results[language] = {
                    container: config.container,
                    running: false,
                    status: 'not found',
                    error: error.message
                };
            }
        }
        
        return results;
    }
}

module.exports = FileManager;