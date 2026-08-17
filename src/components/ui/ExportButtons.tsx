import { downloadTable, type ExportFormat } from '../../services/downloadTable.ts';
import type { Column, Row } from '../../services/exportTable.ts';

// Exigence E6 : export Excel, CSV et PDF.
const FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'xlsx', label: 'Excel' },
  { format: 'csv', label: 'CSV' },
  { format: 'pdf', label: 'PDF' },
];

type Props = {
  basename: string;
  title: string;
  columns: Column[];
  rows: Row[];
};

export function ExportButtons({ basename, title, columns, rows }: Props) {
  // Exporter un tableau vide produit un fichier a une seule ligne d'entete, que
  // le destinataire prend pour une perte de donnees.
  if (rows.length === 0) return null;
  return (
    <div className="export-bar">
      <span className="muted">Exporter :</span>
      {FORMATS.map(({ format, label }) => (
        <button
          key={format}
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => downloadTable(format, basename, title, columns, rows)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
