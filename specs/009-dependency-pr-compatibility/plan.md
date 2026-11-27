# Plano — compatibilidade dos PRs de dependências

## Stack, arquitetura e documentação
Base inicial: main `32cf3b2e831f8d649a15d61ad282edf47d5c0539`. Frontend React 19.3.1, TypeScript 5.9.3, typescript-eslint 8.74.0, Vite 7.3.8, Vitest 4.1.12, npm e Node 22; arquitetura FSD e strict preservados. Backend Java 21/Spring Boot 4.2.0 e PostgreSQL permanecem com seus contratos existentes. CI GitHub Actions possui quatro jobs obrigatórios.

Consultar Context7 para APIs e suporte das ferramentas afetadas; confirmar peers e versões exatas nos metadados oficiais do npm. Ler a constituição e skills TDD, diagnóstico e revisão. GitHub Actions documenta que atualizar a branch de um PR gera `synchronize`; reexecutar um run antigo não incorpora por si só uma correção nova na branch.

## Decisões e ordem
1. Preservar os logs originais e localizar o passo real da falha. Não chamar erro de instalação de RED comportamental.
2. Usar worktrees isoladas em `.tmp/` para branches que necessitam alterações de dependências; manter main e os containers locais intactos.
3. Reproduzir `npm ci` no PR com problema e selecionar o menor conjunto de versões oficialmente compatíveis. Regenerar lockfile com npm, sem flags que ignorem peers.
4. Executar instalação limpa, lint, typecheck, cobertura e build; auditoria e E2E conforme o harness existente. Uma mudança de comportamento exige um teste de regressão pelo seam público antes da correção; uma mudança apenas de dependências reutiliza os testes existentes e o contrato real de instalação.
5. Atualizar branches antigas com main usando o SHA esperado. Não fundir PRs em main nem usar push forçado. Validar conflitos individualmente.
6. Revisar padrões e aderência à spec separadamente; usar Sonar para código suportado e ferramentas nativas para JSON, YAML e Markdown.
7. Publicar correções nas branches correspondentes e acompanhar todos os jobs até a conclusão. Consolidar evidência real por commit.

## Segurança, manutenção e riscos
O resolver nativo do npm é a autoridade para peers; não criar um resolvedor próprio. Manter os gates evita aceitar uma árvore que apenas compila localmente. Não há mudança planejada de API, persistência ou privilégios da aplicação. Upgrades major ficam restritos aos PRs e dependem de revisão antes do merge. Branches podem mudar durante a execução: reler SHA antes de qualquer atualização. JSON/YAML/Markdown não recebem uma aprovação Sonar fictícia quando a operação não suporta essas linguagens.

## Compatibilidades confirmadas antes da implementação
TypeScript 7.0 não fornece a API programática usada pelo typescript-eslint 8.74.0. A [documentação oficial da Microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0) recomenda instalação paralela: `typescript` aponta para `@typescript/typescript6`, com binário `tsc6`, e outro alias instala o compilador 7 com binário `tsc`. Usar versões exatas estáveis e verificar a versão realmente executada por lint/typecheck/build. O alias do compilador não deve colidir com o peer opcional `@typescript/native` que o parser reserva para outra faixa de versão.

O PR #14 de React Flow 13.0.3 falhou em typecheck porque `colorMode` foi removido de `ReactFlowProps`. Confirmar na migração oficial a detecção de tema por `data-theme`, unidades explícitas do padding de `fitView` e ordenação das camadas CSS. Preservar tema claro/escuro, enquadramento e reprodução do Studio. Os seams públicos continuam sendo os controles e a apresentação observável no navegador; a falha de compilação não será registrada como teste comportamental RED.

O PR #6 de PostgreSQL 19 aprovou os três jobs iniciais e falhou ao iniciar o banco no run 45924988509. A imagem oficial mudou o layout a partir da versão 18: `PGDATA` fica em `/var/lib/postgresql/<major>/docker`, com montagem em `/var/lib/postgresql`. Reproduzir a inicialização em volume novo e isolado antes da correção; nunca conectar a imagem 19 ao volume local da versão 17. Ajustes necessários pertencem apenas à branch desse PR. Aprovação de banco novo no CI não comprova migração de dados entre versões major; documentar essa limitação e a necessidade de backup/restauração ou procedimento oficial de upgrade antes de implantar sobre um banco existente.
