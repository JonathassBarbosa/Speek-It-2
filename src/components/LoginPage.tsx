/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import BrandLockup from './brand/BrandLockup';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setPassword('');
    setShowPassword(false);
  };

  const requestResetCode = async () => {
    const res = await fetch('/api/auth/password/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível enviar o código.');
    setSuccess(data.message);
    setMode('reset');
  };

  const resetPassword = async () => {
    const res = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Não foi possível redefinir a senha.');
    setCode('');
    setPassword('');
    setMode('login');
    setSuccess('Senha redefinida. Entre com sua nova senha.');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        if (!name.trim()) throw new Error('Por favor, informe seu nome.');
        await register(email, password, name);
      } else if (mode === 'forgot') {
        await requestResetCode();
      } else {
        await resetPassword();
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isRecovery = mode === 'forgot' || mode === 'reset';

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-10">
          <BrandLockup />
        </div>

        <div className="bg-[#09090d] border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {isRecovery ? (
            <div className="mb-7">
              <button
                type="button"
                onClick={() => changeMode('login')}
                className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/45 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para entrar
              </button>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#00E7FF]/20 bg-[#00E7FF]/10 p-2.5">
                  {mode === 'forgot'
                    ? <Mail className="h-5 w-5 text-[#00E7FF]" />
                    : <KeyRound className="h-5 w-5 text-[#00E7FF]" />}
                </div>
                <div>
                  <h1 className="font-display text-xl font-semibold text-white">
                    {mode === 'forgot' ? 'Recuperar senha' : 'Digite seu código'}
                  </h1>
                  <p className="mt-1 text-xs text-white/35">
                    {mode === 'forgot'
                      ? 'Enviaremos um código para o e-mail cadastrado.'
                      : 'O código possui seis dígitos e expira em 10 minutos.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex bg-white/5 p-1 rounded-xl mb-7 gap-1">
              <button
                type="button"
                onClick={() => changeMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => changeMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  mode === 'register' ? 'bg-blue-600 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <Field label="Nome completo">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Seu nome"
                  required
                  autoComplete="name"
                  className={inputClass}
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                readOnly={mode === 'reset'}
                className={`${inputClass} read-only:opacity-60`}
              />
            </Field>

            {mode === 'reset' && (
              <Field label="Código de recuperação">
                <input
                  type="text"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  minLength={6}
                  maxLength={6}
                  className={`${inputClass} text-center font-mono text-xl tracking-[0.35em]`}
                />
              </Field>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <Field
                label={mode === 'reset' ? 'Nova senha' : 'Senha'}
                hint={mode !== 'login' ? '(mín. 8 caracteres)' : undefined}
              >
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === 'login' ? 'Sua senha' : 'Crie uma senha segura'}
                    required
                    minLength={mode === 'login' ? 1 : 8}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => changeMode('forgot')}
                  className="text-xs font-semibold text-[#43EFFF]/75 transition-colors hover:text-[#7DF5FF]"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {error && (
              <div role="alert" className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs leading-relaxed text-emerald-300">
                <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'login' && 'Entrar no Speek-It'}
                  {mode === 'register' && 'Criar Minha Conta'}
                  {mode === 'forgot' && 'Enviar código'}
                  {mode === 'reset' && 'Redefinir senha'}
                </>
              )}
            </button>
          </form>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => changeMode('forgot')}
              className="mt-5 w-full text-center text-xs font-semibold text-white/35 transition-colors hover:text-white/60"
            >
              Não recebeu? Solicitar outro código
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
        {label} {hint && <span className="text-white/20">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
