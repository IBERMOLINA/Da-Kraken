class CodeGenerator {
    constructor() {
        this.openaiKey = process.env.OPENAI_API_KEY;
        this.anthropicKey = process.env.ANTHROPIC_API_KEY;
        this.useMockAI = process.env.USE_MOCK_AI === 'true' || 
                        this.openaiKey?.includes('mock') || 
                        this.anthropicKey?.includes('mock');
        this.useLocalAI = process.env.USE_LOCAL_AI === 'true';
        this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
        this.localModel = process.env.LOCAL_MODEL || 'codellama:7b';
    }
    
    async generate(prompt, language, context = {}, options = {}) {
        if (this.useLocalAI) {
            return await this.generateWithOllama(prompt, language, context, options);
        }
        
        if (this.useMockAI) {
            return this.generateMockResponse(prompt, language, context, options);
        }
        
        // Try OpenAI first, fallback to Anthropic
        try {
            return await this.generateWithOpenAI(prompt, language, context, options);
        } catch (error) {
            console.log('OpenAI failed, trying Anthropic...', error.message);
            try {
                return await this.generateWithAnthropic(prompt, language, context, options);
            } catch (anthropicError) {
                console.log('Anthropic also failed, using mock response...', anthropicError.message);
                return this.generateMockResponse(prompt, language, context, options);
            }
        }
    }
    
    async generateWithOpenAI(prompt, language, context, options) {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: this.openaiKey });
        
        const systemPrompt = this.buildSystemPrompt(language, context);
        const userPrompt = this.buildUserPrompt(prompt, language, context, options);
        
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
            temperature: 0.7
        });
        
        return {
            code: response.choices[0].message.content,
            provider: 'openai',
            model: response.model,
            language,
            prompt,
            generatedAt: new Date(),
            usage: response.usage
        };
    }
    
    async generateWithAnthropic(prompt, language, context, options) {
        const Anthropic = require('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: this.anthropicKey });
        
        const systemPrompt = this.buildSystemPrompt(language, context);
        const userPrompt = this.buildUserPrompt(prompt, language, context, options);
        
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
            max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 1000,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt }
            ]
        });
        
        return {
            code: response.content[0].text,
            provider: 'anthropic',
            model: response.model,
            language,
            prompt,
            generatedAt: new Date(),
            usage: response.usage
        };
    }
    
    async generateWithOllama(prompt, language, context, options) {
        const axios = require('axios');
        
        const systemPrompt = this.buildSystemPrompt(language, context);
        const userPrompt = this.buildUserPrompt(prompt, language, context, options);
        
        try {
            const response = await axios.post(`${this.ollamaHost}/api/generate`, {
                model: this.localModel,
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false
            });
            
            return {
                code: response.data.response,
                provider: 'ollama',
                model: this.localModel,
                language,
                prompt,
                generatedAt: new Date(),
                usage: { total_tokens: response.data.response.length }
            };
        } catch (error) {
            console.log('Ollama failed, using mock response...', error.message);
            return this.generateMockResponse(prompt, language, context, options);
        }
    }
    
    generateMockResponse(prompt, language, context, options) {
        const templates = {
            javascript: {
                'hello world': `// Generated Hello World function\nfunction helloWorld() {\n    console.log('Hello, World!');\n    return 'Hello, World!';\n}\n\n// Usage\nhelloWorld();`,
                'rest api': `// Generated REST API with Express\nconst express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.get('/api/hello', (req, res) => {\n    res.json({ message: 'Hello from API!' });\n});\n\napp.listen(3000, () => {\n    console.log('Server running on port 3000');\n});`,
                'react component': `// Generated React Component\nimport React, { useState } from 'react';\n\nfunction MyComponent() {\n    const [count, setCount] = useState(0);\n    \n    return (\n        <div>\n            <h1>Count: {count}</h1>\n            <button onClick={() => setCount(count + 1)}>\n                Increment\n            </button>\n        </div>\n    );\n}\n\nexport default MyComponent;`
            },
            python: {
                'hello world': `# Generated Hello World function\ndef hello_world():\n    \"\"\"Print and return a greeting message.\"\"\"\n    message = \"Hello, World!\"\n    print(message)\n    return message\n\n# Usage\nif __name__ == \"__main__\":\n    hello_world()`,
                'rest api': `# Generated REST API with FastAPI\nfrom fastapi import FastAPI\nfrom pydantic import BaseModel\n\napp = FastAPI()\n\nclass Message(BaseModel):\n    text: str\n\n@app.get(\"/api/hello\")\nasync def hello():\n    return {\"message\": \"Hello from FastAPI!\"}\n\n@app.post(\"/api/message\")\nasync def create_message(message: Message):\n    return {\"received\": message.text}\n\nif __name__ == \"__main__\":\n    import uvicorn\n    uvicorn.run(app, host=\"0.0.0.0\", port=8000)`,
                'data analysis': `# Generated Data Analysis Script\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndef analyze_data(data_file):\n    \"\"\"Analyze data from CSV file.\"\"\"\n    # Load data\n    df = pd.read_csv(data_file)\n    \n    # Basic statistics\n    print(\"Data Info:\")\n    print(df.info())\n    print(\"\\nBasic Statistics:\")\n    print(df.describe())\n    \n    # Plot data\n    df.hist(figsize=(12, 8))\n    plt.tight_layout()\n    plt.show()\n    \n    return df\n\n# Usage\n# df = analyze_data('your_data.csv')`
            },
            java: {
                'hello world': `// Generated Hello World class\npublic class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, World!\");\n    }\n    \n    public static String getGreeting() {\n        return \"Hello, World!\";\n    }\n}`,
                'spring boot': `// Generated Spring Boot Application\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@SpringBootApplication\n@RestController\npublic class Application {\n    \n    public static void main(String[] args) {\n        SpringApplication.run(Application.class, args);\n    }\n    \n    @GetMapping(\"/api/hello\")\n    public String hello() {\n        return \"Hello from Spring Boot!\";\n    }\n}`
            },
            go: {
                'hello world': `// Generated Hello World program\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n    message := helloWorld()\n    fmt.Println(message)\n}\n\nfunc helloWorld() string {\n    return \"Hello, World!\"\n}`,
                'web server': `// Generated HTTP Server\npackage main\n\nimport (\n    \"encoding/json\"\n    \"fmt\"\n    \"log\"\n    \"net/http\"\n)\n\ntype Response struct {\n    Message string \\`json:\"message\"\\`\n}\n\nfunc helloHandler(w http.ResponseWriter, r *http.Request) {\n    response := Response{Message: \"Hello from Go server!\"}\n    w.Header().Set(\"Content-Type\", \"application/json\")\n    json.NewEncoder(w).Encode(response)\n}\n\nfunc main() {\n    http.HandleFunc(\"/api/hello\", helloHandler)\n    fmt.Println(\"Server starting on :8080\")\n    log.Fatal(http.ListenAndServe(\":8080\", nil))\n}`
            }
        };
        
        // Find matching template
        const langTemplates = templates[language] || templates.javascript;
        const promptLower = prompt.toLowerCase();
        
        let selectedTemplate = null;
        for (const [key, template] of Object.entries(langTemplates)) {
            if (promptLower.includes(key)) {
                selectedTemplate = template;
                break;
            }
        }
        
        // Fallback to hello world if no match
        if (!selectedTemplate) {
            selectedTemplate = langTemplates['hello world'] || `// Generated ${language} code\n// TODO: Implement based on prompt: ${prompt}`;
        }
        
        return {
            code: selectedTemplate,
            provider: 'mock',
            model: 'mock-generator-v1',
            language,
            prompt,
            generatedAt: new Date(),
            usage: { total_tokens: selectedTemplate.length },
            note: 'This is a mock response. Configure real API keys for AI-generated code.'
        };
    }
    
    buildSystemPrompt(language, context) {
        const frameworks = {
            javascript: context.framework || 'vanilla JavaScript',
            python: context.framework || 'Python standard library',
            java: context.framework || 'Java standard library',
            go: context.framework || 'Go standard library'
        };
        
        return `You are an expert ${language} developer. Generate clean, well-documented, production-ready code using ${frameworks[language]}. Include comments explaining the code structure and usage examples where appropriate.`;
    }
    
    buildUserPrompt(prompt, language, context, options) {
        let userPrompt = `Generate ${language} code for: ${prompt}`;
        
        if (context.framework) {
            userPrompt += `\nFramework: ${context.framework}`;
        }
        
        if (context.database) {
            userPrompt += `\nDatabase: ${context.database}`;
        }
        
        if (options.include_tests) {
            userPrompt += `\nInclude unit tests.`;
        }
        
        if (options.include_docker) {
            userPrompt += `\nInclude Dockerfile.`;
        }
        
        userPrompt += `\nProvide complete, working code with proper error handling.`;
        
        return userPrompt;
    }
}

module.exports = CodeGenerator;