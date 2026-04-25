package com.hospital.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.hospital")
@EntityScan(basePackages = "com.hospital")
@EnableJpaRepositories(basePackages = "com.hospital")
@ConfigurationPropertiesScan("com.hospital")
public class HmsApiApplication {
  public static void main(String[] args) {
    SpringApplication.run(HmsApiApplication.class, args);
  }
}
