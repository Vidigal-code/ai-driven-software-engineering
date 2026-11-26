export const STEP_DURATION_MS = 1200;
export const SPEEDS = [0.5, 1, 2, 4] as const;
export type Speed = (typeof SPEEDS)[number];
export type ScenarioId =
  'success' | 'unit-failure' | 'security-failure' | 'quality-failure';
export type NodeStatus =
  'PENDING' | 'RUNNING' | 'FAILED' | 'RETRYING' | 'PASSED' | 'COMPLETED';
export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

export interface WorkflowStep {
  id: string;
  title: string;
  agent: string;
  phase: 'SDD' | 'TDD' | 'QUALITY' | 'DELIVERY';
  description: string;
  artifact: string;
  code: string;
}

const SPEC_CODE =
  'RF-BOOK-001: Cadastrar livros válidos.\nRN-ISBN: O ISBN deve ser único.\n\nDado um ISBN já cadastrado,\nquando um segundo livro utilizar o mesmo ISBN,\nentão retornar HTTP 409 Conflict.';
const TEST_CODE =
  '@Test\nvoid shouldRejectDuplicateIsbn() {\n    var request = validBookRequest();\n    service.create(request);\n\n    assertThrows(ConflictException.class,\n        () -> service.create(request));\n}';
const SERVICE_CODE =
  '@Transactional\npublic BookResponse create(BookRequest request) {\n    var isbn = isbnValidator.normalize(request.isbn());\n    if (repository.existsByIsbn(isbn)) {\n        throw new ConflictException("ISBN já cadastrado");\n    }\n    return mapper.toResponse(repository.saveAndFlush(book));\n}';

export const STEPS: readonly WorkflowStep[] = [
  {
    id: 'request',
    title: 'Solicitação',
    agent: 'PRODUCT',
    phase: 'SDD',
    description:
      'Definir o problema, o escopo e o resultado esperado para o cadastro de livros.',
    artifact: 'feature-request.md',
    code: 'Objetivo: cadastrar livros de forma segura.\nEscopo: cadastro, consulta, edição e exclusão.\nFora do escopo: empréstimos e pagamentos.',
  },
  {
    id: 'constitution',
    title: 'Constituição',
    agent: 'ORCHESTRATOR',
    phase: 'SDD',
    description:
      'Carregar princípios, limites de segurança e critérios de entrega.',
    artifact: '.specify/constitution.md',
    code: 'SDD antes da implementação.\nTDD: RED → GREEN → REFACTOR.\nDados de entrada validados.\nSegredos fora do repositório.\nNenhuma evidência fictícia.',
  },
  {
    id: 'spec',
    title: 'Especificação SDD',
    agent: 'ARCHITECT',
    phase: 'SDD',
    description:
      'Transformar a intenção em requisitos e regras de negócio verificáveis.',
    artifact: 'specs/002-book-management/spec.md',
    code: SPEC_CODE,
  },
  {
    id: 'plan',
    title: 'Planejamento técnico',
    agent: 'ARCHITECT',
    phase: 'SDD',
    description: 'Definir contratos REST, persistência e fronteiras de teste.',
    artifact: 'plan.md',
    code: 'POST /api/v1/books → 201 Created\nISBN duplicado → 409 Conflict\nController → Service → Repository\nPostgreSQL: UNIQUE(isbn)',
  },
  {
    id: 'tasks',
    title: 'Decomposição',
    agent: 'ORCHESTRATOR',
    phase: 'SDD',
    description:
      'Distribuir tarefas pequenas entre agentes com dependências explícitas.',
    artifact: 'tasks.md',
    code: '- [ ] QA: teste de ISBN duplicado\n- [ ] Backend: regra transacional\n- [ ] Segurança: perfis de acesso\n- [ ] DevOps: build e containers',
  },
  {
    id: 'acceptance',
    title: 'Critérios de aceitação',
    agent: 'QA',
    phase: 'SDD',
    description: 'Conectar cada requisito a um comportamento observável.',
    artifact: 'acceptance.md',
    code: SPEC_CODE,
  },
  {
    id: 'architect',
    title: 'Agente arquiteto',
    agent: 'ARCHITECT',
    phase: 'SDD',
    description:
      'Verificar decisões e preservar uma arquitetura simples e coerente.',
    artifact: 'BookRequest.java',
    code: 'public record BookRequest(\n    @NotBlank String title,\n    @NotBlank String author,\n    @NotBlank String isbn,\n    @Min(0) int totalCopies\n) {}',
  },
  {
    id: 'qa',
    title: 'Agente QA',
    agent: 'QA',
    phase: 'TDD',
    description:
      'Escrever o teste antes da regra de negócio, pela interface pública.',
    artifact: 'BookServiceTest.java',
    code: TEST_CODE,
  },
  {
    id: 'red',
    title: 'TDD · RED',
    agent: 'QA',
    phase: 'TDD',
    description:
      'Observar a falha esperada por comportamento ausente, não por erro de compilação.',
    artifact: 'Resultado demonstrativo',
    code: 'Expected: ConflictException\nActual: no exception thrown\n\nRED esperado: a regra ainda não foi implementada.',
  },
  {
    id: 'developer',
    title: 'Agente desenvolvedor',
    agent: 'DEVELOPER',
    phase: 'TDD',
    description:
      'Implementar somente o comportamento necessário e proteger a unicidade no banco.',
    artifact: 'BookService.java',
    code: SERVICE_CODE,
  },
  {
    id: 'green',
    title: 'TDD · GREEN',
    agent: 'QA',
    phase: 'TDD',
    description: 'Reexecutar testes e verificar que o requisito é satisfeito.',
    artifact: 'BookServiceTest.java',
    code: TEST_CODE,
  },
  {
    id: 'test-decision',
    title: 'Testes passaram?',
    agent: 'ORCHESTRATOR',
    phase: 'TDD',
    description:
      'Uma falha bloqueia o avanço e retorna ao desenvolvedor responsável.',
    artifact: 'Decisão de fluxo',
    code: 'if (testsPassed) advanceToRefactor();\nelse returnToDeveloper();',
  },
  {
    id: 'correction',
    title: 'Correção',
    agent: 'DEVELOPER',
    phase: 'TDD',
    description:
      'Corrigir a causa da falha preservando testes e critérios de aceitação.',
    artifact: 'BookService.java',
    code: SERVICE_CODE,
  },
  {
    id: 'refactor',
    title: 'Refatoração',
    agent: 'DEVELOPER',
    phase: 'TDD',
    description:
      'Melhorar clareza e eliminar duplicações; reexecutar testes após cada alteração.',
    artifact: 'BookRepository.java',
    code: 'public interface BookRepository\n    extends JpaRepository<Book, UUID> {\n    boolean existsByIsbn(String isbn);\n}\n\n// Testes reexecutados após a refatoração.',
  },
  {
    id: 'review',
    title: 'Code Review',
    agent: 'REVIEWER',
    phase: 'QUALITY',
    description:
      'Revisar separadamente padrões de engenharia e aderência à especificação.',
    artifact: 'Revisão demonstrativa',
    code: 'Padrões: responsabilidade única e tipagem.\nEspecificação: regras e cenários atendidos.\nRevisão humana antes da aprovação final.',
  },
  {
    id: 'integration',
    title: 'Testes de integração',
    agent: 'QA',
    phase: 'QUALITY',
    description:
      'Validar API REST, migrations e concorrência com PostgreSQL real.',
    artifact: 'BookApiIntegrationTest.java',
    code: '@Container\nstatic PostgreSQLContainer<?> postgres =\n    new PostgreSQLContainer<>("postgres:17-alpine");\n\n// Validar REST, constraints e transações.',
  },
  {
    id: 'security',
    title: 'Validação de segurança',
    agent: 'SECURITY',
    phase: 'QUALITY',
    description:
      'Validar assinatura JWT, perfis e tentativa de gravação por um leitor.',
    artifact: 'SecurityConfig.java',
    code: '.requestMatchers(HttpMethod.POST, "/api/v1/books")\n.hasAnyRole("ADMIN", "LIBRARIAN")\n\nREADER + POST /books → 403 Forbidden',
  },
  {
    id: 'quality',
    title: 'Quality Gates',
    agent: 'QA',
    phase: 'QUALITY',
    description:
      'Bloquear entrega em caso de falha de cobertura, lint, tipos ou segurança.',
    artifact: 'Política de qualidade',
    code: 'Cobertura mínima: 80% linhas / 75% branches\nTestes unitários e integração\nAnálise estática e dependências\nBuild, smoke e health checks\n\nValores acima são critérios, não resultados reais.',
  },
  {
    id: 'quality-decision',
    title: 'Qualidade aprovada?',
    agent: 'ORCHESTRATOR',
    phase: 'QUALITY',
    description:
      'A aprovação unitária não substitui integração, segurança e revisão.',
    artifact: 'Decisão de entrega',
    code: 'if (allGatesPassed) packageApplication();\nelse correctAndRevalidate();',
  },
  {
    id: 'build',
    title: 'Build e empacotamento',
    agent: 'DEVOPS',
    phase: 'DELIVERY',
    description:
      'Compilar artefatos reprodutíveis depois da aprovação dos gates.',
    artifact: 'Comandos demonstrativos',
    code: './mvnw verify\nnpm ci\nnpm run build',
  },
  {
    id: 'docker',
    title: 'Docker',
    agent: 'DEVOPS',
    phase: 'DELIVERY',
    description: 'Preparar frontend, backend e PostgreSQL com health checks.',
    artifact: 'compose.yaml',
    code: 'services:\n  frontend: # React / Nginx\n  backend:  # Java 21 / Spring Boot\n  postgres: # Volume persistente\n\ndocker compose up --build -d',
  },
  {
    id: 'approved',
    title: 'Software aprovado',
    agent: 'ORCHESTRATOR',
    phase: 'DELIVERY',
    description:
      'Entregar após validação técnica e humana. Esta aprovação pertence apenas ao cenário simulado.',
    artifact: 'Entrega demonstrativa',
    code: '✓ Backend e frontend\n✓ Banco de dados\n✓ Swagger e coleção Postman\n✓ Containers\n✓ Quality Gates do cenário\n\nConsulte evidências reais separadamente.',
  },
];

export const SCENARIOS: readonly {
  id: ScenarioId;
  name: string;
  description: string;
}[] = [
  {
    id: 'success',
    name: 'Fluxo de sucesso',
    description: 'Da especificação à entrega, com todos os gates aprovados.',
  },
  {
    id: 'unit-failure',
    name: 'Falha no teste unitário',
    description: 'ISBN duplicado retorna para correção e novo teste.',
  },
  {
    id: 'security-failure',
    name: 'Falha de segurança',
    description: 'Uma permissão indevida de READER bloqueia a entrega.',
  },
  {
    id: 'quality-failure',
    name: 'Falha no Quality Gate',
    description: 'Cobertura insuficiente exige correção e revalidação.',
  },
];

export const STATUS_LABELS: Record<NodeStatus, string> = {
  PENDING: 'Pendente',
  RUNNING: 'Em execução',
  FAILED: 'Falhou',
  RETRYING: 'Em correção',
  PASSED: 'Aprovado',
  COMPLETED: 'Concluído',
};
