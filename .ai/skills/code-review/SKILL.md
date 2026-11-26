---
name: code-review
description: "Revise mudanças contra padrões e especificação antes de entregar."
---

# code-review

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Compare alterações com constituição e critérios em dois eixos independentes: padrões e aderência. Revise duplicação, nomes, responsabilidade, abstrações, segurança, performance e acessibilidade. Execute Sonar por arquivo compatível e analisadores restantes. Corrija achados e revalide. Conclua com evidência por gate e pendências explícitas.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
