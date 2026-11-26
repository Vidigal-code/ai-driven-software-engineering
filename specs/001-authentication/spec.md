# Especificação — Autenticação e administração

## Contexto e objetivo
Identificar operadores da biblioteca, controlar privilégios e permitir gestão administrativa sem cadastro público privilegiado. Não inclui provedores externos ou recuperação de senha.

## Requisitos e regras
- AUTH-001: registro com nome obrigatório (até100), email válido normalizado (até254), senha com pelo menos12 caracteres e no máximo72 bytes UTF8; cria READER ativo e nunca aceita role/status da entrada pública.
- AUTH-002: login retorna accessToken JWT, tokenType Bearer, expiresIn e user público; senha BCrypt; credenciais incorretas/inatividade retornam401 sem detalhar existência da conta.
- AUTH-003: JWT valida assinatura, expiração, emissor e audiência; configuração externa obrigatória; autorização consulta estado/perfil atual para bloquear desativação imediatamente.
- AUTH-004: refresh aleatório somente cookie HttpOnly/SameSite Strict; hash SHA256 persistido, expiração configurável, rotação transacional com lock; reutilização revoga a família e retorna401. Logout revoga família e limpa cookie.
- AUTH-005: POST auth exige X-Requested-With: XMLHttpRequest e Origin permitido quando presente; CORS allowlist; Secure configurável para HTTPS; proteção de força bruta por IP com capacidade limitada.
- AUTH-006: GET me retorna usuário autenticado; sem token/invalidade401. ADMIN gerencia usuários; LIBRARIAN escreve livros; READER somente consulta. Acesso insuficiente403.
- AUTH-007: ADMIN lista/consulta usuários e altera role/status validados; email único inclusive concorrência; id inexistente404; duplicação409.
- AUTH-008: bootstrap administrativo explicitamente habilitado por ambiente, sem senha fixa; jamais altera senha de usuário existente silenciosamente.

## Histórias e cenários
Como leitor quero criar conta e consultar livros. Como bibliotecário quero editar o acervo. Como administrador quero promover/desativar operadores. Login com senha errada, conta inativa, refresh expirado/reutilizado ou JWT alterado deve falhar. Registro com role arbitrário deve falhar400. Chamadas simultâneas de refresh não podem gerar dois sucessores válidos.

## Restrições não funcionais
Segredos/tokens nunca são logados. Tokens de acesso ficam em memória no navegador. Não há sessão HTTP persistida. Senhas nunca aparecem em DTOs. Todas as respostas de erro usam Problem Details. Banco PostgreSQL real valida unicidade/transações. Política inicial de rate limit por instância deve ser documentada para implantação distribuída.
