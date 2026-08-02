# Inventário operacional

Este documento informa onde cada item está, sem publicar valores secretos.

## Serviços e endereços

| Item | Local |
|---|---|
| Site público | `https://speekit.jsbsmartservices.com.br` |
| Domínio Vercel | `https://speek-it-2.vercel.app` |
| Saúde da API | `/api/monitoring/health` |
| Repositório | `github.com/JonathassBarbosa/Speek-It-2` |
| Projeto Vercel | equipe `ktbsmarts-projects`, projeto `speek-it-2` |
| Domínio/DNS | Hostinger, `jsbsmartservices.com.br` |
| VPS n8n | Hetzner, IP `65.109.163.218` |
| n8n HTTPS | `https://n8n-65-109-163-218.nip.io` |
| Webhook Coach | `/webhook/speek-it-coach-local` |
| Banco | Upstash Redis conectado à Vercel |
| E-mail | Resend |

## Credenciais: onde localizar

| Credencial | Local seguro | Recuperação/rotação |
|---|---|---|
| GitHub | chaveiro do sistema/`gh auth` | `gh auth login` |
| Vercel | conta Vercel | configurações da conta/equipe |
| Admin Speek It | variáveis Vercel | alterar `ADMIN_PASSWORD` e redeploy |
| JWT | variável Vercel | gerar novo segredo; usuários refazem login |
| Redis | integração Upstash/Vercel | rotacionar no Upstash e atualizar variáveis |
| Resend | painel Resend | criar nova API key e atualizar Vercel |
| Gemini | credencial do n8n | rotacionar no Google AI Studio e n8n |
| VPS | chave SSH local/Hetzner | console Hetzner ou nova chave SSH |
| n8n | conta e cofre do n8n | recuperação/configuração da instância |
| Hostinger | conta Hostinger | recuperação de conta e 2FA |

## Variáveis Vercel esperadas

- `VITE_COACH_API_URL` — Production e Preview.
- `JWT_SECRET`.
- `ADMIN_EMAIL`.
- `ADMIN_PASSWORD`.
- conjunto URL/token do Upstash aceito pelo código.
- `RESEND_API_KEY`.
- `EMAIL_FROM`.

`VITE_N8N_API_URL` é legado. Mantenha apenas se algum fluxo antigo ainda depender dele; o Coach atual usa `VITE_COACH_API_URL`.

## VPS

Inventário observado:

- Ubuntu 24.04 LTS.
- Docker.
- container `n8n`, porta 5678.
- persistência: `/root/.n8n` → `/home/node/.n8n`.
- Caddy como proxy HTTPS em 80/443.
- outros containers existentes não pertencem diretamente ao Speek It e não devem ser alterados durante manutenção do app.

## Arquivos de recuperação no repositório

- `n8n/speek-it-coach-local.json`: workflow recomendado.
- `n8n/speek-it-unified-vocal-coach.json`: fluxo unificado anterior.
- `.env.example`: nomes e formato das variáveis.
- `data/*.example.json`: formato de dados local, sem usuários reais.

## Registro privado recomendado

Em um gerenciador de senhas, crie o cofre **Speek It Produção** com entradas para GitHub, Vercel, Hostinger, Hetzner/SSH, n8n, Upstash, Resend, Google AI Studio e administrador do app. Ative 2FA quando disponível e guarde códigos de recuperação offline.

Não copie os valores para este arquivo, README, issues, mensagens ou screenshots.
