package com.dakraken;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class JavaToolsApplication {

    public static void main(String[] args) {
        SpringApplication.run(JavaToolsApplication.class, args);
    }

    @GetMapping("/api/java/health")
    public HealthResponse healthCheck() {
        return new HealthResponse("Java Tools API is running!", "1.0.0", "Java 21");
    }

    public static class HealthResponse {
        private String message;
        private String version;
        private String javaVersion;

        public HealthResponse(String message, String version, String javaVersion) {
            this.message = message;
            this.version = version;
            this.javaVersion = javaVersion;
        }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }

        public String getJavaVersion() { return javaVersion; }
        public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }
    }
}