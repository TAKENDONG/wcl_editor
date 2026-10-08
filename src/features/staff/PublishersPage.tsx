import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { PublisherStatus } from '../../lib/types.ts';
import { formatPart } from '../royalties/format.ts';
import {
  decideDocument, documentLink, fetchAgreement, listDocuments, listPublishers,
  saveAgreement, setPublisherStatus,
  type Agreement, type StaffDocument, type StaffPublisher,
} from '../../services/staffService.ts';

const STATUTS: Record<PublisherStatus, string> = {
  pending: 'À vérifier',
  verified: 'Vérifié',
  suspended: 'Suspendu',
  closed: 'Fermé',
};

const PIECES: Record<StaffDocument['kind'], string> = {
  identity: 'Pièce d’identité',
  legal_existence: 'Existence légale (registre, statuts)',
  rights_attestation: 'Attestation de droits',
};

const ETAT_PIECE: Record<StaffDocument['status'], string> = {
  pending: 'À examiner',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

// Les éditeurs, pour le personnel WCL (09/10/2026) : on commence par de grands
// éditeurs, sous contrat. Le personnel examine les pièces déposées, VÉRIFIE le
// compte — sans quoi l'éditeur ne peut ni soumettre ni être payé (réglage
// `editeurs_verification_obligatoire`) — et saisit l'accord-cadre : part,
// minimum garanti, avance, pays ouverts.
export default function PublishersPage() {
  const [filtre, setFiltre] = useState<PublisherStatus | null>('pending');
  const [rows, setRows] = useState<StaffPublisher[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setRows(await listPublishers(filtre));
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, [filtre]);

  useEffect(() => { void load(); }, [load]);

  const current = rows.find((row) => row.id === selected) ?? null;

  return (
    <>
      <h1>Éditeurs</h1>
      <div className="row" style={{ marginBottom: '1rem' }}>
        {([['pending', 'À vérifier'], ['verified', 'Vérifiés'], ['suspended', 'Suspendus'], [null, 'Tous']] as const)
          .map(([valeur, libelle]) => (
            <button key={libelle} type="button" className={filtre === valeur ? '' : 'secondary'}
                    onClick={() => { setFiltre(valeur); setSelected(null); }}>
              {libelle}
            </button>
          ))}
      </div>
      {error && <p className="error">{error}</p>}

      {rows.length === 0 ? (
        <p className="muted">Aucun éditeur dans cette liste.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Éditeur</th><th>Type</th><th>Pays</th><th>État</th>
                <th className="num">Pièces</th><th className="num">Titres</th>
                <th>Contrat</th><th>Part</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} onClick={() => setSelected(row.id)}
                    style={{ cursor: 'pointer', background: row.id === selected ? 'var(--surface-2, rgba(127,127,127,.08))' : undefined }}>
                  <td><strong>{row.display_name}</strong>{row.legal_name && <span className="muted"> — {row.legal_name}</span>}</td>
                  <td>{row.kind === 'publisher' ? 'Maison' : 'Auteur'}</td>
                  <td>{row.country_code ?? '—'}</td>
                  <td>{STATUTS[row.status]}</td>
                  <td className="num">{row.documents}{row.documents_pending > 0 && <span className="badge badge--warn">{row.documents_pending} à examiner</span>}</td>
                  <td className="num">{row.titles}</td>
                  <td>{row.contract_signed_at ? new Date(row.contract_signed_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>{row.agreement_part != null ? formatPart(row.agreement_part) : 'réglage'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {current && <PublisherDetail key={current.id} publisher={current} onChanged={() => void load()} />}
    </>
  );
}

function PublisherDetail({ publisher, onChanged }: { publisher: StaffPublisher; onChanged: () => void }) {
  const [docs, setDocs] = useState<StaffDocument[]>([]);
  const [notes, setNotes] = useState('');
  const [docNotes, setDocNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDocs = useCallback(async () => {
    try { setDocs(await listDocuments(publisher.id)); } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, [publisher.id]);
  useEffect(() => { void loadDocs(); }, [loadDocs]);

  async function act(action: () => Promise<unknown>, ok: string) {
    setMessage(''); setError('');
    try { await action(); setMessage(ok); onChanged(); await loadDocs(); } catch (cause) {
      const text = cause instanceof Error ? cause.message : 'Erreur inconnue';
      setError(text === 'notes_required' ? 'Un motif est obligatoire : l’éditeur le lira.' : text);
    }
  }

  async function ouvrir(fileKey: string) {
    try { window.open(await documentLink(fileKey), '_blank', 'noopener'); } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Lien impossible');
    }
  }

  return (
    <section className="card" style={{ marginTop: '1.5rem' }}>
      <h2 style={{ marginTop: 0 }}>{publisher.display_name}</h2>
      <p className="muted">
        {publisher.contact_email ?? '—'} · inscrit le {new Date(publisher.created_at).toLocaleDateString('fr-FR')}
        {' · '}{publisher.members} membre(s) · coordonnées de versement {publisher.has_payout ? 'saisies' : 'absentes'}
      </p>
      {message && <p className="notice">{message}</p>}
      {error && <p className="error">{error}</p>}

      <h3>Pièces déposées</h3>
      {docs.length === 0 ? <p className="muted">Aucune pièce : l’éditeur les dépose depuis « Mon compte ».</p> : (
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Pièce</th><th>Déposée</th><th>État</th><th>Motif</th><th /></tr></thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td><button type="button" className="linklike" onClick={() => void ouvrir(doc.file_key)}>{PIECES[doc.kind]}</button></td>
                  <td>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>{ETAT_PIECE[doc.status]}{doc.review_notes && <span className="muted"> — {doc.review_notes}</span>}</td>
                  <td><input value={docNotes[doc.id] ?? ''} placeholder="Motif (si refus)"
                             onChange={(e) => setDocNotes({ ...docNotes, [doc.id]: e.target.value })} /></td>
                  <td className="row">
                    <button type="button" className="btn" onClick={() => void act(
                      () => decideDocument(doc.id, 'accepted', docNotes[doc.id] ?? ''), 'Pièce acceptée.')}>Accepter</button>
                    <button type="button" className="btn btn--ghost" onClick={() => void act(
                      () => decideDocument(doc.id, 'rejected', docNotes[doc.id] ?? ''), 'Pièce refusée.')}>Refuser</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Statut du compte : {STATUTS[publisher.status]}</h3>
      <label className="field">Message à l’éditeur (obligatoire pour suspendre ou fermer)
        <input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <div className="row">
        <button type="button" className="btn" disabled={publisher.status === 'verified'}
                onClick={() => void act(() => setPublisherStatus(publisher.id, 'verified', notes), 'Éditeur vérifié : il peut soumettre et être payé.')}>
          Vérifier
        </button>
        <button type="button" className="btn btn--ghost" disabled={publisher.status === 'suspended'}
                onClick={() => void act(() => setPublisherStatus(publisher.id, 'suspended', notes), 'Éditeur suspendu.')}>
          Suspendre
        </button>
        <button type="button" className="btn btn--ghost" disabled={publisher.status === 'pending'}
                onClick={() => void act(() => setPublisherStatus(publisher.id, 'pending', notes), 'Remis en attente de vérification.')}>
          Remettre en attente
        </button>
        <button type="button" className="btn btn--ghost" disabled={publisher.status === 'closed'}
                onClick={() => void act(() => setPublisherStatus(publisher.id, 'closed', notes), 'Compte fermé.')}>
          Fermer
        </button>
      </div>

      <AgreementForm publisherId={publisher.id} onSaved={onChanged} />
    </section>
  );
}

function AgreementForm({ publisherId, onSaved }: { publisherId: string; onSaved: () => void }) {
  const [a, setA] = useState<Agreement | null>(null);
  const [form, setForm] = useState({ part: '', minimum: '0', avance: '0', debut: '', fin: '', territoires: '', notes: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchAgreement(publisherId).then((row) => {
      setA(row);
      if (row) {
        setForm({
          part: row.part != null ? String(Math.round(row.part * 1000) / 10) : '',
          minimum: String(row.minimum_par_periode ?? 0),
          avance: String(row.avance ?? 0),
          debut: row.debut ?? '',
          fin: row.fin ?? '',
          territoires: (row.territoires ?? []).join(', '),
          notes: row.notes ?? '',
        });
      }
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Erreur inconnue'));
  }, [publisherId]);

  const nombre = (v: string) => Number(v.replace(',', '.').trim() || '0');

  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage(''); setError('');
    try {
      await saveAgreement(publisherId, {
        part: form.part.trim() ? nombre(form.part) / 100 : null,
        minimum: nombre(form.minimum),
        avance: nombre(form.avance),
        debut: form.debut || null,
        fin: form.fin || null,
        territoires: form.territoires.split(/[\s,;]+/).filter(Boolean),
        notes: form.notes,
      });
      setMessage('Accord enregistré. Il s’applique au prochain calcul des redevances.');
      onSaved();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }

  return (
    <form onSubmit={(e) => void save(e)}>
      <h3>Accord-cadre</h3>
      <p className="muted">
        Laisser la part vide applique le réglage général
        {a ? ` (aujourd’hui ${formatPart(a.part_effective)})` : ''}. Montants en {a?.devise ?? 'devise de référence'}.
        {a && a.avance > 0 && ` Avance récupérée à ce jour : ${a.avance_recuperee} sur ${a.avance}.`}
      </p>
      <div className="row" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label className="field">Part éditeur (%)
          <input value={form.part} inputMode="decimal" placeholder="réglage"
                 onChange={(e) => setForm({ ...form, part: e.target.value })} />
        </label>
        <label className="field">Minimum garanti par mois
          <input value={form.minimum} inputMode="decimal" onChange={(e) => setForm({ ...form, minimum: e.target.value })} />
        </label>
        <label className="field">Avance à récupérer
          <input value={form.avance} inputMode="decimal" onChange={(e) => setForm({ ...form, avance: e.target.value })} />
        </label>
        <label className="field">Début
          <input type="date" value={form.debut} onChange={(e) => setForm({ ...form, debut: e.target.value })} />
        </label>
        <label className="field">Fin
          <input type="date" value={form.fin} onChange={(e) => setForm({ ...form, fin: e.target.value })} />
        </label>
      </div>
      <label className="field">Pays ouverts par défaut (codes ISO séparés par des virgules ; vide = le monde)
        <input value={form.territoires} placeholder="CM, CI, SN" onChange={(e) => setForm({ ...form, territoires: e.target.value })} />
      </label>
      <label className="field">Notes internes (jamais montrées à l’éditeur)
        <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      {message && <p className="notice">{message}</p>}
      {error && <p className="error">{error}</p>}
      <div className="form-actions"><button type="submit">Enregistrer l’accord</button></div>
    </form>
  );
}
