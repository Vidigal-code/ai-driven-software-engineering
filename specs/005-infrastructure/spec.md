# Especificação — infraestrutura e entrega

## Contexto e objetivo
INF-001: o monorepo deve ser executável localmente com três serviços Docker: frontend, backend e PostgreSQL. A entrega deve ser reproduzível, segura e acompanhada de evidências reais. O público inclui desenvolvedores, revisores e pessoas que assistirão à demonstração.

## Requisitos funcionais
- INF-002: `docker compose up --build -d` inicia os serviços após configuração do ambiente. Frontend usa porta padrão 3000, backend 8080 e PostgreSQL 5432; todas são configuráveis e publicadas em `0.0.0.0`, acessíveis também por `localhost`. Entre containers, usar DNS dos serviços e as portas internas. Esta regra incorpora a instrução posterior do usuário para acesso dentro e fora dos containers.
- INF-003: health checks e dependências aguardam banco e backend saudáveis; volume mantém dados entre reinicializações. PostgreSQL publica também no loopback IPv6 `[::1]` para clientes que resolvem localhost por IPv6, preservando a publicação IPv4 em `0.0.0.0`.
- INF-004: imagens usam builds multi-stage e usuários sem privilégios; frontend compilado é servido por Nginx com proxy de mesma origem para API, OpenAPI, Swagger e health.
- INF-005: `.env.example` documenta variáveis sem segredos reais. Um inicializador local gera segredos aleatórios sem sobrescrever arquivos existentes. Bootstrap ADMIN só ocorre por configuração explícita.
- INF-006: GitHub Actions executa build, testes, cobertura, análise estática, auditoria de dependências, lint, typecheck, Compose, containers, smoke, E2E e scan de vulnerabilidades. Falhas bloqueiam os jobs dependentes.
- INF-007: coleção Postman v2.1 importável cobre Authentication, Books, Users, Dashboard, Validation, Security e Health; usa variáveis e captura token/ID. Inclui status HTTP, validações, duplicidade e acesso proibido.
- INF-008: smoke integrado exercita health, registro, login, CRUD, RBAC, filtros, dashboard, refresh, logout e OpenAPI contra serviços reais, sem expor segredos nos resultados.
- INF-009: evidências identificam comandos, status e relatórios reais; ausência de execução é registrada como pendência.
- INF-010: coletor local produz manifesto público limitado a contagens, cobertura, fonte e data dos relatórios; arquivos ausentes ficam unavailable, relatórios malformados falham sem publicar aprovação. O manifesto representa um snapshot, não execução em tempo real.

## Requisitos não funcionais e regras
- INF-RN-01: nenhuma senha, chave JWT ou access/refresh token real entra no controle de versão, imagens ou logs.
- INF-RN-02: redes separam o tráfego de dados, volume persistente e permissões mínimas. A publicação externa explícita dos três serviços preserva autenticação e autorização. Segredos de produção vêm de secret manager/orquestrador.
- INF-RN-03: versões de dependências são controladas por Maven BOM e lockfile npm; actions são fixadas por SHA e atualizadas por Dependabot.
- INF-RN-04: cobertura de negócio mínima 80% linhas e 75% branches em ambas as aplicações. Vulnerabilidades HIGH/CRITICAL bloqueiam CI; não existem supressões genéricas.
- INF-RN-05: o proxy não altera semântica de cookies ou autorização. CSP admite estilos inline exigidos por React Flow, mas não código inline arbitrário.

## Histórias e cenários
- Como desenvolvedor, configuro variáveis e inicio a aplicação com Compose para reproduzir a demonstração.
- Como revisor, importo Postman e observo que um READER recebe 403 ao tentar criar livros.
- Como mantenedor, recebo falha no pipeline quando um teste, cobertura, análise ou inicialização falha.
- Sucesso: banco saudável → migrations → backend saudável → frontend acessível → smoke aprovado.
- Erro: segredo ausente, DB indisponível, dependência vulnerável ou aplicação sem health bloqueia a entrega.
- Borda: `.env` existente não é sobrescrito; portas ocupadas exigem reconfiguração; execução repetida não deve apagar o volume nem criar usuários privilegiados implicitamente.

## Restrições
Sem publicação externa automática, contratação de serviços ou alterações em outros projetos. Não usar H2 para validar PostgreSQL. Não alegar pipeline remoto aprovado com base apenas no YAML. Não executar empréstimos, multas, reservas ou pagamentos.
