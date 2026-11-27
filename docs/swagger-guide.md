# Swagger — exemplos e roteiro / Examples and walkthrough

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

## Abrir e autenticar
Com Docker Compose iniciado, abra [Swagger pelo frontend](http://localhost:3000/swagger-ui/index.html) ou [Swagger direto](http://localhost:8080/swagger-ui/index.html). O servidor `/` usa a mesma origem da página, preservando a porta. A opção de autorização não persiste após recarregar a página.

1. Abra **Authentication → POST /api/v1/auth/login** e habilite **Try it out**, se necessário.
2. Substitua os placeholders do exemplo por e-mail e senha da sua conta. Para o administrador criado explicitamente na inicialização, consulte localmente `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` no `.env`. As credenciais não aparecem na documentação.
3. Mantenha `X-Requested-With: XMLHttpRequest` e pressione **Execute**. A resposta esperada é **200**.
4. Copie somente o valor de `accessToken`. Clique em **Authorize**, cole o token sem escrever `Bearer`, confirme **Authorize** e feche o diálogo.
5. Execute **GET /api/v1/auth/me** para conferir a conta e o perfil.

O registro público sempre cria **READER**. Para cadastrar, editar ou excluir livros, use **ADMIN** ou **LIBRARIAN**. Somente ADMIN altera perfis/status de usuários; os exemplos de perfis não concedem permissão por si próprios.

## Roteiro de exemplo: livro completo
Os corpos de requisição têm exemplos selecionáveis e editáveis. Os valores ilustrativos não representam dados previamente cadastrados.

| Etapa | Operação | Como testar | Resultado esperado |
|---|---|---|---|
| Cadastrar | POST /api/v1/books | Selecione `validBook` e execute; copie o `id` retornado | 201, livro e header Location |
| Duplicar | POST /api/v1/books | Repita o mesmo ISBN | 409, Problem Details |
| Consultar | GET /api/v1/books/{id} | Cole o UUID real retornado no cadastro | 200, dados persistidos |
| Pesquisar | GET /api/v1/books | Use os filtros; página começa em 0; sort aceita campos documentados | 200, conteúdo e totais da página |
| Atualizar | PUT /api/v1/books/{id} | Use `updateBook`, mantenha o ISBN do cadastro e altere os campos desejados | 200, livro atualizado |
| Validar erro | POST /api/v1/books | Selecione `invalidCopies` ou `invalidIsbn` | 400, motivo da rejeição |
| Excluir | DELETE /api/v1/books/{id} | Cole o UUID do livro criado neste roteiro | 204, sem corpo |
| Confirmar exclusão | GET /api/v1/books/{id} | Consulte o mesmo UUID excluído | 404 |

Se o ISBN do exemplo já existir, use outro ISBN10/13 válido com checksum correto ou consulte o cadastro existente. Nunca exclua um registro alheio para fazer o exemplo passar. Ano de publicação não pode ser futuro; exemplares disponíveis não podem exceder o total. A atualização utiliza o corpo completo do livro.

## Sessão e erros
O login configura o cookie HttpOnly `library_refresh` automaticamente. Execute **POST /auth/refresh** para renovar; o navegador envia o cookie sem campo manual. Copie o novo access token e atualize **Authorize**. **POST /auth/logout** revoga a sessão de renovação e remove o cookie. O access token já emitido permanece válido até expirar; remova-o também de Authorize ao encerrar o roteiro.

401 indica autenticação ausente/inválida; 403 indica perfil insuficiente ou proteção da requisição; 400 indica entrada inválida; 409 indica conflito de dados; 429 indica limite de tentativas. As respostas publicadas mostram somente erros aplicáveis à operação. Para usar outra porta ou IP, inclua a origem exata em `CORS_ALLOWED_ORIGINS`; não use wildcard. Em HTTPS, configure `COOKIE_SECURE=true`.

## Testes automatizados dos exemplos
Na pasta `backend`, com Java 21 e Docker disponíveis:

```sh
./mvnw verify
```

`OpenApiExamplesIT` consulta o documento real e executa seus exemplos contra PostgreSQL em Testcontainers, com credenciais efêmeras. No Windows, use `mvnw.cmd verify`.

Para testar a própria interface Swagger nas duas portas, com Compose saudável e credenciais administrativas no `.env`, execute na pasta `frontend`:

```sh
node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.swagger.config.ts
```

Os testes usam contas descartáveis, removem seus próprios livros e desativam as contas. Traces, screenshots e vídeos ficam desativados nesta suíte para não registrar tokens. `E2E_BASE_URL` e `E2E_API_URL` permitem testar outras origens. Os resultados ficam em `frontend/artifacts/playwright-swagger.json`; consulte [validação](validation.md) para execuções efetivamente registradas.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

## Open and authenticate
With Docker Compose running, open [Swagger through the frontend](http://localhost:3000/swagger-ui/index.html) or [Swagger directly](http://localhost:8080/swagger-ui/index.html). Server `/` uses the page's origin and preserves its port. Authorization does not persist after a page reload.

1. Open **Authentication → POST /api/v1/auth/login** and enable **Try it out**, if needed.
2. Replace the example placeholders with your account's email and password. For an administrator explicitly created at initialization, read `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` locally from `.env`. Credentials are not published in documentation.
3. Keep `X-Requested-With: XMLHttpRequest` and press **Execute**. Expect **200**.
4. Copy only the `accessToken` value. Click **Authorize**, paste the token without a `Bearer` prefix, confirm **Authorize** and close the dialog.
5. Execute **GET /api/v1/auth/me** to check the account and role.

Public registration always creates **READER**. Creating, editing or deleting books requires **ADMIN** or **LIBRARIAN**. Only ADMIN changes user roles/status; role examples do not themselves grant permission.

## Complete book example walkthrough
Request bodies have selectable, editable examples. Illustrative values do not represent pre-existing records.

| Step | Operation | How to test | Expected result |
|---|---|---|---|
| Create | POST /api/v1/books | Select `validBook` and execute; copy the returned `id` | 201, book and Location header |
| Duplicate | POST /api/v1/books | Repeat the same ISBN | 409, Problem Details |
| Read | GET /api/v1/books/{id} | Paste the actual UUID returned by creation | 200, persisted data |
| Search | GET /api/v1/books | Use filters; pages start at 0; sort accepts documented fields | 200, page content and totals |
| Update | PUT /api/v1/books/{id} | Use `updateBook`, retain the created book's ISBN and change desired fields | 200, updated book |
| Validate errors | POST /api/v1/books | Select `invalidCopies` or `invalidIsbn` | 400, rejection reason |
| Delete | DELETE /api/v1/books/{id} | Paste the UUID of the book created in this walkthrough | 204, no body |
| Confirm deletion | GET /api/v1/books/{id} | Read the deleted UUID | 404 |

If the example ISBN already exists, use another valid ISBN10/13 with a correct checksum or inspect the existing record. Never delete someone else's record to make an example pass. Publication year cannot be in the future; available copies cannot exceed total copies. Updating requires the complete book body.

## Session and errors
Login automatically sets the HttpOnly `library_refresh` cookie. Execute **POST /auth/refresh** to renew; the browser sends the cookie without a manual field. Copy the new access token and update **Authorize**. **POST /auth/logout** revokes the refresh session and removes the cookie. An already-issued access token remains valid until it expires; remove it from Authorize when finishing the walkthrough too.

401 means missing/invalid authentication; 403 means insufficient role or request protection; 400 means invalid input; 409 means a data conflict; 429 means the attempt limit was reached. Published responses show only applicable operation errors. To use another port or IP, add the exact origin to `CORS_ALLOWED_ORIGINS`; do not use a wildcard. Configure `COOKIE_SECURE=true` with HTTPS.

## Automated example tests
From `backend`, with Java 21 and Docker available:

```sh
./mvnw verify
```

`OpenApiExamplesIT` reads the real document and executes its examples against PostgreSQL in Testcontainers using ephemeral credentials. On Windows, use `mvnw.cmd verify`.

To test Swagger itself on both ports, with healthy Compose services and administrator credentials in `.env`, run from `frontend`:

```sh
node --env-file=../.env node_modules/@playwright/test/cli.js test -c playwright.swagger.config.ts
```

Tests use disposable accounts, delete their own books and deactivate accounts. Traces, screenshots and videos are disabled in this suite to avoid recording tokens. `E2E_BASE_URL` and `E2E_API_URL` allow other origins. Results are written to `frontend/artifacts/playwright-swagger.json`; see [validation](validation.md) for actually recorded executions.

</details>
