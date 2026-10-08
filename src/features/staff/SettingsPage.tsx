import { useCallback, useEffect, useState } from 'react';
import { listReglages, saveReglage, type Reglage } from '../../services/staffService.ts';

// LES DÉCISIONS DE WCL, en un seul écran (09/10/2026). « Build everything, we
// would make the decision later » : tout ce qui n'était pas tranché — la part
// des éditeurs, le modèle, l'assiette, les seuils, la fréquence des versements,
// la vérification obligatoire — est un réglage. Le calcul des redevances, la
// vitrine et le contrat le relisent : changer une valeur ici change la règle
// partout, au prochain calcul (une période déjà consolidée ne bouge plus).

type Champ =
  | { cle: string; titre: string; aide: string; type: 'choix'; options: Array<[string, string]> }
  | { cle: string; titre: string; aide: string; type: 'oui_non' }
  | { cle: string; titre: string; aide: string; type: 'pourcent' }
  | { cle: string; titre: string; aide: string; type: 'nombre'; unite: string; facteur?: number }
  | { cle: string; titre: string; aide: string; type: 'texte' }
  | { cle: string; titre: string; aide: string; type: 'sources' }
  | { cle: string; titre: string; aide: string; type: 'frais' };

const CHAMPS: Champ[] = [
  { cle: 'redevances_modele', titre: 'Modèle de répartition', type: 'choix',
    options: [['par_abonne', 'Chaque abonné finance ce qu’il lit'], ['fonds_commun', 'Fonds commun partagé au temps de lecture']],
    aide: '« Par abonné » : un éditeur est payé par ses propres lecteurs. « Fonds commun » : toute la recette est partagée au prorata du temps lu sur la plateforme.' },
  { cle: 'redevances_part_editeurs', titre: 'Part des éditeurs', type: 'pourcent',
    aide: 'Part de la recette reversée aux éditeurs. Repère du marché : 60 %. Un accord-cadre peut la remplacer pour un éditeur.' },
  { cle: 'redevances_assiette', titre: 'Assiette', type: 'choix',
    options: [['net', 'Recette nette (après frais de paiement)'], ['brut', 'Recette brute encaissée']],
    aide: 'Ce sur quoi la part s’applique.' },
  { cle: 'redevances_devise', titre: 'Devise de référence', type: 'texte',
    aide: 'Code à trois lettres (USD, EUR, XAF). Les recettes de chaque mois y sont converties au taux du jour du premier calcul, puis figé.' },
  { cle: 'redevances_seuil_secondes', titre: 'Lecture minimale qui compte', type: 'nombre', unite: 'minutes', facteur: 60,
    aide: 'Par abonné, par livre et par mois. En dessous, un livre ouvert puis refermé ne compte pas.' },
  { cle: 'redevances_plafond_secondes_jour', titre: 'Lecture maximale comptée par jour', type: 'nombre', unite: 'heures', facteur: 3600,
    aide: 'Par abonné. Au-delà, la journée est ramenée à proportion : protège contre un appareil laissé ouvert.' },
  { cle: 'redevances_sources', titre: 'Recettes comptées', type: 'sources',
    aide: 'Paiements (Mobile Money, carte), accès payés accordés en console, codes vendus.' },
  { cle: 'redevances_frais_prestataires', titre: 'Taux de frais par prestataire', type: 'frais',
    aide: 'Vide = taux MESURÉ sur les paiements qui portent leurs frais (My-CoolPay en transmet). Exemple : flutterwave = 3,5.' },
  { cle: 'versements_seuil', titre: 'Versement minimal', type: 'nombre', unite: 'en devise de référence',
    aide: 'En dessous, le montant est reporté au versement suivant, jamais annulé.' },
  { cle: 'versements_tous_les_n_mois', titre: 'Fréquence des versements', type: 'choix',
    options: [['1', 'Chaque mois'], ['3', 'Chaque trimestre'], ['6', 'Chaque semestre'], ['12', 'Chaque année']],
    aide: 'Les mois intermédiaires sont calculés et reportés.' },
  { cle: 'editeurs_verification_obligatoire', titre: 'Vérification obligatoire des éditeurs', type: 'oui_non',
    aide: 'Oui : un éditeur non vérifié ne peut ni soumettre, ni être publié, ni être payé.' },
  { cle: 'redevances_consolidation_auto', titre: 'Consolidation automatique le 15', type: 'oui_non',
    aide: 'Non : WCL consolide chaque mois depuis « Périodes », après relecture du calcul provisoire du 1er.' },
];

const SOURCES: Array<[string, string]> = [['paiements', 'Paiements'], ['manuel', 'Accès payés (console)'], ['codes', 'Codes vendus']];

export default function SettingsPage() {
  const [reglages, setReglages] = useState<Record<string, Reglage>>({});
  const [brouillon, setBrouillon] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const rows = await listReglages();
      setReglages(Object.fromEntries(rows.map((r) => [r.cle, r])));
      setBrouillon({});
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const valeur = (cle: string) => reglages[cle]?.valeur;

  async function enregistrer(champ: Champ, brut: unknown) {
    setMessage(''); setError('');
    try {
      await saveReglage(champ.cle, brut);
      setMessage(`« ${champ.titre} » enregistré. Il s’applique au prochain calcul.`);
      await load();
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : '';
      setError(text === 'valeur_invalide' ? `Valeur refusée pour « ${champ.titre} ».` : text);
    }
  }

  return (
    <>
      <h1>Réglages des éditeurs et des redevances</h1>
      <p className="lead">
        Les décisions commerciales de WCL. Elles s’appliquent au prochain calcul ; une période déjà
        consolidée garde les règles avec lesquelles elle a été calculée.
      </p>
      {message && <p className="notice">{message}</p>}
      {error && <p className="error">{error}</p>}

      {CHAMPS.map((champ) => {
        const v = valeur(champ.cle);
        const d = brouillon[champ.cle];
        return (
          <section key={champ.cle} className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>{champ.titre}</h3>
            <p className="muted" style={{ marginTop: 0 }}>{champ.aide}</p>

            {champ.type === 'choix' && (
              <div className="row">
                {champ.options.map(([code, libelle]) => (
                  <button key={code} type="button" className={String(v) === code ? '' : 'secondary'}
                          onClick={() => void enregistrer(champ, champ.cle === 'versements_tous_les_n_mois' ? Number(code) : code)}>
                    {libelle}
                  </button>
                ))}
              </div>
            )}

            {champ.type === 'oui_non' && (
              <div className="row">
                <button type="button" className={v === true ? '' : 'secondary'} onClick={() => void enregistrer(champ, true)}>Oui</button>
                <button type="button" className={v === false ? '' : 'secondary'} onClick={() => void enregistrer(champ, false)}>Non</button>
              </div>
            )}

            {(champ.type === 'pourcent' || champ.type === 'nombre' || champ.type === 'texte') && (
              <div className="row" style={{ alignItems: 'center' }}>
                <input
                  style={{ maxWidth: '10rem' }}
                  value={d ?? (champ.type === 'pourcent' ? String(Math.round(Number(v) * 1000) / 10)
                    : champ.type === 'nombre' ? String(Number(v) / (champ.facteur ?? 1)) : String(v ?? ''))}
                  onChange={(e) => setBrouillon({ ...brouillon, [champ.cle]: e.target.value })}
                />
                <span className="muted">{champ.type === 'pourcent' ? '%' : champ.type === 'nombre' ? champ.unite : ''}</span>
                <button type="button" disabled={d === undefined} onClick={() => {
                  const n = Number(String(d).replace(',', '.'));
                  void enregistrer(champ, champ.type === 'pourcent' ? n / 100
                    : champ.type === 'nombre' ? Math.round(n * (champ.facteur ?? 1) * 100) / 100
                    : String(d).trim().toUpperCase());
                }}>Enregistrer</button>
              </div>
            )}

            {champ.type === 'sources' && (
              <div className="row">
                {SOURCES.map(([code, libelle]) => {
                  const liste = Array.isArray(v) ? (v as string[]) : [];
                  const actif = liste.includes(code);
                  return (
                    <label key={code} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <input type="checkbox" checked={actif} style={{ width: 'auto' }}
                             onChange={() => void enregistrer(champ, actif ? liste.filter((x) => x !== code) : [...liste, code])} />
                      {libelle}
                    </label>
                  );
                })}
              </div>
            )}

            {champ.type === 'frais' && (
              <div className="row" style={{ alignItems: 'center' }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="flutterwave = 3,5 ; pawapay = 2"
                  value={d ?? Object.entries((v ?? {}) as Record<string, number>)
                    .map(([k, taux]) => `${k} = ${(Number(taux) * 100).toLocaleString('fr-FR')}`).join(' ; ')}
                  onChange={(e) => setBrouillon({ ...brouillon, [champ.cle]: e.target.value })}
                />
                <span className="muted">%</span>
                <button type="button" disabled={d === undefined} onClick={() => {
                  const objet: Record<string, number> = {};
                  for (const morceau of String(d).split(';')) {
                    const [k, taux] = morceau.split('=').map((x) => x.trim());
                    if (k && taux) objet[k.toLowerCase()] = Number(taux.replace(',', '.')) / 100;
                  }
                  void enregistrer(champ, objet);
                }}>Enregistrer</button>
              </div>
            )}

            {reglages[champ.cle]?.modifie_le && (
              <p className="muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>
                Modifié le {new Date(String(reglages[champ.cle]?.modifie_le)).toLocaleString('fr-FR')}
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}
