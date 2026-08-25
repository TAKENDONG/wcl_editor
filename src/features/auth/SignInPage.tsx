import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TextField } from '../../components/ui/Field.tsx';

// Module B — entree dans le portail.
//
// DEUX DESTINATIONS DIFFERENTES, et c'etait le defaut : la creation de compte
// menait au CATALOGUE, comme la connexion. Or un compte tout juste cree n'est
// membre d'aucun editeur — l'ecran lui etait refuse, et il se retrouvait
// renvoye sans explication. Creer un compte d'authentification n'est que la
// premiere moitie de l'inscription ; la seconde est la creation de l'editeur,
// sur `/inscription`.
//
// La connexion, elle, mene au COMPTE et non au catalogue : le catalogue est
// desormais reserve aux gestionnaires, et un comptable y aurait ete renvoye
// aussitot, avec un clignotement.
export default function SignInPage() {
  const { strings } = useLocale();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(mode: 'in' | 'up', event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { data, error: authError } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // Sans session, l'adresse doit etre confirmee : naviguer renverrait
    // aussitot vers cet ecran, ce que l'utilisateur lirait comme un echec.
    if (!data.session) {
      setNotice(strings.confirmEmail);
      return;
    }
    navigate(mode === 'in' ? '/compte' : '/inscription');
  }

  async function resetPassword() {
    if (!email) {
      setError(strings.emailRequiredForReset);
      return;
    }
    setBusy(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setNotice(strings.resetSent);
  }

  return (
    <div className="auth">
      <form className="card card--auth" onSubmit={(event) => void run('in', event)}>
        <h1>{strings.signInTitle}</h1>
        <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
        <TextField
          label={strings.password} type="password"
          value={password} onChange={setPassword} required
        />
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <div className="row">
          <button type="submit" disabled={busy}>{strings.signIn}</button>
          <button
            type="button" className="secondary" disabled={busy}
            onClick={(event) => void run('up', event)}
          >
            {strings.signUp}
          </button>
        </div>
        <button
          type="button" className="linklike" disabled={busy}
          onClick={() => void resetPassword()}
        >
          {strings.forgotPassword}
        </button>
      </form>
    </div>
  );
}
