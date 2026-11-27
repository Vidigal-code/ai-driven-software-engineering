# Especificação — confiabilidade dos workflows

## Contexto e evidência inicial
O usuário solicitou que todos os workflows do GitHub passem. O escopo principal é a execução atual de `main`, sem apagar o histórico de falhas nem aprovar mudanças incompatíveis de PRs.

No commit `a8214560cd31e5e1aeacb8b32ad8647022beeee8`, o run [45907829637](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45907829637) aprovou backend e frontend. O job `dependencies`, etapa Trivy, falhou ao resolver `org.springframework.data:spring-data-bom:2026.1.0` no Maven Central: HTTP 429, `Retry-After: 1800`. O job não possuía o repositório Maven previamente preenchido. A integração foi bloqueada corretamente por `needs`.

Os cinco runs de `Dependabot Updates` em main foram aprovados: 45907836967, 45907836377, 45907836340, 45907836328 e 45907836253. O run de PR [45907981918](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45907981918) também evidenciou conflito de peers: jest-dom 8 requer Vitest >=5 <6, mas o PR isolado preservava Vitest 4.1.12. Isso é uma atualização incompatível separada da falha do main.

## Requisitos
- RF-CI-001: corrigir a causa de infraestrutura observada e obter execução remota aprovada de todos os jobs do workflow em main.
- RF-CI-002: preservar compilação, testes, cobertura, lint, tipagem, análise estática, auditoria, scans, build, health e smoke; falhas continuam bloqueando a integração.
- RF-CI-003: executar Trivy sobre a raiz completa com `vuln,secret,misconfig`, HIGH/CRITICAL e exit-code 1, aproveitando o repositório Maven que o build já resolveu. Não usar offline-scan, suprimir findings ou desativar resolução de transitivas.
- RF-CI-004: executar a suíte Swagger real nas origens do frontend e backend depois da integração real existente; preservar relatório sanitizado.
- RF-CI-005: manter evidências mesmo em falhas, sem mudar o layout dos relatórios backend consumidos pelo coletor.
- RF-CI-006: agrupar atualizações de dependências de testes acopladas para reduzir PRs que violam seus peers; não forçar instalação, aceitar majors sem validação, fechar ou fundir PRs para esconder falhas.
- RF-CI-007: registrar run, commit, jobs e resultado real. Validação YAML local não equivale a workflow remoto aprovado.

## Histórias e bordas
Como mantenedor, quero que o scan use dependências já resolvidas e não seja bloqueado por consultas remotas redundantes. Como apresentador, quero que os exemplos Swagger estejam cobertos no CI. Como revisor, quero distinguir falha histórica, incompatibilidade de PR e estado do main atual.

Erros de build, resolução Maven, scanner, testes ou health continuam falhas. Ausência de credenciais externas não pode gerar aprovação fictícia. Relatórios não contêm tokens ou senhas. Uma nova revisão do commit exige seu próprio run.
