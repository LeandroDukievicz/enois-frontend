import { useState } from 'react';
import { Button } from '../../components/Sistema/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../lib/api/auth';
import appleLogo from '../../assets/icones/apple-logo.png';

const stats = [
  { value: '120k+', label: 'Profissionais' },
  { value: '2.8k', label: 'Mentores ativos' },
  { value: '640', label: 'Comunidades' },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" />
  </svg>
);

const AppleIcon = () => (
  <img src={appleLogo} alt="" className="block h-4.5 w-auto" />
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    {open ? (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    )}
  </svg>
);

export const CadastroPage = () => {
  const { login, signup } = useAuth();

  const [tab, setTab] = useState<'cadastro' | 'entrar'>('cadastro');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleTabChange = (t: 'cadastro' | 'entrar') => {
    setTab(t);
    setForgotPassword(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'cadastro') {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      // PublicOnlyRoute redireciona para /inicio quando isAuthenticated muda
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Algo deu errado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      setError('Não foi possível enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-16 md:flex md:w-[44%]"
        style={{ background: 'linear-gradient(135deg, #3B1E7A 0%, #7C3AED 55%, #A78BFA 100%)' }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.09), transparent 60%)' }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[14px] text-white">✦</span>
          <span className="text-[18px] font-light text-white">Conexão</span>
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">Networking com propósito</p>
          <blockquote className="mt-5">
            <span className="block text-[52px] leading-none text-white/30"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
              aria-hidden="true">&ldquo;</span>
            <p className="mt-1 text-[28px] font-light leading-[1.3] tracking-tight text-white">
              Encontrei aqui as conversas que mudaram minha carreira.
            </p>
            <span className="block text-[52px] leading-none text-white/30"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}
              aria-hidden="true">&rdquo;</span>
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20" />
            <div>
              <p className="text-[15px] font-light text-white">Marina Rocha</p>
              <p className="text-[13px] font-light text-white/60">Engenheira Sênior · Nubank</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-10">
          {stats.map(s => (
            <div key={s.label}>
              <p className="text-[26px] font-light text-white">{s.value}</p>
              <p className="text-[12px] font-light text-white/55">{s.label}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Painel direito */}
      <div className="flex flex-1 items-center justify-center bg-[#F9F8FF] px-8 py-6">
        <div className="w-full max-w-[420px]">

          {/* Toggle */}
          <div className="flex rounded-full bg-[#EDE8F5] p-1">
            {([
              { key: 'cadastro', label: 'Criar conta' },
              { key: 'entrar', label: 'Entrar' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex-1 rounded-full py-2 text-[14px] font-light transition-all duration-200 outline-none focus:outline-none ${
                  tab === key && !forgotPassword
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#0f0f14]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Título */}
          <h1 className="mt-5 text-[26px] font-light tracking-tight text-[#0f0f14]">
            {forgotPassword ? 'Recuperar acesso.' : tab === 'cadastro' ? 'Vamos começar.' : 'Bem-vinda de volta.'}
          </h1>
          <p className="mt-1 text-[14px] font-light text-[#6B7280]">
            {forgotPassword
              ? 'Enviaremos um link de redefinição para o seu e-mail.'
              : tab === 'cadastro'
              ? 'Crie sua conta em menos de um minuto.'
              : 'Continue de onde parou.'}
          </p>

          {/* Social — só nos fluxos principais */}
          {!forgotPassword && (
            <>
              <div className="mt-4 flex flex-col gap-2.5">
                <button className="relative flex items-center justify-center rounded-xl border border-[#E5E0EB] bg-white py-2.5 text-[14px] font-light text-[#0f0f14] outline-none transition hover:border-[#C4B5FD] hover:bg-[#F5F3FF] focus:outline-none">
                  <span className="absolute left-4 flex h-4 w-4 shrink-0 items-center justify-center">
                    <GoogleIcon />
                  </span>
                  Continuar com Google
                </button>
                <button className="relative flex items-center justify-center rounded-xl border border-[#E5E0EB] bg-white py-2.5 text-[14px] font-light text-[#0f0f14] outline-none transition hover:border-[#C4B5FD] hover:bg-[#F5F3FF] focus:outline-none">
                  <span className="absolute left-4 flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden">
                    <AppleIcon />
                  </span>
                  Continuar com Apple
                </button>
              </div>
              <div className="my-4 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E5E0EB]" />
                <span className="text-[12px] font-light text-[#9CA3AF]">ou com e-mail</span>
                <div className="h-px flex-1 bg-[#E5E0EB]" />
              </div>
            </>
          )}

          {forgotPassword && <div className="mt-5" />}

          {/* Error */}
          {error && (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          {/* Forgot password sent */}
          {forgotSent ? (
            <div className="rounded-xl border border-[#E5E0EB] bg-[#F5F3FF] px-4 py-5 text-center">
              <p className="text-[15px] font-light text-[#0f0f14]">Link enviado!</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">Verifique sua caixa de entrada em {forgotEmail}.</p>
              <button
                onClick={() => { setForgotPassword(false); setForgotSent(false); }}
                className="mt-4 text-[13px] font-light text-[#7C3AED] hover:underline"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={forgotPassword ? handleForgotSubmit : handleSubmit} className="flex flex-col gap-3">
              {tab === 'cadastro' && !forgotPassword && (
                <div>
                  <label className="mb-1 block text-[13px] font-light text-[#0f0f14]">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Maria da Silva"
                    required
                    className="w-full rounded-xl border border-[#E5E0EB] bg-white px-4 py-2.5 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-[13px] font-light text-[#0f0f14]">E-mail</label>
                <input
                  type="email"
                  value={forgotPassword ? forgotEmail : email}
                  onChange={e => forgotPassword ? setForgotEmail(e.target.value) : setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                  className="w-full rounded-xl border border-[#E5E0EB] bg-white px-4 py-2.5 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]"
                />
              </div>

              {!forgotPassword && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-[13px] font-light text-[#0f0f14]">Senha</label>
                    {tab === 'entrar' && (
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-[12px] font-light text-[#7C3AED] outline-none hover:underline focus:outline-none"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={tab === 'cadastro' ? 'Mínimo de 8 caracteres' : 'Sua senha'}
                      required
                      minLength={tab === 'cadastro' ? 8 : undefined}
                      className="w-full rounded-xl border border-[#E5E0EB] bg-white px-4 py-2.5 pr-12 text-[14px] font-light text-[#0f0f14] placeholder:text-[#9CA3AF] outline-none transition focus:border-[#7C3AED]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] outline-none hover:text-[#6B7280] focus:outline-none"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-1">
                <Button variant="primary" size="hero" className="w-full" type="submit">
                  {loading
                    ? 'Aguarde…'
                    : forgotPassword
                    ? 'Enviar link de redefinição →'
                    : tab === 'cadastro'
                    ? 'Criar conta →'
                    : 'Entrar →'}
                </Button>
              </div>
            </form>
          )}

          {tab === 'cadastro' && !forgotPassword && !forgotSent && (
            <p className="mt-3 text-center text-[12px] font-light text-[#9CA3AF]">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-[#7C3AED] underline-offset-2 hover:underline">Termos</a>
              {' '}e{' '}
              <a href="#" className="text-[#7C3AED] underline-offset-2 hover:underline">Política de Privacidade</a>.
            </p>
          )}

          {forgotPassword && !forgotSent && (
            <p className="mt-4 text-center text-[12px] font-light text-[#9CA3AF]">
              Lembrou a senha?{' '}
              <button
                onClick={() => setForgotPassword(false)}
                className="text-[#7C3AED] outline-none underline-offset-2 hover:underline focus:outline-none"
              >
                Voltar para o login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
