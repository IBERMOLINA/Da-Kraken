const { v4: uuidv4 } = require('uuid');

class ContainerManager {
    constructor(docker) {
        this.docker = docker;
        this.languageImages = {
            'nodejs': 'xomni/nodejs-container:latest',
            'python': 'xomni/python-container:latest',
            'java': 'xomni/java-container:latest',
            'go': 'xomni/go-container:latest',
            'rust': 'xomni/rust-container:latest',
            'cpp': 'xomni/cpp-container:latest'
        };
    }
    
    async startLanguageContainer(language, sessionId) {
        const imageName = this.languageImages[language];
        if (!imageName) {
            throw new Error(`Unsupported language: ${language}`);
        }
        
        try {
            // Check if image exists locally, pull if not
            try {
                await this.docker.getImage(imageName).inspect();
            } catch (error) {
                console.log(`Pulling image ${imageName}...`);
                await this.docker.pull(imageName);
            }
            
            const container = await this.docker.createContainer({
                Image: imageName,
                name: `${language}-${sessionId}`,
                Env: [
                    `SESSION_ID=${sessionId}`,
                    `LANGUAGE=${language}`,
                    `BRIDGE_ENDPOINT=http://bridge-orchestrator:4000`
                ],
                WorkingDir: '/workspace',
                Volumes: {
                    '/workspace': {},
                    '/shared': {}
                },
                HostConfig: {
                    Memory: 1024 * 1024 * 1024, // 1GB
                    CpuQuota: 50000, // 50% CPU
                    Binds: [
                        `shared-volume:/shared`,
                        `${sessionId}-workspace:/workspace`
                    ],
                    NetworkMode: 'bridge-network'
                },
                NetworkingConfig: {
                    EndpointsConfig: {
                        'bridge-network': {}
                    }
                }
            });
            
            await container.start();
            
            return {
                id: container.id,
                sessionId,
                language,
                container,
                status: 'running',
                startedAt: new Date()
            };
        } catch (error) {
            throw new Error(`Failed to start ${language} container: ${error.message}`);
        }
    }
    
    async stopContainer(containerInfo) {
        try {
            await containerInfo.container.stop();
            await containerInfo.container.remove();
        } catch (error) {
            throw new Error(`Failed to stop container: ${error.message}`);
        }
    }
    
    async executeCode(containerInfo, code, language) {
        const { container } = containerInfo;
        
        try {
            // Create execution script based on language
            const scriptName = this.getExecutionScript(language);
            const codeFile = this.getCodeFile(language, code);
            
            // Write code to container
            const codeWriteExec = await container.exec({
                Cmd: ['sh', '-c', `echo '${code.replace(/'/g, "'\"'\"'")}' > ${codeFile}`],
                AttachStdout: true,
                AttachStderr: true
            });
            
            await codeWriteExec.start();
            
            // Execute code
            const exec = await container.exec({
                Cmd: this.getExecutionCommand(language, codeFile),
                AttachStdout: true,
                AttachStderr: true
            });
            
            const stream = await exec.start();
            
            return new Promise((resolve, reject) => {
                let output = '';
                let error = '';
                
                stream.on('data', (chunk) => {
                    const data = chunk.toString();
                    if (chunk[0] === 1) {
                        output += data.slice(8);
                    } else if (chunk[0] === 2) {
                        error += data.slice(8);
                    }
                });
                
                stream.on('end', () => {
                    resolve({
                        output: output.trim(),
                        error: error.trim(),
                        exitCode: 0,
                        language,
                        executedAt: new Date()
                    });
                });
                
                stream.on('error', (err) => {
                    reject(new Error(`Execution failed: ${err.message}`));
                });
            });
        } catch (error) {
            throw new Error(`Failed to execute code: ${error.message}`);
        }
    }
    
    getCodeFile(language, code) {
        const extensions = {
            'nodejs': 'js',
            'python': 'py',
            'java': 'java',
            'go': 'go',
            'rust': 'rs',
            'cpp': 'cpp'
        };
        
        const ext = extensions[language] || 'txt';
        return `/workspace/generated/code_${Date.now()}.${ext}`;
    }
    
    getExecutionCommand(language, codeFile) {
        const commands = {
            'nodejs': ['node', codeFile],
            'python': ['python', codeFile],
            'java': ['sh', '-c', `cd $(dirname ${codeFile}) && javac $(basename ${codeFile}) && java $(basename ${codeFile} .java)`],
            'go': ['go', 'run', codeFile],
            'rust': ['sh', '-c', `rustc ${codeFile} -o /tmp/rust_exec && /tmp/rust_exec`],
            'cpp': ['sh', '-c', `g++ ${codeFile} -o /tmp/cpp_exec && /tmp/cpp_exec`]
        };
        
        return commands[language] || ['cat', codeFile];
    }
    
    async getContainerStats(containerInfo) {
        try {
            const stats = await containerInfo.container.stats({ stream: false });
            return {
                sessionId: containerInfo.sessionId,
                language: containerInfo.language,
                cpu: this.calculateCpuPercent(stats),
                memory: this.calculateMemoryUsage(stats),
                network: stats.networks,
                timestamp: new Date()
            };
        } catch (error) {
            throw new Error(`Failed to get container stats: ${error.message}`);
        }
    }
    
    calculateCpuPercent(stats) {
        const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
        const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
        const numCpus = stats.cpu_stats.online_cpus || 1;
        
        return (cpuDelta / systemDelta) * numCpus * 100.0;
    }
    
    calculateMemoryUsage(stats) {
        return {
            usage: stats.memory_stats.usage,
            limit: stats.memory_stats.limit,
            percent: (stats.memory_stats.usage / stats.memory_stats.limit) * 100
        };
    }
    
    async listActiveContainers() {
        try {
            const containers = await this.docker.listContainers({
                filters: { label: ['xomni-container=true'] }
            });
            
            return containers.map(container => ({
                id: container.Id,
                image: container.Image,
                status: container.Status,
                names: container.Names,
                created: container.Created
            }));
        } catch (error) {
            throw new Error(`Failed to list containers: ${error.message}`);
        }
    }
}

module.exports = ContainerManager;