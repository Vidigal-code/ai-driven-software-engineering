# Plano — Swagger com exemplos executáveis

## Preparação e decisões
Stack e arquitetura existentes identificadas nos manifests: Spring MVC/DTOs/serviços/JPA, Spring Security e PostgreSQL. Context7 consultado para Springdoc, Swagger Core e configuração de origens. Usar OpenApiCustomizer, modelos Example/Schema/Server e anotações oficiais, sem APIs obsoletas ou outra biblioteca. Catálogo único para exemplos evita divergência; schemas continuam derivados dos DTOs.

## Implementação
1. Teste público RED em /v3/api-docs antes da alteração documental.
2. Exemplos e descrições por operação; respostas application/json e application/problem+json; headers relevantes e 204 sem corpo.
3. Servidor relativo `/`, orientações de autenticação, cookie oculto e configuração UI sem persistir autorização.
4. Defaults de origens explícitos nas configurações; preservar overrides e segredos locais.
5. Testes extraem os exemplos publicados, substituem somente identificadores/credenciais efêmeras para isolamento e executam autenticação/CRUD/erros com PostgreSQL real.
6. Navegador verifica Swagger direto e pelo proxy; guia bilíngue e evidências.

## Segurança, impacto e riscos
Nenhuma migração ou mudança do modelo de dados. Manter proteção CSRF, CSP e autorização; não relaxar CORS para wildcard. Tokens somente em memória; testes sem traces/screenshot com credenciais. Origem relativa evita porta perdida no proxy. Exemplos precisam seguir regras do serviço, inclusive checksum ISBN. Dados de teste são exclusivos e removidos quando possível. Builds e testes Maven não podem disputar o mesmo target.

## Validação
JUnit/MockMvc/Testcontainers, JaCoCo e SpotBugs; Playwright para comportamento público; Sonar por arquivo compatível e análise completa Java; análise nativa para YAML/Markdown. Revisar contrato e padrões separadamente.

## Correção da medição de cobertura
O scanner completo encontrou 0 issues, mas reprovou cobertura de código novo em 55%: a configuração global do JaCoCo instrumentava somente service/security e omitia as classes de documentação exercitadas pelos testes HTTP. A correção usa instrumentação completa e dois relatórios nativos: `target/site/jacoco` preserva o escopo de negócio consumido pelo coletor; `target/site/jacoco-full` informa toda a execução ao Sonar. O check de negócio continua com 80% de linhas e 75% de branches, e o gate Sonar não é reduzido. Relatórios são gerados a partir dos mesmos dados reais de execução.
