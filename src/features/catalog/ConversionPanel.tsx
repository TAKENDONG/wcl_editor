import { useState } from 'react';
import { convertSubmission } from '../../services/conversionService.ts';
import type { ConversionReport, ConversionWarningKind } from '../../lib/types.ts';

// Exigence C2 — conversion assistée. « Assistée » est le mot important : la
// conversion produit un EPUB ET un rapport de ce qui a été perdu, et l'éditeur
// décide. Rien n'est soumis d'office.

const LOSS_LABELS: Record<ConversionWarningKind, string> = {
  image: 'image(s) non reprise(s)',
  table: 'tableau(x) écarté(s)',
  footnote: 'note(s) de bas de page perdue(s)',
  columns: 'passage(s) en colonnes aplati(s)',
  header: 'en-tête(s) ou pied(s) de page ignoré(s)',
};

export function ConversionPanel({ submissionId }: { submissionId: string }) {
  const [report, setReport] = useState<ConversionReport | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setError('');
    try {
      setReport(await convertSubmission(submissionId));
    } catch (cause) {
      setReport(null);
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <h3>Conversion assistée</h3>
      <p className="muted">
        Un fichier Word (.docx) peut être converti en EPUB. La conversion garde les
        titres, les paragraphes, les listes et la mise en forme simple. Elle{' '}
        <strong>ne reprend pas</strong> les images, les tableaux ni les notes de bas
        de page — elle vous dit lesquels ont été perdus.
      </p>

      <button type="button" className="btn" disabled={busy} onClick={() => void run()}>
        {busy ? 'Conversion…' : 'Convertir en EPUB'}
      </button>

      {error && <p className="error">{error}</p>}

      {report && (
        <>
          <p className="notice">
            EPUB produit : {report.sections} section(s),{' '}
            {report.visible_chars.toLocaleString('fr-FR')} caractères, soit environ{' '}
            <strong>{report.estimated_pages.toLocaleString('fr-FR')} pages
            normalisées</strong>. C’est ce nombre qui servira au calcul de vos
            redevances.
          </p>

          {report.warnings.length > 0 ? (
            <>
              <p className="muted">
                <strong>À vérifier avant de soumettre.</strong> Les éléments suivants
                n’ont pas été repris. Si l’un d’eux porte du texte, votre ouvrage sera
                mesuré — et rémunéré — sans lui :
              </p>
              <ul className="muted">
                {report.warnings.map((warning) => (
                  <li key={warning.kind}>
                    {warning.count} {LOSS_LABELS[warning.kind]}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="muted">
              Aucune perte détectée : le document ne contenait ni image, ni tableau,
              ni note de bas de page.
            </p>
          )}

          <p className="muted">
            Le fichier Word d’origine est conservé. Relisez l’EPUB produit avant de
            soumettre l’ouvrage à la validation.
          </p>
        </>
      )}
    </div>
  );
}
