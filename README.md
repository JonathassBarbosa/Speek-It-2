# Speek It.

Plataforma brasileira de treino de comunicação com teleprompter, acompanhamento palavra por palavra, análise local de fala, histórico de evolução e Coach IA em português do Brasil.

## Funcionalidades

- Teleprompter com velocidade, tamanho e linha de foco ajustáveis.
- Gravação de áudio e modo de criação com câmera.
- Acompanhamento das palavras reconhecidas durante a leitura.
- Avaliação local de dicção, ritmo, entonação e pausas.
- Histórico com reprodução das gravações armazenadas no navegador.
- Dashboard de evolução e conquistas compartilháveis.
- Coach IA por texto ou voz integrado ao n8n e Gemini.
- Autenticação, painel administrativo e sincronização de métricas.
- Backup e restauração dos usuários e avaliações pelo painel administrativo.
- Endpoint de saúde e monitoramento automático de disponibilidade.

## Arquitetura

- React 19, TypeScript, Vite e Tailwind CSS v4 no frontend.
- API Express executada como função serverless na Vercel.
- Redis/Upstash para usuários, avaliações, backups e registros de erro.
- IndexedDB no navegador para textos, avaliações completas e arquivos de áudio.
- n8n na VPS para o fluxo do Coach IA.

O frontend e a API são publicados pela Vercel. GitHub Pages não é compatível com a arquitetura atual porque autenticação e administração dependem da API.

## Desenvolvimento local

Pré-requisitos: Node.js 20 ou superior.

```bash
git clone https://github.com/JonathassBarbosa/Speek-It-2.git
cd Speek-It-2
npm ci
cp .env.example .env.local
npm run dev
```

O aplicativo local fica disponível em `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Ambiente | Finalidade |
|---|---|---|
| `VITE_COACH_API_URL` | build/frontend | Webhook HTTPS de produção do Coach no n8n |
| `JWT_SECRET` | servidor | Assinatura dos tokens de autenticação |
| `ADMIN_EMAIL` | servidor | E-mail do administrador inicial |
| `ADMIN_PASSWORD` | servidor | Senha forte do administrador inicial |
| `UPSTASH_REDIS_REST_URL` | servidor | Endpoint REST do Redis |
| `UPSTASH_REDIS_REST_TOKEN` | servidor | Credencial REST do Redis |
| `RESEND_API_KEY` | servidor | Envio dos códigos de recuperação de senha |
| `EMAIL_FROM` | servidor | Remetente verificado, como `Speek It <recuperacao@dominio.com>` |

As variáveis que começam com `VITE_` ficam visíveis no código do navegador. Nunca armazene chaves privadas nelas. A chave do Gemini deve permanecer protegida dentro das credenciais do n8n.

### Recuperação de senha

O fluxo de recuperação envia um código numérico de seis dígitos para o e-mail cadastrado. O código expira em 10 minutos, permite no máximo cinco tentativas e só pode ser solicitado novamente após 60 segundos.

O envio utiliza a API da Resend. Cadastre `RESEND_API_KEY` e um remetente verificado em `EMAIL_FROM` nas variáveis da Vercel. O endpoint de saúde informa `services.email: configured` quando o envio está pronto.

## Validação

```bash
npm run lint
npm run test
npm run build
npm audit --omit=dev
```

O comando `npm run check` executa tipos, testes e compilação em sequência. A automação `.github/workflows/ci.yml` repete essas validações em cada PR e atualização da `main`.

## Publicação na Vercel

1. Importe o repositório na Vercel.
2. Cadastre todas as variáveis de servidor e `VITE_COACH_API_URL`.
3. Conecte um Redis compatível com REST.
4. Publique a branch `main`.
5. Confirme `GET /api/monitoring/health`.
6. Quando o lançamento for público, ajuste a proteção de acesso da Vercel conscientemente.

O arquivo `vercel.json` encaminha `/api/*` para a função Express e as demais rotas para o aplicativo.

## Monitoramento

- `GET /api/monitoring/health` verifica API e persistência.
- Erros críticos de renderização autenticada são enviados para o backend.
- Administradores podem consultar `GET /api/monitoring/errors`.
- A automação `.github/workflows/availability.yml` consulta a produção a cada 30 minutos.
- Falhas aparecem na aba **Actions** do GitHub e podem usar as notificações nativas do repositório.

## Backup e restauração

O painel administrativo permite criar snapshots de usuários e avaliações. São mantidos os 14 backups mais recentes no Redis.

Antes de uma restauração, o sistema cria automaticamente um snapshot do estado atual. A restauração exige uma sessão de administrador.

Recomendações operacionais:

- crie um backup antes de mudanças relevantes;
- valide periodicamente se os snapshots aparecem no painel;
- mantenha também o backup gerenciado oferecido pelo provedor do Redis;
- restrinja o acesso às credenciais da Vercel, Redis e n8n.

## Privacidade dos arquivos

As gravações de treino e os vídeos permanecem no navegador do usuário. O Coach envia ao n8n somente o texto ou áudio que o usuário decidir enviar naquela conversa. As métricas resumidas das avaliações são sincronizadas com o servidor.

## Licença

Apache-2.0.
