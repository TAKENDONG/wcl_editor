import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';
import { CountryField } from '../../components/ui/CountryField.tsx';
import type { PublisherKind } from '../../lib/types.ts';
import { garderInscription } from './inscriptionEnAttente.ts';

// Module B — entrée dans le portail : SE CONNECTER, ou CRÉER UN COMPTE ÉDITEUR.
//
// L'INSCRIPTION SE FAIT D'UN SEUL FORMULAIRE (10/10/2026) : type de compte,
// nom, pays, adresse et mot de passe. Avant, « Créer un compte » ne proposait
// que l'adresse et le mot de passe — les champs de l'éditeur n'apparaissaient
// qu'après, sur une autre page, et personne ne les trouvait.
//
// Le compte est un compte WCL App (même projet Supabase) : l'e-mail de
// confirmation contient un CODE, saisi ici. La fiche éditeur est créée dès que
// la personne est connectée (`AccountPage`, à partir de `inscriptionEnAttente`),
// qu'elle vienne de confirmer son code ou qu'elle ait déjà un compte WCL App.
export default function SignInPage() {
  const { strings, locale } = useLocale();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [kind, setKind] = useState<PublisherKind>('publisher');
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [country, setCountry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [accepte, setAccepte] = useState(false);
  const [code, setCode] = useState('');
  const [attenteCode, setAttenteCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function changerMode(suivant: 'connexion' | 'inscription') {
    setMode(suivant);
    setError(null);
    setNotice(null);
  }

  async function seConnecter(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) {
      // Compte jamais confirmé : on renvoie un code plutôt que de laisser la
      // personne bloquée devant « Email not confirmed ».
      if (/not confirmed/i.test(authError.message)) {
        await supabase.auth.resend({ type: 'signup', email });
        setAttenteCode(true);
        setNotice(strings.codeSent);
        return;
      }
      setError(authError.message);
      return;
    }
    navigate('/compte');
  }

  async function sInscrire(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 8) { setError(strings.passwordTooShort); return; }
    if (password !== password2) { setError(strings.passwordMismatch); return; }
    if (!country) { setError(strings.countryRequired); return; }

    // Gardé AVANT l'appel : si l'adresse a déjà un compte WCL App, la fiche se
    // créera à la connexion, sans rien ressaisir.
    garderInscription({
      email: email.trim(), kind, displayName: displayName.trim(),
      legalName: kind === 'publisher' ? legalName.trim() : '',
      country, contactEmail: (contactEmail || email).trim(),
    });

    setBusy(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: displayName.trim(), lang: locale } },
    });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // Adresse déjà inscrite : Supabase ne le dit pas par une erreur, mais par
    // un utilisateur sans identité. On renvoie vers la connexion.
    if (data.user && (data.user.identities ?? []).length === 0) {
      setMode('connexion');
      setNotice(strings.alreadyAccount);
      return;
    }
    if (data.session) {
      navigate('/compte');
      return;
    }
    setAttenteCode(true);
    setNotice(strings.codeSent);
  }

  async function confirmer(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(), token: code.replace(/\s+/g, ''), type: 'signup',
    });
    setBusy(false);
    if (otpError || !data.session) {
      setError(otpError?.message ?? strings.confirmEmail);
      return;
    }
    navigate('/compte');
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

  if (attenteCode) {
    return (
      <div className="auth">
        <form className="card card--auth" onSubmit={(event) => void confirmer(event)}>
          <h1>{strings.signInTitle}</h1>
          {notice && <p className="notice">{notice}</p>}
          <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
          <TextField label={strings.codeLabel} value={code} onChange={setCode} required />
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button type="submit" disabled={busy || code.trim().length < 6}>{strings.codeConfirm}</button>
            <button type="button" className="secondary" disabled={busy}
                    onClick={() => { setAttenteCode(false); setNotice(null); setError(null); }}>
              {strings.cancel}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth">
      <div className="card card--auth">
        <div className="row" style={{ marginBottom: '1rem' }}>
          <button type="button" className={mode === 'connexion' ? '' : 'secondary'}
                  onClick={() => changerMode('connexion')}>
            {strings.signIn}
          </button>
          <button type="button" className={mode === 'inscription' ? '' : 'secondary'}
                  onClick={() => changerMode('inscription')}>
            {strings.signUpPublisher}
          </button>
        </div>

        {mode === 'connexion' ? (
          <form onSubmit={(event) => void seConnecter(event)}>
            <h1>{strings.signInTitle}</h1>
            {notice && <p className="notice">{notice}</p>}
            <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
            <TextField label={strings.password} type="password" value={password} onChange={setPassword} required />
            {error && <p className="error">{error}</p>}
            <div className="row">
              <button type="submit" disabled={busy}>{strings.signIn}</button>
            </div>
            <button type="button" className="linklike" disabled={busy} onClick={() => void resetPassword()}>
              {strings.forgotPassword}
            </button>
          </form>
        ) : (
          <form onSubmit={(event) => void sInscrire(event)}>
            <h1>{strings.registerTitle}</h1>
            <p className="muted" style={{ marginTop: 0 }}>{strings.registerLead}</p>

            <SelectField label={strings.accountKind} value={kind} onChange={(next) => setKind(next as PublisherKind)}>
              <option value="publisher">{strings.kindPublisher}</option>
              <option value="author">{strings.kindAuthor}</option>
            </SelectField>
            <TextField label={strings.displayName} value={displayName} onChange={setDisplayName} required />
            {kind === 'publisher' && (
              <TextField label={strings.legalName} value={legalName} onChange={setLegalName} required />
            )}
            <CountryField label={strings.country} value={country} onChange={setCountry} locale={locale} required />
            <TextField label={strings.contactEmail} type="email" value={contactEmail} onChange={setContactEmail}
                       placeholder={email || undefined} />

            <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
            <TextField label={strings.password} type="password" value={password} onChange={setPassword} required />
            <TextField label={strings.passwordConfirm} type="password" value={password2} onChange={setPassword2} required />

            <label className="field" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <input type="checkbox" style={{ width: 'auto', marginTop: '0.2rem' }}
                     checked={accepte} onChange={(e) => setAccepte(e.target.checked)} />
              <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.88rem' }}>
                {strings.acceptTerms} <Link to="/conditions" target="_blank">{strings.termsTitle}</Link>
              </span>
            </label>

            {error && <p className="error">{error}</p>}
            {notice && <p className="notice">{notice}</p>}
            <div className="row">
              <button type="submit" disabled={busy || !accepte || !displayName.trim() || !email.trim()}>
                {strings.create}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
