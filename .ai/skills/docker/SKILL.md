---
name: docker
description: "Altere containers, Compose e entrega."
---

# docker

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Leia spec005, manifests e documentação oficial. Faça builds multi-stage, runtime mínimo, usuários não privilegiados e secrets externos. Banco fica em rede interna com volume e health; frontend usa proxy de mesma origem. Valide Compose, build, inicialização, health e smoke. Conclua com execução real ou limitação registrada; não alegue deploy apenas por configurar CI.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
