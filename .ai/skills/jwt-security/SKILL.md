---
name: jwt-security
description: "Altere autenticação, autorização e sessão com tokens."
---

# jwt-security

## Preparação
Leia `AGENTS.md` e `.specify/constitution.md`. As regras centrais têm fonte única; esta skill define o procedimento específico.

## Procedimento e conclusão
Leia spec001 e docs/security.md. Use Resource Server oficial, valide assinatura/iss/aud/exp e roles/status. Access token fica em memória; refresh fica HttpOnly com hash persistido e rotação atômica. Teste replay, expiração, inativo, READER sem escrita, CSRF e logout. Conclua com testes de acesso e sem segredos nos artefatos.

## Evidências
Registre requisito, comando, resultado e localização do relatório. Falhas retornam ao responsável em `.ai/orchestration.md`; ausência de execução permanece pendente.
