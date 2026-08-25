import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.ts';
import type { FileVersion } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';

// Exigence C7 — gestion des versions de fichier.
//
// La pagination normalisee est affichee A COTE de chaque version : c'est elle
// qui divise le pool, et un remplacement de fichier qui la modifie deplace la
// part de TOUS les editeurs. La montrer rend le deplacement constatable au lieu
// d'etre subi.
export function FileHistory({ submissionId }: { submissionId: string }) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: cause } = await supabase.rpc('submission_file_history', {
        p_submission_id: submissionId,
      });
      if (cause) throw new Error(cause.message);
      setVersions((data ?? []) as FileVersion[]);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <p className="muted">Chargement de l’historique…</p>;
  if (error) return <p className="error">{error}</p>;
  if (versions.length === 0) return <p className="muted">Aucune version déposée.</p>;

  const pagesOf = (v: FileVersion): number | null => v.normalized_pages;

  return (
    <>
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Version</th>
            <th>Format</th>
            <th className="num">Pages normalisées</th>
            <th className="num">Écart</th>
            <th>Empreinte</th>
            <th>Déposée le</th>
          </tr>
        </thead>
        <tbody>
          {versions.map((version, index) => {
            const previous = index > 0 ? pagesOf(versions[index - 1]) : null;
            const current = pagesOf(version);
            const delta = previous !== null && current !== null ? current - previous : null;
            return (
              <tr key={version.file_sha256}>
                <td>
                  v{version.version_no}
                  {version.is_current && <span className="badge badge--ok">actuelle</span>}
                </td>
                <td>{version.file_format.toUpperCase()}</td>
                <td className="num">
                  {current === null ? 'non mesurée' : current.toLocaleString('fr-FR')}
                </td>
                <td className="num">
                  {delta === null ? '—' : delta === 0 ? 'inchangé'
                    : `${delta > 0 ? '+' : ''}${delta.toLocaleString('fr-FR')}`}
                </td>
                {/* Les douze premiers caracteres suffisent a distinguer deux
                    versions ; l'empreinte entiere deborde sur telephone. */}
                <td className="muted"><code>{version.file_sha256.slice(0, 12)}</code></td>
                <td>{new Date(version.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <ExportButtons
      basename="versions-fichier"
      title="Historique des versions"
      columns={[
        { key: 'version', label: 'Version' },
        { key: 'format', label: 'Format' },
        { key: 'pages', label: 'Pages normalisées' },
        { key: 'sha', label: 'Empreinte' },
        { key: 'date', label: 'Déposée le' },
      ]}
      rows={versions.map((v) => ({
        version: `v${v.version_no}${v.is_current ? ' (actuelle)' : ''}`,
        format: v.file_format.toUpperCase(),
        pages: v.normalized_pages === null ? 'non mesurée' : String(v.normalized_pages),
        sha: v.file_sha256,
        date: new Date(v.created_at).toISOString().slice(0, 10),
      }))}
    />
    </>
  );
}
