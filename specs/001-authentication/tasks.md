# Tarefas — Autenticação

- [x] AUTH-T01 (AUTH-001/002; backend): DTOs, User, migrations, AuthService e testes AuthServiceTest. Depende da especificação. Concluído com RED/GREEN e registro/login válidos/inválidos.
- [x] AUTH-T02 (AUTH-003; segurança/backend): TokenService/SecurityConfig e TokenServiceTest. Depende T01. Assinatura, issuer, audience e expiração validados.
- [x] AUTH-T03 (AUTH-004/005; segurança/backend): RefreshToken, repository lock, cookies/filter e testes AuthApiIT. Depende T02. Rotação/replay/logout/CSRF comprovados.
- [x] AUTH-T04 (AUTH-006/007; backend/QA): UserController/UserService e AuthApiIT. Depende T03. Controle de perfis e inatividade passam.
- [x] AUTH-T05 (AUTH-008; DevOps/backend): BootstrapAdmin e BootstrapAdminTest, documentação de ambiente. Depende T01. Nenhum segredo fixo.
- [x] AUTH-T06 (QA): Maven verify, Sonar, revisão de segurança e integração frontend. Depende T01..05. Relatórios reais conferidos: 81 testes backend, 2 E2E reais e zero issues abertas após revisão fundamentada de S4502.
- [x] AUTH-T07 (AUTH-005; segurança/backend): alinhar seleção de rotas do AuthRequestFilter ao matcher oficial MVC, preservando header, Origin e limite de tentativas. Regressão AuthRequestFilterTest e suíte HTTP devem passar sem remover proteções.

Evidência final: Maven clean verify aprovado com 81 testes. S4502 foi revisado como falso positivo específico da estratégia alternativa, com testes de caminhos codificados, header e Origin e sete verificações HTTP. Consulta ao servidor confirmou zero issues abertas e gate OK. A justificativa está em docs/security.md, artifacts/csrf-review.json e artifacts/sonar-reviewed.json. Nenhuma regra, perfil ou asserção foi enfraquecido; a execução remota de CI continua não registrada.
