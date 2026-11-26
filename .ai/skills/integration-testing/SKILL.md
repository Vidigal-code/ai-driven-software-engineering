---
name: integration-testing
description: "Valide REST, banco, sessão e fluxos completos."
---

# integration-testing

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Use Testcontainers PostgreSQL com migrations e MockMvc para backend. Verifique constraints, transações e concorrência pelo contrato público. Frontend usa Testing Library e Playwright; mocks de rede devem ser identificados e complementados por smoke integrado. Conclua quando serviços reais estiverem saudáveis e cenários críticos tiverem evidência; registre testes indisponíveis.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
