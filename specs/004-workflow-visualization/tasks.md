# Tarefas — Engineering Workflow Studio

- [x] T-WF-001 — Renderizar 22 nós React Flow e rotas de retorno com estados PENDING/RUNNING/FAILED/RETRYING/PASSED/COMPLETED.
  - Requisito: RF-WF-001; critério: CA-WF-001.
  - Agente: frontend-developer; dependência: constituição e preparação.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-002 — Executar automaticamente Play/Pause/Resume/Stop/Restart, anterior/próximo, velocidades 0.5/1/2/4; cancelar timers.
  - Requisito: RF-WF-002; critério: CA-WF-002.
  - Agente: frontend-developer; dependência: T-WF-001.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-003 — Demonstrar sucesso, ISBN duplicado, autorização READER e Quality Gate reprovado; falhas retornam para correção e revalidação.
  - Requisito: RF-WF-003; critério: CA-WF-003.
  - Agente: frontend-developer; dependência: T-WF-002.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-004 — Mostrar detalhes/artefatos com realce de sintaxe e apresentação progressiva; nunca executar código dos trechos.
  - Requisito: RF-WF-004; critério: CA-WF-004.
  - Agente: frontend-developer; dependência: T-WF-003.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-005 — Gerar logs a partir dos eventos com tempo relativo, agente, nível, filtro, auto-scroll, limpeza, cópia/exportação.
  - Requisito: RF-WF-005; critério: CA-WF-005.
  - Agente: frontend-developer; dependência: T-WF-004.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-006 — Oferecer zoom, fit-view, tela cheia e acompanhamento do nó ativo; respeitar reduced-motion.
  - Requisito: RF-WF-006; critério: CA-WF-006.
  - Agente: frontend-developer; dependência: T-WF-005.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-007 — Identificar permanentemente Modo demonstração — execução simulada e separar evidências reais indisponíveis.
  - Requisito: RF-WF-007; critério: CA-WF-007.
  - Agente: frontend-developer; dependência: T-WF-006.
  - Arquivos: frontend/src/entities/workflow, features/workflow-player, widgets/workflow-canvas, pages/engineering-workflow; testes frontend/src e frontend/tests/e2e.
  - Conclusão: comportamento implementado e testes correspondentes executados; evidência real registrada.

- [x] T-WF-QA — Revisar padrões/especificação, lint, typecheck, cobertura, build, Sonar e E2E; registrar resultados reais sem marcar execução ausente.


## Evidências de conclusão

Validação local em 26/11/2026: 58 testes Vitest, 14 cenários Playwright de contrato em Chromium, lint, TypeScript strict e build aprovados. Cobertura do escopo de lógica: 100% linhas e 98,18% branches. Análise Sonar por conteúdo completo de 56 arquivos frontend: 0 issues; não equivale a gate de servidor.

Relatórios: frontend/artifacts/vitest.json, frontend/coverage/coverage-summary.json, frontend/artifacts/playwright.json, frontend/artifacts/sonar.json. Integração com API real é registrada separadamente em frontend/artifacts/playwright-integration.json e docs/validation.md. Cenários visuais são simulações; health consulta a API real; CI sem execução registrada permanece explicitamente indisponível.
