# Validação dos PRs de dependências

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

## Escopo e causas
Esta manutenção segue a [spec009](../specs/009-dependency-pr-compatibility) e verifica os commits atuais dos PRs abertos. A aprovação anterior de main não aprovava automaticamente esses PRs.

- **PR #17 — TypeScript:** o [run 45914885752](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914885752) falhou em `npm ci`, antes dos testes. TypeScript 7.0.2 não atende ao peer `>=4.8.4 <6.1.0` de typescript-eslint 8.74.0. A proposta usa o compilador 7 e a API 6 em paralelo, conforme a [orientação oficial da Microsoft](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). O pacote de compatibilidade fornece `tsc6`; o compilador nativo fornece `tsc`.
- **PR #14 — React Flow:** a atualização para 13.0.3 removeu `colorMode` de `ReactFlowProps`, causando erro de tipagem. A adaptação preserva o tema por `data-theme`, a ordem das camadas CSS e o enquadramento do Studio.
- **PR #6 — PostgreSQL:** a imagem 19 recusava a montagem no caminho antigo `/var/lib/postgresql/data`. A correção monta o mesmo volume em `/var/lib/postgresql`, conforme o layout oficial, e documenta a atualização de ambientes existentes na própria branch.
- **Demais checks antigos:** branches ainda usavam a configuração anterior à correção de resolução Maven/Trivy da [spec008](../specs/008-ci-reliability). A atualização da branch incorpora essa correção e gera uma nova execução.

Não houve teste TDD executado com falha no job original do PR #17. Excluir testes não corrigiria o conflito de instalação. Testes, asserções e limites de cobertura permanecem obrigatórios.

## Resultados
Validação local: PR #17 passou em npm10.9.9 ci, lint, typecheck, build e audit (zero vulnerabilidades), 61 testes unitários/componentes e 18 E2E. A versão chamada explicitamente pelo typecheck é 7.0.2; o pacote de compatibilidade 6.0.2 carrega a API 6.0.3. O npm normalizou 21 metadados `libc` no lockfile, sem remover pacotes nem mudar versões/integridades fora do TypeScript.

PR #14 passou em npm ci, lint, typecheck, build, 61 testes unitários/componentes e 19 E2E. O novo teste reproduziu o contorno selecionado cortado pelo viewport antes da correção e passou após o padding equivalente de 6,52%. Os temas claro e escuro foram inspecionados; Sonar reportou zero issues nos três arquivos alterados. Ambos os PRs mantiveram 100% das linhas e 98,18% dos branches no escopo de negócio configurado.

PR #6 foi validado com volumes temporários: inicialização de banco 19 com menor privilégio, persistência após recriar o container, recusa de um volume 17 e preservação de seus dados ao reiniciar com a versão 17. O entrypoint oficial faz a recusa; nenhum wrapper ou migração automática foi adicionado. Isso não valida uma migração real de dados 17 → 19.

Snapshot remoto em 2026-11-27T02:15:17.665358+00:00: **15 dos 15 PRs abertos aprovados, com 60 de 60 jobs obrigatórios concluídos com sucesso**. `backend`, `frontend`, `dependencies` e `integration` terminaram com `success` no run do SHA informado. Nenhum desses jobs foi ignorado.

| PR | Head SHA | Run | Quality gates |
|---|---|---|---|
| [#1](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/1) | `f509fa6` | [45924785118](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924785118) | 4/4 |
| [#2](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/2) | `d9adfb6` | [45924790314](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924790314) | 4/4 |
| [#3](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/3) | `a7a05d7` | [45914935383](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914935383) | 4/4 |
| [#4](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/4) | `8c43ec5` | [45924794814](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924794814) | 4/4 |
| [#5](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/5) | `802f404` | [45925179769](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925179769) | 4/4 |
| [#6](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/6) | `101314b` | [45926622512](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45926622512) | 4/4 |
| [#7](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/7) | `ddcddbf` | [45925289590](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925289590) | 4/4 |
| [#8](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/8) | `c9cbc92` | [45924996735](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924996735) | 4/4 |
| [#9](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/9) | `87465e7` | [45925298093](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925298093) | 4/4 |
| [#10](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/10) | `247f476` | [45925303019](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925303019) | 4/4 |
| [#11](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/11) | `35f131e` | [45925007172](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925007172) | 4/4 |
| [#14](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/14) | `2f90d0f` | [45925886754](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925886754) | 4/4 |
| [#16](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/16) | `aceaa95` | [45914846092](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914846092) | 4/4 |
| [#17](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/17) | `907a158` | [45925779392](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925779392) | 4/4 |
| [#18](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/18) | `530ea98` | [45914893744](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914893744) | 4/4 |

Revisões independentes de padrões e especificação dos PRs #17, #14 e #6: zero achados em cada eixo. Nenhum teste foi excluído, nenhuma asserção foi reduzida e nenhum limite de cobertura foi alterado.

## Limites e reprodução
As correções são propostas nas branches dos PRs, sem merge automático de upgrades major em main. Runs antigos permanecem no histórico. Os containers locais e o volume PostgreSQL são preservados.

Na branch correspondente, executar no frontend: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build` e `npm audit --audit-level=high`. O CI executa também backend, PostgreSQL, smoke, E2E e scans das imagens. Um build local não substitui essa execução remota.

Avisos de Node 20 vêm do runtime de Actions antigas, inclusive cache transitivo do Trivy; são distintos da versão Node 22 da aplicação e do erro de peers. Markdown e JSON usam validação estrutural/nativa; não recebem aprovação fictícia de snippets Sonar sem suporte à linguagem. GitPageDocs foi consultado em modo de leitura; não há configuração de site nesse repositório.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

## Scope and causes
This maintenance follows [spec009](../specs/009-dependency-pr-compatibility) and checks the current commits of open PRs. The previous main approval did not automatically approve these PRs.

- **PR #17 — TypeScript:** [run 45914885752](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914885752) failed at `npm ci`, before tests. TypeScript 7.0.2 does not satisfy typescript-eslint 8.74.0's `>=4.8.4 <6.1.0` peer. The proposal runs compiler 7 and API 6 side by side, following [Microsoft's official guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0). The compatibility package provides `tsc6`; the native compiler provides `tsc`.
- **PR #14 — React Flow:** upgrading to 13.0.3 removed `colorMode` from `ReactFlowProps`, causing a type error. The adaptation preserves the theme through `data-theme`, CSS layer ordering and the Studio viewport.
- **PR #6 — PostgreSQL:** image 19 rejected mounting at the old `/var/lib/postgresql/data` path. The fix mounts the same volume at `/var/lib/postgresql`, following the official layout, and documents upgrading existing environments on that branch.
- **Other old checks:** branches still used the configuration preceding the Maven/Trivy resolution fix in [spec008](../specs/008-ci-reliability). Updating each branch incorporates that fix and triggers a new run.

No failing TDD test ran in PR #17's original job. Deleting tests would not fix the installation conflict. Tests, assertions and coverage thresholds remain mandatory.

## Results
Local validation: PR #17 passed npm10.9.9 ci, lint, typecheck, build and audit (zero vulnerabilities), 61 unit/component tests and 18 E2E tests. Typecheck explicitly calls version 7.0.2; compatibility package 6.0.2 loads API 6.0.3. npm normalized 21 `libc` metadata entries in the lockfile without removing packages or changing versions/integrities outside TypeScript.

PR #14 passed npm ci, lint, typecheck, build, 61 unit/component tests and 19 E2E tests. The new test reproduced the selected outline being clipped by the viewport before the fix and passed with the equivalent 6.52% padding. Light and dark themes were visually inspected; Sonar reported zero issues across the three changed files. Both PRs preserved 100% line and 98.18% branch coverage within the configured business scope.

PR #6 was validated with temporary volumes: least-privilege PostgreSQL 19 startup, persistence after container recreation, refusal of a PostgreSQL 17 volume and preservation of its data when restarted with version 17. The official entrypoint rejects the old layout; no wrapper or automatic migration was added. This does not validate a real PostgreSQL 17 → 19 data migration.

Remote snapshot at 2026-11-27T02:15:17.665358+00:00: **15 of 15 open PRs approved, with 60 of 60 required jobs successfully completed**. `backend`, `frontend`, `dependencies` and `integration` finished with `success` in the run for the specified SHA. None of these jobs was skipped.

| PR | Head SHA | Run | Quality gates |
|---|---|---|---|
| [#1](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/1) | `f509fa6` | [45924785118](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924785118) | 4/4 |
| [#2](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/2) | `d9adfb6` | [45924790314](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924790314) | 4/4 |
| [#3](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/3) | `a7a05d7` | [45914935383](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914935383) | 4/4 |
| [#4](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/4) | `8c43ec5` | [45924794814](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924794814) | 4/4 |
| [#5](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/5) | `802f404` | [45925179769](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925179769) | 4/4 |
| [#6](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/6) | `101314b` | [45926622512](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45926622512) | 4/4 |
| [#7](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/7) | `ddcddbf` | [45925289590](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925289590) | 4/4 |
| [#8](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/8) | `c9cbc92` | [45924996735](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45924996735) | 4/4 |
| [#9](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/9) | `87465e7` | [45925298093](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925298093) | 4/4 |
| [#10](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/10) | `247f476` | [45925303019](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925303019) | 4/4 |
| [#11](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/11) | `35f131e` | [45925007172](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925007172) | 4/4 |
| [#14](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/14) | `2f90d0f` | [45925886754](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925886754) | 4/4 |
| [#16](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/16) | `aceaa95` | [45914846092](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914846092) | 4/4 |
| [#17](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/17) | `907a158` | [45925779392](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45925779392) | 4/4 |
| [#18](https://github.com/Vidigal-code/ai-driven-software-engineering/pull/18) | `530ea98` | [45914893744](https://github.com/Vidigal-code/ai-driven-software-engineering/actions/runs/45914893744) | 4/4 |

Independent standards and specification reviews for PRs #17, #14 and #6: zero findings on each axis. No test was deleted, no assertion was reduced and no coverage threshold was changed.

## Limits and reproduction
Fixes are proposed on the PR branches without automatically merging major upgrades into main. Old runs remain in history. Local containers and the PostgreSQL volume are preserved.

On the corresponding branch, run in frontend: `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build` and `npm audit --audit-level=high`. CI also runs backend, PostgreSQL, smoke, E2E and image scans. A local build does not replace that remote execution.

Node 20 warnings come from older Actions runtimes, including Trivy's transitive cache action; they are separate from the application's Node 22 version and the peer error. Markdown and JSON use structural/native validation, without fictitious Sonar snippet approval for unsupported languages. GitPageDocs was consulted in read-only mode; this repository has no site configuration.

</details>
