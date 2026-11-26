# Constituição de desenvolvimento

## Autoridade e preparação

As diretrizes globais de `~/.codex/AGENTS.md` são a fonte global. Esta constituição complementa essas diretrizes para o monorepo; instruções explícitas do usuário prevalecem. Consulte manifests, lockfiles, configurações e documentação antes de alterar código. Identifique linguagens, versões, ferramentas e arquitetura; execute MCPs pertinentes e consulte Context7 para as APIs utilizadas. Leia configuração e escopo do GitPageDocs antes de escrever. Preserve mudanças existentes e dados sensíveis.

Antes da implementação registre stack, convenções oficiais, solução nativa disponível, APIs obsoletas a evitar, solução mínima, impactos de segurança/performance/escalabilidade/manutenção e interfaces de teste. Leia as skills aplicáveis, incluindo as instaladas em `D:/Prompts/.claude/skills`. Falha de ferramenta deve ser registrada com validação alternativa, nunca convertida em aprovação fictícia.

## Engenharia e arquitetura

Adote SOLID, Clean Code, DRY, KISS e YAGNI onde agregam valor. Use módulos pequenos com responsabilidade única, baixo acoplamento e alta coesão. Aplique padrões somente mediante necessidade concreta; evite factories, repositories adicionais ou camadas delegadoras sem benefício. Prefira APIs nativas, estáveis, suportadas e compatíveis; evite APIs deprecated. Separe domínio, negócio, infraestrutura, apresentação e persistência.

Backend: Java 21, Spring Boot e gerenciamento de dependências pelo BOM; Spring MVC, Security, Data JPA/Hibernate, Bean Validation, Flyway e PostgreSQL. Controllers traduzem HTTP e DTOs, services aplicam transações/regras, repositories persistem; entidades não são contratos REST. UUID identifica recursos. Nomes Java em inglês, classes PascalCase, métodos camelCase, constantes UPPER_SNAKE_CASE. Migrações são incrementais e imutáveis após aplicadas.

Frontend: React e TypeScript strict, Vite e Feature-Sliced Design. Direção `app → pages → widgets → features → entities → shared`. Slices do mesmo nível não dependem entre si. APIs públicas limitam imports. React Query gerencia estado remoto; React Hook Form e Zod validam formulários. Estado local cuida de interação local. Componentes PascalCase; funções camelCase; sem `any` em fronteiras, argumentos flag ou funções com mais de três argumentos. Configurações e tokens visuais têm fonte única.

## Configuração, erros e observabilidade

Valores variáveis entre ambientes vêm de configuração validada. Segredos vêm de ambiente ou secret manager, nunca de fontes, logs ou exemplos. `.env.example` contém apenas placeholders e parâmetros ilustrativos. Tipar interfaces públicas; validar entradas/saídas nas fronteiras; sanitizar conforme o destino. Consultas são parametrizadas. Trate erros com Problem Details e códigos HTTP apropriados. Capture exceções apenas para recuperação ou contexto útil; não silencie falhas. Logs estruturados omitem senhas, tokens e dados pessoais desnecessários.

Retry, timeout, backoff, fallback, circuit breaker, rollback, idempotência, cache e rate limiting exigem uma necessidade concreta. Considere complexidade, memória, concorrência, pooling, paginação, lazy loading, índices e prevenção de N+1. Meça antes de otimizações complexas.

## Segurança

Aplique menor privilégio, validação nas fronteiras e proteção às categorias OWASP relevantes. Registro público cria somente READER. ADMIN administra usuários/livros; LIBRARIAN administra livros; READER apenas consulta. A autorização do servidor prevalece sobre controles visuais. Use hash seguro de senha, JWT validado por assinatura/expiração/emissor/audiência, access token curto em memória, refresh aleatório com hash persistido, expiração, rotação e revogação. Configure cookie HttpOnly, SameSite e Secure conforme HTTPS. Proteja endpoints de cookie contra CSRF; CORS usa allowlist explícita. Limite tentativas de autenticação. Restrições de unicidade no banco protegem concorrência. Não exponha stack traces ou segredos em erros.

Containers usam estágios separados, runtime mínimo e usuário não privilegiado quando suportado. Por instrução explícita do usuário, frontend, backend e PostgreSQL escutam em 0.0.0.0 e publicam portas configuráveis no host (3000, 8080 e 5432). O host acessa por localhost; containers acessam outros serviços pelo DNS do Compose. Swagger é configurável e deve ser desativado/restrito em produção. Usuários demonstrativos exigem configuração explícita e nunca são ativados automaticamente em produção.

## SDD e TDD

Cada feature precisa, antes do código, de `spec.md`, `plan.md`, `tasks.md`, `acceptance.md` em `specs/`. Requisitos, critérios, tarefas, testes e resultados possuem vínculo rastreável. Especificação registra sucesso, erro, borda, segurança, restrições e contratos. Checkboxes somente mudam após evidência real.

TDD obrigatório: um comportamento público por ciclo. Escreva o teste, execute RED por comportamento ausente (não compilação/configuração), implemente o mínimo, execute GREEN; então refatore e reexecute. Os seams aprovados são serviços/regras públicas do backend, API REST, máquina pública da simulação e formulários/controles observáveis pelo usuário. Não enfraqueça testes ou critérios para passar. Teste sucesso, erro, borda e validação conforme impacto. Use Mockito apenas em fronteiras, MockMvc para HTTP e Testcontainers/PostgreSQL para semântica real de persistência; H2 não substitui PostgreSQL. Frontend usa Vitest/Testing Library e Playwright. Controle relógio/timers nos testes da simulação.

## Quality Gates e revisão

Após mudanças analise cada arquivo compatível com SonarQube; resolva projectKey pela configuração ou descoberta e informe ausência de projeto. Reanalise após correções até zero issues. Para linguagens não suportadas use analisador da stack. Não confunda análise de snippets com aprovação de um projeto no servidor. Revise também contra esta constituição e skills de clean code. Revise separadamente padrões e aderência à especificação.

Gates obrigatórios: compilação, testes unitários/componentes/integração/end-to-end aplicáveis, lint, typecheck, build, análise estática, dependências, smoke/health e Docker Compose. Cobertura mínima da lógica de negócio: 80% linhas e 75% branches no backend e frontend. Exclusões exigem justificativa técnica explícita; não excluir regras difíceis para melhorar métricas. Falhas bloqueiam aprovação. Reporte ferramenta indisponível, erro, teste pulado e pendência sem declarar conclusão.

## Interface e demonstração

Forneça acessibilidade por teclado, rótulos, foco, contraste, feedback de erro/loading/vazio, responsividade, temas claro/escuro e `prefers-reduced-motion`. A biblioteca usa dados da API. A simulação tem máquina de estados independente, tipada e testável, com cleanup de timers, quatro cenários, retornos por falha e controles de reprodução.

O Studio exibe permanentemente `Modo demonstração — execução simulada`. Logs, cobertura e aprovações da simulação são identificados como demonstrativos. Evidências reais ficam separadas e mostram ausência quando ainda não registradas. Código do navegador não é executado dinamicamente. Não invente métricas de produtividade, cobertura, segurança ou duração.

## Documentação, autoria e encerramento

Documentação geral usa título e dois blocos equivalentes `<details>`: `### 🇧🇷 Descrição em Português`/`Ver Detalhes` e `### 🇺🇸 English Description`/`View Details`. AGENTS, `.specify`, `.ai` e `specs` são integralmente PT-BR, preservando identificadores técnicos. Skills possuem frontmatter válido. Centralize regras e referencie-as, evitando cópias divergentes.

Código, comentários, metadados, commits, PRs e releases descrevem o projeto na voz dos autores humanos. Não atribua autoria ou coautoria a ferramentas, não adicione trailers, assinaturas ou links de sessão. A documentação da metodologia e sua interface podem mencionar agentes e ferramentas por serem parte explícita do produto; isso não é crédito autoral. Não invente autoria humana nem resultados de execução.

Uma feature termina somente com especificação, plano, tarefas, critérios, testes, implementação, revisão, segurança, documentação, integração e gates comprovados. O projeto só está aprovado quando todos os critérios de `specs/` estiverem validados; limitações e pendências permanecem visíveis no relatório final.
