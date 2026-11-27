# PostgreSQL 19 — atualização de ambiente / Environment upgrade

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

## Escopo desta proposta

Esta branch propõe PostgreSQL 19. O Compose monta o volume existente em `/var/lib/postgresql`; a imagem oficial usa `PGDATA=/var/lib/postgresql/19/docker`. O nome lógico `postgres_data` permanece igual. Não há migração automática nem troca silenciosa para outro volume.

Um volume novo pode ser inicializado normalmente. Se um volume do PostgreSQL 17 contiver `PG_VERSION` na raiz, o entrypoint oficial do PostgreSQL 19 interrompe a inicialização com uma mensagem de layout incompatível. Essa recusa é esperada: alterar a imagem ou o ponto de montagem não converte os arquivos do banco. As migrations Flyway também não convertem o formato físico do cluster.

## Procedimento para um ambiente com dados

1. Mantenha a imagem 17 e seu volume originais até concluir a migração. Planeje uma janela sem escritas e registre uma estratégia de retorno.
2. Faça backup lógico e valide sua restauração em ambiente isolado. Use `pg_dump --format=custom` para o banco da aplicação e inventarie os objetos globais necessários. Configure a conexão por arquivos protegidos, como `PGPASSFILE`; não coloque senhas nos comandos, logs ou repositório. Trate backups como dados sensíveis.
3. Prepare PostgreSQL 19 em **outro volume, explicitamente identificado**, sem reutilizar os arquivos do cluster 17. Recrie os papéis necessários com menor privilégio e segredos do ambiente de destino.
4. Restaure o backup com `pg_restore --exit-on-error`, respeitando o proprietário e as permissões da aplicação. Valide contagens, integridade, autenticação, CRUD, migrations, health e backups no destino. O sucesso da inicialização, por si só, não aprova uma migração.
5. Somente depois da validação, configure o ambiente para usar o volume migrado e faça o corte planejado. Preserve o volume e o backup originais. Um retorno após novas escritas no PostgreSQL 19 exige reconciliação; não descarte esses dados.

Uma alternativa é `pg_upgrade`, que exige as duas versões e planejamento específico de armazenamento. Consulte a [documentação oficial de atualização](https://www.postgresql.org/docs/19/upgrading.html) e as [orientações da imagem oficial](https://github.com/docker-library/docs/tree/master/postgres).

## Limites da evidência

O CI desta proposta usa um volume novo e descartável. Isso valida inicialização e integração, **não uma migração de dados 17 → 19**. A validação local usa apenas volumes temporários identificados para testar persistência e recusa do layout antigo. Nenhum dado de um ambiente existente é migrado por esta mudança.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

## Scope of this proposal

This branch proposes PostgreSQL 19. Compose mounts the existing volume at `/var/lib/postgresql`; the official image uses `PGDATA=/var/lib/postgresql/19/docker`. The logical name `postgres_data` remains unchanged. There is no automatic migration or silent switch to another volume.

A new volume can initialize normally. If a PostgreSQL 17 volume contains `PG_VERSION` at its root, the official PostgreSQL 19 entrypoint stops initialization with an incompatible-layout message. This refusal is expected: changing the image or mount point does not convert database files. Flyway migrations do not convert the physical cluster format either.

## Procedure for an environment containing data

1. Keep the original PostgreSQL 17 image and volume until migration is complete. Plan a window without writes and document a rollback strategy.
2. Create a logical backup and validate its restoration in an isolated environment. Use `pg_dump --format=custom` for the application database and inventory required global objects. Configure connections through protected files such as `PGPASSFILE`; do not put passwords in commands, logs or the repository. Treat backups as sensitive data.
3. Prepare PostgreSQL 19 in **another explicitly identified volume**, without reusing PostgreSQL 17 cluster files. Recreate required roles with least privilege and the destination environment's secrets.
4. Restore the backup with `pg_restore --exit-on-error`, respecting application ownership and permissions. Validate row counts, integrity, authentication, CRUD, migrations, health and backups in the destination. Successful startup alone does not approve a migration.
5. Only after validation, configure the environment to use the migrated volume and perform the planned cutover. Preserve the original volume and backup. Rolling back after new writes to PostgreSQL 19 requires reconciliation; do not discard those writes.

An alternative is `pg_upgrade`, which requires both versions and storage-specific planning. Consult the [official upgrade documentation](https://www.postgresql.org/docs/19/upgrading.html) and the [official image guidance](https://github.com/docker-library/docs/tree/master/postgres).

## Evidence limits

This proposal's CI uses a new disposable volume. It validates initialization and integration, **not a PostgreSQL 17 → 19 data migration**. Local validation uses only identified temporary volumes to test persistence and refusal of the old layout. This change does not migrate data from an existing environment.

</details>
