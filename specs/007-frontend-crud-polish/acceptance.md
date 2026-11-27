# Aceitação — Selects e gerenciamento completo do acervo

| Critério / requisito | Dado | Quando | Então | Teste |
|---|---|---|---|---|
| CA-UX-001 / RF-UX-001 | select rotulado habilitado | usar teclado e selecionar opção | valor muda, foco visível e seta única não intercepta clique | Select.test.tsx, Playwright |
| CA-UX-002 / RF-UX-002 | tela desktop/mobile em ambos os temas | abrir livros e filtros | ações legíveis e layout sem sobreposição | Playwright e screenshots locais |
| CA-UX-003 / RF-UX-003 | ADMIN/LIBRARIAN autenticado | cadastrar, consultar, editar e recarregar | todos os dados persistem e detalhes/lista refletem atualização | integration.spec.ts |
| CA-UX-004 / RF-UX-003 | livro existente | cancelar exclusão e depois confirmar | cancelamento preserva; confirmação remove e ajusta paginação | library.spec.ts, integration.spec.ts |
| CA-UX-005 / RF-UX-004 | entrada inválida, ISBN duplicado ou servidor indisponível | salvar | erro visível, valores preservados e nenhum sucesso falso | BookEditor.test.tsx, library.spec.ts |
| CA-UX-006 / RF-UX-003/004 | READER ou gravação pendente | abrir ações ou tentar reenviar | escrita indisponível ao leitor; envio duplicado/troca durante gravação impedidos | library.spec.ts |

Usar testes existentes quando comprovarem o comportamento; ampliar apenas para lacunas reais. Registrar resultados sem marcar conclusão antecipada.
