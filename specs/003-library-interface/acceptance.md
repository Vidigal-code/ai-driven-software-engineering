# Aceitação — Interface da biblioteca

Os critérios observam interfaces públicas. Os nomes de teste são referências previstas; a matriz final aponta a execução efetiva. Status inicial pendente.

| Critério / requisito | Dado | Quando | Então | Teste previsto |
|---|---|---|---|---|
| CA-UI-001 / RF-UI-001 | visitante sem sessão | abrir /books | redireciona ao login sem dados protegidos | library.spec.ts |
| CA-UI-001a / RF-UI-001 | credenciais válidas | enviar login | carrega usuário, mantém token em memória e abre dashboard | AuthForm.test.tsx, library.spec.ts |
| CA-UI-001b / RF-UI-001 | campos inválidos ou login401 | enviar | erro acessível, sem sessão | AuthForm.test.tsx |
| CA-UI-001c / RF-UI-001 | duas consultas recebem401 | renovar | um único refresh, ambas repetem uma vez | client.test.ts |
| CA-UI-001d / RF-UI-001 | refresh expirado | restaurar sessão | limpa acesso e pede login sem loop | client.test.ts |
| CA-UI-001e / RF-UI-001 | usuário autenticado | sair | logout, sessão e cache privado limpos | client.test.ts, library.spec.ts |
| CA-UI-002 / RF-UI-002 | dados persistidos | abrir dashboard | indicadores e recentes refletem API sem fallback fictício | library.spec.ts |
| CA-UI-002a / RF-UI-002 | consulta pendente/vazia/falha | abrir listagem | loading/vazio/erro com nova tentativa, respectivamente | teste de listagem |
| CA-UI-003 / RF-UI-003 | ADMIN/LIBRARIAN e dados válidos | cadastrar e consultar | livro retornado pela API aparece com disponibilidade | BookEditor.test.tsx, library.spec.ts |
| CA-UI-003a / RF-UI-003 | título/autor/ISBN/ano/cópias inválidos | salvar | erros identificam campos e impedem envio | book.test.ts, BookEditor.test.tsx |
| CA-UI-003b / RF-UI-003 | livro existente | editar título/cópias | listagem/detalhes atualizam e dashboard é invalidado | library.spec.ts |
| CA-UI-003c / RF-UI-003 | confirmação de exclusão | cancelar, depois confirmar | cancelar preserva; confirmar remove e atualiza lista | library.spec.ts |
| CA-UI-003d / RF-UI-003 | acervo diverso | pesquisar/filtrar título/autor/ISBN/categoria/disponibilidade, ordenar/paginar | parâmetros corretos; filtros reiniciam página; resultados da API | teste de listagem, library.spec.ts |
| CA-UI-003e / RF-UI-003 | ISBN existente | cadastrar | mostra409 e preserva campos | BookEditor.test.tsx |
| CA-UI-004 / RF-UI-004 | READER | consultar acervo | consulta habilitada sem ações de escrita/administração | library.spec.ts |
| CA-UI-004a / RF-UI-004 | READER/LIBRARIAN | abrir /users diretamente | nega acesso sem dados administrativos | library.spec.ts |
| CA-UI-004b / RF-UI-004 | resposta403 | aguardar operação | informa permissão insuficiente sem tentativa de elevação | client.test.ts/componente |
| CA-UI-005 / RF-UI-005 | teclado/mobile/reduced-motion | navegar e usar diálogo | nomes/foco visíveis, foco entra/retorna, layout utilizável, movimento reduzido | Playwright |
| CA-UI-005a / RF-UI-005 | tema atual | alternar e recarregar | preferência visual persiste, tokens não vão ao storage | Playwright |
| CA-UI-006 / RF-UI-006 | ADMIN e outro usuário | alterar role/status | linha reflete resposta real e erros são exibidos | library.spec.ts |

## Gate
Executar lint, typecheck, cobertura, build e navegador. docs/validation.md distingue mocks de integração real. Um teste de schema não comprova o fluxo da interface. Marcar tarefas somente com evidência.
