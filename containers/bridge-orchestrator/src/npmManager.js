// NPM Management Utilities for Da-Kraken
// Comprehensive npm operations with enhanced security and monitoring

const { 
    safeJsonParse, 
    safeJsonStringify, 
    createApiResponse, 
    createErrorResponse 
} = require('./json-safe-encoding');

class NpmManager {
    constructor(fileManager, logger) {
        this.fileManager = fileManager;
        this.logger = logger;
        this.lockfilePath = '/workspace/package-lock.json';
        this.packagePath = '/workspace/package.json';
    }

    /**
     * Execute npm install with comprehensive options
     */
    async install(options = {}) {
        const {
            production = false,
            development = false,
            optional = true,
            clean = false,
            force = false,
            audit = true
        } = options;

        let commands = [];
        
        if (clean) {
            commands.push('npm cache clean --force');
            commands.push('rm -rf node_modules package-lock.json');
        }

        let installCmd = 'npm install';
        
        if (production) installCmd += ' --only=production';
        if (development) installCmd += ' --only=development';
        if (!optional) installCmd += ' --no-optional';
        if (force) installCmd += ' --force';
        if (!audit) installCmd += ' --no-audit';

        commands.push(installCmd);

        const results = [];
        for (const cmd of commands) {
            try {
                const result = await this.fileManager.executeNpmCommand(cmd);
                results.push(result);
                
                if (!result.success) {
                    this.logger.error(`NPM command failed: ${cmd}`, result.stderr);
                    break;
                }
            } catch (error) {
                this.logger.error(`NPM install failed: ${error.message}`);
                throw error;
            }
        }

        return {
            operation: 'install',
            results: results,
            success: results.every(r => r.success),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute npm ci (clean install)
     */
    async ci() {
        try {
            this.logger.info('Running npm ci for clean install');
            
            // Remove node_modules first
            await this.fileManager.executeNpmCommand('rm -rf node_modules');
            
            const result = await this.fileManager.executeNpmCommand('ci');
            
            return {
                operation: 'ci',
                result: result,
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM ci failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute npm test with coverage and reporting
     */
    async test(options = {}) {
        const {
            coverage = false,
            watch = false,
            silent = false,
            reporter = 'spec'
        } = options;

        let testCmd = 'npm test';
        
        if (coverage) testCmd += ' -- --coverage';
        if (watch) testCmd += ' -- --watch';
        if (silent) testCmd += ' --silent';

        try {
            const result = await this.fileManager.executeNpmCommand(testCmd, {
                timeout: 600000 // 10 minutes for tests
            });

            return {
                operation: 'test',
                result: result,
                coverage: coverage,
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM test failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute npm prune to remove unused packages
     */
    async prune(production = false) {
        try {
            let pruneCmd = 'npm prune';
            if (production) pruneCmd += ' --production';

            const result = await this.fileManager.executeNpmCommand(pruneCmd);

            return {
                operation: 'prune',
                production: production,
                result: result,
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM prune failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute npm shrinkwrap
     */
    async shrinkwrap() {
        try {
            const result = await this.fileManager.executeNpmCommand('shrinkwrap');

            return {
                operation: 'shrinkwrap',
                result: result,
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM shrinkwrap failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute npm rebuild
     */
    async rebuild(packageName = null) {
        try {
            let rebuildCmd = 'npm rebuild';
            if (packageName) rebuildCmd += ` ${packageName}`;

            const result = await this.fileManager.executeNpmCommand(rebuildCmd);

            return {
                operation: 'rebuild',
                package: packageName,
                result: result,
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM rebuild failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update package-lock.json and perform audit
     */
    async updateLockfile() {
        try {
            // First, update package-lock.json
            const updateResult = await this.fileManager.executeNpmCommand('install --package-lock-only');
            
            if (!updateResult.success) {
                throw new Error(`Failed to update lockfile: ${updateResult.stderr}`);
            }

            // Then audit
            const auditResult = await this.audit();

            return {
                operation: 'update-lockfile',
                lockfileUpdate: updateResult,
                audit: auditResult,
                success: updateResult.success && auditResult.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Lockfile update failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Execute npm audit with fix options
     */
    async audit(fix = false, force = false) {
        try {
            let auditCmd = 'npm audit';
            if (fix) {
                auditCmd += ' fix';
                if (force) auditCmd += ' --force';
            }
            auditCmd += ' --json';

            const result = await this.fileManager.executeNpmCommand(auditCmd);
            
            let auditData = {};
            if (result.stdout) {
                const parseResult = safeJsonParse(result.stdout);
                if (parseResult.success) {
                    auditData = parseResult.data;
                }
            }

            return {
                operation: 'audit',
                fix: fix,
                force: force,
                result: result,
                auditData: auditData,
                vulnerabilities: auditData.vulnerabilities || {},
                success: result.success,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM audit failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Comprehensive package.json analysis
     */
    async analyzePackageJson() {
        try {
            const packageFile = await this.fileManager.fetchFile('nodejs-dev', this.packagePath);
            const parseResult = safeJsonParse(packageFile.content);
            
            if (!parseResult.success) {
                throw new Error('Invalid package.json file');
            }

            const pkg = parseResult.data;
            
            // Analyze dependencies
            const analysis = {
                name: pkg.name,
                version: pkg.version,
                dependencies: {
                    production: Object.keys(pkg.dependencies || {}),
                    development: Object.keys(pkg.devDependencies || {}),
                    peer: Object.keys(pkg.peerDependencies || {}),
                    optional: Object.keys(pkg.optionalDependencies || {})
                },
                scripts: Object.keys(pkg.scripts || {}),
                engines: pkg.engines || {},
                repository: pkg.repository,
                license: pkg.license,
                keywords: pkg.keywords || [],
                totalDependencies: 
                    (Object.keys(pkg.dependencies || {}).length) +
                    (Object.keys(pkg.devDependencies || {}).length),
                timestamp: new Date().toISOString()
            };

            return analysis;
        } catch (error) {
            this.logger.error(`Package.json analysis failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get outdated packages
     */
    async getOutdated() {
        try {
            const result = await this.fileManager.executeNpmCommand('outdated --json');
            
            let outdatedData = {};
            if (result.stdout) {
                const parseResult = safeJsonParse(result.stdout);
                if (parseResult.success) {
                    outdatedData = parseResult.data;
                }
            }

            return {
                operation: 'outdated',
                result: result,
                outdatedPackages: outdatedData,
                count: Object.keys(outdatedData).length,
                success: true, // outdated command succeeds even with outdated packages
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`NPM outdated check failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Full CI/CD pipeline: install, test, audit
     */
    async cicdPipeline(options = {}) {
        const {
            skipTests = false,
            skipAudit = false,
            production = false,
            coverage = false
        } = options;

        const pipeline = [];
        
        try {
            // Step 1: Clean install
            this.logger.info('CICD Pipeline: Starting clean install');
            const ciResult = await this.ci();
            pipeline.push({ step: 'ci', ...ciResult });

            if (!ciResult.success) {
                throw new Error('CI install failed');
            }

            // Step 2: Run tests (if not skipped)
            if (!skipTests) {
                this.logger.info('CICD Pipeline: Running tests');
                const testResult = await this.test({ coverage });
                pipeline.push({ step: 'test', ...testResult });

                if (!testResult.success) {
                    throw new Error('Tests failed');
                }
            }

            // Step 3: Security audit (if not skipped)
            if (!skipAudit) {
                this.logger.info('CICD Pipeline: Running security audit');
                const auditResult = await this.audit();
                pipeline.push({ step: 'audit', ...auditResult });

                // Don't fail on audit issues, just report them
            }

            // Step 4: Prune for production (if requested)
            if (production) {
                this.logger.info('CICD Pipeline: Pruning for production');
                const pruneResult = await this.prune(true);
                pipeline.push({ step: 'prune', ...pruneResult });

                if (!pruneResult.success) {
                    throw new Error('Production prune failed');
                }
            }

            return {
                operation: 'cicd-pipeline',
                pipeline: pipeline,
                success: pipeline.every(step => step.success),
                duration: pipeline.length,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            this.logger.error(`CICD Pipeline failed: ${error.message}`);
            return {
                operation: 'cicd-pipeline',
                pipeline: pipeline,
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Generate comprehensive npm report
     */
    async generateReport() {
        try {
            const [packageAnalysis, outdated, audit] = await Promise.all([
                this.analyzePackageJson(),
                this.getOutdated(),
                this.audit()
            ]);

            return {
                report: 'npm-comprehensive',
                package: packageAnalysis,
                outdated: outdated,
                security: audit,
                summary: {
                    totalDependencies: packageAnalysis.totalDependencies,
                    outdatedCount: outdated.count,
                    vulnerabilityCount: Object.keys(audit.vulnerabilities).length,
                    hasSecurityIssues: Object.keys(audit.vulnerabilities).length > 0
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            this.logger.error(`Report generation failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = NpmManager;