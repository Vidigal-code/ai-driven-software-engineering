# Testes e Quality Gates / Tests and Quality Gates

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>


## Estratégia
Os seams públicos foram definidos no requisito: regras/services do backend, REST, máquina de estados e interação observável da UI. Mockito substitui fronteiras de persistência nos testes unitários; integração usa PostgreSQL real em Testcontainers. Migrations e constraints são exercitadas no mesmo banco usado em produção.

Vitest testa regras e transições; Testing Library verifica formulários e controles por rótulo/papel acessível. Playwright verifica navegação e reprodução no navegador. Mocks de rede têm escopo explícito e não substituem o smoke contra os serviços reais.

## Execução
No backend:
```sh
./mvnw verify
```
No Windows use `mvnw.cmd verify` e JDK 21 no JAVA_HOME. Testcontainers requer Docker. Surefire executa testes unitários; Failsafe executa testes de integração. JaCoCo gera relatório em `backend/target/site/jacoco/`; relatórios JUnit ficam em `target/surefire-reports` e `target/failsafe-reports`.

No frontend:
```sh
npm ci
npx playwright install chromium
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```
Consulte scripts em package.json para opções locais. O relatório de cobertura fica em `frontend/coverage/`; Playwright registra resultados e artefatos conforme sua configuração. Vitest usa no máximo dois workers para evitar contenção quando outras validações estão em execução. Os testes de navegador locais foram executados em Chromium; isso não comprova compatibilidade com todos os navegadores.

Com o Compose saudável, a suíte separada `playwright.integration.config.ts` usa navegador e API reais. Execute em frontend: `node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.integration.config.ts`. Credenciais vêm somente do ambiente; os testes criam contas descartáveis, excluem seus próprios livros e desativam as contas. Traces ficam desativados para proteger credenciais. A suíte padrão de contratos e a suíte real não se substituem.

## Exemplos Swagger e interface do acervo
O [guia Swagger](swagger-guide.md) descreve o roteiro manual e a suíte `playwright.swagger.config.ts`, que verifica as origens do proxy e do backend, autenticação pela UI, Authorize, CRUD, conflito de ISBN, renovação e logout. Execute em frontend: `node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.swagger.config.ts`. A suíte não registra traces, screenshots ou vídeos. `OpenApiExamplesIT` executa os payloads extraídos do contrato publicado contra PostgreSQL em Testcontainers.

Os cenários de livros validam cadastro, consulta, edição/atualização persistida, exclusão/cancelamento, erros associados aos campos e bloqueio do diálogo durante gravação. Selects compartilham o controle nativo e ChevronDown decorativo; seus testes preservam rótulos, seleção e teclado. A inspeção visual cobre desktop/mobile e temas. Resultados reais de cada rodada estão em [validação](validation-updates.md).

## Cobertura
Limites iniciais: 80% de linhas e 75% de branches para lógica de negócio em ambos os aplicativos. No backend, services/regras concentram comportamento; configuração declarativa, entidades/DTOs de transporte e bootstrap não substituem esses testes e são validados por integração/revisão. No frontend, a máquina de estados, contratos/regras e cliente de sessão concentram branches; componentes também têm testes observáveis. Confira escopo exato nos manifests antes de interpretar os percentuais.

Em 26/11/2026, o relatório frontend registrou 100% de linhas (123/123), 98,18% de branches (108/110), 100% de funções (38/38) e 99,29% de statements (141/142). O escopo cobre modelos/regras, máquina de estados, cliente HTTP/sessão e hook de reprodução; exclui catálogo declarativo, testes e composição visual. Testes de componentes e E2E complementam esse escopo. JaCoCo final do backend registrou 98,62% de linhas (214/217) e 96,88% de branches (155/160) no escopo service/security. Consulte [validação](validation-updates.md) para resultados e gates ainda pendentes. Métricas de cenário no Studio são simuladas e não são cobertura do projeto.

## Casos críticos
- ISBN10/13, checksum, normalização, duplicação concorrente e quantidades/ano inválidos.
- Registro sempre READER, login inválido/inativo, JWT inválido/expirado, autorização de perfis.
- Refresh expirado, rotação, replay, revogação persistente da família e logout.
- Filtros, paginação/sort inválidos, inexistência e dashboard sobre dados persistidos.
- Formulários, CRUD, erros/loading, sessão compartilhada e controle de acesso.
- Quatro cenários do Studio, Play automático, Pause/Resume/Stop/Restart, velocidade, navegação e cleanup de timers.
- Nível textual dos logs, auto-scroll, cópia/exportação e aviso de simulação em tela cheia.
- Health real da API, estados indisponíveis e separação entre snapshot de relatórios, CI e simulação.

## Gates e evidência
CI deve bloquear falhas de compilação, testes, cobertura, lint/tipagem, análise estática, dependências relevantes, build e health. Sonar de snippets é uma análise por arquivo, não um gate de projeto publicado. Ferramentas sem suporte para a linguagem recebem validação equivalente; erros de infraestrutura ficam explícitos. [Validação](validation.md) registra somente execuções reais.


</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>


## Strategy
Public seams were defined in the request: backend rules/services, REST, the state machine and observable UI interactions. Mockito replaces persistence boundaries in unit tests; integration uses real PostgreSQL through Testcontainers. Migrations and constraints run against the production database engine.

Vitest tests rules/transitions; Testing Library checks forms and controls by accessible role/label. Playwright checks navigation and playback in a browser. Network mocks have explicit scope and do not replace smoke tests against real services.

## Execution
In the backend:
```sh
./mvnw verify
```
On Windows use `mvnw.cmd verify` with JDK 21 in JAVA_HOME. Testcontainers requires Docker. Surefire runs unit tests; Failsafe runs integration tests. JaCoCo writes `backend/target/site/jacoco/`; JUnit reports are in `target/surefire-reports` and `target/failsafe-reports`.

In the frontend:
```sh
npm ci
npx playwright install chromium
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```
Consult package.json scripts for local options. Coverage is in `frontend/coverage/`; Playwright records results/artifacts according to its configuration. Vitest uses at most two workers to avoid contention with other checks. Local browser tests ran in Chromium; they do not establish compatibility with every browser.

With healthy Compose services, the separate `playwright.integration.config.ts` suite uses a real browser and API. From frontend run `node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.integration.config.ts`. Credentials come only from the environment; tests create disposable accounts, delete their own books and deactivate accounts. Traces are disabled to protect credentials. The default contract suite and the real suite complement each other.

## Swagger examples and catalog interface
The [Swagger guide](swagger-guide.md) describes the manual walkthrough and `playwright.swagger.config.ts`, which checks proxy/backend origins, UI authentication, Authorize, CRUD, duplicate ISBN, refresh and logout. From frontend run `node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.swagger.config.ts`. This suite records no traces, screenshots or videos. `OpenApiExamplesIT` executes payloads extracted from the published contract against PostgreSQL in Testcontainers.

Book scenarios validate creation, reading, persisted editing/update, deletion/cancellation, field-associated errors and dialog locking during writes. Selects share the native control and decorative ChevronDown; tests preserve labels, selection and keyboard behavior. Visual inspection covers desktop/mobile and themes. Actual results for each run are in [validation](validation-updates.md).

## Coverage
Initial thresholds are 80% lines and 75% branches for business logic in both applications. Backend services/rules hold behavior; declarative configuration, transport entities/DTOs and bootstrap do not replace these tests and are checked through integration/review. Frontend state-machine, contracts/rules and session-client logic hold branches; components also have observable tests. Check manifest scope before interpreting percentages.

On 2026-11-26, the frontend report recorded 100% lines (123/123), 98.18% branches (108/110), 100% functions (38/38) and 99.29% statements (141/142). Its scope covers models/rules, the state machine, HTTP/session client and playback hook; it excludes the declarative catalog, tests and visual composition. Component and E2E tests complement this scope. Final backend JaCoCo recorded 98.62% lines (214/217) and 96.88% branches (155/160) within service/security scope. See [validation](validation-updates.md) for results and pending gates. Studio scenario metrics are simulated, not project coverage.

## Critical cases
- ISBN10/13, checksums, normalization, concurrent duplicates and invalid copy counts/years.
- Always-READER registration, invalid/inactive login, invalid/expired JWT and role authorization.
- Expired refresh, rotation, replay, persistent family revocation and logout.
- Filters, invalid pagination/sort, missing records and dashboard over persisted data.
- Forms, CRUD, error/loading states, shared session refresh and access control.
- Four Studio scenarios, automatic Play, Pause/Resume/Stop/Restart, speed, navigation and timer cleanup.
- Textual log levels, auto-scroll, copy/export and the simulation label in fullscreen.
- Real API health, unavailable states and separation of report snapshots, CI and simulation.

## Gates and evidence
CI must block compilation, test, coverage, lint/type, static-analysis, relevant dependency, build and health failures. Sonar snippets are per-file analysis, not a published project gate. Unsupported languages receive equivalent validation; infrastructure failures remain explicit. [Validation](validation.md) records only real executions.


</details>
