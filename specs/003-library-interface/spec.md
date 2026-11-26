# Interface da biblioteca

## Contexto e objetivo

Entregar a interface corporativa do Library Management e demonstrar Spec-to-Production Engineering. Consulte a constituição antes de alterar esta feature.

## Requisitos funcionais

- RF-UI-001: Autenticar e restaurar sessão com access token somente em memória e refresh single-flight via cookie HttpOnly.
- RF-UI-002: Apresentar dashboard e livros exclusivamente com dados da API, estados carregando/vazio/erro e nova tentativa.
- RF-UI-003: Cadastrar, consultar, editar e excluir livros com RHF/Zod; confirmar exclusão; filtros, ordenação e paginação no servidor.
- RF-UI-004: Restringir mutações a ADMIN/LIBRARIAN e administração de usuários a ADMIN; redirecionar visitantes para login.
- RF-UI-005: Oferecer interface responsiva, teclado, foco de diálogo, contraste e temas claro/escuro.
- RF-UI-006: Administrar perfil e status de usuários e refletir erros Problem Details sem expor dados sensíveis.

## Requisitos não funcionais

TypeScript strict e FSD; dependências descendentes, módulos coesos e sem any. Contraste, rótulos e teclado obrigatórios. O navegador não armazena tokens em localStorage. Nenhuma métrica simulada pode ser apresentada como execução real.

## Histórias e cenários

Como entrevistador, quero explorar a metodologia e verificar resultados reais separadamente. Como bibliotecário, quero administrar o acervo com feedback claro. Como leitor, quero consultar sem permissão de mutação.

Sucesso: dados válidos produzem estado confirmado; erro de rede permite nova tentativa; 401 renova uma vez, expiração redireciona; 403 informa acesso insuficiente. Borda: acervo vazio, última página, clique repetido, desmontagem, pausa e velocidade alterada. Não há empréstimos, multas, reservas nem execução de agentes externos.

## Regras de negócio e restrições

Papéis e validação do backend prevalecem. Filtros são parametrizados via URLSearchParams. A simulação é determinística; cada retorno tem uma falha observável e revalidação posterior. Nenhuma evidência é inventada.
