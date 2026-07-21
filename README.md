# 🎙️ Speek-It — Teleprompter Inteligente

Sistema de teleprompter com análise de oratória em tempo real. Grave sua leitura, receba notas de **dicção, ritmo, entonação e pausas** e acompanhe sua evolução no histórico.

## ✨ Funcionalidades

- **Teleprompter** com rolagem automática ajustável e linha de foco
- **Gravação de voz** com visualizador de espectro de áudio
- **Análise de oratória local** (heurística, sem depender de nenhuma API externa) com notas detalhadas de dicção, ritmo, entonação e pausas
- **Banco de textos** com categorias: Onboarding, Vendas, Motivacional e Treino Rápido
- **Histórico de treinos** com playback de áudio e exportação de relatório (.txt)
- **Modo claro/escuro** com tema dark imersivo por padrão
- **Armazenamento local** via IndexedDB (sem servidor necessário para uso básico)

## 🚀 Como rodar localmente

**Pré-requisitos:** Node.js 20+

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/speek-it.git
cd speek-it

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento (nenhuma variável de ambiente é necessária)
npm run dev
```

Acesse em: [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy no GitHub Pages

O projeto usa **Vite** para build estático e **gh-pages** para deploy. Como a análise de oratória roda inteiramente local, o app funciona da mesma forma no GitHub Pages.

```bash
# Antes do deploy, edite "homepage" no package.json com sua URL real:
# "homepage": "https://SEU_USUARIO.github.io/speek-it"

npm run deploy
```

## 🛠️ Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite + Express) |
| `npm run build` | Gera build de produção em `/dist` |
| `npm run deploy` | Faz deploy no GitHub Pages |
| `npm run lint` | Verifica tipos TypeScript |

## 🏗️ Tecnologias

- **React 19** + **TypeScript**
- **Tailwind CSS v4** (via Vite plugin)
- **Vite 6**
- **Express** (servidor de API)
- **IndexedDB** (armazenamento local de textos, avaliações e áudios)
- **Web Speech API** (transcrição em tempo real)
- **MediaRecorder API** (gravação de áudio)

## 📁 Estrutura do Projeto

```
speek-it/
├── src/
│   ├── App.tsx                        # Orquestrador: conecta hooks e telas, sem lógica própria
│   ├── main.tsx                       # Entry point
│   ├── index.css                      # Estilos globais + Tailwind
│   ├── types.ts                       # Interfaces TypeScript
│   ├── hooks/
│   │   ├── useTrainingLibrary.ts      # Textos/avaliações + persistência (IndexedDB)
│   │   ├── useTeleprompter.ts         # Scroll, timer e auto-scroll do teleprompter
│   │   ├── useWordTracking.ts         # Tokenização do texto e acompanhamento palavra-a-palavra
│   │   ├── useVideoCreatorMode.ts     # Câmera + gravação de vídeo (Modo Creator)
│   │   ├── useSpeechRecorder.ts       # Microfone, MediaRecorder e Web Speech API
│   │   ├── useSpeechEvaluation.ts     # Avaliação de oratória (heurística local)
│   │   └── useKeyboardShortcuts.ts    # Atalhos de teclado (Space/R/Esc)
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppNavbar.tsx          # Navegação (desktop + mobile)
│   │   ├── train/
│   │   │   ├── TrainingTab.tsx        # Composição da aba de treino
│   │   │   ├── ScriptSidebar.tsx      # Lista de roteiros
│   │   │   ├── TeleprompterMonitor.tsx# Monitor de leitura + controles
│   │   │   └── AnalysisPanel.tsx      # Painel de resultado da análise
│   │   ├── history/
│   │   │   └── HistoryTab.tsx         # Aba de histórico de treinos
│   │   ├── TextBank.tsx               # Gerenciamento de roteiros (Banco de Textos)
│   │   ├── Dashboard.tsx              # Dashboard de evolução
│   │   ├── AdminDashboard.tsx         # Painel administrativo
│   │   ├── LoginPage.tsx              # Autenticação
│   │   └── ThemeToggle.tsx            # Alternador de tema
│   ├── contexts/
│   │   └── AuthContext.tsx            # Sessão do usuário (JWT)
│   └── lib/
│       ├── db.ts                      # IndexedDB (textos, avaliações, áudio)
│       ├── speechAnalysis.ts          # Normalização de texto + análise local de fala
│       └── format.ts                  # Formatação de tempo e categorias
├── server.ts                          # Entry point: monta rotas + Vite/estático
├── server/
│   ├── db.ts                          # Persistência em JSON (usuários, avaliações)
│   ├── auth.ts                        # JWT + middlewares de autenticação
│   └── routes/
│       ├── auth.ts                    # /api/auth (register, login, me)
│       ├── admin.ts                   # /api/admin (estatísticas)
│       └── evaluations.ts             # /api/evaluations (sync com o servidor)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 📄 Licença

Apache-2.0 — veja [LICENSE](LICENSE) para detalhes.
# Speek-It-2
