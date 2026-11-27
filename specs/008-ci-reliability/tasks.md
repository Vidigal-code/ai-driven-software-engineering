# Tarefas — confiabilidade dos workflows

- [x] CI-T01 — DevOps: consultar logs remotos e documentação oficial; evidência: runs 45907829637/45907981918, erro 429 e conflito de peers identificados.
- [x] CI-T02 — DevOps, depende T01: mover scanner para o job com Maven resolvido; `.github/workflows/ci.yml`; escopo, severidade e bloqueios preservados; actionlint, contratos de configuração e revisão aprovados. Evidência: `artifacts/ci-reliability-validation.json`. A execução remota está em CI-T05.
- [x] CI-T03 — DevOps/QA, depende specs006: incluir suíte Swagger real e artifact sanitizado; `.github/workflows/ci.yml`; quatro testes remotos aprovados no run 45914734649, artifact `integrated-evidence` publicado e conferido.
- [x] CI-T04 — DevOps: agrupar dependências de teste acopladas em `.github/dependabot.yml`; YAML e padrões validados, versões existentes preservadas.
- [x] CI-T05 — Orquestrador/DevOps, depende T02–04 e código estável: commit `04e3899792279189a4e38039bcc5db213ca27f11` publicado; todos os quatro jobs do run [45914734649](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914734649) e os seis runs Dependabot Updates desse SHA aprovados, sem checks enfraquecidos. O commit documental posterior também deve concluir seus gates antes do encerramento.
- [x] CI-T06 — Orquestrador: consolidar docs/validation e rastreabilidade com run/commit/resultados; distinguir histórico e PRs incompatíveis do main.
