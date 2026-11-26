# Validação e limitações / Validation and limitations

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

Registro em 26/11/2026. Este documento distingue resultados efetivamente executados, snapshots anteriores e verificações ainda pendentes. Os arquivos de relatório são artefatos locais ignorados pelo Git; a ausência deles em um checkout novo não representa aprovação nem falha. Gere-os novamente pelos comandos do [README](../README.md) e da [estratégia de testes](testing.md).

## Frontend validado

| Verificação | Resultado observado | Evidência |
|---|---|---|
| Vitest / Testing Library | 58 testes aprovados em 11 arquivos; 0 falhas | [vitest.json](../frontend/artifacts/vitest.json) |
| Playwright de contrato | 14 aprovados; 0 falhas, pulados ou instáveis; Chromium | [playwright.json](../frontend/artifacts/playwright.json) |
| Playwright com API real | 2 aprovados sobre as imagens finais; login, CRUD, renovação, logout e READER; 26/11 às 22:33:55 UTC | [playwright-integration.json](../frontend/artifacts/playwright-integration.json) |
| ESLint | Comando executado com 0 warnings e saída 0 | `npm run lint` |
| TypeScript strict | Saída 0 | `npm run typecheck` |
| Build de produção | Saída 0; artefatos gerados em frontend/dist | `npm run build` |
| Sonar por arquivo | 56 arquivos completos, 0 issues; hashes correspondem ao conteúdo analisado | [sonar.json](../frontend/artifacts/sonar.json) |
| Auditoria npm completa | Dependências de produção e desenvolvimento: 0 vulnerabilidades | [npm-audit-all.json](../frontend/artifacts/npm-audit-all.json) |

Cobertura real do escopo configurado: **100% linhas (123/123), 98,18% branches (108/110), 100% funções (38/38), 99,29% statements (141/142)**. Fonte: [coverage-summary.json](../frontend/coverage/coverage-summary.json). O escopo compreende regras/modelos, cliente HTTP/sessão, máquina de estados e hook de reprodução; não é cobertura de todos os componentes visuais. Catálogo declarativo, testes e composição visual não entram nesse denominador. O gate exige pelo menos 80% de linhas e 75% de branches.

A execução inicial sob forte concorrência teve dois timeouts de componentes; Vitest foi limitado a dois workers, sem alterar asserções nem ampliar timeout. A execução final de 58 testes passou em 9,34 segundos. Os testes de contrato usam mocks de rede; os dois testes de integração usam serviços reais e relatórios separados. Não houve execução local em Firefox/WebKit.

As capturas [desktop escuro](../frontend/artifacts/studio-desktop-dark.png), [desktop claro](../frontend/artifacts/studio-desktop-light.png) e [mobile](../frontend/artifacts/studio-mobile-dark.png) complementaram a inspeção visual. Foram verificados teclado nos controles principais, ausência de overflow horizontal da página, controles do terminal, auto-scroll, clipboard e entrada/saída de tela cheia com aviso demonstrativo visível. A automação CUA estava indisponível; as capturas vieram de Playwright.

## Backend validado e snapshots de integração

A rodada final de `mvnw clean verify` concluiu com BUILD SUCCESS em 26/11/2026 às 22:29:17 UTC: 81 testes, sendo 59 unitários e 22 de integração, sem falhas, erros ou testes pulados. SpotBugs registrou 0 bugs. O scanner e o rebuild final também terminaram; seus resultados e limites estão separados abaixo. Newman foi executado antes do rebuild final; smoke e Playwright real foram repetidos sobre as imagens finais.

| Verificação | Snapshot observado | Evidência |
|---|---|---|
| Maven Surefire / Failsafe final | 59 unitários + 22 integração = 81 aprovados; 0 falhas/erros/pulados | backend/target/surefire-reports, backend/target/failsafe-reports |
| SpotBugs final | 0 bugs; verify aprovado | backend/target/spotbugsXml.xml |
| Integração de autenticação em PostgreSQL | 13 testes aprovados, 0 falhas/erros/pulados; 26/11/2026 | [root-validation.json](../artifacts/root-validation.json), backend/target-security-review/surefire-reports |
| Coletor de evidências | 6 testes aprovados e análise por arquivo sem issues | [root-validation.json](../artifacts/root-validation.json) |
| JaCoCo final do escopo service/security | 212/215 linhas = 98,60%; 155/160 branches = 96,88% | backend/target/site/jacoco/jacoco.xml |
| Newman 6.2.3 contra API real | 29 requisições, 47 assertions, 0 falhas; 22:10:51 UTC | [postman-run.json](../artifacts/postman-run.json) |
| Smoke contra Compose final | 14 verificações, 0 falhas; 22:33:57 UTC; conta descartável desativada | [smoke.json](../artifacts/smoke.json) |

Os XMLs finais foram conferidos após a conclusão da rodada; não foram somados ciclos RED ou relatórios antigos. O manifesto [evidence.json](../frontend/public/evidence.json), gerado às 22:29:37 UTC, registra os testes e a cobertura finais de backend e frontend. A resposta HTTP da imagem frontend foi comparada ao arquivo fonte e corresponde integralmente ao snapshot, conforme [runtime-access.json](../artifacts/runtime-access.json).

## Sonar de projeto — aprovação padrão não significa ausência de issues

O [snapshot do scanner](../artifacts/sonar-project-final.json), concluído em **26/11/2026 às 22:31:17 UTC**, registrou gate padrão `OK`, 0 bugs, 0 code smells e um apontamento java:S4502 para revisão. Esse arquivo histórico foi preservado. Após a revisão fundamentada, a consulta ao servidor confirmou **0 issues abertas e 1 falso positivo revisado**: [sonar-reviewed.json](../artifacts/sonar-reviewed.json).

S4502 foi classificado como `FALSE_POSITIVE` com evidência da proteção por header e Origin, matcher oficial consistente com MVC, CORS restritivo, cookie SameSite Strict e Bearer nas rotas de negócio. Sete verificações HTTP contra a imagem final retornaram 403 para requisições rejeitadas: [csrf-review.json](../artifacts/csrf-review.json). Nenhum teste, regra ou perfil foi enfraquecido. A classificação é uma revisão rastreável, não supressão genérica. A análise frontend por arquivo continua sendo uma verificação distinta do scanner de projeto.

O servidor registra coverage 62,6%, line_coverage 49,8% e branch_coverage 96,9% em seu escopo analisado; esses denominadores diferem do gate JaCoCo aplicado a service/security. Não compare os percentuais como se medissem o mesmo conjunto de arquivos.

## Infraestrutura — snapshots das imagens examinadas

As linhas abaixo identificam os relatórios das imagens em execução com **0 vulnerabilidades HIGH/CRITICAL**. Isso não equivale a ausência de vulnerabilidades de outras severidades. Build, inicialização, smoke, Playwright real e scans finais foram executados. Os três containers estão saudáveis, usam UID não zero e permanecem em execução; as portas 3000, 8080 e 5432 publicam em `0.0.0.0` e responderam por localhost. DNS interno, health entre serviços e `nginx -t` passaram. PostgreSQL usa `listen_addresses=*` e a role da aplicação não possui superuser, createdb ou createrole. Evidências: [compose-services.json](../artifacts/compose-services.json), [runtime-access.json](../artifacts/runtime-access.json) e [infra-validation.json](../artifacts/infra-validation.json).

| Artefato | Relatório | Snapshot UTC | HIGH/CRITICAL |
|---|---|---|---|
| Backend final | [trivy-backend-final.json](../artifacts/trivy-backend-final.json) | 26/11 22:33:27 | 0 |
| Frontend final | [trivy-frontend-final.json](../artifacts/trivy-frontend-final.json) | 26/11 22:33:06 | 0 |
| PostgreSQL corrigido | [trivy-postgres-hardened.json](../artifacts/trivy-postgres-hardened.json) | 26/11 21:36:21 | 0 |
| Dependências do filesystem | [trivy-filesystem.json](../artifacts/trivy-filesystem.json) | 26/11 | 0 |

Digests registrados nesses relatórios:

Após relato de conexão recusada por clientes IPv6, a publicação adicional `[::1]:5432` foi aplicada sem apagar o volume. `Test-NetConnection` executado diretamente no Windows passou para `127.0.0.1`, `localhost` e `::1`; evidência em [postgres-windows-connectivity.json](../artifacts/postgres-windows-connectivity.json).

- Backend: `sha256:d9828e8873cdc5498bc9d3f128cb2956b489b4b07f511ecdcd2f594a365fa21e`.
- Frontend: `sha256:2f681ea60bd62b162bbdc4a033457936e30c46c3c46463687f4e7de565f3ef2d`.
- PostgreSQL: `sha256:aeedeb9068df31cd57edd68fbc7753dda7f2b5ef41aa212dcda93215d3c45e80`.

Relatórios anteriores foram preservados para rastrear as correções; apenas os arquivos e digests da tabela correspondem às imagens atuais. O scan de filesystem não possui digest de imagem. Seis arquivos de infraestrutura tiveram 0 issues na análise por arquivo do Sonar; Markdown, YAML, JSON, shell, PowerShell e configuração Nginx usam validadores correspondentes, pois essas linguagens/configurações não são cobertas por essa operação do MCP. Actionlint, ShellCheck, schema oficial Postman, parser PowerShell, Compose e validação documental passaram. GitPageDocs teve descoberta e leituras reais; não existe configuração de site para alegar aprovação de `validate_docs`.

## Versões registradas

| Componente | Versão/configuração |
|---|---|
| Java / Spring Boot / Springdoc / JaCoCo | Java 21 / 4.2.0 / 3.2.1 / 0.8.16 |
| Runtime Java / banco / Nginx | Temurin 21.0.13.1+2 / PostgreSQL 17.12 / Nginx 1.28.3 |
| Docker / Compose / Trivy | 29.2.1 / 5.0.2 / 0.76.2 |
| React / TypeScript / Vite / Tailwind | 19.3.1 / 5.9.3 strict / 7.3.8 / 4.3.5 |
| React Flow / Router / TanStack Query | 12.12.1 / 7.18.7 / 5.108.4 |
| React Hook Form / resolvers / Zod / Lucide | 7.92.0 / 5.9.2 / 4.6.7 / 1.81.0 |
| Vitest / Testing Library React / Playwright / ESLint | 4.1.12 / 16.3.3 / 1.65.1 / 10.15.0 |
| Node local / requisito mínimo | 22.20.0 / 22.12.0 |

Dependências gerenciadas pelo BOM seguem o pom efetivo; o lockfile fixa a árvore frontend. A decisão documentada de usar JUnit Jupiter 6 com Spring Framework 7 está em [arquitetura](architecture.md). Não atribua às tags móveis das imagens um digest futuro.

## Pendências e interpretação

1. **CI remoto não executado.** A existência de .github/workflows/ci.yml, validado localmente, não comprova aprovação no GitHub. Os resultados locais e a revisão de segurança acima foram efetivamente registrados.

O Studio mostra “Modo demonstração — execução simulada”, inclusive em tela cheia. Seus testes e aprovações animados não são evidências reais. O painel lê o snapshot dos relatórios e consulta separadamente o health da API a cada 30 segundos; não infere o estado de todos os containers. Segurança operacional e limitações de implantação permanecem descritas em [segurança](security.md). Nenhuma alteração de política de segurança foi feita nesta revisão documental.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

Recorded on 2026-11-26. This document distinguishes checks that actually ran, earlier snapshots and pending verification. Report files are local Git-ignored artifacts; their absence in a fresh checkout means neither approval nor failure. Regenerate them with the commands in the [README](../README.md) and [testing strategy](testing.md).

## Validated frontend

| Check | Observed result | Evidence |
|---|---|---|
| Vitest / Testing Library | 58 tests passed across 11 files; 0 failures | [vitest.json](../frontend/artifacts/vitest.json) |
| Contract Playwright | 14 passed; 0 failed, skipped or flaky; Chromium | [playwright.json](../frontend/artifacts/playwright.json) |
| Playwright with the real API | 2 passed against final images; login, CRUD, renewal, logout and READER; November 26 at 22:33:55 UTC | [playwright-integration.json](../frontend/artifacts/playwright-integration.json) |
| ESLint | Executed with 0 warnings and exit 0 | `npm run lint` |
| Strict TypeScript | Exit 0 | `npm run typecheck` |
| Production build | Exit 0; artifacts generated in frontend/dist | `npm run build` |
| Per-file Sonar | 56 complete files, 0 issues; hashes match analyzed contents | [sonar.json](../frontend/artifacts/sonar.json) |
| Full npm audit | Production and development dependencies: 0 vulnerabilities | [npm-audit-all.json](../frontend/artifacts/npm-audit-all.json) |

Actual configured-scope coverage: **100% lines (123/123), 98.18% branches (108/110), 100% functions (38/38), 99.29% statements (141/142)**. Source: [coverage-summary.json](../frontend/coverage/coverage-summary.json). Scope includes rules/models, HTTP/session client, the state machine and playback hook; it is not coverage of every visual component. Declarative catalog, tests and visual composition are excluded from this denominator. The gate requires at least 80% lines and 75% branches.

An initial heavily concurrent run had two component timeouts; Vitest was limited to two workers without changing assertions or increasing timeouts. The final 58-test run passed in 9.34 seconds. Contract tests use network mocks; the two integration tests use real services and separate reports. Firefox/WebKit were not run locally.

The [dark desktop](../frontend/artifacts/studio-desktop-dark.png), [light desktop](../frontend/artifacts/studio-desktop-light.png) and [mobile](../frontend/artifacts/studio-mobile-dark.png) captures supplemented visual inspection. Checks covered keyboard access to primary controls, no page-level horizontal overflow, terminal controls, auto-scroll, clipboard and fullscreen entry/exit with the demonstration label visible. CUA automation was unavailable; captures came from Playwright.

## Validated backend and integration snapshots

The final `mvnw clean verify` run completed with BUILD SUCCESS on 2026-11-26 at 22:29:17 UTC: 81 tests, comprising 59 unit and 22 integration tests, with no failures, errors or skipped tests. SpotBugs recorded 0 bugs. The scanner and final rebuild also completed; their results and limits appear separately below. Newman ran before the final rebuild; smoke and real Playwright were repeated against final images.

| Check | Observed snapshot | Evidence |
|---|---|---|
| Final Maven Surefire / Failsafe | 59 unit + 22 integration = 81 passed; 0 failures/errors/skipped | backend/target/surefire-reports, backend/target/failsafe-reports |
| Final SpotBugs | 0 bugs; verify passed | backend/target/spotbugsXml.xml |
| Authentication integration against PostgreSQL | 13 passed, 0 failures/errors/skipped; 2026-11-26 | [root-validation.json](../artifacts/root-validation.json), backend/target-security-review/surefire-reports |
| Evidence collector | 6 passed tests and per-file analysis without issues | [root-validation.json](../artifacts/root-validation.json) |
| Final JaCoCo service/security scope | 212/215 lines = 98.60%; 155/160 branches = 96.88% | backend/target/site/jacoco/jacoco.xml |
| Newman 6.2.3 against the real API | 29 requests, 47 assertions, 0 failures; 22:10:51 UTC | [postman-run.json](../artifacts/postman-run.json) |
| Smoke against final Compose | 14 checks, 0 failures; 22:33:57 UTC; disposable account deactivated | [smoke.json](../artifacts/smoke.json) |

Final XML files were checked after the run completed; RED cycles and old reports were not combined. The [evidence.json](../frontend/public/evidence.json) manifest, generated at 22:29:37 UTC, records final backend and frontend tests and coverage. The frontend image's HTTP response was compared with the source file and matches it completely, as recorded in [runtime-access.json](../artifacts/runtime-access.json).

## Project Sonar — default approval does not mean no issues

The [scanner snapshot](../artifacts/sonar-project-final.json), completed on **2026-11-26 at 22:31:17 UTC**, recorded default gate `OK`, 0 bugs, 0 code smells and one java:S4502 finding for review. That historical file was preserved. After documented review, a server query confirmed **0 open issues and 1 reviewed false positive**: [sonar-reviewed.json](../artifacts/sonar-reviewed.json).

S4502 was classified `FALSE_POSITIVE` based on header and Origin protection, the official MVC-consistent matcher, restrictive CORS, a SameSite Strict cookie and Bearer authentication on business routes. Seven HTTP probes against the final image returned 403 for rejected requests: [csrf-review.json](../artifacts/csrf-review.json). No test, rule or profile was weakened. This is a traceable review, not a blanket suppression. Frontend per-file analysis remains distinct from the project scanner.

The server records coverage 62.6%, line_coverage 49.8% and branch_coverage 96.9% within its analyzed scope; these denominators differ from the service/security JaCoCo gate. Do not compare these percentages as if they measured the same files.

## Infrastructure — snapshots of examined images

The rows below identify reports for the running images with **0 HIGH/CRITICAL vulnerabilities**. This does not mean no vulnerabilities at other severities. Final builds, startup, smoke, real Playwright and scans were executed. All three containers are healthy, run with nonzero UIDs and remain running; ports 3000, 8080 and 5432 bind `0.0.0.0` and responded through localhost. Internal DNS, health between services and `nginx -t` passed. PostgreSQL uses `listen_addresses=*`, and the application role has no superuser, createdb or createrole privilege. Evidence: [compose-services.json](../artifacts/compose-services.json), [runtime-access.json](../artifacts/runtime-access.json) and [infra-validation.json](../artifacts/infra-validation.json).

| Artifact | Report | UTC snapshot | HIGH/CRITICAL |
|---|---|---|---|
| Final backend | [trivy-backend-final.json](../artifacts/trivy-backend-final.json) | November 26 22:33:27 | 0 |
| Final frontend | [trivy-frontend-final.json](../artifacts/trivy-frontend-final.json) | November 26 22:33:06 | 0 |
| Corrected PostgreSQL | [trivy-postgres-hardened.json](../artifacts/trivy-postgres-hardened.json) | November 26 21:36:21 | 0 |
| Filesystem dependencies | [trivy-filesystem.json](../artifacts/trivy-filesystem.json) | November 26 | 0 |

Digests recorded in those reports:

After a connection-refused report from IPv6 clients, the additional `[::1]:5432` binding was applied without deleting the volume. `Test-NetConnection` executed directly on Windows passed for `127.0.0.1`, `localhost` and `::1`; evidence is in [postgres-windows-connectivity.json](../artifacts/postgres-windows-connectivity.json).

- Backend: `sha256:d9828e8873cdc5498bc9d3f128cb2956b489b4b07f511ecdcd2f594a365fa21e`.
- Frontend: `sha256:2f681ea60bd62b162bbdc4a033457936e30c46c3c46463687f4e7de565f3ef2d`.
- PostgreSQL: `sha256:aeedeb9068df31cd57edd68fbc7753dda7f2b5ef41aa212dcda93215d3c45e80`.

Earlier reports were preserved to trace corrections; only the files and digests in the table correspond to current images. Filesystem scanning has no image digest. Six infrastructure files had 0 issues in per-file Sonar analysis; Markdown, YAML, JSON, shell, PowerShell and Nginx configuration use corresponding validators because this MCP operation does not cover those languages/configurations. Actionlint, ShellCheck, official Postman schema, PowerShell parser, Compose and documentation validation passed. GitPageDocs discovery and reads ran; there is no site configuration to claim `validate_docs` approval.

## Recorded versions

| Component | Version/configuration |
|---|---|
| Java / Spring Boot / Springdoc / JaCoCo | Java 21 / 4.2.0 / 3.2.1 / 0.8.16 |
| Java runtime / database / Nginx | Temurin 21.0.13.1+2 / PostgreSQL 17.12 / Nginx 1.28.3 |
| Docker / Compose / Trivy | 29.2.1 / 5.0.2 / 0.76.2 |
| React / TypeScript / Vite / Tailwind | 19.3.1 / strict 5.9.3 / 7.3.8 / 4.3.5 |
| React Flow / Router / TanStack Query | 12.12.1 / 7.18.7 / 5.108.4 |
| React Hook Form / resolvers / Zod / Lucide | 7.92.0 / 5.9.2 / 4.6.7 / 1.81.0 |
| Vitest / Testing Library React / Playwright / ESLint | 4.1.12 / 16.3.3 / 1.65.1 / 10.15.0 |
| Local Node / minimum requirement | 22.20.0 / 22.12.0 |

BOM-managed dependencies follow the effective pom; the lockfile fixes the frontend dependency tree. The documented choice of JUnit Jupiter 6 with Spring Framework 7 is in [architecture](architecture.md). Do not assign a future digest to mutable image tags.

## Pending checks and interpretation

1. **Remote CI has not run.** The locally validated .github/workflows/ci.yml does not establish GitHub approval. The local results and security review above were actually recorded.

The Studio shows “Modo demonstração — execução simulada”, including fullscreen. Animated tests and approvals are not actual evidence. The panel reads report snapshots and separately queries API health every 30 seconds; it does not infer every container's state. Operational security and deployment limitations remain described in [security](security.md). This documentation revision changed no security policy.

</details>
