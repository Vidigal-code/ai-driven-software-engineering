# Aceitação — Swagger com exemplos executáveis

| Critério / requisito | Dado | Quando | Então | Teste |
|---|---|---|---|---|
| CA-SWAG-001 / RF-SWAG-001 | OpenAPI publicado | ler requests/responses | exemplos completos, tipos corretos, erros aplicáveis e 204 sem corpo | OpenApiExamplesIT |
| CA-SWAG-002 / RF-SWAG-002 | operação selecionada | consultar parâmetros e schemas | regras, limites, permissões e header claros; cookie não editável | OpenApiExamplesIT |
| CA-SWAG-003 / RF-SWAG-003 | usuário com conta própria | seguir tutorial | autentica e usa Bearer sem segredo publicado ou persistido | OpenApiExamplesIT, swagger.spec.ts |
| CA-SWAG-004 / RF-SWAG-004 | Swagger nas portas 3000 e 8080 | executar requisição | mesma origem correta sem relaxar CSP/CSRF | swagger.spec.ts |
| CA-SWAG-005 / RF-SWAG-005 | banco PostgreSQL isolado | executar exemplos válidos, duplicados, inválidos e sem permissão | 201/200/204 e 400/401/403/404/409 coerentes | OpenApiExamplesIT |

Evidências somente após execução; credenciais de fixtures nunca substituem autenticação real na aplicação.
