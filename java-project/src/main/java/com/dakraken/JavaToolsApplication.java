package com.dakraken;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Java Tools Application main class.
 * Provides REST endpoints for Java development tools.
 */
@SpringBootApplication
@RestController
public final class JavaToolsApplication {

    /**
     * Main method to start the Spring Boot application.
     *
     * @param args command line arguments
     */
    public static void main(final String[] args) {
        SpringApplication.run(JavaToolsApplication.class, args);
    }

    /**
     * Health check endpoint.
     *
     * @return HealthResponse with application status
     */
    @GetMapping("/api/java/health")
    public HealthResponse healthCheck() {
        return new HealthResponse("Java Tools API is running!", "1.0.0", "Java 21");
    }

    /**
     * Health response data class.
     * Contains application status information.
     */
    public static final class HealthResponse {

        /** Status message. */
        private String message;

        /** Application version. */
        private String version;

        /** Java runtime version. */
        private String javaVersion;

        /**
         * Constructor for HealthResponse.
         *
         * @param messageParam status message
         * @param versionParam application version
         * @param javaVersionParam Java runtime version
         */
        public HealthResponse(final String messageParam, final String versionParam,
                final String javaVersionParam) {
            this.message = messageParam;
            this.version = versionParam;
            this.javaVersion = javaVersionParam;
        }

        /**
         * Get the status message.
         *
         * @return status message
         */
        public String getMessage() {
            return message;
        }

        /**
         * Set the status message.
         *
         * @param messageParam status message
         */
        public void setMessage(final String messageParam) {
            this.message = messageParam;
        }

        /**
         * Get the application version.
         *
         * @return application version
         */
        public String getVersion() {
            return version;
        }

        /**
         * Set the application version.
         *
         * @param versionParam application version
         */
        public void setVersion(final String versionParam) {
            this.version = versionParam;
        }

        /**
         * Get the Java runtime version.
         *
         * @return Java runtime version
         */
        public String getJavaVersion() {
            return javaVersion;
        }

        /**
         * Set the Java runtime version.
         *
         * @param javaVersionParam Java runtime version
         */
        public void setJavaVersion(final String javaVersionParam) {
            this.javaVersion = javaVersionParam;
        }
    }
}
