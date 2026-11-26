# Tarefas — Interface da biblioteca

- [x] T-UI-001 — Autenticar e restaurar sessão com access token somente em memória e refresh single-flight via cookie HttpOnly.
  - Requisito: RF-UI-001; critério: CA-UI-001.
  - Agente: frontend-developer; dependência: constituição e preparação.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-002 — Apresentar dashboard e livros exclusivamente com dados da API, estados carregando/vazio/erro e nova tentativa.
  - Requisito: RF-UI-002; critério: CA-UI-002.
  - Agente: frontend-developer; dependência: T-UI-001.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-003 — Cadastrar, consultar, editar e excluir livros com RHF/Zod; confirmar exclusão; filtros, ordenação e paginação no servidor.
  - Requisito: RF-UI-003; critério: CA-UI-003.
  - Agente: frontend-developer; dependência: T-UI-002.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-004 — Restringir mutações a ADMIN/LIBRARIAN e administração de usuários a ADMIN; redirecionar visitantes para login.
  - Requisito: RF-UI-004; critério: CA-UI-004.
  - Agente: frontend-developer; dependência: T-UI-003.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-005 — Oferecer interface responsiva, teclado, foco de diálogo, contraste e temas claro/escuro.
  - Requisito: RF-UI-005; critério: CA-UI-005.
  - Agente: frontend-developer; dependência: T-UI-004.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-006 — Administrar perfil e status de usuários e refletir erros Problem Details sem expor dados sensíveis.
  - Requisito: RF-UI-006; critério: CA-UI-006.
  - Agente: frontend-developer; dependência: T-UI-005.
  - Arquivos: frontend/src/shared/api, entities/book, entities/user, features, pages; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-UI-QA — Revisar padrões/especificação, lint, typecheck, cobertura, build, Sonar e E2E; registrar resultados reais sem marcar execução ausente.


## Evidências de conclusão

Validação local em 26/11/2026: 58 testes Vitest, 14 cenários Playwright de contrato em Chromium, lint, TypeScript strict e build aprovados. Cobertura do escopo de lógica: 100% linhas e 98,18% branches. Análise Sonar por conteúdo completo de 56 arquivos frontend: 0 issues; não equivale a gate de servidor.

Relatórios: frontend/artifacts/vitest.json, frontend/coverage/coverage-summary.json, frontend/artifacts/playwright.json, frontend/artifacts/sonar.json. Integração com API real é registrada separadamente em frontend/artifacts/playwright-integration.json e docs/validation.md. Cenários visuais são simulações; health consulta a API real; CI sem execução registrada permanece explicitamente indisponível.
