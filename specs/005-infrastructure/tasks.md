# Tarefas — infraestrutura e entrega

| ID | Tarefa e arquivos | Dependências | Responsável | Critério de conclusão |
| --- | --- | --- | --- | --- |
| INF-T01 | Dockerfiles, `.dockerignore`, `compose.yaml`, `frontend/nginx.conf` | Planos 001–004 e manifests | DevOps | Compose validado; builds e health reais aprovados |
| INF-T02 | `.env.example`, `.gitignore`, `scripts/init-env.mjs` | INF-T01 | DevOps/Segurança | Geração segura, sem overwrite e sem credenciais versionadas |
| INF-T03 | Coleção e environment `postman/` | Contratos auth/books/users/dashboard | DevOps/QA | JSON e schema válidos; requisições e asserções correspondem à API |
| INF-T04 | `.github/workflows/ci.yml`, Dependabot | Scripts npm/Maven e INF-T01 | DevOps | Gates configurados e ações verificadas; execução remota reportada separadamente |
| INF-T05 | `scripts/smoke.mjs` | Backend/frontend prontos e INF-T01 | QA/DevOps | CRUD/auth/RBAC/dashboard/health executados por HTTP real |
| INF-T06 | Revisão e evidências `artifacts/` | INF-T01–05 | Segurança/QA/Orquestrador | Sonar/validadores, scans, logs e pendências reais consolidados |

- [x] INF-T01 — builds finais e três containers saudáveis; UID não zero, portas em 0.0.0.0, localhost e DNS interno validados, volume preservado.
- [x] INF-T02 — ambiente e segredos: geração local, proteção contra sobrescrita, `git check-ignore` e parse do exemplo validados.
- [x] INF-T03 — Postman: schema oficial v2.1.0 validado; Newman 6.2.3 executou 29 requisições e 47 asserções sem falhas contra os serviços reais. A conta descartável foi desativada; evidência sanitizada em `artifacts/postman-run.json`.
- [x] INF-T04 — CI e dependências: workflow validado com actionlint, YAML/estrutura e referências oficiais; execução remota no GitHub ainda não registrada.
- [x] INF-T05 — 14 grupos de smoke reais aprovados sobre imagens finais; conta descartável desativada. Dois testes Playwright adicionais validaram navegação e API real.
- [x] INF-T06 — revisão da infraestrutura concluída: seis arquivos com zero issues Sonar, validadores aprovados, scans finais sem HIGH/CRITICAL e evidências em artifacts. S4502 revisado como falso positivo com justificativa e sete verificações HTTP; zero issues abertas confirmado. PostgreSQL acessível diretamente no Windows por 127.0.0.1, localhost e ::1. Execução remota do CI não registrada.
- [x] INF-T07 — coletor com seis testes RED/GREEN e análise por arquivo; parsing de falha/ausência/cobertura validado. Manifesto real publicado na imagem frontend e comparado integralmente pela resposta HTTP em artifacts/runtime-access.json.
