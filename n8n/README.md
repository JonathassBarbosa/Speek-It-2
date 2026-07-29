# Workflow n8n do Speek-It

Arquivo para importação:

- `speek-it-unified-vocal-coach.json`
- `speek-it-coach-local.json` — versão recomendada sem cobrança por chamada

## Coach no nível gratuito

O arquivo `speek-it-coach-local.json` usa:

- Gemini Flash no nível gratuito;
- transcrição de voz em português do Brasil feita pelo navegador;
- voz em português do Brasil fornecida pelo aparelho do usuário;
- credencial protegida pelo cofre do n8n;
- nenhuma cobrança por chamada dentro dos limites gratuitos.

A URL de produção termina em:

```text
/webhook/speek-it-coach-local
```

## Importar

1. Abra o n8n.
2. Selecione **Workflows → Import from File**.
3. Escolha o arquivo JSON desta pasta.
4. Abra os cinco nós cujo nome começa com `OpenAI`.
5. Selecione a mesma credencial OpenAI em cada um deles.
6. Salve e publique/ative o workflow.
7. Abra `Webhook API Entry` e copie a **Production URL**.

Não use a URL com `/webhook-test/`. A URL correta termina em:

```text
/webhook/speek-it-api
```

## Contrato da API

### Avaliação

`multipart/form-data`:

- `action`: `evaluate`
- `promptText`: texto alvo em inglês
- `audio`: gravação do aluno

### Chat por texto

`multipart/form-data`:

- `action`: `chat`
- `sessionId`: identificador da sessão
- `text`: mensagem

### Chat por áudio

`multipart/form-data`:

- `action`: `chat`
- `sessionId`: identificador da sessão
- `audio`: gravação do aluno
