# Speek It.

Plataforma brasileira de treinamento de comunicação e oratória com teleprompter, acompanhamento palavra por palavra, análise local de fala, histórico de evolução, conquistas e Coach IA em português do Brasil.

**Produção:** [speekit.jsbsmartservices.com.br](https://speekit.jsbsmartservices.com.br/)

**API de saúde:** [speekit.jsbsmartservices.com.br/api/monitoring/health](https://speekit.jsbsmartservices.com.br/api/monitoring/health)

**Repositório:** [JonathassBarbosa/Speek-It-2](https://github.com/JonathassBarbosa/Speek-It-2)

## Situação atual

O produto possui frontend e API publicados na Vercel, domínio próprio, persistência Redis, recuperação de senha por e-mail, Coach integrado ao n8n e painel administrativo com diagnóstico em tempo real.

O treinamento principal não depende de IA externa: gravação, acompanhamento do roteiro e pontuação são processados no navegador. Apenas o Coach conversa com o webhook do n8n.

## Funcionalidades

- Cadastro, login e sessão com duração de sete dias.
- Recuperação de senha por código de seis dígitos enviado por e-mail.
- Teleprompter com velocidade, tamanho da fonte, progresso e atalhos.
- Gravação de áudio e modo criador com câmera/vídeo.
- Reconhecimento de fala em PT-BR e feedback por palavra.
- Avaliação local de dicção, ritmo, entonação e pausas.
- Biblioteca com roteiros predefinidos e personalizados.
- Histórico com reprodução das gravações armazenadas no aparelho.
- Dashboard de evolução e conquistas compartilháveis.
- Coach IA por texto ou voz, com resposta em PT-BR.
- Tema claro e escuro.
- Administração de usuários, métricas, backups e restauração.
- Central de diagnóstico de API, Redis, e-mail, microfone, navegador e Coach.
- Monitoramento de disponibilidade e registro de erros do frontend.

## Documentação completa

| Documento | Conteúdo |
|---|---|
| [Manual do usuário](docs/MANUAL-DO-USUARIO.md) | Cadastro, treino, Coach, histórico, evolução e permissões |
| [Manual do administrador](docs/MANUAL-DO-ADMINISTRADOR.md) | Acesso administrativo, diagnóstico, usuários e backups |
| [Arquitetura](docs/ARQUITETURA.md) | Componentes, fluxos, dados, tecnologias e decisões técnicas |
| [API](docs/API.md) | Endpoints, autenticação, exemplos e códigos de resposta |
| [Coach IA e n8n](docs/COACH-IA-E-N8N.md) | Workflow, webhook, contrato, ativação e testes |
| [Operação e deploy](docs/OPERACAO-E-DEPLOY.md) | Desenvolvimento, Vercel, domínio, publicação e rollback |
| [Segurança, dados e backups](docs/SEGURANCA-DADOS-E-BACKUPS.md) | Segredos, persistência, privacidade, backup e restauração |
| [Solução de problemas](docs/SOLUCAO-DE-PROBLEMAS.md) | Diagnóstico de falhas comuns e roteiro para demonstrações |
| [Inventário operacional](docs/INVENTARIO-OPERACIONAL.md) | Serviços, URLs, variáveis e onde localizar credenciais |

## Arquitetura resumida

```text
Navegador
├── React + Vite + Tailwind
├── IndexedDB: roteiros, avaliações completas e áudios
├── Web Speech API: transcrição e acompanhamento de palavras
└── MediaRecorder: áudio e vídeo
        │
        ├── /api → Express na Vercel
        │           ├── autenticação JWT
        │           ├── usuários e métricas → Redis/Upstash
        │           ├── recuperação → Resend
        │           └── diagnóstico e backups
        │
        └── Coach → webhook HTTPS do n8n na VPS
                    └── Gemini + resposta PT-BR
```

Mais detalhes em [Arquitetura](docs/ARQUITETURA.md).

## Tecnologias

- React 19, TypeScript e Vite 6.
- Tailwind CSS 4, Motion e Lucide React.
- Express 4, JSON Web Token e bcrypt.
- IndexedDB no navegador.
- Upstash Redis para persistência do servidor.
- Resend para códigos de recuperação.
- n8n e Gemini para o Coach.
- Vercel para frontend e API serverless.
- GitHub Actions para validação e disponibilidade.

## Desenvolvimento local

### Requisitos

- Node.js 20 ou superior.
- npm.
- Navegador moderno com microfone.

### Instalação

```bash
git clone https://github.com/JonathassBarbosa/Speek-It-2.git
cd Speek-It-2
npm ci
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

Sem Redis, os dados do servidor são gravados na pasta `data/` apenas durante o desenvolvimento. Em produção, o Redis é obrigatório.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Inicia frontend e API localmente |
| `npm run lint` | Valida TypeScript |
| `npm run test` | Executa testes automatizados |
| `npm run build` | Gera o pacote de produção |
| `npm run check` | Executa tipos, testes e build |
| `npm start` | Executa o servidor compilado |

## Variáveis de ambiente

| Variável | Uso | Obrigatória em produção | Sigilo |
|---|---|---:|---|
| `VITE_COACH_API_URL` | Webhook de produção do Coach | Sim, para o Coach | Pública no bundle |
| `VITE_N8N_API_URL` | Compatibilidade com fluxo unificado antigo | Não | Pública no bundle |
| `JWT_SECRET` | Assinatura das sessões | Sim | Secreta |
| `ADMIN_EMAIL` | Conta administrativa inicial | Sim | Sensível |
| `ADMIN_PASSWORD` | Senha administrativa inicial | Sim | Secreta |
| `UPSTASH_REDIS_REST_URL` | Endpoint REST do Redis | Sim | Sensível |
| `UPSTASH_REDIS_REST_TOKEN` | Token do Redis | Sim | Secreta |
| `UPSTASH_KV_REST_API_URL` | Nome alternativo criado pela integração | Alternativa | Sensível |
| `UPSTASH_KV_REST_API_TOKEN` | Token alternativo da integração | Alternativa | Secreta |
| `RESEND_API_KEY` | Envio de e-mails | Sim, para recuperação | Secreta |
| `EMAIL_FROM` | Remetente verificado | Sim, para recuperação | Configuração |

Use [.env.example](.env.example) como modelo. Nunca faça commit de `.env`, `.env.local`, tokens, senhas ou chaves privadas.

## Dados e persistência

- **IndexedDB:** roteiros, avaliações completas e arquivos de áudio ficam no navegador do usuário.
- **Redis:** usuários, hashes de senha, métricas resumidas, backups, erros e códigos temporários ficam no servidor.
- **Senha:** armazenada somente como hash bcrypt.
- **Códigos:** armazenados como hash, expiram em dez minutos e são de uso único.
- **Áudio:** não é enviado ao backend do Speek It; no Coach, é enviado diretamente ao webhook quando solicitado pelo usuário.

## Publicação

O `vercel.json` direciona `/api/*` para `api/index.ts` e serve o restante como SPA. Cada atualização integrada à branch `main` inicia um deploy de produção.

Checklist resumido:

1. Executar `npm run check`.
2. Abrir PR contra `main`.
3. Confirmar GitHub Actions e Vercel Preview.
4. Integrar a PR.
5. Aguardar Vercel `Ready`.
6. Testar `/api/monitoring/health`.
7. Entrar como administrador e executar a Central de Diagnóstico.

Consulte [Operação e deploy](docs/OPERACAO-E-DEPLOY.md) para o procedimento completo.

## Segurança

Este repositório é público. Credenciais reais devem existir somente nos cofres da Vercel, n8n, Resend e Upstash. O [Inventário operacional](docs/INVENTARIO-OPERACIONAL.md) registra onde encontrá-las sem publicar seus valores.

Se uma credencial for exposta, remova-a do serviço, gere outra, atualize o cofre correspondente e faça novo deploy. Apagar apenas o texto do Git não invalida uma chave já copiada.

## Licença

O código contém cabeçalhos SPDX `Apache-2.0`. Confirme a política comercial e os direitos sobre ativos visuais antes de redistribuir o produto ou aceitar contribuições externas.
