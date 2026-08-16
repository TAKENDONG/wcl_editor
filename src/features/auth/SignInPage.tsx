import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TextField } from '../../components/ui/Field.tsx';

export default function SignInPage() {
  const { strings } = useLocale();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(mode: 'in' | 'up', event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const call = mode === 'in'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });
    const { error: authError } = await call;
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate('/catalogue');
  }

  return (
    <form onSubmit={(event) => void run('in', event)} style={{ maxWidth: '26rem' }}>
      <h1>{strings.signInTitle}</h1>
      <TextField label={strings.email} type="email" value={email} onChange={setEmail} required />
      <TextField label={strings.password} type="password" value={password} onChange={setPassword} required />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit" disabled={busy}>{strings.signIn}</button>
        <button type="button" className="secondary" disabled={busy}
                onClick={(event) => void run('up', event)}>
          {strings.signUp}
        </button>
      </div>
    </form>
  );
}
