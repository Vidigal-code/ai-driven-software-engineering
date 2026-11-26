import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck } from 'lucide-react';
import { z } from 'zod';
import { HEALTH_URL } from '../../shared/config';

const HEALTH_REFRESH_MS = 30_000;
const healthSchema = z.object({ status: z.string() });

const evidenceSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.string(),
  entries: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      status: z.enum(['unavailable', 'passed', 'failed', 'recorded']),
      recordedAt: z.string().nullable(),
      sources: z.array(z.string()),
      metrics: z.record(z.string(), z.number()),
    }),
  ),
});
const LABELS = {
  unavailable: 'Não registrada',
  passed: 'Aprovada',
  failed: 'Reprovada',
  recorded: 'Registrada',
};

export function EvidencePanel() {
  const health = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(10_000) });
      if (!response.ok) throw new Error('API indisponível.');
      return healthSchema.parse(await response.json());
    },
    retry: false,
    refetchInterval: HEALTH_REFRESH_MS,
  });
  let healthStatus = 'Indisponível';
  if (health.isPending) healthStatus = 'Verificando…';
  else if (health.data?.status === 'UP' && !health.isError) healthStatus = 'UP';
  const evidence = useQuery({
    queryKey: ['evidence'],
    queryFn: async () => {
      const response = await fetch('/evidence.json');
      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('application/json')
      )
        return null;
      return evidenceSchema.parse(await response.json());
    },
    retry: false,
    staleTime: 60_000,
  });
  return (
    <details className="evidence-box">
      <summary className="flex items-center gap-2 cursor-pointer">
        <ClipboardCheck size={17} />
        Evidências reais do projeto{' '}
        <span className="badge ml-auto">Separadas da simulação</span>
      </summary>
      <div className="mt-3">
        <p><strong>API: {healthStatus}</strong></p>
        <p>Consulta real à API; não verifica todos os containers. Atualização a cada 30 segundos.</p>
        <p>CI: execução ainda não registrada</p>
      </div>
      <p className="mt-3">
        Snapshot da última coleta de relatórios; não representa o estado ao vivo
        do CI.
      </p>
      {evidence.data ? (
        <div className="mt-4">
          <p>
            Coleta:{' '}
            {new Date(evidence.data.generatedAt).toLocaleString('pt-BR')}
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Verificação</th>
                  <th>Resultado</th>
                  <th>Métricas registradas</th>
                </tr>
              </thead>
              <tbody>
                {evidence.data.entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.label}</td>
                    <td>{LABELS[entry.status]}</td>
                    <td>
                      {Object.entries(entry.metrics)
                        .map(([key, value]) => `${key}: ${Number(value)}`)
                        .join(' · ') || 'Execução ainda não registrada'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="mt-3">
          Execução ainda não registrada. Consulte os relatórios de teste e o
          pipeline antes de afirmar aprovação.
        </p>
      )}
    </details>
  );
}
