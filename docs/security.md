# Segurança / Security

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>


## Modelo de confiança
O navegador não é autoridade de permissões. Spring Security valida o JWT e aplica autorização no servidor; ocultar botões é somente experiência de usuário. Consultar perfil/estado atual impede que uma conta desativada ou rebaixada continue usando permissões antigas. ADMIN administra usuários e livros; LIBRARIAN escreve livros; READER consulta.

## Sessão e credenciais
Registro público aceita nome, e-mail e senha; papel/status privilegiados não são aceitos. E-mail é normalizado e protegido por constraint única. Senhas usam BCrypt; limites de bytes evitam truncamento silencioso. Bootstrap administrativo é opt-in, usa ambiente e não deve ser mantido habilitado em produção.

Access tokens JWT têm assinatura HS256, expiração curta, emissor e audiência validados. A chave base64 deve representar pelo menos 32 bytes aleatórios e permanecer secreta. A chave simétrica é uma escolha mínima para um único emissor/validador; múltiplos serviços independentes podem justificar chaves assimétricas e rotação via provedor de identidade.

O access token fica em memória; refresh opaco fica em cookie HttpOnly, SameSite=Strict, Path=/api/v1/auth e Secure quando servido por HTTPS. O banco guarda SHA-256 do token aleatório, família, expiração e revogação. Rotação usa transação/lock; replay revoga a família. Logout invalida refresh e limpa o cookie. Um access token roubado pode sobreviver até sua expiração, desde que a conta continue ativa; não existe blacklist por token de acesso nesta versão.

## CSRF, CORS e headers
POSTs de autenticação exigem `X-Requested-With: XMLHttpRequest`; Origin, quando enviado, precisa estar na allowlist. Esse header não é permitido em uma requisição cross-site simples, e o preflight é restrito por CORS. Clientes como Postman sem Origin ainda precisam do header. SameSite Strict reforça a proteção do cookie. Rotas de negócio recebem Bearer explícito, não autenticação ambiental por cookie.

Use mesma origem por proxy no deploy. Configure origins exatas, nunca wildcard com credenciais. HTTPS e COOKIE_SECURE=true são necessários fora da demonstração HTTP local. Nginx aplica CSP, nosniff, referrer-policy e proteção contra framing; o backend também aplica headers do Spring Security.

### Revisão do apontamento S4502

O Sonar sinalizou a desativação do filtro CSRF padrão. A revisão confirmou a proteção alternativa no AuthRequestFilter: todos os POSTs de autenticação exigem header explícito, Origin é restrito, e PathPatternRequestMatcher acompanha a semântica do roteamento, inclusive caracteres codificados. A estratégia de header para APIs é descrita pela [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi). Ser stateless, isoladamente, não protege cookies contra CSRF.

Antes do encerramento, foi corrigida por RED/GREEN uma diferença na correspondência de caminhos codificados. Testes automatizados e sete verificações HTTP na imagem final confirmaram rejeição 403 sem o header ou com origem/preflight indevidos. S4502 foi classificado como falso positivo para esta configuração, com justificativa no servidor e em [csrf-review.json](../artifacts/csrf-review.json). Não foram desativadas regras ou reduzidas asserções. Alterações em CORS, mecanismos de autenticação ou rotas que consomem cookies exigem nova revisão.

## Dados e recursos
ISBN possui validação de checksum, normalização e unicidade no PostgreSQL, inclusive para cadastros concorrentes. JPA/Criteria usa parâmetros; ordenação aceita somente campos definidos. Páginas possuem limites. Bean Validation/DTOs evitam overposting e entidades não são serializadas diretamente. Problem Details não expõe stack trace. Logs não devem incluir Authorization, cookies, senhas ou hashes.

Rate limiting limita autenticação por IP e usa armazenamento limitado por instância. No Compose, as requisições encaminhadas pelo Nginx compartilham o IP do proxy e, portanto, o mesmo limite; o acesso direto à API usa o IP observado pelo backend. Para vários clientes ou réplicas, configure um limitador no proxy/gateway e uma política explícita de proxies confiáveis. O serviço não confia em X-Forwarded-For arbitrário.

## Operação
Segredos locais ficam em .env ignorado; CI recebe valores efêmeros/secrets. Por solicitação explícita, todos os serviços publicam portas em 0.0.0.0, inclusive PostgreSQL5432; autenticação do banco continua obrigatória. Volumes contêm dados persistentes e precisam de backup e controle de acesso. Desative/restrinja Swagger em produção. Scans de dependências/containers bloqueiam vulnerabilidades relevantes; resultado configurado não significa scan já executado.

Tokens refresh expirados/revogados requerem limpeza operacional em execução prolongada. Recuperação de senha, MFA, provedor externo e gestão centralizada de chaves estão fora desta versão. Veja [validação](validation.md) para controles efetivamente testados e limites restantes.


</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>


## Trust model
The browser is not the permissions authority. Spring Security validates JWTs and enforces server authorization; hidden buttons only improve user experience. Checking current role/status prevents deactivated or downgraded accounts from retaining old privileges. ADMIN manages users and books; LIBRARIAN writes books; READER reads.

## Sessions and credentials
Public registration accepts name, email and password; privileged role/status fields are rejected. Email is normalized and protected by a unique constraint. Passwords use BCrypt; byte limits prevent silent truncation. Administrative bootstrap is opt-in, uses environment configuration and should not remain enabled in production.

JWT access tokens use HS256 signatures, short expiration and validated issuer/audience. The base64 key must represent at least 32 random bytes and remain secret. A symmetric key is a minimal choice for a single issuer/validator; independent services may justify asymmetric keys and identity-provider key rotation.

Access tokens stay in memory; opaque refresh tokens use an HttpOnly, SameSite=Strict, Path=/api/v1/auth cookie with Secure under HTTPS. The database stores the random token's SHA-256 hash, family, expiration and revocation. Rotation uses a transaction/lock; replay revokes the family. Logout invalidates refresh and clears the cookie. A stolen access token may survive until expiration while its account remains active; this version has no per-access-token blacklist.

## CSRF, CORS and headers
Authentication POSTs require `X-Requested-With: XMLHttpRequest`; Origin, when supplied, must match the allowlist. This header is not allowed in simple cross-site requests, and CORS restricts preflight. Clients such as Postman without Origin still require the header. SameSite Strict reinforces cookie protection. Business routes receive an explicit Bearer header, not ambient cookie authentication.

Deploy through a same-origin proxy. Configure exact origins, never wildcard with credentials. HTTPS and COOKIE_SECURE=true are required beyond the local HTTP demonstration. Nginx applies CSP, nosniff, referrer-policy and framing protection; the backend also applies Spring Security headers.

### S4502 finding review

Sonar flagged the disabled default CSRF filter. Review confirmed the alternative protection in AuthRequestFilter: all authentication POSTs require an explicit header, Origin is restricted, and PathPatternRequestMatcher follows routing semantics, including encoded characters. The API header strategy is described by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi). Being stateless alone does not protect cookies from CSRF.

Before closure, an encoded-path matching discrepancy was corrected through RED/GREEN. Automated tests and seven HTTP checks against the final image confirmed 403 rejection without the header or with an untrusted origin/preflight. S4502 was classified as a false positive for this configuration, with rationale recorded on the server and in [csrf-review.json](../artifacts/csrf-review.json). No rules were disabled or assertions weakened. Changes to CORS, authentication mechanisms or cookie-consuming routes require renewed review.

## Data and resources
ISBNs have checksum validation, normalization and PostgreSQL uniqueness, including concurrent creation. JPA/Criteria uses bound parameters; sorting only accepts declared fields. Pages are bounded. Bean Validation/DTOs prevent overposting and entities are never serialized directly. Problem Details does not expose stack traces. Logs must not contain Authorization, cookies, passwords or hashes.

Rate limiting bounds authentication per IP with bounded per-instance storage. In Compose, requests forwarded by Nginx share the proxy IP and therefore the same limit; direct API access uses the IP observed by the backend. For multiple clients or replicas, configure a proxy/gateway limiter and an explicit trusted-proxy policy. The service does not trust arbitrary X-Forwarded-For headers.

## Operations
Local secrets stay in ignored .env files; CI uses ephemeral values/secrets. By explicit request all services publish ports on 0.0.0.0, including PostgreSQL5432; database authentication remains required. Volumes hold persistent data and require backups/access controls. Disable/restrict Swagger in production. Dependency/container scans block relevant vulnerabilities; configured checks do not mean scans already ran.

Expired/revoked refresh tokens require operational cleanup during long-running deployments. Password recovery, MFA, external identity and centralized key management are outside this version. See [validation](validation.md) for tested controls and remaining limits.


</details>
