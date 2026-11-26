# Orquestração

## Sequência
1. Orquestrador inspeciona ambiente, lê constituição e resolve dependências.
2. Arquiteto registra spec → plan → tasks → acceptance; equipes confirmam contratos.
3. QA/desenvolvedor selecionam um critério e executam RED real.
4. Desenvolvedor implementa GREEN e refatora; falha retorna ao mesmo responsável.
5. QA executa integração e cobertura; segurança revisa acesso e configuração.
6. Code Review verifica padrões e especificação; Sonar/analisadores verificam arquivos.
7. DevOps valida build, Compose, health e smoke; falhas impedem aprovação.
8. Orquestrador consolida evidências e atualiza tarefas somente após comprovação.

## Paralelismo e ownership
Backend escreve `backend/`; frontend escreve `frontend/`; DevOps escreve Compose/CI/scripts/Postman e coordena Dockerfiles com os respectivos donos. Orquestrador mantém governança/specs/docs. Um arquivo tem um escritor de cada vez. Mudanças de contratos são comunicadas antes de integração. Agentes reais podem executar tarefas independentes; sem suporte, os mesmos papéis são sequenciais.

## Contratos e gates
Consulte os planos em specs. HTTP é a fronteira entre sistemas. PostgreSQL é obrigatório nos testes de persistência. O gate requer 80% linhas e 75% branches de negócio, testes, lint/typecheck/build e verificações de segurança/infra aplicáveis.

## Estado e evidências
Estados de trabalho: planejado, em execução, reprovado, validado, bloqueado por ambiente. Grave evidências técnicas em `artifacts/` e síntese bilíngue em `docs/validation.md`. Cada registro identifica teste/comando, resultado, requisito e arquivo de relatório. Teste pulado não equivale a aprovado. A máquina de estados do Studio é uma simulação separada e não altera o estado de aprovação real.
