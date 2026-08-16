import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerPublisher } from '../../services/publisherService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';
import type { PublisherKind } from '../../lib/types.ts';

// Module B — creation du compte editeur. Le formulaire ne valide que la
// coherence de saisie ; la regle metier (raison sociale obligatoire pour une
// maison d'edition) est appliquee par la RPC, qui est la seule autorite.
export default function RegisterPage() {
  const { strings } = useLocale();
  const navigate = useNavigate();
  const [kind, setKind] = useState<PublisherKind>('author');
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [country, setCountry] = useState('CM');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await registerPublisher({
        kind, displayName, countryCode: country, contactEmail: email,
        legalName: kind === 'publisher' ? legalName : undefined,
      });
      navigate('/catalogue');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} style={{ maxWidth: '30rem' }}>
      <h1>{strings.registerTitle}</h1>
      <SelectField label="Type de compte" value={kind}
                   onChange={(next) => setKind(next as PublisherKind)}>
        <option value="author">{strings.kindAuthor}</option>
        <option value="publisher">{strings.kindPublisher}</option>
      </SelectField>
      <TextField label={strings.displayName} value={displayName} onChange={setDisplayName} required />
      {kind === 'publisher' && (
        <TextField label={strings.legalName} value={legalName} onChange={setLegalName} required />
      )}
      <TextField label={strings.country} value={country} onChange={setCountry} placeholder="CM" required />
      <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={busy}>{strings.create}</button>
    </form>
  );
}
