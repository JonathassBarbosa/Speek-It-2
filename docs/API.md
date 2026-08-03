# API

Base pública: `https://speekit.jsbsmartservices.com.br/api`

Corpos usam JSON, exceto o webhook externo do Coach, que usa `multipart/form-data`.

## Autenticação

Rotas protegidas exigem:

```http
Authorization: Bearer SEU_TOKEN
```

O token JWT expira em sete dias.

## Autenticação e senha

### `POST /auth/register`

```json
{ "name": "Nome", "email": "pessoa@exemplo.com", "password": "senha-com-8-ou-mais" }
```

Retorna token e usuário. `400` para campos inválidos ou e-mail já cadastrado.

### `POST /auth/login`

```json
{ "email": "pessoa@exemplo.com", "password": "senha" }
```

Retorna token e usuário. `401` para credenciais incorretas.

### `GET /auth/me`

Protegida. Retorna usuário atual ou `404`.

### `POST /auth/password/forgot`

```json
{ "email": "pessoa@exemplo.com" }
```

Retorna sempre mensagem neutra. `503` quando e-mail não está configurado.

### `POST /auth/password/reset`

```json
{ "email": "pessoa@exemplo.com", "code": "123456", "password": "nova-senha" }
```

Retorna sucesso ou `400` para código inválido/expirado.

## Avaliações

### `POST /evaluations/sync`

Protegida. Recebe `textId`, `textTitle`, `score`, `diccaoScore`, `ritmoScore`, `entonacaoScore`, `pausasScore` e `duration`. Salva apenas o resumo.

## Administração

Todas exigem token com função `admin`.

- `GET /admin/stats`: totais e ranking.
- `GET /admin/backups`: lista snapshots.
- `POST /admin/backups`: cria snapshot.
- `POST /admin/backups/:id/restore`: restaura snapshot.
- `GET /admin/diagnostics`: estado atual dos serviços.
- `POST /admin/diagnostics/run`: executa `storage`, `coach-config` ou `coach-end-to-end`.

Exemplo:

```json
{ "id": "coach-config" }
```

O teste `coach-end-to-end` envia mensagem real ao n8n.

## Monitoramento

### `GET /monitoring/health`

Pública e sem cache. Retorna status, horário, backend de armazenamento, latência e configuração de e-mail. `503` indica degradação do armazenamento.

### `POST /monitoring/client-error`

Protegida. Aceita mensagem, stack, componentStack, caminho e user-agent com limites de tamanho.

### `GET /monitoring/errors`

Administrativa. Retorna erros recentes.

## Códigos comuns

- `200`: sucesso.
- `201`: recurso criado.
- `202`: erro do cliente aceito para registro.
- `400`: requisição inválida.
- `401`: ausente, inválido ou expirado.
- `403`: não administrador.
- `404`: recurso ou rota inexistente.
- `503`: dependência essencial indisponível.

## Limites

A função serverless de produção aceita JSON e formulários de até 5 MB; o servidor local está configurado com limite de 50 MB. Isso não deve ser interpretado como autorização para enviar arquivos grandes: o backend normal não recebe áudio de treino.
