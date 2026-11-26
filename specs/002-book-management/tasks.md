# Tarefas — Livros

- [x] BOOK-T01 (BOOK-002/003; backend): BookRules/BookRulesTest, ISBN canônico e validações. Sem dependência além SDD. RED/GREEN por comportamento.
- [x] BOOK-T02 (BOOK-001/005; backend): Book, DTOs, mapper, repository, service e BookServiceTest. Depende T01. CRUD/inexistência/duplicação aprovados.
- [x] BOOK-T03 (BOOK-004; backend): BookSearch/Pagination/BookController. Depende T02. Filtros, sort whitelist e limites testados.
- [x] BOOK-T04 (BOOK-006; segurança): autorizações e Problem Details. Depende AUTH-T02, T03. HTTP401/403/404/409 comprovados.
- [x] BOOK-T05 (BOOK-007; backend): DashboardService/controller/projeção. Depende T02. Indicadores reais, incluindo acervo vazio.
- [x] BOOK-T06 (QA): LibraryApiIT, concorrência/PostgreSQL/Flyway e Maven verify. Depende T01..05. Relatórios reais com coverage e análise estática.
- [x] BOOK-T07 (BOOK-004a; backend/QA): corrigir filtro ISBN10 canônico em BookRules/BookSearch após RED de BookRulesTest e LibraryApiIT; preservar pesquisa parcial/literal. Depende T03. Concluir com regressões, cobertura e análise estática.
