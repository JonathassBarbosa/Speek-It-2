/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Por favor, informe seu nome.');
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.35)] border border-white/10 mb-5">
            <Mic className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            SPEEK<span className="text-blue-500">-IT</span>
          </h1>
          <p className="text-xs text-white/40 font-mono tracking-widest mt-1">SPEECH TELEPROMPTER</p>
        </div>

        {/* Card */}
        <div className="bg-[#09090d] border border-white/8 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Tabs */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-7 gap-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-wide transition-all ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (register only) */}
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-1.5">
                Senha {mode === 'register' && <span className="text-white/20">(mín. 6 caracteres)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Crie uma senha segura' : 'Sua senha'}
                  required
                  minLength={mode === 'register' ? 6 : 1}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'login' ? 'Entrar no Speek-It' : 'Criar Minha Conta'}
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-center text-[10px] text-white/20 mt-6 leading-relaxed">
            {mode === 'login'
              ? 'Entre com sua conta para continuar seu treinamento.'
              : 'Ao criar uma conta, seus treinos são salvos com segurança no servidor.'}
          </p>
        </div>
      </div>
    </div>
  );
}
