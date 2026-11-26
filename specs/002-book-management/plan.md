# Plano — Livros

## Arquitetura
Java21/Spring Boot4.2.0; BookController→BookService→BookRepository (JpaRepository/JpaSpecificationExecutor). BookRules normaliza/valida ISBN e invariantes com Clock injetado. Mapper produz records BookResponse. BookSearch aplica CriteriaBuilder parametrizado. Pagination valida whitelist e tamanho. DashboardService usa agregação e página recente limitada. DTOs Bean Validation validam contratos e serviço repete invariantes de domínio necessárias.

## Modelo de dados
Tabela books UUID PK, isbn varchar13 UNIQUE, strings limitadas, publication_year, total_copies, available_copies, timestamps timestamptz, version otimista. CHECK total>=0/available>=0/available<=total/ano>=1. Índices em created_at e categoria; banco garante unicidade sob concorrência. ISBN13 é forma canônica e ISBN10 equivalente converte para prefixo978.

## Contratos
POST /api/v1/books201 com Location; GET /books200 página {content,number,size,totalElements,totalPages}; GET /books/{id}200; PUT /books/{id}200; DELETE /books/{id}204. BookRequest inclui todos campos editáveis; opcionais publisher/category/description. Filtros title,author,isbn,category,available; page0,size20,sort=createdAt,desc. Ordenação permitida title,author,isbn,category,publicationYear,totalCopies,availableCopies,createdAt,updatedAt. GET /dashboard/summary retorna agregações e recentBooks.

## Testes/ordem/segurança
Ciclos RED/GREEN no BookRules/BookService por interfaces públicas e Mockito somente repository como fronteira de banco. MockMvc/Testcontainers PostgreSQL valida API/JPA/Flyway, filtros, transações, ISBN concorrente, roles e erros. JaCoCo mínimos80% linhas/75% branches em regras/serviços; exclusões apenas configuração/DTO boilerplate justificadas. PostgreSQL publica porta5432 configurável em0.0.0.0 conforme solicitação explícita posterior; serviços internos usam hostname postgres. Consistência com unique constraint vence pré-check amigável.

## Impactos/riscos
Pesquisa de ISBN reutiliza checksum/canonicalização em BookRules quando o filtro é ISBN10 completo válido; os demais filtros preservam busca parcial escapada em BookSearch. Regressão unitária da normalização precede implementação e regressão HTTP/PostgreSQL garante ligação do filtro ao catálogo canônico.

Busca contains pode fazer scan; páginas limitadas evitam retorno ilimitado. Para acervos maiores avaliar índice trigram mediante medição. Agregações são calculadas no banco; sem cache prematuro. Atualizações concorrentes podem retornar409 pelo controle otimista em vez de sobrescrever dados.
