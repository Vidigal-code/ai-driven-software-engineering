# Aceitação — Engineering Workflow Studio

Os critérios observam máquina pública, hook de reprodução e controles acessíveis. Status inicial pendente até execução registrada.

| Critério / requisito | Dado | Quando | Então | Teste previsto |
|---|---|---|---|---|
| CA-WF-001 / RF-WF-001 | Studio inicial | abrir rota pública | 22 nós/decisões/retornos e estados com texto/ícone além de cor | workflow.spec.ts |
| CA-WF-001a / RF-WF-001 | etapa selecionada | selecionar outro nó | painel muda responsável/artefato/estado sem alterar execução | workflow.spec.ts |
| CA-WF-002 / RF-WF-002 | cenário parado | Play e passagem do intervalo | avança automaticamente sem novos cliques | machine.test.ts, useWorkflow.test.tsx |
| CA-WF-002a / RF-WF-002 | execução ativa | Pause, avançar relógio, Resume | pausa preserva índice; retoma desse ponto | useWorkflow.test.tsx |
| CA-WF-002b / RF-WF-002 | execução ativa/pausada | Stop | cancela timer e entra na condição definida de parada | machine.test.ts, useWorkflow.test.tsx |
| CA-WF-002c / RF-WF-002 | execução parcial | Restart | estados/logs/progresso reiniciam sem timers duplicados | machine.test.ts, useWorkflow.test.tsx |
| CA-WF-002d / RF-WF-002 | pausado | próxima/anterior | transição determinística sem ultrapassar início/fim | machine.test.ts |
| CA-WF-002e / RF-WF-002 | reprodução1x | escolher0.5x/2x/4x | próximo intervalo usa nova velocidade e preserva estado | useWorkflow.test.tsx |
| CA-WF-002f / RF-WF-002 | reprodução ativa | desmontar/trocar cenário | timer antigo não altera estado novo ou desmontado | useWorkflow.test.tsx |
| CA-WF-002g / RF-WF-002 | estado final/pausado | evento incompatível | ignora/rejeita sem corromper estado | machine.test.ts |
| CA-WF-003 / RF-WF-003 | cenário sucesso | executar fim a fim | RED precede implementação/GREEN; refatoração revalidada; integração/segurança/gates antes da entrega | machine.test.ts |
| CA-WF-003a / RF-WF-003 | cenário ISBN | executar falha | FAILED/log, retorno à correção/desenvolvedor, novo GREEN antes de avançar | machine.test.ts, workflow.spec.ts |
| CA-WF-003b / RF-WF-003 | cenário segurança | tentativa READER | reprova acesso, retorna responsável e repete segurança antes de aprovar | machine.test.ts |
| CA-WF-003c / RF-WF-003 | cenário gate | reprovar cobertura/análise | bloqueia build/entrega até correção e revalidação | machine.test.ts |
| CA-WF-004 / RF-WF-004 | artefato | selecionar/executar etapa | realce/progressão, representação identificada e texto nunca executado | workflow.spec.ts |
| CA-WF-005 / RF-WF-005 | eventos emitidos | ler terminal | tempo relativo, agente, nível e mensagem correspondem aos eventos | machine.test.ts |
| CA-WF-005a / RF-WF-005 | histórico com falha | filtrar/copiar/exportar/limpar | filtro correto; cópia/exportação preservam histórico; limpar não reinicia máquina | workflow.spec.ts |
| CA-WF-005b / RF-WF-005 | auto-scroll desligado | novo log | preserva posição; ligado acompanha novos logs | teste de terminal |
| CA-WF-006 / RF-WF-006 | canvas | zoom/fit/fullscreen/follow | controles funcionam; follow só acompanha se habilitado | workflow.spec.ts |
| CA-WF-006a / RF-WF-006 | reduced-motion e teclado | navegar/executar | controles principais acessíveis, sem animação excessiva | workflow.spec.ts |
| CA-WF-007 / RF-WF-007 | qualquer estado | ler cabeçalho/evidências | Modo demonstração — execução simulada visível; dados reais ausentes nunca inventados | workflow.spec.ts |

## Gate
Cobertura de lógica conforme constituição; lint, typecheck, testes, build e navegador aprovados por execução real. Uma aprovação simulada não comprova gates reais.
