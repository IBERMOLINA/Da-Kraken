package com.dakraken;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@SpringJUnitConfig
class JavaToolsApplicationTest {

    @Test
    void contextLoads() {
        // This test will pass if the application context loads successfully
        assertTrue(true, "Application context should load without errors");
    }

    @Test
    void healthResponseCreation() {
        JavaToolsApplication.HealthResponse response = 
            new JavaToolsApplication.HealthResponse("Test message", "1.0.0", "Java 21");
        
        assertEquals("Test message", response.getMessage());
        assertEquals("1.0.0", response.getVersion());
        assertEquals("Java 21", response.getJavaVersion());
    }
}