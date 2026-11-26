# Especificação — Livros e dashboard

## Contexto e objetivo
Gerenciar catálogo e disponibilidade da biblioteca. Não inclui empréstimos, multas, pagamentos ou reservas.

## Requisitos
- BOOK-001: cadastrar Book com UUID, title, author, isbn, publisher, publicationYear, category, description, totalCopies, availableCopies, createdAt, updatedAt; DTOs distintos de entidades.
- BOOK-002: título/autor/ISBN obrigatórios; título até200, autor150, editora150, categoria100, descrição5000; ano1..ano atual; quantidades inteiras não negativas, disponível<=total.
- BOOK-003: ISBN10 ou13 validado por checksum, removendo somente hífens/espaços e convertendo10 em13 canônico; unicidade inclusive concorrência no PostgreSQL.
- BOOK-004: consultar individual, listar, filtrar título/autor/ISBN/categoria/disponibilidade, paginar e ordenar com whitelist; páginas máximo configurado100.
- BOOK-004a: pesquisa por ISBN10 completo válido encontra o mesmo registro canônico ISBN13; hífens/espaços são normalizados. Fragmentos e entradas que não representam ISBN completo válido continuam buscas literais parametrizadas.
- BOOK-005: editar com mesmas invariantes; excluir; id desconhecido404, ISBN duplicado409, entrada inválida400.
- BOOK-006: ADMIN/LIBRARIAN podem escrever; READER pode ler; sem autenticação401 e sem permissão403.
- BOOK-007: dashboard real com totalTitles,totalCopies,availableCopies,unavailableCopies,totalCategories,recentBooks; agregações no banco e limite para recentes.

## Histórias e cenários
Bibliotecário cadastra/atualiza/remove exemplares; leitor pesquisa acervo e disponibilidade; administrador acompanha indicadores. Edição não permite ISBN de outro livro. ISBN10 e equivalente13 não podem representar dois registros. Concorrência de dois cadastros equivalentes deve criar somente um. Acervo vazio retorna lista/indicadores zerados.

## Não funcionais e bordas
Transações no serviço; constraints e índices PostgreSQL; consultas bind/Criteria e sort validado; não retornar entidade JPA; evitar N+1. Ano futuro, valores ausentes/negativos, disponíveis>total, checksum incorreto, sort arbitrário e páginas negativas retornam400. Logs não incluem dados sensíveis. Não inventar livros para substituir integração real.
