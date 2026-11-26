# Plano técnico — infraestrutura e entrega

## Arquitetura e decisões
Compose configura frontend → backend → PostgreSQL. O frontend Nginx escuta `0.0.0.0:8080` internamente e expõe 3000 no host; backend escuta `0.0.0.0:8080`; PostgreSQL escuta todas as interfaces em 5432. Por instrução posterior do usuário, os três serviços publicam portas em `0.0.0.0` e permitem acesso por `localhost`; containers usam DNS `frontend`, `backend` e `postgres` e portas internas. Volume nomeado preserva o banco. `depends_on: service_healthy` evita avançar antes da readiness.

Os três serviços participam da rede `edge` para acesso entre containers e publicação no host; backend e PostgreSQL também compartilham `data`. A publicação do PostgreSQL requer sua associação à rede não interna; somente `data: internal: true` impedia a conexão pelo host neste Docker Desktop.

Backend compila com Maven Wrapper e JDK 21 em estágio de build; runtime Temurin 21 JRE executa como UID 10001. Frontend compila com Node 22 e `npm ci`; nginxinc/nginx-unprivileged serve `dist`. PostgreSQL 17 Alpine fornece persistência. Tags major/linha recebem correções upstream; CI verifica vulnerabilidades e Dependabot atualiza dependências controladas no repositório.

O scan real da base PostgreSQL encontrou libxml2 corrigível por atualização e bibliotecas Go vulneráveis no utilitário gosu. `postgres/Dockerfile` atualiza pacotes e remove esse utilitário porque o runtime já é iniciado explicitamente como `USER postgres`. O entrypoint oficial usa gosu somente no ramo UID 0; esse ramo deixa de ser necessário. A imagem derivada deve passar novamente por Trivy e health, sem supressão de vulnerabilidades.

O scan da base Nginx também identificou correções disponíveis em pacotes do sistema. O estágio runtime executa atualização de pacotes durante o build e retorna ao UID 101 antes da execução. Os resultados do scan da imagem final prevalecem sobre a reputação ou o nome da imagem base.

## Tecnologias e documentação consultada
Docker CLI/daemon 29.2.1, Compose 5.0.2 locais. Context7 `/docker/docs` consultado para health/dependências e builds; `/websites/github_en_actions` para permissions/cache/artifacts; `/postmanlabs/postman-collection` para eventos e coleção v2.1. GitPageDocs MCP 0.0.30 descobriu 20 tools e 7 resources via stdio no diretório do projeto; configuração de site ausente, leituras disponíveis. SonarQube local 26.9 está UP; nenhum projectKey encontrado, análise por perfil padrão deve ser identificada como snippet.

## Contratos e modelo de dados
A infraestrutura não redefine o domínio. Consome `/api/v1`, `GET /actuator/health`, `/v3/api-docs` e `/swagger-ui/index.html`. Todas as mutações de autenticação enviam `X-Requested-With: XMLHttpRequest`; cookies de refresh são transportados pelo proxy. Postman captura `accessToken`, `user.id` e `book.id`; senhas vêm das variáveis locais.

## Segurança
Segredos obrigatórios via ambiente, geração local criptográfica, sem defaults administrativos. Docker usa usuário não privilegiado, `no-new-privileges`, health e limites de recursos. Nginx aplica CSP, nosniff, política de referrer e restrição de framing. CI usa `contents: read`, actions fixadas por SHA, npm audit e Trivy com falha em HIGH/CRITICAL. Tokens de CI não são persistidos pelo checkout.

## Estratégia de testes e gates
Configuração é validada pelo `docker compose config --quiet`. Backend `./mvnw verify` inclui JaCoCo, SpotBugs e Testcontainers. Frontend executa lint, typecheck, Vitest/cobertura, build e Playwright. Smoke Node usa HTTP público real e assertivas de contrato; Postman usa assertions nativas e validação do schema. Sonar cobre Docker/JS/nginx quando suportado; YAML/JSON/env usam parsers/schema/comandos da stack. Falta de daemon ou rede é limitação de infraestrutura, nunca evidência RED de regra de negócio.

## Ordem, impactos e riscos
O coletor `scripts/collect-evidence.mjs` usa Node 22 e APIs nativas fs/promises e node:test, sem dependência adicional. Sua interface pública recebe o diretório raiz e retorna um manifesto tipado por contrato JSON. Lê somente JaCoCo XML, relatórios JUnit Surefire/Failsafe, Vitest JSON e coverage-summary.json em caminhos fixos. Não lê .env ou logs gerais. A gravação em frontend/public/evidence.json só ocorre após parsing completo. Testes usam diretório temporário e dados sintéticos identificados, nunca apresentados como evidência do projeto. O frontend exibe ausência ou snapshot com data/fonte, sem confundir com os cenários do Studio.

1. Criar especificação, plano, tarefas e critérios; confirmar contratos dos agentes.
2. Configurar arquivos Docker/Compose/ambiente e coleção Postman.
3. Configurar CI, smoke e validação estrutural.
4. Executar os gates após os aplicativos estarem disponíveis; corrigir falhas.
5. Consolidar evidências e atualizar checkboxes apenas após validação.

Imagens exigem rede e espaço local. Testcontainers depende de daemon Docker acessível. Tokens em cookie requerem HTTPS/Secure na implantação. Rate limiting em memória do backend exige estratégia compartilhada antes de múltiplas réplicas. A inicialização administrativa permanece opt-in; segredos gerados devem ser guardados em local seguro.
