import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase.ts';
import { CountryField } from '../../components/ui/CountryField.tsx';
import { useNavigate } from 'react-router-dom';
import { registerPublisher } from '../../services/publisherService.ts';
import { useCapabilitiesContext } from '../../hooks/CapabilitiesContext.tsx';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';
import type { PublisherKind } from '../../lib/types.ts';

// Module B — creation du compte editeur. Le formulaire ne valide que la
// coherence de saisie ; la regle metier (raison sociale obligatoire pour une
// maison d'edition) est appliquee par la RPC, qui est la seule autorite.
export default function RegisterPage() {
  const { strings, locale } = useLocale();
  const navigate = useNavigate();
  const { refresh } = useCapabilitiesContext();
  const [kind, setKind] = useState<PublisherKind>('publisher');
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // L'adresse de contact part de celle du compte : rien à ressaisir.
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail((courant) => courant || data.user?.email || '');
    });
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!country) { setError(strings.countryRequired); return; }
    setBusy(true);
    setError(null);
    try {
      await registerPublisher({
        kind, displayName, countryCode: country, contactEmail: email,
        legalName: kind === 'publisher' ? legalName : undefined,
      });
      // LES DROITS SONT RELUS AVANT DE NAVIGUER. Ils avaient ete etablis au
      // demarrage, quand l'utilisateur n'etait membre d'aucun editeur : sans
      // cette relecture, « Catalogue » restait absent de la navigation et la
      // route le renvoyait aussitot — il fallait recharger la page pour que le
      // portail reconnaisse l'editeur qu'il venait de creer.
      await refresh();
      navigate('/compte');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  // Meme presentation que l'ecran de connexion : un formulaire seul, colle au
  // bord gauche d'un ecran large, se lit comme une page inachevee.
  return (
    <div className="auth">
      <form className="card card--auth" onSubmit={(event) => void submit(event)}>
      <h1>{strings.registerTitle}</h1>
      <SelectField label={strings.accountKind} value={kind}
                   onChange={(next) => setKind(next as PublisherKind)}>
        <option value="publisher">{strings.kindPublisher}</option>
        <option value="author">{strings.kindAuthor}</option>
      </SelectField>
      <TextField label={strings.displayName} value={displayName} onChange={setDisplayName} required />
      {kind === 'publisher' && (
        <TextField label={strings.legalName} value={legalName} onChange={setLegalName} required />
      )}
      <CountryField label={strings.country} value={country} onChange={setCountry} locale={locale} required />
      <TextField label={strings.contactEmail} type="email" value={email} onChange={setEmail} required />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>{strings.create}</button>
      </form>
    </div>
  );
}
