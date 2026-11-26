package com.library.api.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.*;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.*;
import java.util.List;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {
    @Bean
    OpenAPI libraryOpenApi() {
        return new OpenAPI().info(new Info().title("Library Management API").version("v1")
                .description("Catálogo de biblioteca. JWT Bearer para rotas protegidas; auth usa X-Requested-With: XMLHttpRequest e refresh cookie HttpOnly."))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme().type(SecurityScheme.Type.HTTP)
                        .scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    OpenApiCustomizer errors() {
        return api -> api.getPaths().forEach((url, path) -> path.readOperationsMap()
                .forEach((method, operation) -> customize(url, method, operation)));
    }

    private void customize(String url, PathItem.HttpMethod method, Operation operation) {
        if (url.startsWith("/api/v1/auth/") && !url.endsWith("/me")) { operation.setSecurity(List.of()); }
        applySuccessResponse(operation, successStatus(url, method));
        for (String status : List.of("400", "401", "403", "404", "409", "429")) {
            operation.getResponses().putIfAbsent(status, new ApiResponse().description("Problem Details: " + status)
                    .content(new Content().addMediaType("application/problem+json", new MediaType().schema(problemSchema()))));
        }
    }

    private String successStatus(String url, PathItem.HttpMethod method) {
        if (method == PathItem.HttpMethod.DELETE || url.endsWith("/logout")) { return "204"; }
        if (method == PathItem.HttpMethod.POST && (url.endsWith("/register") || url.equals("/api/v1/books"))) { return "201"; }
        return "200";
    }

    private void applySuccessResponse(Operation operation, String status) {
        if ("200".equals(status)) { return; }
        ApiResponse response = operation.getResponses().remove("200");
        if ("204".equals(status)) {
            response = new ApiResponse().description("Operação concluída sem corpo.");
        } else {
            if (response == null) { response = new ApiResponse(); }
            response.description("Recurso criado.");
        }
        operation.getResponses().addApiResponse(status, response);
    }

    private Schema<?> problemSchema() {
        return new ObjectSchema().addProperty("type", new StringSchema()).addProperty("title", new StringSchema())
                .addProperty("status", new IntegerSchema()).addProperty("detail", new StringSchema())
                .addProperty("instance", new StringSchema());
    }
}
