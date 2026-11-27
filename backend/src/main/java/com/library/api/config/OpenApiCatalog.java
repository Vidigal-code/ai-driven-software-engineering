package com.library.api.config;

import io.swagger.v3.oas.models.examples.Example;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.List;
import java.util.Objects;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
public final class OpenApiCatalog {
    private final Catalog catalog;

    public record Definition(String summary, String description, Map<String, Object> value) { }
    public record OperationDefinition(String operationId, String description, String successStatus,
            String successExample, List<String> requestExamples, Map<String, String> errorExamples) { }
    private record Catalog(Map<String, Definition> examples, Map<String, OperationDefinition> operations) { }

    public OpenApiCatalog(ObjectMapper mapper) {
        try (var input = new ClassPathResource("openapi/catalog.json").getInputStream()) {
            catalog = mapper.readValue(input, Catalog.class);
        } catch (IOException exception) {
            throw new UncheckedIOException("Não foi possível carregar os exemplos OpenAPI.", exception);
        }
    }

    public Example named(String name) {
        Definition example = Objects.requireNonNull(catalog.examples().get(name), "Exemplo OpenAPI não encontrado: " + name);
        return new Example().summary(example.summary()).description(example.description()).value(example.value());
    }

    public OperationDefinition operation(String path, String method) {
        return Objects.requireNonNull(catalog.operations().get(method + " " + path), "Operação OpenAPI não documentada: " + path);
    }
}
