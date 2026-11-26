# Critérios de aceitação — infraestrutura e entrega

| Critério | Requisito/tarefa | Dado | Quando | Então | Validação |
| --- | --- | --- | --- | --- | --- |
| INF-CA01 | INF-002/003; T01 | Ambiente configurado e Docker disponível | `docker compose up --build -d --wait` | Três serviços saudáveis, frontend 3000 e backend 8080 acessíveis | Compose config/build/ps e smoke |
| INF-CA02 | INF-002/004; T01 | Imagens compiladas | Containers iniciam | Serviços usam UID não zero; frontend/backend/PostgreSQL publicam em 0.0.0.0 e respondem por localhost e DNS interno | docker inspect, Compose, TCP host e requisições entre serviços |
| INF-CA03 | INF-005; T02 | `.env` ausente | Inicializador executa | Segredos aleatórios são escritos só em `.env`, ignorado pelo Git | init-env e git check-ignore |
| INF-CA04 | INF-005; T02 | `.env` já existe | Inicializador executa novamente | Falha sem alterar seu conteúdo | Execução duplicada e hash |
| INF-CA05 | INF-007; T03 | Coleção Postman | Validação de schema e scripts | Pastas, variáveis e assertions válidas, sem credenciais reais | Schema Postman e JSON |
| INF-CA06 | INF-006; T04 | Pipeline configurado | Teste/lint/cobertura/scan falha | Job falha e entrega dependente não avança | Revisão YAML e execução CI quando disponível |
| INF-CA07 | INF-008; T05 | ADMIN configurado explicitamente | Smoke usa HTTP real | Cadastro/CRUD/refresh funcionam, READER recebe 403 e duplicata 409 | scripts/smoke.mjs |
| INF-CA08 | INF-009; T06 | Verificações executadas ou indisponíveis | Relatório consolidado | Resultados reais e pendências são distinguíveis, sem aprovação inventada | artifacts e docs/validation.md |
| INF-CA09 | INF-RN-01/02; T01/02 | Configuração pronta | Revisão de segurança | Sem segredo versionado ou bootstrap implícito; porta DB externa usa autenticação por senha | git diff, Compose, conexão autenticada e scan |
| INF-CA10 | INF-010; T07 | Nenhum relatório | coletar evidências | retorna unavailable, sem números inventados | collect-evidence.test.mjs |
| INF-CA11 | INF-010; T07 | Relatórios reais presentes | coletar evidências | usa totais/cobertura/data/fonte e distingue passed/failed/skipped | collect-evidence.test.mjs e manifesto local |
| INF-CA12 | INF-010; T07 | Relatório inválido | coletar | falha explícita e não publica snapshot de aprovação | collect-evidence.test.mjs |
