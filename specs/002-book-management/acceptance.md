# Aceitação — Livros

| ID / requisito / teste | Dado | Quando | Então |
|---|---|---|---|
| BOOK-CA01 / BOOK-001 / BookServiceTest.createValidBook | entrada válida | cadastrar e consultar | dados persistidos em DTO |
| BOOK-CA02 / BOOK-003 / BookRulesTest.convertsIsbn10ToCanonical13 | ISBN10 com hífens | normalizar | ISBN13 canônico |
| BOOK-CA03 / BOOK-003 / BookServiceTest.rejectsDuplicateIsbn | ISBN existente | cadastrar novamente |409 |
| BOOK-CA04 / BOOK-002 / BookServiceTest.rejectsInvalidInput e BookRulesTest.rejectsInvalidIsbn | título/autor vazio, ISBN inválido, cópias inválidas, ano futuro | validar |400 |
| BOOK-CA05 / BOOK-005 / BookServiceTest.updateAndDelete | livro existente | editar/excluir | novos dados/ausência consultável |
| BOOK-CA06 / BOOK-004 / LibraryApiIT.filtersAndPaginates | acervo diverso | pesquisar/ordenar/paginar | subconjunto ordenado e metadados corretos |
| BOOK-CA07 / BOOK-003 / LibraryApiIT.concurrentDuplicateIsbn | mesmo ISBN em chamadas simultâneas | cadastrar | um201 e um409 |
| BOOK-CA08 / BOOK-006 / AuthApiIT.deniesAnonymousInvalidCredentialsAndReaderWrites | READER | tentar editar/excluir/criar |403 |
| BOOK-CA09 / BOOK-007 / LibraryApiIT.dashboardUsesRealBooks | livros persistidos | consultar dashboard | totais/categorias/recentes correspondem ao acervo |
| BOOK-CA10 / BOOK-004 / LibraryApiIT.rejectsInvalidPaging | sort fora whitelist/página negativa/tamanho excessivo | listar |400 |
| BOOK-CA11 / BOOK-004a / BookRulesTest.normalizesCompleteIsbnSearchAndPreservesFragments e LibraryApiIT.findsCanonicalBookByEquivalentIsbn10 | livro armazenado em ISBN13 | buscar ISBN10 válido equivalente ou fragmento | encontra o mesmo registro; filtro inválido continua literal sem erro de cadastro |

Resultados não são presumidos: tarefas só serão marcadas após relatórios de execução.
