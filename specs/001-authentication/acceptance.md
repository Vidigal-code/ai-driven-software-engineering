# Aceitação — Autenticação

| ID / requisito / teste | Dado | Quando | Então |
|---|---|---|---|
| AUTH-CA01 / AUTH-001 / AuthServiceTest.register | dados válidos | cadastrar | cria READER, senha protegida, resposta sem hash |
| AUTH-CA02 / AUTH-001 / AuthApiIT.rejectsPrivilegeInjectionAndInvalidRegistration | registro com role ADMIN | enviar |400 e sem privilégio criado |
| AUTH-CA03 / AUTH-002 / AuthServiceTest.login | usuário ativo | senha correta/incorreta | token válido/401 genérico |
| AUTH-CA04 / AUTH-003 / TokenServiceTest.rejectsExpiredAlteredAndWrongAudienceTokens | JWT expirado, audiência/emissor inválidos | decodificar | rejeitado |
| AUTH-CA05 / AUTH-004 / AuthApiIT.rotatesRefreshAndCommitsFamilyRevocationWhenReplayIsRejected e serializesConcurrentRefreshSoReplayCannotLeaveAUsableSuccessor | cookie válido | renovar e reutilizar anterior | novo cookie, replay401 e família revogada |
| AUTH-CA06 / AUTH-004 / AuthApiIT.logoutClearsCookieAndRevokesTheRefreshFamily | sessão válida | logout e refresh |204 e depois401 |
| AUTH-CA07 / AUTH-005 / AuthApiIT.rejectsCrossSiteCookieMutationsAndMissingCustomHeader; AuthRequestFilterTest.limitsCredentialAttemptsButAllowsRefreshWithAnApprovedOrigin; AuthAttemptLimiterTest.blocksAttemptsAboveThePerAddressLimit | POST sem header ou Origin indevido | autenticar |403; rate limit excedido429 |
| AUTH-CA08 / AUTH-006 / AuthApiIT.deniesAnonymousInvalidCredentialsAndReaderWrites | READER | cadastrar livro ou listar usuários |403; ADMIN autorizado |
| AUTH-CA09 / AUTH-007 / AuthApiIT.enforcesCurrentRoleAndActiveStatusAgainstAlreadyIssuedTokens | ADMIN | alterar perfil/desativar usuário | resposta atualizada, usuário inativo bloqueado |
| AUTH-CA10 / AUTH-001 / AuthApiIT.rejectsDuplicateEmailIgnoringCase | email já cadastrado | repetir com maiúsculas |409 |

| AUTH-CA11 / AUTH-005 / AuthRequestFilterTest.rejectsEncodedAuthenticationPathWithoutTheRequiredHeader e AuthApiIT | caminho de autenticação com caractere codificado, como %72efresh | enviar POST sem header exigido | 403, usando a mesma semântica de correspondência do roteamento Spring |

As execuções e resultados permanecem nos relatórios Surefire/Failsafe/JaCoCo; ausência de resultado não constitui aprovação.

AUTH-CA11 / AUTH-005 / AuthRequestFilterTest.rejectsEncodedAuthenticationPathWithoutTheRequiredHeader: dado um caminho de autenticação que o MVC normaliza, quando o POST não possui o header obrigatório, então o filtro mantém a rejeição403 antes do controlador.
