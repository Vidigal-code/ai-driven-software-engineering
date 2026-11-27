package com.library.api.config;

import com.library.api.config.OpenApiCatalog.OperationDefinition;
import com.library.api.service.SortFields;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.headers.Header;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.servers.Server;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import static java.util.Map.entry;

@Configuration(proxyBeanMethods = false)
public class OpenApiConfig {
    private static final String JSON = "application/json";
    private static final String PROBLEM_JSON = "application/problem+json";
    private static final String AJAX_HEADER_VALUE = "XMLHttpRequest";
    private static final String TITLE_FIELD = "title";
    private static final String GUIDE = """
            ## Comece aqui

            1. Use **Authentication → login** com suas próprias credenciais. Se necessário, **register** cria somente **READER**; preencha a senha vazia do exemplo. Nenhum usuário ou segredo é criado automaticamente.
            2. Execute o login e copie **accessToken da resposta real**. Clique **Authorize**, cole somente o token, sem escrever o prefixo Bearer, e confirme. O texto ilustrativo dos exemplos não autentica.
            3. Consulte **currentUser**, **listBooks** e **dashboardSummary**. Para criar, editar ou excluir livros use uma conta **ADMIN** ou **LIBRARIAN**; contas públicas READER recebem 403.
            4. Em **createBook**, escolha **validBook** e Execute. Copie o id retornado para **getBook**, **updateBook** e **deleteBook**. Repetir o mesmo ISBN demonstra 409; **invalidCopies** e **invalidIsbn** demonstram 400. Exclusão bem-sucedida retorna 204 sem corpo.
            5. Para **refresh**, execute sem corpo: o navegador envia o cookie **HttpOnly** automaticamente. Copie o novo accessToken para Authorize. Não existe campo editável de refresh token.
            6. Para sair, execute **logout** e depois **Logout** no diálogo Authorize, removendo o token da memória da UI. Um access token já emitido permanece sujeito à sua expiração e ao estado atual da conta.

            ## Parâmetros e sessão

            O servidor relativo **/** mantém todas as requisições na origem desta página, incluindo o proxy do frontend. POSTs de autenticação trazem **X-Requested-With: XMLHttpRequest** predefinido e a origem precisa estar na allowlist configurada.

            Filtros combinam por AND, páginas começam em 0 e o tamanho máximo aparece no parâmetro size. Ordenação oferece somente campos aceitos pela API. UUIDs, datas, tokens e indicadores dos exemplos são ilustrativos; use os valores retornados pela execução real.

            A autorização não é persistida após recarregar a página. O cookie de refresh é HttpOnly, SameSite=Strict e Secure quando configurado para HTTPS. Não cole senhas ou tokens em URLs. **Users** exige ADMIN; use outro usuário de teste ao alterar perfil ou status.
            """;
    private static final Map<String, String> FIELD_DESCRIPTIONS = Map.ofEntries(
            entry("id", "UUID gerado pelo servidor; use o valor real retornado pela API."),
            entry("name", "Nome obrigatório, até 100 caracteres; espaços externos são removidos."),
            entry("email", "Email válido, até 254 caracteres; normalizado para minúsculas e único no cadastro."),
            entry("role", "ADMIN administra usuários e livros; LIBRARIAN administra livros; READER somente consulta."),
            entry("active", "Indica se a conta pode autenticar e utilizar a API."),
            entry(TITLE_FIELD, "Título obrigatório, até 200 caracteres."),
            entry("author", "Autor obrigatório, até 150 caracteres."),
            entry("isbn", "ISBN-10/13 válido por checksum, único. Remove hífens/espaços; respostas usam ISBN-13 canônico."),
            entry("publisher", "Editora opcional, até 150 caracteres."),
            entry("publicationYear", "Ano inteiro entre 1 e o ano atual; anos futuros são rejeitados."),
            entry("category", "Categoria opcional, até 100 caracteres."),
            entry("description", "Descrição opcional do livro, até 5000 caracteres."),
            entry("totalCopies", "Quantidade total de exemplares; inteira e não negativa."),
            entry("availableCopies", "Quantidade disponível; inteira, não negativa e nunca superior ao total."),
            entry("createdAt", "Instante de criação em UTC, formato ISO 8601."),
            entry("updatedAt", "Instante da última atualização em UTC, formato ISO 8601."),
            entry("accessToken", "JWT de acesso retornado pela execução real. Copie somente este valor para Authorize; não use o texto ilustrativo."),
            entry("tokenType", "Tipo de autenticação Bearer; Swagger adiciona o prefixo automaticamente."),
            entry("expiresIn", "Validade do access token em segundos, conforme configuração do ambiente."),
            entry("user", "Usuário autenticado sem senha, hash ou refresh token."),
            entry("content", "Itens desta página; pode ser uma lista vazia."),
            entry("number", "Índice da página retornada, iniciando em 0."),
            entry("size", "Tamanho solicitado da página, limitado pela configuração do servidor."),
            entry("totalElements", "Quantidade total de registros que correspondem aos filtros."),
            entry("totalPages", "Número total de páginas para o tamanho solicitado."),
            entry("totalTitles", "Quantidade real de títulos distintos cadastrados."),
            entry("unavailableCopies", "Total de exemplares menos exemplares disponíveis."),
            entry("totalCategories", "Quantidade de categorias distintas não vazias."),
            entry("recentBooks", "Livros cadastrados recentemente, limitados pela configuração do servidor."),
            entry("type", "URI do tipo de problema; about:blank usa o significado do status HTTP."),
            entry("status", "Código HTTP correspondente à resposta."),
            entry("detail", "Explicação do erro; não contém stack trace nem segredos."),
            entry("instance", "Caminho da requisição quando informado."),
            entry("errors", "Mapa opcional campo→mensagem em falhas de validação de DTO.")
    );
    private final OpenApiCatalog catalog;
    private final int maximumPageSize;

    public OpenApiConfig(OpenApiCatalog catalog, @Value("${library.pagination.max-size}") int maximumPageSize) {
        this.catalog = catalog;
        this.maximumPageSize = maximumPageSize;
    }

    @Bean
    OpenAPI libraryOpenApi() {
        return new OpenAPI().info(new Info().title("Library Management API").version("v1")
                .description(GUIDE)).servers(List.of(new Server().url("/").description("Mesma origem desta página — backend ou proxy do frontend")))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme().type(SecurityScheme.Type.HTTP)
                        .scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    @Bean
    OpenApiCustomizer documentedContract() {
        return api -> {
            api.getComponents().addSchemas("ProblemDetail", problemSchema());
            api.getPaths().forEach((url, path) -> path.readOperationsMap()
                    .forEach((method, operation) -> customize(url, method, operation)));
            describeSchemas(api);
        };
    }

    private void customize(String url, PathItem.HttpMethod method, Operation operation) {
        OperationDefinition definition = catalog.operation(url, method.name());
        operation.setOperationId(definition.operationId());
        operation.setDescription(definition.description());
        if (url.startsWith("/api/v1/auth/") && !url.endsWith("/me")) operation.setSecurity(List.of());
        for (String name : definition.requestExamples()) {
            operation.getRequestBody().getContent().get(JSON).addExamples(name, catalog.named(name));
        }
        ApiResponse success = successResponse(operation, definition);
        documentHeaders(url, method, success);
        ApiResponses responses = new ApiResponses().addApiResponse(definition.successStatus(), success);
        definition.errorExamples().forEach((status, example) -> responses.addApiResponse(status, errorResponse(status, example)));
        operation.setResponses(responses);
        describeParameters(url, operation);
    }

    private ApiResponse successResponse(Operation operation, OperationDefinition definition) {
        if ("204".equals(definition.successStatus())) return new ApiResponse().description("Operação concluída; resposta sem corpo.");
        ApiResponse response = operation.getResponses().getOrDefault(definition.successStatus(), operation.getResponses().get("200"));
        MediaType content = response.getContent().values().iterator().next();
        content.addExamples("success", catalog.named(definition.successExample()));
        return response.description("Operação concluída. Dados abaixo são ilustrativos; Execute retorna os dados reais.")
                .content(new Content().addMediaType(JSON, content));
    }

    private ApiResponse errorResponse(String status, String name) {
        var example = catalog.named(name);
        var response = new ApiResponse().description(example.getSummary())
                .content(new Content().addMediaType(PROBLEM_JSON, new MediaType()
                        .schema(new Schema<>().$ref("#/components/schemas/ProblemDetail")).addExamples(name, example)));
        if ("429".equals(status)) response.addHeaderObject("Retry-After", new Header()
                .description("Segundos até nova tentativa, conforme a janela configurada.").schema(new IntegerSchema()));
        return response;
    }

    private void documentHeaders(String url, PathItem.HttpMethod method, ApiResponse response) {
        if (url.equals("/api/v1/books") && method == PathItem.HttpMethod.POST) {
            response.addHeaderObject("Location", new Header().description("Caminho relativo do livro recém-criado, com seu UUID real.")
                    .schema(new StringSchema().format("uri-reference")));
        }
        if (url.startsWith("/api/v1/auth/") && method == PathItem.HttpMethod.POST) {
            response.addHeaderObject("Set-Cookie", new Header().description(
                    "library_refresh: cookie gerenciado pelo navegador, HttpOnly, SameSite=Strict, Path=/api/v1/auth; Secure sob HTTPS. Logout expira o cookie.")
                    .schema(new StringSchema()));
        }
    }

    private void describeParameters(String url, Operation operation) {
        if (operation.getParameters() == null) return;
        operation.setParameters(operation.getParameters().stream().filter(parameter -> !"cookie".equals(parameter.getIn())).toList());
        operation.getParameters().forEach(parameter -> describeParameter(url, parameter));
    }

    private void describeParameter(String url, Parameter parameter) {
        String name = parameter.getName();
        switch (name) {
            case "X-Requested-With" -> parameter.description("Obrigatório nos POSTs de autenticação. Mantenha XMLHttpRequest; a origem também é validada.")
                    .example(AJAX_HEADER_VALUE).schema(new StringSchema()._default(AJAX_HEADER_VALUE)._enum(List.of(AJAX_HEADER_VALUE)));
            case "page" -> parameter.description("Página iniciando em 0.").getSchema().minimum(BigDecimal.ZERO);
            case "size" -> parameter.description("Itens por página, entre 1 e " + maximumPageSize + " neste ambiente.")
                    .getSchema().minimum(BigDecimal.ONE).maximum(BigDecimal.valueOf(maximumPageSize));
            case "sort" -> describeSort(url, parameter);
            case "id" -> parameter.description("UUID real retornado pelo cadastro ou listagem; substitua o identificador ilustrativo.")
                    .example("67cddf30-6cc2-441c-b098-55c5c581034a");
            case "available" -> parameter.description("true: pelo menos um exemplar disponível; false: nenhum disponível; omitido: ambos.");
            case "isbn" -> parameter.description("ISBN-10/13 completo válido ou fragmento. Remove hífens/espaços e encontra equivalentes 10/13.").example("0-201-48567-2");
            case TITLE_FIELD -> parameter.description("Trecho do título, sem distinguir maiúsculas.").example("Refactoring");
            case "author" -> parameter.description("Trecho do autor, sem distinguir maiúsculas.").example("Fowler");
            case "category" -> parameter.description("Categoria exata, sem distinguir maiúsculas.").example("Engenharia de software");
            default -> throw new IllegalStateException("Parâmetro OpenAPI sem descrição: " + name);
        }
    }

    private void describeSort(String url, Parameter parameter) {
        Set<String> fields = url.startsWith("/api/v1/books") ? SortFields.BOOKS : SortFields.USERS;
        List<String> values = fields.stream().sorted().flatMap(field -> Stream.of(field + ",asc", field + ",desc")).toList();
        String defaultValue = parameter.getSchema().getDefault().toString();
        parameter.description("Escolha campo,direção da lista permitida.").schema(new StringSchema()._enum(values)._default(defaultValue));
    }

    private void describeSchemas(OpenAPI api) {
        api.getComponents().getSchemas().forEach((name, schema) -> {
            Schema<?> typedSchema = schema;
            if (typedSchema.getProperties() == null) return;
            typedSchema.getProperties().forEach((field, property) -> {
                if ("password".equals(field)) property.description("Senha própria: registro exige pelo menos 12 caracteres e no máximo 72 bytes UTF-8; nunca aparece na resposta.")
                        .format("password").writeOnly(true);
                else if ("ProblemDetail".equals(name) && TITLE_FIELD.equals(field)) property.description("Resumo do significado do status HTTP.");
                else property.description(FIELD_DESCRIPTIONS.get(field));
            });
        });
    }

    private Schema<?> problemSchema() {
        return new ObjectSchema().addProperty("type", new StringSchema()).addProperty(TITLE_FIELD, new StringSchema())
                .addProperty("status", new IntegerSchema()).addProperty("detail", new StringSchema())
                .addProperty("instance", new StringSchema()).addProperty("errors", new MapSchema().additionalProperties(new StringSchema()));
    }
}
