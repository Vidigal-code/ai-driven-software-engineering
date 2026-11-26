# Engineering Workflow Studio

## Contexto e objetivo

Entregar a interface corporativa do Library Management e demonstrar Spec-to-Production Engineering. Consulte a constituição antes de alterar esta feature.

## Requisitos funcionais

- RF-WF-001: Renderizar 22 nós React Flow e rotas de retorno com estados PENDING/RUNNING/FAILED/RETRYING/PASSED/COMPLETED.
- RF-WF-002: Executar automaticamente Play/Pause/Resume/Stop/Restart, anterior/próximo, velocidades 0.5/1/2/4; cancelar timers.
- RF-WF-003: Demonstrar sucesso, ISBN duplicado, autorização READER e Quality Gate reprovado; falhas retornam para correção e revalidação.
- RF-WF-004: Mostrar detalhes/artefatos com realce de sintaxe e apresentação progressiva; nunca executar código dos trechos.
- RF-WF-005: Gerar logs a partir dos eventos com tempo relativo, agente, nível, filtro, auto-scroll, limpeza, cópia/exportação.
- RF-WF-006: Oferecer zoom, fit-view, tela cheia e acompanhamento do nó ativo; respeitar reduced-motion.
- RF-WF-007: Identificar permanentemente Modo demonstração — execução simulada e separar evidências reais indisponíveis.

## Requisitos não funcionais

TypeScript strict e FSD; dependências descendentes, módulos coesos e sem any. Contraste, rótulos e teclado obrigatórios. O navegador não armazena tokens em localStorage. Nenhuma métrica simulada pode ser apresentada como execução real.

## Histórias e cenários

Como entrevistador, quero explorar a metodologia e verificar resultados reais separadamente. Como bibliotecário, quero administrar o acervo com feedback claro. Como leitor, quero consultar sem permissão de mutação.

Sucesso: dados válidos produzem estado confirmado; erro de rede permite nova tentativa; 401 renova uma vez, expiração redireciona; 403 informa acesso insuficiente. Borda: acervo vazio, última página, clique repetido, desmontagem, pausa e velocidade alterada. Não há empréstimos, multas, reservas nem execução de agentes externos.

## Regras de negócio e restrições

Papéis e validação do backend prevalecem. Filtros são parametrizados via URLSearchParams. A simulação é determinística; cada retorno tem uma falha observável e revalidação posterior. Nenhuma evidência é inventada.
