package com.hospital.api;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
/**
 * Minimal {@code @SpringBootConfiguration} for {@code @WebMvcTest} slices in the
 * controller module. The real {@code @SpringBootApplication} lives in the start
 * module, which is not on the test classpath of this module.
 *
 * <p>Must reside in {@code com.hospital.api} (parent of all controller test
 * packages) so that Spring Boot's upward search finds it.</p>
 *
 * <p>Deliberately does NOT component-scan controller config packages —
 * those would pull in security filters with unsatisfied dependencies.
 * Each {@code @WebMvcTest} uses {@code @Import} for the beans it needs.</p>
 */
@SpringBootConfiguration
@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    DataSourceTransactionManagerAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,
    SecurityAutoConfiguration.class
})
public class ControllerTestConfig {

    /**
     * Permissive security configuration for {@code @WebMvcTest} slices.
     * Disables CSRF and permits all requests so tests can focus on
     * controller behavior without token boilerplate.
     */
    @Bean
    SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
