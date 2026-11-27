# Plano — confiabilidade dos workflows

## Stack e preparação
GitHub Actions em YAML, runners Ubuntu, Java 21/Maven Wrapper, Node 22/npm, Python e Docker Compose. Context7 oficial consultado para GitHub Actions, GitHub CLI, Trivy e Dependabot. Runs e logs lidos pelo `gh` autenticado, sem alteração remota nessa etapa. A constituição, skills Docker, TDD e code-review orientam a alteração.

## Decisão técnica
Mover o scan filesystem do job `dependencies` para `backend`, imediatamente após `verify`. O mesmo runner já possui os POMs resolvidos em `~/.m2/repository`; isso elimina a dependência de restauração de cache entre jobs. A documentação oficial do Trivy recomenda preencher esse repositório antes de escanear e alerta que offline-scan pode omitir transitivas ausentes.

Manter `scan-ref: .`: ações `uses` executam na raiz do workspace, independentemente de `defaults.run.working-directory: backend`. Criar a pasta de saída na raiz e publicar o relatório de segurança em um artifact separado com `if: always()`. Não misturar caminhos desse artifact com `backend-evidence`, cujo diretório comum precisa continuar `backend/target`.

Publicar também `backend/target/site/jacoco-full/`, relatório completo consumido pelo Sonar. O relatório de negócio continua em `backend/target/site/jacoco/`, preservando o contrato do coletor e seus limites de cobertura.

O job `dependencies` mantém validação estrutural/documental, schema Postman, testes do coletor e actionlint. `integration` continua dependendo de backend, frontend e dependencies. Adicionar execução de `playwright.swagger.config.ts` após a suíte com API real e incluir seu JSON sanitizado nos artifacts.

Agrupar `vitest`, `@vitest/*` e `@testing-library/jest-dom` nas atualizações npm do Dependabot. As versões da aplicação permanecem inalteradas; PRs existentes e majors seguem revisão própria.

## Segurança e riscos
Não reduzir limites de cobertura ou severidade, usar continue-on-error, desligar scanners, usar instalação forçada ou alterar checks para ocultar erro. O scanner pode demorar mais ao examinar o workspace após build; timeout suficiente deve preservar a execução completa. Falhas transitórias de provedores devem continuar visíveis. Nenhum segredo é publicado nos artifacts.

## Validação e sequência
1. Preservar RED remoto: logs dos runs 45907829637 e 45907981918.
2. Alterar somente workflow e agrupamento, após os quatro artefatos SDD.
3. Validar YAML, actionlint, dependências entre jobs, caminhos de artifacts e revisão de diff.
4. Aguardar fonte estável de Swagger e frontend; commit/push coordenados pelo orquestrador.
5. Observar o novo run em main, corrigir falhas reais até todos os jobs concluírem com success e registrar URLs/commit.

Configuração YAML é validada por ferramentas nativas; a operação de snippets Sonar não possui linguagem GitHub Actions/Dependabot. Nenhuma execução local substitui o gate remoto.
