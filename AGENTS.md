# Instruções do repositório

1. Leia `~/.codex/AGENTS.md` e `.specify/constitution.md` antes de qualquer tarefa. A constituição contém as regras centrais; os documentos abaixo especializam o trabalho.
2. Para implementar ou corrigir comportamentos, leia os quatro artefatos da feature em `specs/` e a skill aplicável em `.ai/skills/`. Consulte `.ai/orchestration.md` para dependências e evidências.
3. Consulte manifests/lockfiles e Context7 antes de usar APIs. Leia as skills globais pertinentes em `D:/Prompts/.claude/skills` quando disponíveis. Registre limitações de ferramentas.
4. Trabalhe em TDD incremental pelos seams aprovados na constituição. Mantenha alterações de outro agente e não escreva simultaneamente nos mesmos arquivos.
5. Revise padrões e especificação; execute SonarQube por arquivo suportado e os gates definidos nos manifests/CI. Registre resultados reais em `docs/validation.md` e relatórios gerados em `artifacts/`.
6. Marque tarefas somente após implementação e validação. Mantenha a simulação educacional separada dos resultados de execução reais.

## Mapa de contexto

- Autenticação/autorização: `specs/001-authentication/` e `docs/security.md`.
- Livros/dashboard: `specs/002-book-management/`.
- Interface FSD: `specs/003-library-interface/`.
- Máquina de estados/React Flow: `specs/004-workflow-visualization/`.
- Containers, CI, Postman e execução: `specs/005-infrastructure/`.
- Agentes e limites de atuação: `.ai/agents/`.

Não realize commit, push ou publicação sem instrução correspondente. O escopo desta implementação é o repositório local e sua execução Docker.
