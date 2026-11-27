# Validação das melhorias de interface, Swagger e CI

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

## Escopo
Registro das features [006](../specs/006-swagger-examples), [007](../specs/007-frontend-crud-polish) e [008](../specs/008-ci-reliability), posteriores ao [snapshot inicial](validation.md). A stack permanece Java 21/Spring Boot 4.2.0/Springdoc 3.2.1 e React 19.3.1/TypeScript 5.9.3/Vite 7.3.8. Não foram adicionadas dependências da aplicação.

O frontend usa um Select nativo compartilhado com seta ChevronDown, filtros rotulados, formulário agrupado, ações de consulta/edição/exclusão, apresentação móvel e rolagem do menu em telas baixas. O CRUD persiste todos os campos na API. Operações pendentes bloqueiam fechamento e reenvio; erros preservam valores e identificam os campos quando a API os informa.

O Swagger publica 38 exemplos em 15 operações, regras, parâmetros, respostas, permissões e roteiro de autenticação. A origem relativa resolve o acesso direto e pelo proxy; a allowlist explícita contém localhost:3000 e localhost:8080. Tokens não são persistidos pelo Swagger. Consulte o [guia de execução](swagger-guide.md).

## Resultados locais efetivamente executados

| Verificação | Resultado | Evidência local |
|---|---|---|
| Backend / Maven | 87 testes: 59 unitários e 28 de integração; zero falhas, erros ou skips | backend/target/surefire-reports e failsafe-reports |
| Exemplos OpenAPI / PostgreSQL | 6 testes de contrato e execução real dos exemplos | OpenApiExamplesIT e backend/target/swagger-validation-summary.json |
| SpotBugs | 0 bugs | backend/target/spotbugsXml.xml |
| Frontend / Vitest | 61 aprovados | frontend/artifacts/vitest.json |
| Navegador com contratos simulados | 18 aprovados, zero falhas/skips/flaky | frontend/artifacts/playwright.json |
| Navegador com API real | 2 aprovados; CRUD completo, persistência, refresh, logout e READER | frontend/artifacts/playwright-integration.json |
| Swagger no navegador | 4 aprovados; proxy e backend, login/Authorize, CRUD, 409, 404, rotação e logout | frontend/artifacts/playwright-swagger.json |
| Lint, TypeScript e build frontend | Aprovados | scripts do package.json e relatórios locais |
| Sonar de projeto | Gate OK; 0 issues abertas, 0% duplicação, 95,9% cobertura de código novo | artifacts/sonar-swagger-green.json |
| Sonar frontend | 16 arquivos da interface sem issues; teste/config Swagger analisados separadamente | frontend/artifacts/sonar-polish.json e artifacts/swagger-sonar-final.json |
| Smoke de serviços | 14 verificações aprovadas | artifacts/smoke.json |
| Documentação e entrega | 65 documentos Markdown, 29 requests Postman e 3 configurações aprovados | scripts/validate-project.py |

Cobertura JaCoCo de negócio: **214/217 linhas (98,62%) e 155/160 branches (96,88%)**, com gate mínimo 80%/75%. O relatório completo contém **545/555 linhas (98,20%) e 215/237 branches (90,72%)**. O relatório restrito continua em `target/site/jacoco`, utilizado pelo coletor e pelo gate de negócio; o amplo está em `target/site/jacoco-full`, utilizado pelo Sonar. Os dois vêm da mesma execução instrumentada. Nenhum limite foi reduzido ou nova exclusão criada para obter aprovação.

O frontend mantém 100% das linhas e 98,18% dos branches no escopo de lógica de negócio configurado. Isso não significa cobertura de todos os componentes visuais; testes de componentes e navegador complementam essa medição. As capturas `frontend/artifacts/books-*`, `book-editor-*` e `swagger-*` foram inspecionadas. As capturas Swagger não usam autenticação. A suíte autenticada desativa retenção de screenshots, vídeos, traces e snapshots de falha; erros de transporte com credenciais são sanitizados.

## Falhas encontradas e corrigidas
- RED do Swagger: servidor sem porta pelo proxy e login403 na origem8080. GREEN: quatro cenários reais nas duas origens.
- RED da interface: fechamento durante gravação, erro de campo sem associação e “Sair” inacessível em viewport baixo. GREEN: componentes, 18 E2E e dois fluxos reais.
- RED do Sonar: cobertura nova55% porque a instrumentação omitia classes de configuração exercitadas pelos testes. GREEN: instrumentação completa, relatórios separados e gate95,9%, sem reduzir critérios.
- RED do CI inicial: [run45907829637](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45907829637) aprovou backend/frontend, mas Trivy recebeu429 do Maven Central. O scanner foi movido para depois do Maven no mesmo runner, reutilizando os POMs resolvidos; scanners, severidades e bloqueios permanecem iguais.

## Verificação remota e limites
O [workflow Quality gates](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/workflows/ci.yml) inclui agora o roteiro Swagger real e publica ambos os relatórios JaCoCo. O registro final deve identificar run, SHA e jobs aprovados; validação YAML/actionlint local não comprova execução remota. A execução do novo commit ainda está pendente neste registro inicial de entrega.

Os cinco runs iniciais de Dependabot Updates passaram. PRs de atualização major têm seu próprio estado: por exemplo, o PR isolado de jest-dom8 exige Vitest5 e não deve ser aprovado forçando a instalação. O grupo de dependências de testes mantém essas atualizações acopladas, sem alterar a stack instalada.

Os relatórios brutos em artifacts/target são ignorados pelo Git e precisam ser gerados em outro checkout. Java no snippet Sonar não oferece caminho de arquivo e produziu S1598 artificial; o scanner completo com caminhos reais validou as fontes. YAML/Markdown/PowerShell/JSON usam validadores próprios quando não suportados pelo snippet. Os testes locais de navegador foram executados em Chromium. Containers continuam acessíveis em localhost e publicados em 0.0.0.0; o volume PostgreSQL foi preservado.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

## Scope
Record of features [006](../specs/006-swagger-examples), [007](../specs/007-frontend-crud-polish) and [008](../specs/008-ci-reliability), following the [initial snapshot](validation.md). The stack remains Java 21/Spring Boot 4.2.0/Springdoc 3.2.1 and React 19.3.1/TypeScript 5.9.3/Vite 7.3.8. No application dependencies were added.

The frontend uses a shared native Select with a ChevronDown arrow, labeled filters, grouped forms, read/edit/delete actions, a mobile presentation and scrolling navigation on short screens. CRUD persists every field through the API. Pending operations block closing and resubmission; errors preserve values and identify fields when provided by the API.

Swagger publishes 38 examples across 15 operations, rules, parameters, responses, permissions and an authentication walkthrough. Relative origin supports direct and proxy access; the explicit allowlist includes localhost:3000 and localhost:8080. Swagger does not persist tokens. See the [execution guide](swagger-guide.md).

## Local checks that actually ran

| Check | Result | Local evidence |
|---|---|---|
| Backend / Maven | 87 tests: 59 unit and 28 integration; zero failures, errors or skips | backend/target/surefire-reports and failsafe-reports |
| OpenAPI examples / PostgreSQL | 6 contract tests executing the actual examples | OpenApiExamplesIT and backend/target/swagger-validation-summary.json |
| SpotBugs | 0 bugs | backend/target/spotbugsXml.xml |
| Frontend / Vitest | 61 passed | frontend/artifacts/vitest.json |
| Browser with simulated contracts | 18 passed; zero failures/skips/flaky | frontend/artifacts/playwright.json |
| Browser with real API | 2 passed; full CRUD, persistence, refresh, logout and READER | frontend/artifacts/playwright-integration.json |
| Swagger browser | 4 passed; proxy/backend, login/Authorize, CRUD, 409, 404, rotation and logout | frontend/artifacts/playwright-swagger.json |
| Frontend lint, TypeScript and build | Passed | package.json scripts and local reports |
| Project Sonar | Gate OK; 0 open issues, 0% duplication, 95.9% new-code coverage | artifacts/sonar-swagger-green.json |
| Frontend Sonar | 16 interface files without issues; Swagger test/config analyzed separately | frontend/artifacts/sonar-polish.json and artifacts/swagger-sonar-final.json |
| Service smoke | 14 checks passed | artifacts/smoke.json |
| Documentation and delivery | 65 Markdown documents, 29 Postman requests and 3 configurations passed | scripts/validate-project.py |

Business JaCoCo coverage: **214/217 lines (98.62%) and 155/160 branches (96.88%)**, with the unchanged 80%/75% gate. The full report contains **545/555 lines (98.20%) and 215/237 branches (90.72%)**. The restricted report remains at `target/site/jacoco` for the collector and business gate; the full report is at `target/site/jacoco-full` for Sonar. Both use the same instrumented execution. No threshold was reduced or new exclusion introduced to obtain approval.

Frontend coverage remains 100% lines and 98.18% branches within the configured business-logic scope. This is not coverage of every visual component; component/browser tests complement it. Captures under `frontend/artifacts/books-*`, `book-editor-*` and `swagger-*` were inspected. Swagger captures use no authentication. The authenticated suite disables retention of screenshots, videos, traces and failure snapshots; credential-bearing transport failures are sanitized.

## Failures found and fixed
- Swagger RED: missing proxy port and login403 on origin8080. GREEN: four real scenarios across both origins.
- Interface RED: closing during writes, unassociated field errors and inaccessible “Sair” on a short viewport. GREEN: components, 18 E2E and two real flows.
- Sonar RED: 55% new-code coverage because instrumentation omitted configuration classes exercised by tests. GREEN: full instrumentation, separate reports and 95.9% gate coverage, without lowering criteria.
- Initial CI RED: [run45907829637](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45907829637) passed backend/frontend, but Trivy received429 from Maven Central. Scanning was moved after Maven on the same runner to reuse resolved POMs; scanners, severities and blocking behavior are unchanged.

## Remote verification and limits
The [Quality gates workflow](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/workflows/ci.yml) now includes the real Swagger walkthrough and uploads both JaCoCo reports. The final record must identify its run, SHA and passing jobs; local YAML/actionlint validation is not remote execution evidence. Execution of the new commit is still pending in this initial delivery record.

All five initial Dependabot Updates runs passed. Major-update PRs have their own status: for example, the isolated jest-dom8 PR requires Vitest5 and must not be approved through forced installation. The test-dependency group keeps these updates together without changing the installed stack.

Raw reports in artifacts/target are Git-ignored and must be generated in another checkout. Java Sonar snippets lack a file path and produced an artificial S1598; the full scanner with real paths validated the sources. YAML/Markdown/PowerShell/JSON use their own validators when unsupported by snippets. Local browser tests ran in Chromium. Containers remain reachable through localhost and published on 0.0.0.0; the PostgreSQL volume was preserved.

</details>
