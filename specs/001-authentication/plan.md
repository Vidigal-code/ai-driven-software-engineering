# Plano — Autenticação

## Decisão de stack
Java21, Spring Boot4.2.0, Spring Security7.2, JPA/Hibernate e Jackson gerenciados pelo BOM, Springdoc3.2.1, PostgreSQL17, Flyway, Maven3.9.16, JaCoCo0.8.16. Spring Test7 exige oficialmente JUnit Jupiter6; adotado Jupiter6.1.3 do BOM em substituição ao requisito original JUnit5 para preservar suporte atual. Context7 e fonte oficial SpringExtension consultados antes desta decisão. A estrutura de testes mantém APIs Jupiter, Mockito, MockMvc e Testcontainers2.0.5.

## Arquitetura e dados
AuthController traduz HTTP/cookies; AuthService possui registro/login/refresh/logout; TokenService emite JWT e tokens opacos; UserService administra usuários; SecurityFilterChain usa Resource Server oficial e converter para papel/estado atual. User contém UUID, nome, email normalizado único, hash de senha, role enum, ativo e timestamps. RefreshToken contém hash único, usuário, família, expiração e revogação. Lock pessimista serializa rotação; rejeição por replay mantém revogação da família.

## Contratos
Base /api/v1. POST auth/register201 e auth/login200 retornam {accessToken,tokenType,expiresIn,user}. POST auth/refresh200 renova cookie; POST auth/logout204 o limpa. GET auth/me200 retorna {id,name,email,role,active,createdAt,updatedAt}. GET users pagina {content,number,size,totalElements,totalPages}; GET users/{id}; PATCH users/{id}/role {role}; PATCH users/{id}/status {active}. Erros400/401/403/404/409/429 Problem Details.

## Segurança e configuração
JWT_SECRET base64 de pelo menos32 bytes, JWT_ISSUER, JWT_AUDIENCE, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, COOKIE_SECURE, CORS_ALLOWED_ORIGINS. Cookie restrito a /api/v1/auth. X-Requested-With: XMLHttpRequest exigido nos POST auth e Origin restrito quando presente; clientes sem Origin precisam header. CORS não aceita wildcard. Bootstrap exige BOOTSTRAP_ADMIN_ENABLED e credenciais de ambiente. Access token curto permanece válido somente enquanto usuário ativo e seu papel atual permite operação.

## Testes e ordem
O filtro de requisições usa PathPatternRequestMatcher oficial, com a mesma interpretação de caminhos da configuração MVC padrão. A normalização de caminho não pode retirar a exigência de header/Origin; uma regressão unitária cobre essa propriedade.

1. DTOs/migrations/configuração harness.
2. Ciclos unitários registro, login, expiração, rotação e revogação pelas interfaces públicas.
3. MockMvc com PostgreSQL Testcontainers para roles, JWT real, cookies, CSRF, duplicação e transações.
4. Integração frontend por contratos estáveis.
5. Sonar por arquivo suportado, revisão, Maven verify/coverage/build.

## Riscos
Chave HS256 exige proteção igual no emissor/validador. Rate limit local não coordena várias instâncias; proxy precisa política de IP confiável. Não adicionar retries de autenticação ou persistência. Persistência do refresh requer limpeza operacional de tokens expirados em implantação longa.
