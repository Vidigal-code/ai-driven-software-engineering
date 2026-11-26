---
name: unit-testing
description: "Teste regras, contratos locais e máquina de estados."
---

# unit-testing

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Escolha a interface pública indicada no critério. Use exemplos independentes da implementação, tempo determinístico e nomes ligados ao requisito. Cubra sucesso, erro, borda e transições inválidas. Mock somente fronteiras externas. Execute um teste por ciclo TDD. Conclua com testes sensíveis à regressão e relatório real.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
