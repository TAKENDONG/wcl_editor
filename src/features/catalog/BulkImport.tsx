import { useState } from 'react';
import { importRows, type ImportOutcome } from '../../services/bulkImportService.ts';
import {
  parseImportFile, TEMPLATE_HEADERS, type ImportRow,
} from '../../services/bulkImportParser.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { DropZone } from '../../components/ui/DropZone.tsx';

// Module C — import en masse. L'import crée des BROUILLONS de métadonnées :
// chaque ouvrage a besoin de son propre fichier, qui ne peut pas être joint en
// lot. On prépare cent fiches d'un coup, on y attache les fichiers ensuite.
export function BulkImport({ publisherId, onDone }: {
  publisherId: string; onDone: () => void;
}) {
  const { strings } = useLocale();
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function inspect(file: File) {
    setError(null);
    setOutcome(null);
    try { setRows(await parseImportFile(file)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
  }

  async function run() {
    if (!rows) return;
    setBusy(true);
    try {
      const result = await importRows(publisherId, rows);
      setOutcome(result);
      setRows(null);
      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const csv = `${TEMPLATE_HEADERS.join(',')}\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele-import-wcl.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card card--form">
      <DropZone label={strings.bulkPick} accept=".csv,.xlsx" hint={strings.bulkHint}
                file={null} disabled={busy} onPick={(f) => void inspect(f)} />

      {rows && (
        <p className="notice" style={{ margin: '0.9rem 0 0' }}>
          {rows.length} {strings.bulkReady}
        </p>
      )}
      {outcome && (
        <div className="notice" style={{ margin: '0.9rem 0 0' }}>
          <strong>{outcome.created} {strings.bulkCreated}</strong>
          {outcome.errors.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0' }}>
              {outcome.errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="button" disabled={!rows || busy} onClick={() => void run()}>
          {busy ? strings.working : strings.bulkImport}
        </button>
        <button type="button" className="secondary" onClick={downloadTemplate}>
          {strings.bulkTemplate}
        </button>
      </div>
      <p className="muted" style={{ fontSize: '0.82rem', margin: '0.5rem 0 0' }}>
        {strings.bulkNote}
      </p>
    </div>
  );
}
