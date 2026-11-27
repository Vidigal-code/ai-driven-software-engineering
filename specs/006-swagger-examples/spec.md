# Especificação — Swagger com exemplos executáveis

## Contexto e objetivo
Facilitar a exploração da API no Swagger com exemplos completos, instruções de autenticação e testes que executem os contratos publicados. O navegador deve funcionar tanto pelo proxy do frontend quanto pela porta do backend.

## Requisitos
- RF-SWAG-001: publicar exemplos nomeados de cadastro/login, criação/atualização de livro, perfil e status de usuário; exemplos completos de sucesso e Problem Details com códigos aplicáveis a cada operação.
- RF-SWAG-002: descrever campos, obrigatoriedade, validações, permissões, filtros, paginação, ordenação e UUIDs; documentar o header de autenticação e cookies automáticos sem campo editável de cookie.
- RF-SWAG-003: mostrar roteiro login → Authorize → CRUD → refresh → logout, esclarecendo que registro cria READER e escrita requer ADMIN/LIBRARIAN. Usar exemplos ilustrativos sem credenciais ou tokens reais.
- RF-SWAG-004: Try it out usa a mesma origem da página em localhost:3000 e localhost:8080; allowlist local explícita inclui ambas as origens, com configuração por ambiente. Preservar CSP, CSRF, HttpOnly e autorização.
- RF-SWAG-005: testes de contrato executam os exemplos contra PostgreSQL; teste de navegador comprova o uso da UI e registra evidências reais.

## Histórias, erros e bordas
Como apresentador, quero executar exemplos sem montar JSON do zero. Como integrador, quero distinguir 400 de validação, 401 de autenticação, 403 de autorização, 404 de recurso ausente e 409 de duplicação. Exemplos inválidos são identificados como tais; 204 não possui corpo. Documentar ISBN único e disponível ≤ total, ano até o atual, página zero e limite configurável. Não criar usuário privilegiado automaticamente, persistir token no navegador nem alterar regras de negócio para facilitar exemplos.

## Restrições não funcionais
Usar APIs nativas do Springdoc/Swagger Core compatíveis com Java 21, Spring Boot 4.2.0 e Springdoc 3.2.1. Nenhuma dependência nova. Manter documentação geral bilíngue e evidências sem segredos.
