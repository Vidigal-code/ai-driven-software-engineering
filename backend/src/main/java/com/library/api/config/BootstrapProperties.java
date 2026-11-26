package com.library.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("library.bootstrap")
public record BootstrapProperties(boolean enabled, String name, String email, String password) { }
