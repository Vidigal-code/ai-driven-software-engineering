# Aceitação — compatibilidade dos PRs de dependências

| Critério / requisito / tarefa | Dado | Quando | Então | Evidência |
|---|---|---|---|---|
| CA-DEP-001 / RF-DEP-001 / T02 | manifests e lockfile da proposta corrigida | `npm ci` executa sem ignorar peers | instalação termina com sucesso | saída npm e árvore instalada |
| CA-DEP-002 / RF-DEP-002 / T02/05 | suíte existente preservada | lint, typecheck, testes com cobertura e build executam | todos passam sem reduzir asserções ou limites | relatórios do frontend e diff |
| CA-DEP-003 / RF-DEP-003/006 / T03 | PR possui checks da configuração antiga | branch incorpora main usando seu SHA esperado | novo run testa a correção sem merge do PR em main | commits e eventos do GitHub |
| CA-DEP-004 / RF-DEP-004 / T04 | uma dependência major não possui suporte estável compatível | proposta é corrigida | versão validada e limitação ficam explícitas, sem instalação forçada | peers oficiais, manifests e documentação |
| CA-DEP-005 / RF-DEP-005 / T06 | commit final de um PR publicado | todos os jobs terminam | backend, frontend, dependencies e integration estão success no mesmo run | URL, head SHA e conclusões remotas |
| CA-DEP-006 / RF-DEP-006 / T03/05 | ambiente local já contém serviços e dados | manutenção dos PRs termina | volume PostgreSQL e configuração sensível permanecem preservados | status Git e ausência de operações destrutivas |

Uma instalação que falha não é evidência de falha TDD. Runs antigos permanecem consultáveis; a aceitação considera os commits atuais explicitamente identificados.
