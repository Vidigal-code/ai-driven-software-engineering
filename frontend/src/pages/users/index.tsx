import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  type Role,
} from '../../entities/user';
import {
  EmptyState,
  ErrorBanner,
  LoadingState,
  PageHeading,
} from '../../shared/ui';

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();
  const users = useQuery({
    queryKey: ['users', page],
    queryFn: () => getUsers(page),
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['users'] });
  const role = useMutation({
    mutationFn: updateUserRole,
    onSuccess: invalidate,
  });
  const status = useMutation({
    mutationFn: updateUserStatus,
    onSuccess: invalidate,
  });
  return (
    <>
      <PageHeading
        title="Gerenciamento de usuários"
        description="Controle os perfis de acesso e mantenha a biblioteca segura."
      />
      {(role.error || status.error) && (
        <ErrorBanner error={role.error ?? status.error} />
      )}
      <section className="panel">
        <div className="panel-header">
          <h2>Equipe e leitores</h2>
          <span className="badge badge-purple">Somente administradores</span>
        </div>
        {users.isPending && <LoadingState />}
        {users.error && (
          <ErrorBanner error={users.error} retry={() => void users.refetch()} />
        )}
        {users.data?.content.length === 0 && (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Os usuários cadastrados serão exibidos aqui."
          />
        )}
        {users.data && (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.data.content.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                        <div className="small muted mt-1">{user.email}</div>
                      </td>
                      <td>
                        <select
                          className="select"
                          aria-label={`Perfil de ${user.name}`}
                          value={user.role}
                          disabled={role.isPending}
                          onChange={(event) =>
                            role.mutate({
                              id: user.id,
                              role: event.target.value as Role,
                            })
                          }
                        >
                          <option value="READER">Leitor</option>
                          <option value="LIBRARIAN">Bibliotecário</option>
                          <option value="ADMIN">Administrador</option>
                        </select>
                      </td>
                      <td>
                        <span
                          className={`badge ${user.active ? 'badge-green' : 'badge-orange'}`}
                        >
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="button"
                          disabled={status.isPending}
                          onClick={() =>
                            status.mutate({ id: user.id, active: !user.active })
                          }
                        >
                          {user.active ? 'Desativar' : 'Ativar'}
                          <span className="sr-only"> {user.name}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>{users.data.totalElements} usuários</span>
              <div className="pagination-actions">
                <button
                  className="button"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </button>
                <span>
                  {page + 1} / {Math.max(1, users.data.totalPages)}
                </span>
                <button
                  className="button"
                  disabled={page + 1 >= users.data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
