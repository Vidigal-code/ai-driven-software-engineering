# Especificação — Selects e gerenciamento completo do acervo

## Contexto e objetivo
O CRUD já possui integração REST, mas precisa de ações mais claras e layout consistente. Padronizar todos os selects e suas setas, organizar a página de livros e comprovar cadastro, consulta, edição/atualização e exclusão pela interface.

## Requisitos
- RF-UX-001: todos os selects do frontend compartilham aparência, seta ChevronDown, altura, espaçamento, borda, foco e estados disabled/erro; preservar semântica nativa, labels e teclado.
- RF-UX-002: página de livros apresenta hierarquia clara de título/ação principal, filtros identificados, tabela com ações explícitas e paginação; funcionamento responsivo nos temas claro/escuro sem sobreposição de texto/seta.
- RF-UX-003: ADMIN/LIBRARIAN cadastra todos os campos do livro, consulta detalhes, abre edição preenchida, salva alterações persistidas e exclui mediante confirmação. Cancelar mantém dados; READER apenas consulta.
- RF-UX-004: formulários agrupam identificação, publicação e exemplares; erros de campo/servidor permanecem visíveis e preservam dados; envio em andamento evita duplicação. Listagem/detalhes/dashboard refletem mutações da API.
- RF-UX-005: testes públicos comprovam CRUD, filtros, seleção por teclado, validações, cancelamento, permissões e layout desktop/mobile. Não usar dados simulados como substituição permanente da API.

## Casos de erro e borda
ISBN duplicado (409), cópias disponíveis acima do total, ano futuro, sessão sem permissão, falha de rede e exclusão do último item da página. Não permitir que resposta antiga feche ou altere um formulário novo. Exibir feedback de loading/sucesso/erro e estado vazio sem números fictícios.

## Restrições
Preservar arquitetura FSD, React/TypeScript strict, TanStack Query, React Hook Form/Zod e Lucide existentes. Sem biblioteca de select adicional. Não ampliar para empréstimos ou criar endpoints novos de usuários. Layout deve respeitar reduced-motion e navegação por teclado.
