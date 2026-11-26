---
name: spring-boot
description: "Implemente API, negócio e persistência em Java/Spring."
---

# spring-boot

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Leia specs001/002, pom e documentação Context7 compatível. Use controller com DTO, service transacional e repository JPA; retorne ProblemDetail para erros. Use validação Jakarta e migrações Flyway. Parametrize queries, valide paginação/sort e garanta unicidade no PostgreSQL. Conclua com testes públicos, MockMvc e integração real; não exponha entidades.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
