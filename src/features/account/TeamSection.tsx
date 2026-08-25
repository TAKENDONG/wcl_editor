import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { fetchTeam, inviteMember, revokeMember, type TeamMember } from '../../services/accountService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';
import type { PublisherRole } from '../../lib/types.ts';

const ROLE_LABEL: Record<PublisherRole, string> = {
  admin: 'Administrateur',
  catalog: 'Gestionnaire de catalogue',
  finance: 'Comptable',
};

// Module B — équipe multi-utilisateurs et sous-rôles.
export function TeamSection({ publisherId }: { publisherId: string }) {
  const { strings } = useLocale();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PublisherRole>('catalog');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setTeam(await fetchTeam(publisherId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, [publisherId]);

  useEffect(() => { void reload(); }, [reload]);

  async function act(run: () => Promise<void>) {
    setError(null);
    try { await run(); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
  }

  // Le serveur refuse de revoquer le dernier administrateur (`last_admin`).
  // L'interface ne doit pas proposer une action vouee a echouer.
  const lastAdmin = (member: TeamMember) =>
    member.role === 'admin'
    && team.filter((m) => m.role === 'admin' && m.status === 'active').length <= 1;

  return (
    <section>
      <h2>{strings.sectionTeam}</h2>
      <table>
        <thead><tr><th>{strings.email}</th><th>{strings.role}</th><th /></tr></thead>
        <tbody>
          {team.map((m) => (
            <tr key={m.user_id}>
              <td>{m.email}</td>
              <td>
                <span className={`badge${m.status === 'revoked' ? ' badge--danger' : ''}`}>
                  {ROLE_LABEL[m.role]}
                </span>
              </td>
              <td>
                {m.status === 'active' && !lastAdmin(m) && (
                  <button type="button" className="danger"
                          onClick={() => void act(() => revokeMember(publisherId, m.user_id))}>
                    {strings.revoke}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ExportButtons
        basename="equipe"
        title="Equipe"
        columns={[
          { key: 'email', label: strings.email },
          { key: 'role', label: strings.role },
        ]}
        rows={team.map((m) => ({ email: m.email, role: m.role }))}
      />

      <form className="card card--form" style={{ marginTop: '1rem' }}
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              void act(async () => { await inviteMember(publisherId, email, role); setEmail(''); });
            }}>
        <div className="form-grid">
          <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
          <SelectField label={strings.role} value={role}
                       onChange={(v) => setRole(v as PublisherRole)}>
            <option value="catalog">{ROLE_LABEL.catalog}</option>
            <option value="finance">{ROLE_LABEL.finance}</option>
            <option value="admin">{ROLE_LABEL.admin}</option>
          </SelectField>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="form-actions"><button type="submit">{strings.invite}</button></div>
        <p className="muted" style={{ fontSize: '0.82rem', margin: '0.5rem 0 0' }}>
          {strings.inviteHint}
        </p>
      </form>
    </section>
  );
}
