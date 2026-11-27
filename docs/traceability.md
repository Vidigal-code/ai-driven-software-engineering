# Rastreabilidade / Traceability

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

## Cadeia de evidência

Cada linha liga requisito → critério de aceitação → tarefa → teste → implementação → resultado → gate. Os artefatos SDD ficam em [specs](../specs); cada pasta contém spec.md, plan.md, tasks.md e acceptance.md. Os resultados efetivos estão em [validação](validation.md). A existência de um teste não prova que ele passou.

| Requisitos | Critérios / tarefas | Testes | Implementação | Evidência / gate |
|---|---|---|---|---|
| AUTH-001/002 | AUTH-CA01/02/03/10; AUTH-T01 | AuthServiceTest, AuthApiIT | AuthService, AuthController, User | Surefire/Failsafe; autenticação e HTTP |
| AUTH-003 | AUTH-CA04; AUTH-T02 | TokenServiceTest, AuthApiIT | TokenService, SecurityConfig | JWT: assinatura, emissor, audiência e expiração |
| AUTH-004/005 | AUTH-CA05/06/07; AUTH-T03 | AuthServiceTest, AuthApiIT, AuthRequestFilterTest, AuthAttemptLimiterTest | RefreshTokenRepository, AuthService, AuthRequestFilter | Rotação, replay concorrente, CSRF e rate limit |
| AUTH-006/007/008 | AUTH-CA08/09 e bootstrap; AUTH-T04/05/06 | UserServiceTest, BootstrapAdminTest, AuthApiIT | UserService, BootstrapAdmin, autorização | RBAC, inatividade, bootstrap opt-in e smoke |
| BOOK-001/002/003/005 | BOOK-CA01/02/03/04/05/07; BOOK-T01/02/06 | BookRulesTest, BookServiceTest, LibraryApiIT | BookRules, BookService, migration Flyway | Validação, CRUD, unicidade concorrente; PostgreSQL real |
| BOOK-004/006/007 | BOOK-CA06/08/09/10; BOOK-T03/04/05/06 | PaginationTest, DashboardServiceTest, LibraryApiIT, AuthApiIT | BookSearch, Pagination, DashboardService, controllers | Filtros, paginação, totais e respostas HTTP |
| RF-UI-001 | CA-UI-001 e variantes; T-UI-001 | client.test.ts, session-context.test.tsx, SessionProvider.test.tsx, AuthForm.test.tsx, integration.spec.ts | Cliente HTTP, sessão e autenticação | Vitest e navegador com API real |
| RF-UI-002/003 | CA-UI-002/003 e variantes; T-UI-002/003 | BookEditor.test.tsx, book.test.ts, library.spec.ts, integration.spec.ts | Dashboard, livros, editor, tabela | Formulários, CRUD, pesquisa, loading/erro e paginação |
| RF-UI-004/006 | CA-UI-004/006; T-UI-004/006 | user.test.ts, library.spec.ts, integration.spec.ts | Rotas, permissões, usuários | Reader/admin e autorização real do servidor |
| RF-UI-005 | CA-UI-005 e variantes; T-UI-005/QA | library.spec.ts, workflow.spec.ts | Layout, tema, diálogos, tokens CSS | Teclado, viewport móvel e temas |
| RF-WF-001/002/003 | CA-WF-001/002/003 e variantes; T-WF-001/002/003 | machine.test.ts, useWorkflow.test.tsx, workflow.spec.ts | Catálogo, máquina de estados e reprodução | Transições, quatro cenários, timers e Play automático |
| RF-WF-004/005/006/007 | CA-WF-004/005/006/007; T-WF-004/005/006/007/QA | workflow.spec.ts, ExecutionTerminal.test.tsx, EvidencePanel.test.tsx e revisão visual | Canvas, detalhes, terminal e evidências | Artefatos, falhas/retorno, logs e transparência |
| INF-001..009 | acceptance 005; INF-T01..06 | smoke.mjs, validate-project.py, Playwright, scanners | Compose, Dockerfiles, Nginx, CI, Postman | Health, HTTP, schemas, builds e vulnerabilidades |
| INF-010 | INF-CA10/11/12; INF-T07 | collect-evidence.test.mjs | collect-evidence.mjs, EvidencePanel | Relatórios ausentes, falhas e cobertura; manifesto real |
| RF-SWAG-001..005 | CA-SWAG-001..005; SWAG-T01..05 | OpenApiExamplesIT, swagger.spec.ts | OpenApiConfig, DTOs/controllers, exemplos, origens explícitas | Contrato executado em PostgreSQL e Swagger no navegador; ver validação |
| RF-UX-001..005 | CA-UX-001..006; UX-T01..05 | Select.test.tsx, BookEditor.test.tsx, library.spec.ts, integration.spec.ts | Select compartilhado, página/editor/tabela de livros | Componentes, CRUD real, teclado e revisão visual; ver validação |
| RF-CI-001..007 | acceptance 008; CI-T01..06 | actionlint, validate-project.py, execuções GitHub Actions | ci.yml, agrupamento Dependabot | Maven antes do scan, gates preservados e resultado remoto por commit |
| RF-DEP-001..006 | acceptance 009; DEP-T01..06 | npm ci, lint, typecheck, Vitest, Playwright e checks dos PRs | Manifests/lockfile e compatibilidade das branches de dependências | [Relatório por PR](dependency-pr-validation.md), SHA e run; sem remover testes |

## Localização dos resultados

- Backend: [testes](../backend/src/test/java/com/library/api), relatórios em backend/target/surefire-reports e failsafe-reports, JaCoCo em backend/target/site/jacoco, SpotBugs em backend/target/spotbugsXml.xml.
- Frontend: testes junto aos slices e [E2E](../frontend/tests/e2e); Vitest em frontend/artifacts/vitest.json, cobertura em frontend/coverage, Playwright em frontend/artifacts/playwright.json e playwright-integration.json.
- Infraestrutura: artifacts/smoke.json, relatórios Trivy e estado dos serviços. Esses artefatos locais são ignorados pelo Git; CI publica os relatórios de cada execução.
- Studio: frontend/public/evidence.json é um snapshot gerado dos relatórios. Ele não transforma logs simulados em resultados reais. A consulta independente a /actuator/health verifica somente a API a cada 30 segundos; CI sem execução registrada é exibido como indisponível.
- Revisão: Sonar por arquivo e scanner com caminhos reais; ferramentas sem suporte recebem validação equivalente, com a limitação registrada.
- CI: o workflow é versionado; aprovação remota exige uma execução real no GitHub.

## Critério para encerramento

O responsável só marca uma tarefa após implementação e validação aplicável. RED exige falha de comportamento, não de configuração. Refatoração exige repetir testes afetados. Cobertura mínima: 80% das linhas e 75% dos branches no escopo de negócio documentado. Falhas de segurança, integração, análise ou inicialização bloqueiam a entrega mesmo quando testes unitários passam.

O orquestrador consolida os resultados; QA compara com os critérios; segurança e DevOps revisam seus controles. Nenhum resultado não executado é apresentado como aprovado.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

## Evidence chain

Each row links requirement → acceptance criterion → task → test → implementation → result → gate. SDD artifacts live in [specs](../specs); each directory contains spec.md, plan.md, tasks.md and acceptance.md. Actual results are in [validation](validation.md). A test's existence does not prove it passed.

| Requirements | Criteria / tasks | Tests | Implementation | Evidence / gate |
|---|---|---|---|---|
| AUTH-001/002 | AUTH-CA01/02/03/10; AUTH-T01 | AuthServiceTest, AuthApiIT | AuthService, AuthController, User | Surefire/Failsafe; authentication and HTTP |
| AUTH-003 | AUTH-CA04; AUTH-T02 | TokenServiceTest, AuthApiIT | TokenService, SecurityConfig | JWT signature, issuer, audience and expiration |
| AUTH-004/005 | AUTH-CA05/06/07; AUTH-T03 | AuthServiceTest, AuthApiIT, AuthRequestFilterTest, AuthAttemptLimiterTest | RefreshTokenRepository, AuthService, AuthRequestFilter | Rotation, concurrent replay, CSRF and rate limiting |
| AUTH-006/007/008 | AUTH-CA08/09 and bootstrap; AUTH-T04/05/06 | UserServiceTest, BootstrapAdminTest, AuthApiIT | UserService, BootstrapAdmin, authorization | RBAC, inactivity, opt-in bootstrap and smoke |
| BOOK-001/002/003/005 | BOOK-CA01/02/03/04/05/07; BOOK-T01/02/06 | BookRulesTest, BookServiceTest, LibraryApiIT | BookRules, BookService, Flyway migration | Validation, CRUD, concurrent uniqueness; real PostgreSQL |
| BOOK-004/006/007 | BOOK-CA06/08/09/10; BOOK-T03/04/05/06 | PaginationTest, DashboardServiceTest, LibraryApiIT, AuthApiIT | BookSearch, Pagination, DashboardService, controllers | Filters, pagination, totals and HTTP responses |
| RF-UI-001 | CA-UI-001 and variants; T-UI-001 | client.test.ts, session-context.test.tsx, SessionProvider.test.tsx, AuthForm.test.tsx, integration.spec.ts | HTTP client, session and authentication | Vitest and browser with real API |
| RF-UI-002/003 | CA-UI-002/003 and variants; T-UI-002/003 | BookEditor.test.tsx, book.test.ts, library.spec.ts, integration.spec.ts | Dashboard, books, editor, table | Forms, CRUD, search, loading/errors and pagination |
| RF-UI-004/006 | CA-UI-004/006; T-UI-004/006 | user.test.ts, library.spec.ts, integration.spec.ts | Routes, permissions, users | Reader/admin and real server authorization |
| RF-UI-005 | CA-UI-005 and variants; T-UI-005/QA | library.spec.ts, workflow.spec.ts | Layout, theme, dialogs, CSS tokens | Keyboard, mobile viewport and themes |
| RF-WF-001/002/003 | CA-WF-001/002/003 and variants; T-WF-001/002/003 | machine.test.ts, useWorkflow.test.tsx, workflow.spec.ts | Catalog, state machine and playback | Transitions, four scenarios, timers and automatic Play |
| RF-WF-004/005/006/007 | CA-WF-004/005/006/007; T-WF-004/005/006/007/QA | workflow.spec.ts, ExecutionTerminal.test.tsx, EvidencePanel.test.tsx and visual review | Canvas, details, terminal and evidence | Artifacts, failure/return, logs and transparency |
| INF-001..009 | acceptance 005; INF-T01..06 | smoke.mjs, validate-project.py, Playwright, scanners | Compose, Dockerfiles, Nginx, CI, Postman | Health, HTTP, schemas, builds and vulnerabilities |
| INF-010 | INF-CA10/11/12; INF-T07 | collect-evidence.test.mjs | collect-evidence.mjs, EvidencePanel | Missing reports, failures and coverage; real manifest |
| RF-SWAG-001..005 | CA-SWAG-001..005; SWAG-T01..05 | OpenApiExamplesIT, swagger.spec.ts | OpenApiConfig, DTOs/controllers, examples, explicit origins | Contract executed against PostgreSQL and browser Swagger; see validation |
| RF-UX-001..005 | CA-UX-001..006; UX-T01..05 | Select.test.tsx, BookEditor.test.tsx, library.spec.ts, integration.spec.ts | Shared Select, book page/editor/table | Components, real CRUD, keyboard and visual review; see validation |
| RF-CI-001..007 | acceptance 008; CI-T01..06 | actionlint, validate-project.py, GitHub Actions runs | ci.yml, Dependabot grouping | Maven before scanning, preserved gates and remote result per commit |
| RF-DEP-001..006 | acceptance 009; DEP-T01..06 | npm ci, lint, typecheck, Vitest, Playwright and PR checks | Manifests/lockfile and dependency branch compatibility | [Per-PR report](dependency-pr-validation.md), SHA and run; no tests removed |

## Result locations

- Backend: [tests](../backend/src/test/java/com/library/api), reports under backend/target/surefire-reports and failsafe-reports, JaCoCo under backend/target/site/jacoco, SpotBugs at backend/target/spotbugsXml.xml.
- Frontend: tests alongside slices and [E2E](../frontend/tests/e2e); Vitest at frontend/artifacts/vitest.json, coverage under frontend/coverage, Playwright at frontend/artifacts/playwright.json and playwright-integration.json.
- Infrastructure: artifacts/smoke.json, Trivy reports and service state. Local artifacts are Git-ignored; CI publishes each run's reports.
- Studio: frontend/public/evidence.json is a report snapshot. It does not convert simulated logs into real results. The independent /actuator/health request checks only the API every 30 seconds; unrecorded CI execution is shown as unavailable.
- Review: per-file Sonar and a scanner using real paths; unsupported files receive equivalent validation with limitations recorded.
- CI: the workflow is versioned; remote approval requires an actual GitHub run.

## Completion criterion

Owners check tasks only after implementation and applicable validation. RED requires a behavioral failure, not a configuration failure. Refactoring requires rerunning affected tests. Minimum coverage: 80% lines and 75% branches within the documented business scope. Security, integration, analysis or startup failures block delivery even when unit tests pass.

The orchestrator consolidates results; QA checks criteria; security and DevOps review their controls. No unexecuted check is presented as approved.

</details>
