package com.dakraken;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import org.junit.jupiter.api.Assertions;

/**
 * Test class for JavaToolsApplication.
 * Tests application context loading and health response creation.
 */
@SpringBootTest
@SpringJUnitConfig
class JavaToolsApplicationTest {

    /**
     * Test that application context loads successfully.
     */
    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
        Assertions.assertTrue(true, "Application context should load without errors");
    }

    /**
     * Test HealthResponse creation and getter methods.
     */
    @Test
    void healthResponseCreation() {
        JavaToolsApplication.HealthResponse response =
            new JavaToolsApplication.HealthResponse("Test message", "1.0.0", "Java 21");

        Assertions.assertEquals("Test message", response.getMessage());
        Assertions.assertEquals("1.0.0", response.getVersion());
        Assertions.assertEquals("Java 21", response.getJavaVersion());
    }
}