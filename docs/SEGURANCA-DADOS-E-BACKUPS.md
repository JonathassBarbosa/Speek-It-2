# Segurança, dados e backups

## Segredos

Nunca armazene no GitHub:

- senha de administrador;
- `JWT_SECRET`;
- tokens Upstash/Redis;
- chave Resend;
- chave Gemini;
- credenciais do n8n, VPS, Hostinger ou Vercel;
- códigos de recuperação.

Documentar um segredo em repositório público compromete o serviço mesmo que o objetivo seja backup pessoal. Use gerenciador de senhas ou arquivo criptografado fora do repositório.

## Senhas e sessões

- Senhas usam bcrypt.
- JWT assinado expira em sete dias.
- Token fica em `localStorage`, portanto scripts injetados seriam um risco; mantenha dependências e CSP sob revisão.
- A recuperação responde de forma neutra para não revelar contas cadastradas.
- Códigos possuem hash, expiração, limite de tentativas e uso único.

## Dados pessoais

O backend armazena nome, e-mail, função, data de criação e métricas de treino. O navegador armazena roteiros, avaliações detalhadas e áudio. O Coach pode processar texto e áudio enviados voluntariamente.

Antes de lançamento comercial, formalize:

- Política de Privacidade;
- Termos de Uso;
- base legal e consentimento para voz;
- procedimento de exportação e exclusão;
- prazo de retenção;
- contato do controlador;
- contratos com Vercel, Upstash, Resend, Hetzner, n8n e provedor do modelo.

## Backups existentes

O painel administrativo cria snapshots no Redis com usuários e avaliações resumidas. Mantém até 14. A restauração cria um snapshot de pré-restauração.

Não estão incluídos nesses snapshots:

- áudio do IndexedDB;
- roteiros personalizados locais;
- variáveis da Vercel;
- configurações/credenciais do n8n;
- DNS;
- arquivos da VPS.

## Plano completo de backup

### Diário/automático

- proteção e persistência oferecidas pelo Upstash;
- histórico de deploys da Vercel;
- repositório GitHub.

### Antes de mudanças

- snapshot pelo painel;
- exportação do workflow n8n sem credenciais;
- cópia protegida de `/root/.n8n`;
- registro das variáveis existentes por nome e ambiente;
- captura dos registros DNS, sem tokens.

### Teste de restauração

Trimestralmente, restaure em ambiente isolado e confirme login, totais, avaliação e Coach. Backup nunca testado é apenas uma hipótese.

## Resposta a vazamento

1. desative/rotacione a credencial no provedor;
2. atualize Vercel ou n8n;
3. faça novo deploy/reinício necessário;
4. encerre sessões quando aplicável, trocando `JWT_SECRET`;
5. revise logs e impacto;
6. documente o incidente;
7. avalie obrigações legais de comunicação.
