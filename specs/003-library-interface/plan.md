# Plano — Interface da biblioteca

## Integração de navegador com serviços reais
Uma suíte Playwright separada em tests/e2e/integration.spec.ts usa Compose e credenciais administrativas fornecidas somente por ambiente para preparar um operador descartável. A interface executa login, CRUD, pesquisa, recarga com refresh e logout; uma conta READER permanece sem ações de escrita. Ao terminar, exclui apenas livros criados pelo teste e desativa as contas descartáveis. Traces ficam desativados nessa suíte para evitar registrar credenciais/cookies. A suíte padrão com mocks valida contratos e erros independentemente; ambas são executadas pelo CI. A configuração dedicada exige backend disponível e não pula testes silenciosamente.

## Arquitetura e decisões

React 19.3.1, TypeScript 5.9.3 strict, Vite 7.3.8, React Router 7.18.7, TanStack Query 5.108.4, React Hook Form 7.92.0, Zod 4.6.7, Tailwind 4.3.5, React Flow 12.12.1. Vitest 4.1.12/Testing Library e Playwright 1.65.1 validam comportamento. Versões consultadas no registry e APIs oficiais via Context7. APIs atuais object-options e createRoot; não usar ReactDOM.render ou react-flow-renderer legado.

FSD: app compõe providers/router; pages coordenam; widgets renderizam regiões; features implementam ações; entities modelam contratos; shared centraliza HTTP/UI/config. Reducer puro da simulação não depende de React Flow; um hook agenda e cancela o próximo evento. Query gerencia somente dados remotos. A solução evita store global além da sessão.

## Contratos e modelo

API relativa /api/v1. Auth {accessToken,tokenType,expiresIn,user}; mutações auth enviam credentials include e X-Requested-With: XMLHttpRequest. Page {content,number,size,totalElements,totalPages}; number inicia zero. Book possui os campos da especificação 002. User {id,name,email,role,active,createdAt,updatedAt}. Dashboard {totalTitles,totalCopies,availableCopies,unavailableCopies,totalCategories,recentBooks}.

Workflow possui cenário, cursor, status de reprodução, velocidade e histórico determinístico de eventos. Estados de nó e progresso são derivados; retrocesso reconstitui o mesmo estado sem duplicar timers.

## Segurança e performance

Access token em memória; refresh coalescido e retry limitado a uma renovação; entradas/saídas validadas com Zod; React escapa trechos; sem eval. Paginação no servidor limita payload. Câmera e animações opcionais respeitam reduced-motion. Cookies dependem da configuração correta do proxy/HTTPS.

## Testes, riscos e ordem

Seams aprovados na constituição: máquina pública, cliente HTTP e formulários/controles acessíveis. TDD incremental: teste comportamental RED, implementação mínima GREEN, revisão e regressão. Cobertura 80% linhas/75% branches da lógica de negócio (models e HTTP); composição visual verificada por RTL/Playwright. Primeiro harness, máquina/validação, sessão/API, formulários, páginas, integração e E2E. Riscos: compatibilidade de navegador fullscreen/clipboard, indisponibilidade de API/Docker; tratar falhas visíveis e registrar limites reais.
