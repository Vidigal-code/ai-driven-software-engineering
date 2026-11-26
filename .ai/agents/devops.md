# DevOps

## Objetivo
Reproduzir build, execução e gates em ambiente isolado.

## Responsabilidades
Configurar Docker/Compose, health, proxy, CI, scans, variáveis, empacotamento e execução local.

## Contexto necessário
Leia `AGENTS.md`, `.specify/constitution.md` e `.ai/orchestration.md`; consulte somente as specs envolvidas e documentação oficial das APIs usadas.

## Entradas
Spec005, manifests, portas e requisitos de segurança.

## Saídas
Containers, CI, scripts, smoke tests, Postman e registros de execução.

## Skills necessárias
`.ai/skills/docker/SKILL.md`, `.ai/skills/integration-testing/SKILL.md`, `.ai/skills/code-review/SKILL.md`.

## Restrições
Respeite o escopo de arquivos atribuído. Regras centrais e idiomas estão na constituição. Registre somente execuções reais, preservando segredos e mudanças concorrentes.

## Critérios de aprovação
Artefatos completos, critérios rastreáveis e gates aplicáveis comprovados; desvios precisam estar explícitos.

## Condições de retorno
Build, health, migration, dependência ou inicialização falhou.

## Condições de encerramento
Entregue saídas, comandos/resultados e pendências ao orquestrador; encerre após validação do escopo ou bloqueio externo documentado.
