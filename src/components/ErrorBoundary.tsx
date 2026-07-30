import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  declare readonly props: Props;
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const token = localStorage.getItem('speekit_token');
    if (!token) return;

    fetch('/api/monitoring/client-error', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
      keepalive: true,
    }).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#030608] px-6 text-[#e9fbfd] flex items-center justify-center">
          <section className="max-w-md rounded-3xl border border-white/10 bg-[#061015] p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#00E7FF]">
              Speek It.
            </p>
            <h1 className="mt-4 font-display text-2xl font-semibold">
              Não foi possível carregar esta tela
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              O problema foi registrado. Atualize a página para continuar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-[#00E7FF] px-5 py-3 text-sm font-bold text-[#021014]"
            >
              Atualizar página
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
