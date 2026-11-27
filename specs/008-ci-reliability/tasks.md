# Tarefas — confiabilidade dos workflows

- [x] CI-T01 — DevOps: consultar logs remotos e documentação oficial; evidência: runs 45907829637/45907981918, erro 429 e conflito de peers identificados.
- [x] CI-T02 — DevOps, depende T01: mover scanner para o job com Maven resolvido; `.github/workflows/ci.yml`; escopo, severidade e bloqueios preservados; actionlint, contratos de configuração e revisão aprovados. Evidência: `artifacts/ci-reliability-validation.json`. A execução remota está em CI-T05.
- [ ] CI-T03 — DevOps/QA, depende specs006: incluir suíte Swagger real e artifact sanitizado; `.github/workflows/ci.yml`; concluir com comandos corretos e execução remota dos exemplos.
- [x] CI-T04 — DevOps: agrupar dependências de teste acopladas em `.github/dependabot.yml`; YAML e padrões validados, versões existentes preservadas.
- [ ] CI-T05 — Orquestrador/DevOps, depende T02–04 e código estável: commit/push autorizado e acompanhamento do run em main; concluir somente com todos os jobs aprovados, sem checks enfraquecidos.
- [ ] CI-T06 — Orquestrador: consolidar docs/validation e rastreabilidade com run/commit/resultados; distinguir histórico e PRs incompatíveis do main.
