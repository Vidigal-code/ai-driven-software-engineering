# Aceitação — confiabilidade dos workflows

| Critério / requisito | Dado | Quando | Então | Validação |
|---|---|---|---|---|
| CA-CI-001 / RF-CI-001/003 | build Maven aprovado no runner | scanner filesystem executa em seguida | usa repositório local populado, escopo raiz e scanners completos, sem falha429 observada no run inicial | ordem do workflow, logs do novo run |
| CA-CI-002 / RF-CI-002 | um gate falha | GitHub processa dependências | integration não aprova nem ignora a falha | needs preservado e revisão do YAML |
| CA-CI-003 / RF-CI-004 | Compose saudável e credenciais efêmeras | suíte Swagger executa | exemplos de login/CRUD/refresh/logout funcionam nas duas portas | Playwright Swagger no job integration |
| CA-CI-004 / RF-CI-005 | qualquer etapa falha | coleta de artifacts executa | relatórios disponíveis são preservados, sem segredo e sem quebrar caminhos do coletor | upload always e artifacts do run |
| CA-CI-005 / RF-CI-006 | atualizações acopladas de testes | Dependabot avalia versões | grupo mantém os pacotes relacionados numa proposta, sem instalar com force/legacy-peer-deps | dependabot.yml e PR futuro |
| CA-CI-006 / RF-CI-007 | novo commit publicado em main | execução termina | todos os jobs do workflow configurado estão success e relatório identifica commit/run | gh run view e URL pública do run |

Execuções passadas não são reescritas. PRs que alteram major incompatível permanecem evidências separadas e não recebem aprovação artificial.
