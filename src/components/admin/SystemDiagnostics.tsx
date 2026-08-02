import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  CircleX,
  Database,
  Gauge,
  LoaderCircle,
  Mic,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Volume2,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type CheckStatus = 'operational' | 'warning' | 'error' | 'running';

interface DiagnosticCheck {
  id: string;
  label: string;
  category: 'backend' | 'data' | 'security' | 'integration' | 'browser';
  status: CheckStatus;
  message: string;
  latencyMs?: number;
  checkedAt: string;
  canRun?: boolean;
  mayConsumeExternalUsage?: boolean;
}

const iconById: Record<string, typeof Activity> = {
  api: Server,
  storage: Database,
  jwt: ShieldCheck,
  admin: ShieldCheck,
  email: Wifi,
  'coach-config': Bot,
  'coach-end-to-end': Bot,
  connection: Wifi,
  microphone: Mic,
  recording: Gauge,
  recognition: Activity,
  voice: Volume2,
  'local-data': Database,
};

const statusStyle = {
  operational: {
    label: 'Operacional',
    icon: CheckCircle2,
    card: 'border-emerald-500/20 bg-emerald-500/[0.035]',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
  warning: {
    label: 'Atenção',
    icon: CircleAlert,
    card: 'border-amber-500/20 bg-amber-500/[0.035]',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  error: {
    label: 'Falha',
    icon: CircleX,
    card: 'border-red-500/20 bg-red-500/[0.035]',
    badge: 'border-red-500/20 bg-red-500/10 text-red-300',
    dot: 'bg-red-400',
  },
  running: {
    label: 'Testando',
    icon: LoaderCircle,
    card: 'border-cyan-500/20 bg-cyan-500/[0.035]',
    badge: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
    dot: 'bg-cyan-400',
  },
};

function initialBrowserChecks(): DiagnosticCheck[] {
  const timestamp = new Date().toISOString();
  return [
    { id: 'connection', label: 'Site e conexão', category: 'browser', status: 'running', message: 'Verificando acesso ao site...', checkedAt: timestamp, canRun: true },
    { id: 'microphone', label: 'Microfone', category: 'browser', status: 'warning', message: 'Clique em testar para validar a permissão e a entrada de áudio.', checkedAt: timestamp, canRun: true },
    { id: 'recording', label: 'Gravação de áudio', category: 'browser', status: 'running', message: 'Verificando compatibilidade do navegador...', checkedAt: timestamp, canRun: true },
    { id: 'recognition', label: 'Reconhecimento de fala', category: 'browser', status: 'running', message: 'Verificando compatibilidade do navegador...', checkedAt: timestamp, canRun: true },
    { id: 'voice', label: 'Voz do Coach no aparelho', category: 'browser', status: 'running', message: 'Procurando uma voz em português do Brasil...', checkedAt: timestamp, canRun: true },
    { id: 'local-data', label: 'Dados no navegador', category: 'browser', status: 'running', message: 'Verificando armazenamento local...', checkedAt: timestamp, canRun: true },
  ];
}

export default function SystemDiagnostics() {
  const { token } = useAuth();
  const [serverChecks, setServerChecks] = useState<DiagnosticCheck[]>([]);
  const [browserChecks, setBrowserChecks] = useState<DiagnosticCheck[]>(initialBrowserChecks);
  const [refreshing, setRefreshing] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [panelError, setPanelError] = useState('');

  const replaceCheck = useCallback((id: string, patch: Partial<DiagnosticCheck>) => {
    const update = (checks: DiagnosticCheck[]) => checks.map((check) => check.id === id ? { ...check, ...patch } : check);
    if (initialBrowserChecks().some((check) => check.id === id)) setBrowserChecks(update);
    else setServerChecks(update);
  }, []);

  const refreshServer = useCallback(async (quiet = false) => {
    if (!token) return;
    if (!quiet) setRefreshing(true);
    setPanelError('');
    try {
      const response = await fetch('/api/admin/diagnostics', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Não foi possível consultar o servidor.');
      setServerChecks(payload.checks ?? []);
      setLastRefresh(new Date());
    } catch (error) {
      setPanelError(error instanceof Error ? error.message : 'Não foi possível atualizar o painel.');
    } finally {
      if (!quiet) setRefreshing(false);
    }
  }, [token]);

  const browserResult = (id: string, label: string, status: CheckStatus, message: string, startedAt: number): DiagnosticCheck => ({
    id,
    label,
    category: 'browser',
    status,
    message,
    latencyMs: Date.now() - startedAt,
    checkedAt: new Date().toISOString(),
    canRun: true,
  });

  const runBrowserCheck = useCallback(async (id: string) => {
    const current = browserChecks.find((check) => check.id === id);
    if (!current) return;
    replaceCheck(id, { status: 'running', message: 'Executando teste...', checkedAt: new Date().toISOString() });
    const startedAt = Date.now();
    let result: DiagnosticCheck;

    try {
      if (id === 'connection') {
        if (!navigator.onLine) throw new Error('Este aparelho está sem conexão com a internet.');
        const response = await fetch('/api/monitoring/health', { cache: 'no-store' });
        if (!response.ok) throw new Error(`O site respondeu com erro ${response.status}.`);
        result = browserResult(id, current.label, 'operational', 'Site, internet e API estão acessíveis.', startedAt);
      } else if (id === 'microphone') {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não oferece acesso ao microfone.');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const track = stream.getAudioTracks()[0];
        const description = track?.label ? `Entrada detectada: ${track.label}.` : 'Permissão concedida e entrada de áudio detectada.';
        stream.getTracks().forEach((item) => item.stop());
        result = browserResult(id, current.label, 'operational', description, startedAt);
      } else if (id === 'recording') {
        if (typeof MediaRecorder === 'undefined') throw new Error('Gravação de áudio não é suportada neste navegador.');
        const preferred = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type));
        result = browserResult(id, current.label, preferred ? 'operational' : 'warning', preferred ? `Formato compatível: ${preferred}.` : 'Gravação disponível, mas nenhum formato preferencial foi identificado.', startedAt);
      } else if (id === 'recognition') {
        const speechWindow = window as typeof window & { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
        const supported = Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition);
        result = browserResult(id, current.label, supported ? 'operational' : 'warning', supported ? 'Reconhecimento de fala disponível neste navegador.' : 'Este navegador não possui reconhecimento de fala nativo. O envio de áudio ao Coach continua disponível.', startedAt);
      } else if (id === 'voice') {
        if (!('speechSynthesis' in window)) throw new Error('Leitura de respostas não é suportada neste navegador.');
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          await new Promise<void>((resolve) => {
            const timeout = window.setTimeout(resolve, 800);
            speechSynthesis.addEventListener('voiceschanged', () => { window.clearTimeout(timeout); resolve(); }, { once: true });
          });
          voices = speechSynthesis.getVoices();
        }
        const ptBr = voices.find((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith('pt-br'));
        result = browserResult(id, current.label, ptBr ? 'operational' : 'warning', ptBr ? `Voz PT-BR disponível: ${ptBr.name}.` : 'Leitura disponível, mas o aparelho não informou uma voz específica em PT-BR.', startedAt);
      } else if (id === 'local-data') {
        localStorage.setItem('speekit_diagnostic', String(Date.now()));
        localStorage.removeItem('speekit_diagnostic');
        result = browserResult(id, current.label, 'operational', 'Armazenamento do navegador disponível para sessão e preferências.', startedAt);
      } else {
        throw new Error('Teste do navegador não reconhecido.');
      }
    } catch (error) {
      result = browserResult(id, current.label, 'error', error instanceof Error ? error.message : 'O teste falhou.', startedAt);
    }
    setBrowserChecks((checks) => checks.map((check) => check.id === id ? result : check));
    return result;
  }, [browserChecks, replaceCheck]);

  const runServerCheck = useCallback(async (id: string, confirmUsage = true) => {
    const current = serverChecks.find((check) => check.id === id);
    if (!current || !token) return;
    if (current.mayConsumeExternalUsage && confirmUsage && !window.confirm('Este teste enviará uma mensagem real ao Coach IA e pode consumir a cota do serviço externo. Deseja continuar?')) return;
    replaceCheck(id, { status: 'running', message: 'Executando teste...', checkedAt: new Date().toISOString() });
    try {
      const response = await fetch('/api/admin/diagnostics/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'O teste falhou.');
      setServerChecks((checks) => checks.map((check) => check.id === id ? payload.check : check));
      return payload.check as DiagnosticCheck;
    } catch (error) {
      replaceCheck(id, { status: 'error', message: error instanceof Error ? error.message : 'O teste falhou.', checkedAt: new Date().toISOString() });
    }
  }, [replaceCheck, serverChecks, token]);

  const runSafeChecks = async () => {
    setRunningAll(true);
    await refreshServer();
    for (const id of ['connection', 'microphone', 'recording', 'recognition', 'voice', 'local-data']) {
      await runBrowserCheck(id);
    }
    await runServerCheck('storage', false);
    await runServerCheck('coach-config', false);
    setLastRefresh(new Date());
    setRunningAll(false);
  };

  useEffect(() => {
    refreshServer();
    for (const id of ['connection', 'recording', 'recognition', 'voice', 'local-data']) void runBrowserCheck(id);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshServer(true);
        void runBrowserCheck('connection');
      }
    }, 15_000);
    return () => window.clearInterval(interval);
  }, [refreshServer, runBrowserCheck]);

  const checks = [...serverChecks, ...browserChecks];
  const summary = useMemo(() => ({
    operational: checks.filter((check) => check.status === 'operational').length,
    warning: checks.filter((check) => check.status === 'warning').length,
    error: checks.filter((check) => check.status === 'error').length,
  }), [checks]);
  const overall = summary.error > 0 ? 'error' : summary.warning > 0 ? 'warning' : 'operational';
  const OverallIcon = statusStyle[overall].icon;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#09090d] shadow-2xl shadow-black/20">
      <div className="border-b border-white/5 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-blue-500/[0.06] p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-start gap-3">
            <div className={`rounded-2xl border p-3 ${statusStyle[overall].badge}`}><OverallIcon className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Central de diagnóstico</p>
              <h3 className="mt-1 text-xl font-bold text-white">Saúde do Speek It em tempo real</h3>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/45">
                Teste site, dados, acesso, recuperação de senha, navegador, microfone, gravação, voz e Coach antes de cada demonstração.
              </p>
            </div>
          </div>
          <button type="button" onClick={runSafeChecks} disabled={runningAll || refreshing} className="flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-[#041014] transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60">
            {runningAll ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {runningAll ? 'Testando tudo...' : 'Testar funções agora'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 md:max-w-md">
          <Summary value={summary.operational} label="Operacionais" color="text-emerald-300" />
          <Summary value={summary.warning} label="Atenção" color="text-amber-300" />
          <Summary value={summary.error} label="Falhas" color="text-red-300" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle[overall].dot} ${overall === 'operational' ? 'animate-pulse' : ''}`} />
          Atualização automática a cada 15 segundos
          {lastRefresh && ` · última consulta às ${lastRefresh.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`}
        </div>
      </div>

      {panelError && <div className="m-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">{panelError}</div>}

      <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
        {checks.map((check) => {
          const visual = statusStyle[check.status];
          const StatusIcon = visual.icon;
          const CheckIcon = iconById[check.id] ?? Activity;
          return (
            <article key={check.id} className={`flex min-h-48 flex-col rounded-2xl border p-4 transition-colors ${visual.card}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-2"><CheckIcon className="h-4 w-4 text-white/70" /></div>
                  <h4 className="text-sm font-bold text-white">{check.label}</h4>
                </div>
                <span className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${visual.badge}`}>
                  <StatusIcon className={`h-3 w-3 ${check.status === 'running' ? 'animate-spin' : ''}`} />{visual.label}
                </span>
              </div>
              <p className="mt-4 flex-1 text-xs leading-relaxed text-white/50">{check.message}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
                <span className="text-[10px] text-white/25">{check.latencyMs !== undefined ? `${check.latencyMs} ms` : 'Verificação de configuração'}</span>
                {check.canRun && (
                  <button type="button" disabled={check.status === 'running'} onClick={() => check.category === 'browser' ? runBrowserCheck(check.id) : runServerCheck(check.id)} className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 transition hover:text-cyan-100 disabled:opacity-40">
                    <RefreshCw className={`h-3 w-3 ${check.status === 'running' ? 'animate-spin' : ''}`} />
                    {check.mayConsumeExternalUsage ? 'Teste real (pode consumir)' : 'Testar'}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Summary({ value, label, color }: { value: number; label: string; color: string }) {
  return <div className="rounded-xl border border-white/5 bg-black/20 px-3 py-2"><p className={`text-lg font-black ${color}`}>{value}</p><p className="text-[9px] uppercase tracking-wider text-white/30">{label}</p></div>;
}
