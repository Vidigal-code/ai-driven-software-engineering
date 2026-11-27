# Plano — Selects e gerenciamento completo do acervo

## Arquitetura e decisões
React 19.3.1, TypeScript 5.9.3, Vite 7.3.8, Tailwind 4.3.5, React Query 5.108.4, React Hook Form 7.92.0, Zod 4.6.7 e Lucide 1.81.0. Consultar Context7 para select nativo React e estilos compatíveis antes de implementar. Manter direção app → pages → widgets → features → entities → shared.

Componente Select em shared/ui envolve select nativo e ChevronDown decorativo, aceita atributos tipados e ref; CSS centralizado para appearance, padding e foco. Substituir selects de livros, usuários, workflow e terminal sem mudar contratos. Usar semântica nativa evita recriar gerenciamento de teclado/foco. Nenhuma API deprecated ou dependência nova necessária.

## Fluxo e dados
Página orquestra consultas e mutações existentes; editor cuida de formulário, tabela de apresentação e ações. Reorganizar filtros e grupos do editor com nomes acessíveis. Endpoints POST/GET/PUT/DELETE /api/v1/books existentes; IDs, timestamps e dados vêm da API. React Query invalida books/dashboard; erro mantém formulário e valores. Impedir fechamento/troca durante operação pendente quando necessário para evitar corrida.

## Ordem e validação
1. Auditar lacunas e testar um comportamento faltante (RED).
2. Implementar mínimo, executar GREEN e refatorar.
3. Padronizar select e layout; teste de seleção nativa/teclado e formulário.
4. Playwright CRUD completo contra API/PostgreSQL e cenários de erro/controle de acesso; revisão visual desktop/mobile claro/escuro.
5. Lint, typecheck, cobertura, build, Sonar dos arquivos suportados e revisão independente; atualizar container frontend.

## Riscos
Não sobrescrever alterações dos demais agentes. Rotas de Swagger terão teste separado. Não alterar regras de autorização para facilitar a demonstração. Manter foco de modal, mensagens de erro e largura dos controles acessíveis. Testes usam dados descartáveis e não armazenam credenciais em artefatos.
