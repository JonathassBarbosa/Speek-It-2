# Arquitetura

## Visão geral

O Speek It é uma aplicação React de página única com uma API Express. Na Vercel, o frontend é estático e a API roda como função serverless. O Coach é uma integração externa hospedada no n8n da VPS.

## Componentes

### Frontend

- `src/App.tsx`: composição principal, autenticação, navegação e ligação dos hooks.
- `src/components/train/`: teleprompter, controles e análise.
- `src/components/VocalCoachChat.tsx`: texto/áudio do Coach e síntese de voz.
- `src/components/Dashboard.tsx`: evolução e conquistas.
- `src/components/AdminDashboard.tsx`: operação administrativa.
- `src/components/admin/SystemDiagnostics.tsx`: diagnóstico em tempo real.
- `src/contexts/AuthContext.tsx`: sessão, login e cadastro.
- `src/lib/db.ts`: IndexedDB.
- `src/lib/speechAnalysis.ts`: análise heurística local.

### Backend

- `server.ts`: Express local e servidor de produção compilado.
- `api/index.ts`: entrada serverless da Vercel.
- `server/auth.ts`: JWT e autorização administrativa.
- `server/db.ts`: Redis ou arquivos locais no desenvolvimento.
- `server/email.ts`: Resend.
- `server/diagnostics.ts`: verificações administrativas.
- `server/routes/`: autenticação, avaliações, administração e monitoramento.

### Infraestrutura

- Vercel: domínio, build, frontend e API.
- Upstash Redis: persistência do backend.
- Resend: envio de códigos.
- Hetzner VPS: Docker com n8n e proxy HTTPS Caddy.
- n8n: orquestra Coach/Gemini.
- GitHub: código, PRs e Actions.

## Fluxos principais

### Autenticação

1. Frontend envia e-mail e senha a `/api/auth/login`.
2. Backend lê usuário no Redis e valida bcrypt.
3. JWT com `userId` e `role` é emitido por sete dias.
4. Frontend guarda o token em `localStorage`.
5. Rotas protegidas validam `Authorization: Bearer`.

### Recuperação de senha

1. Usuário solicita recuperação.
2. Backend sempre responde de forma neutra para evitar enumeração.
3. Para usuário existente, cria código aleatório, salva hash no Redis e envia pelo Resend.
4. O código expira em dez minutos, possui limite de tentativas e uso único.
5. Senha nova é armazenada com bcrypt custo 12.

### Treino

1. Roteiro é carregado do IndexedDB.
2. MediaRecorder captura áudio.
3. Web Speech API gera transcrição PT-BR quando suportada.
4. O teleprompter avança continuamente e acompanha palavras reconhecidas.
5. `analyzeSpeechLocally` calcula notas heurísticas.
6. Avaliação completa e áudio ficam no IndexedDB.
7. Resumo é sincronizado com o Redis para métricas administrativas.

### Coach

1. Usuário envia texto ou áudio diretamente ao webhook configurado em `VITE_COACH_API_URL`.
2. n8n processa o pedido com o modelo configurado.
3. Retorna JSON com `textResponse` e, opcionalmente, `audioBase64`.
4. Se não houver áudio do servidor, o navegador usa voz PT-BR instalada.

## Modelo de dados

### Redis

- `speek-it:users`: id, e-mail, nome, hash, função e criação.
- `speek-it:evaluations`: resumo das notas e duração.
- `speek-it:backups`: até 14 snapshots.
- `speek-it:client-errors`: até 100 erros recentes.
- `speek-it:password-resets`: códigos com hash, expiração e tentativas.

### IndexedDB `TeleprompterInteligenteDB`

- `texts`: roteiros predefinidos e personalizados.
- `evaluations`: avaliações completas e feedback.
- `audio`: blobs de gravação.

## Decisões importantes

- A análise principal é local para reduzir custo e dependência externa.
- Áudios de treino não são persistidos no backend.
- Métricas resumidas permitem administração sem transferir o arquivo de áudio.
- `VITE_*` é público por definição; somente URLs não secretas devem usar esse prefixo.
- Redis é obrigatório na Vercel, pois o sistema de arquivos serverless não é persistente.

## Limitações conhecidas

- Web Speech API varia por navegador e pode exigir serviço do fornecedor do navegador.
- Histórico completo é específico do navegador/perfil.
- A análise heurística não substitui avaliação profissional.
- A disponibilidade do Coach depende de VPS, Caddy, n8n, workflow e Gemini.
- Voz sintetizada depende das vozes instaladas no aparelho.
