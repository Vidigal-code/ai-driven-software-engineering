# Tarefas — Swagger com exemplos executáveis

- [x] SWAG-T01 — Arquiteto: analisar stack, Context7 e artefatos SDD; arquivos specs/006; conclusão: contrato e critérios definidos antes do código.
- [x] SWAG-T02 — Backend/QA, depende T01: RED/GREEN dos exemplos públicos e DTOs em backend; conclusão: exemplos executados por testes com PostgreSQL.
- [x] SWAG-T03 — Backend/DevOps, depende T01: servidor relativo, defaults de origens e UI; arquivos backend/config, application.yml, compose.yaml, .env.example, scripts/init-env.mjs; conclusão: allowlist preservada e origens locais funcionais.
- [x] SWAG-T04 — QA, depende T02/T03: teste Playwright do Swagger nas duas portas; frontend/tests/e2e/swagger.spec.ts e configuração própria; conclusão: login e CRUD reais sem segredos nos relatórios.
- [x] SWAG-T05 — Orquestrador, depende T02/T04: guia, rastreabilidade, revisão e gates; docs e README; conclusão: resultados reais registrados, containers atualizados e saudáveis.

Evidencia de encerramento: testes locais, scanner e GitHub Actions 45914734649 aprovados no commit 04e3899. Consulte docs/validation-updates.md.
