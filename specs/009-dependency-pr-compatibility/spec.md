# Especificação — compatibilidade dos PRs de dependências

## Contexto
O usuário solicitou corrigir e reexecutar os workflows com falha, incluindo o PR #17 de TypeScript 7.0.2. O run 45914885752 falhou em `npm ci`: `typescript-eslint@8.74.0` aceita TypeScript `>=4.8.4 <6.1.0`. Nenhum teste executou nesse job. Outros PRs ainda apresentam a falha de resolução Maven já corrigida em main pela spec008. Aprovação do main não equivale à aprovação de cada PR.

## Objetivo e requisitos
- RF-DEP-001: tornar reproduzível a instalação do frontend no PR #17 com versões estáveis que respeitem os peers oficiais. Não usar `--force`, `--legacy-peer-deps` ou overrides que declarem compatibilidade inexistente.
- RF-DEP-002: preservar testes, asserções, cobertura mínima, lint, tipagem, segurança e integração. Excluir testes não resolve uma falha anterior à execução dos testes.
- RF-DEP-003: atualizar as branches dos PRs com checks antigos em falha para incorporar a correção de CI já validada em main e executar os gates sobre os novos commits.
- RF-DEP-004: corrigir incompatibilidades adicionais comprovadas pelos logs, sem alterar a intenção do produto nem aprovar automaticamente upgrades major em main.
- RF-DEP-005: registrar PR, head SHA, run e conclusão de cada job. Uma falha histórica permanece no histórico; um teste ignorado ou job cancelado não conta como aprovação.
- RF-DEP-006: preservar o ambiente local, dados PostgreSQL, segredos, mudanças concorrentes e conteúdo de PRs. Atualizações remotas usam SHA esperado e não reescrevem histórico.

## Histórias, restrições e bordas
Como mantenedor, quero distinguir incompatibilidade de dependências, falha de teste e erro de infraestrutura para aplicar a correção correspondente. Como revisor, quero os checks do commit atual de cada PR e todas as proteções anteriores preservadas.

Se nenhuma versão estável da ferramenta suportar o upgrade proposto, a proposta deverá declarar a versão compatível efetivamente validada e a limitação, sem fingir suporte à major incompatível. Conflitos de merge e novos findings de segurança exigem investigação. Avisos de runtime das Actions são distintos de erros que bloqueiam os jobs. Não fechar PRs, apagar runs ou fundir upgrades para esconder falhas.
