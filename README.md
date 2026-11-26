# AI-Driven Software Engineering — Library Management

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>


Sistema de gerenciamento de acervo e **Engineering Workflow Studio**, demonstração interativa de Spec-to-Production Engineering: SDD, TDD, agentes especializados, skills e Quality Gates. O Studio identifica sua execução simulada; cadastro, autenticação, usuários e dashboard consomem uma API real.

## Execução com Docker
Requisitos: Docker Engine/Compose e Node.js22.12+ para gerar configuração local. Na raiz:

```sh
node scripts/init-env.mjs --admin-email admin@example.test
docker compose up --build -d
docker compose ps
```

O script cria .env ignorado, com segredos e senha administrativa aleatórios; não imprime credenciais nem sobrescreve configuração existente. Consulte localmente BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD em .env para o primeiro login. O endereço do comando é apenas ilustrativo. Para iniciar sem administrador use `node scripts/init-env.mjs`; registro público sempre cria READER. Nenhum usuário demonstrativo é habilitado automaticamente.

Após criar o administrador, desative BOOTSTRAP_ADMIN_ENABLED e recrie o backend. Não altere as senhas do banco em .env após criar o volume sem executar a rotação correspondente no PostgreSQL.

| Serviço | URL padrão |
|---|---|
| Frontend | http://localhost:3000 |
| Studio público | http://localhost:3000/engineering/workflow |
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui/index.html |
| OpenAPI | http://localhost:8080/v3/api-docs |
| Health | http://localhost:8080/actuator/health |
| PostgreSQL | localhost:5432 (dentro da rede Compose: postgres:5432) |

FRONTEND_PORT/BACKEND_PORT/POSTGRES_PORT são configuráveis e publicados em 0.0.0.0; no host use localhost ou o IP da máquina. Dentro de cada container, localhost aponta para ele próprio; para outro serviço use o nome frontend/backend/postgres. Ao mudar a origem do navegador ajuste CORS_ALLOWED_ORIGINS. Use COOKIE_SECURE=true com HTTPS. `docker compose down` preserva o volume; remoção do volume apaga os dados e não faz parte da rotina.

## Desenvolvimento e validação
Backend: JDK21, Maven Wrapper e PostgreSQL; configure as variáveis descritas em .env.example. Frontend: Node22.12+ e npm. O .env da raiz é consumido pelo Compose; não é carregado automaticamente pelo Maven.

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

No Windows use `mvnw.cmd` com JAVA_HOME apontando para JDK21. Os testes de integração usam Testcontainers e precisam de Docker.

```sh
cd frontend
npm ci
npx playwright install chromium
npm run dev
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

O proxy do Vite deve apontar para o backend local conforme vite.config.ts. Para npm run dev na porta5173, configure CORS_ALLOWED_ORIGINS=http://localhost:5173 no backend (ou a lista explícita de origens3000 e5173). Não há token em localStorage. Para validar o ambiente completo, após iniciar os serviços e configurar bootstrap:

```sh
node --env-file=.env scripts/smoke.mjs
```

Para o fluxo real no navegador, com Compose iniciado:

```sh
cd frontend
node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.integration.config.ts
```

Essa suíte usa contas descartáveis e desativa-as ao concluir; não grava traces com credenciais. A suíte padrão usa mocks de contrato explicitamente separados. Para atualizar o painel de evidências antes de recompilar o frontend, execute `node scripts/collect-evidence.mjs` na raiz após os testes.

O painel separa o snapshot de relatórios da consulta real a `/actuator/health`, atualizada a cada 30 segundos. Essa consulta verifica a API, não todos os containers. O CI permanece como execução não registrada até existir evidência remota. `VITE_API_BASE_URL` e `VITE_HEALTH_URL` permitem ajustar as URLs no build; os padrões usam a mesma origem do frontend.

Dados opcionais de livros exigem `SPRING_PROFILES_ACTIVE=demo` e `DEMO_DATA_ENABLED=true`; ambas as opções ficam desativadas no ambiente gerado. Isso não cria credenciais administrativas fixas.

Consulte [resultados reais](docs/validation.md) para testes, cobertura e revisão de segurança. O Sonar está sem issues abertas após revisão fundamentada de um falso positivo; o pipeline configurado não comprova uma execução no GitHub.

## Funcionalidades e contratos
- Login, registro READER, renovação/rotação/revogação de sessão e logout.
- Acervo com CRUD, ISBN10/13 normalizado, filtros, paginação, ordenação e disponibilidade.
- Dashboard calculado no PostgreSQL e administração de perfis/status.
- Studio com22 nós, quatro cenários, execução automática, pausa/retomada, navegação, velocidade, zoom, artefatos e logs exportáveis.
- Swagger, Postman, migrações Flyway, containers, health e CI com gates.

| Grupo | Endpoints /api/v1 |
|---|---|
| Autenticação | POST /auth/register, /auth/login, /auth/refresh, /auth/logout; GET /auth/me |
| Livros | POST/GET /books; GET/PUT/DELETE /books/{id} |
| Usuários | GET /users, /users/{id}; PATCH /users/{id}/role, /users/{id}/status |
| Dashboard | GET /dashboard/summary |

Erros usam Problem Details. Mutações de autenticação exigem `X-Requested-With: XMLHttpRequest`; rotas protegidas usam Bearer. Importe os dois JSONs de postman/ e configure valores locais; nenhum segredo real faz parte da coleção.

## Stack e decisões
Java21, Spring Boot4.2, Spring Security/Data JPA/Hibernate, PostgreSQL17, Flyway, Springdoc3.2, JUnit Jupiter6, Mockito, MockMvc, Testcontainers e JaCoCo. React19, TypeScript5.9 strict, Vite7, Tailwind4, React Flow12, React Router7, TanStack Query5, RHF7, Zod4, Vitest4 e Playwright. Manifests/lockfile contêm versões exatas.

**Atualização em relação ao escopo original:** Spring Framework7 exige JUnit6. A implementação usa o BOM compatível do Boot4.2 em vez de forçar JUnit5 sem suporte. [Arquitetura](docs/architecture.md) registra essa decisão e as fontes oficiais.

## Estrutura
```text
.specify/        Constituição e templates
.ai/            Agentes, skills e orquestração
specs/001..005/  Especificações, planos, tarefas e aceitação
backend/        API Java, migrations e testes
frontend/       SPA FSD, Studio e testes
postman/        Coleção e ambiente importáveis
scripts/        Configuração local e verificações
docs/           Arquitetura, segurança, testes e apresentação
.github/        CI e atualizações de dependências
compose.yaml    Serviços frontend/backend/postgres
```

## Documentação e demonstração
[Arquitetura](docs/architecture.md) · [Fluxo](docs/development-workflow.md) · [Segurança](docs/security.md) · [Testes](docs/testing.md) · [Rastreabilidade](docs/traceability.md) · [Apresentação de5/15 minutos](docs/presentation-guide.md) · [Validação e limitações](docs/validation.md).

A demonstração não chama modelos nem executa código arbitrário. Não inclui empréstimos, multas, pagamentos ou reservas. Produção exige HTTPS, gestão/rotação de segredos, backups e avaliação das limitações operacionais documentadas.


</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>


A catalog-management system and **Engineering Workflow Studio**, an interactive demonstration of Spec-to-Production Engineering: SDD, TDD, specialized agents, skills and Quality Gates. The Studio labels simulated execution; catalog, authentication, users and dashboard consume a real API.

## Run with Docker
Requirements: Docker Engine/Compose and Node.js22.12+ to generate local configuration. From the root:

```sh
node scripts/init-env.mjs --admin-email admin@example.test
docker compose up --build -d
docker compose ps
```

The script creates an ignored .env with random secrets and administrative password; it neither prints credentials nor overwrites existing configuration. Read BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD locally in .env for the first login. The command's address is illustrative. To start without an administrator run `node scripts/init-env.mjs`; public registration always creates READER. Demonstration accounts are never enabled automatically.

After creating the administrator, disable BOOTSTRAP_ADMIN_ENABLED and recreate the backend. Do not change database passwords in .env after volume creation without rotating them in PostgreSQL too.

| Service | Default URL |
|---|---|
| Frontend | http://localhost:3000 |
| Public Studio | http://localhost:3000/engineering/workflow |
| Backend | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui/index.html |
| OpenAPI | http://localhost:8080/v3/api-docs |
| Health | http://localhost:8080/actuator/health |
| PostgreSQL | localhost:5432 (inside the Compose network: postgres:5432) |

FRONTEND_PORT/BACKEND_PORT/POSTGRES_PORT are configurable and published on 0.0.0.0; use localhost or the machine IP from the host. Inside each container, localhost points to that container; use frontend/backend/postgres service names to reach another service. Update CORS_ALLOWED_ORIGINS when changing browser origin. Use COOKIE_SECURE=true with HTTPS. `docker compose down` preserves the volume; deleting the volume erases data and is not part of normal operation.

## Development and validation
Backend: JDK21, Maven Wrapper and PostgreSQL; configure variables documented in .env.example. Frontend: Node22.12+ and npm. Root .env is consumed by Compose; Maven does not load it automatically.

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

On Windows use `mvnw.cmd` with JAVA_HOME pointing to JDK21. Integration tests use Testcontainers and require Docker.

```sh
cd frontend
npm ci
npx playwright install chromium
npm run dev
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

Vite's proxy must target the local backend as configured in vite.config.ts. For npm run dev on port5173, configure CORS_ALLOWED_ORIGINS=http://localhost:5173 in the backend (or an explicit list of origins3000 and5173). No token is stored in localStorage. To validate the full environment after starting services and configuring bootstrap:

```sh
node --env-file=.env scripts/smoke.mjs
```

For the real browser workflow, with Compose running:

```sh
cd frontend
node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.integration.config.ts
```

This suite uses disposable accounts and deactivates them afterwards; it does not record credential-bearing traces. The default suite uses explicitly separate contract mocks. To update the evidence panel before rebuilding the frontend, run `node scripts/collect-evidence.mjs` from the root after tests.

The panel separates report snapshots from the real `/actuator/health` request, refreshed every 30 seconds. This checks the API, not every container. CI remains unrecorded until remote execution evidence exists. `VITE_API_BASE_URL` and `VITE_HEALTH_URL` configure build-time URLs; their defaults use the frontend's origin.

Optional book data requires `SPRING_PROFILES_ACTIVE=demo` and `DEMO_DATA_ENABLED=true`; both are disabled in generated configuration. This does not create fixed administrative credentials.

Read [real results](docs/validation.md) for tests, coverage and security review. Sonar has no open issues after a documented false-positive review; a configured pipeline does not prove a GitHub execution.

## Features and contracts
- Login, READER registration, session renewal/rotation/revocation and logout.
- Catalog CRUD, normalized ISBN10/13, filters, pagination, sorting and availability.
- PostgreSQL-backed dashboard and role/status administration.
- Studio with22 nodes, four scenarios, automatic playback, pause/resume, navigation, speed, zoom, artifacts and exportable logs.
- Swagger, Postman, Flyway migrations, containers, health and gated CI.

| Group | /api/v1 endpoints |
|---|---|
| Authentication | POST /auth/register, /auth/login, /auth/refresh, /auth/logout; GET /auth/me |
| Books | POST/GET /books; GET/PUT/DELETE /books/{id} |
| Users | GET /users, /users/{id}; PATCH /users/{id}/role, /users/{id}/status |
| Dashboard | GET /dashboard/summary |

Errors use Problem Details. Authentication mutations require `X-Requested-With: XMLHttpRequest`; protected routes use Bearer. Import both JSON files in postman/ and configure local values; the collection contains no real secrets.

## Stack and decisions
Java21, Spring Boot4.2, Spring Security/Data JPA/Hibernate, PostgreSQL17, Flyway, Springdoc3.2, JUnit Jupiter6, Mockito, MockMvc, Testcontainers and JaCoCo. React19, strict TypeScript5.9, Vite7, Tailwind4, React Flow12, React Router7, TanStack Query5, RHF7, Zod4, Vitest4 and Playwright. Manifests/lockfile record exact versions.

**Change from the original scope:** Spring Framework7 requires JUnit6. The implementation uses Boot4.2's compatible BOM instead of forcing unsupported JUnit5. [Architecture](docs/architecture.md) records the decision and official sources.

## Structure
```text
.specify/        Constitution and templates
.ai/            Agents, skills and orchestration
specs/001..005/  Specifications, plans, tasks and acceptance
backend/        Java API, migrations and tests
frontend/       FSD SPA, Studio and tests
postman/        Importable collection and environment
scripts/        Local configuration and checks
docs/           Architecture, security, tests and presentation
.github/        CI and dependency updates
compose.yaml    Frontend/backend/postgres services
```

## Documentation and demonstration
[Architecture](docs/architecture.md) · [Workflow](docs/development-workflow.md) · [Security](docs/security.md) · [Testing](docs/testing.md) · [Traceability](docs/traceability.md) · [5/15-minute presentation](docs/presentation-guide.md) · [Validation and limits](docs/validation.md).

The demonstration does not call models or execute arbitrary code. Loans, fines, payments and reservations are outside scope. Production requires HTTPS, secret management/rotation, backups and evaluation of documented operational limits.


</details>
