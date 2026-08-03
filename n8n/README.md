# Workflows n8n do Speek It

## Arquivos

- `speek-it-coach-local.json`: fluxo atual e recomendado, usando Gemini e voz do aparelho.
- `speek-it-unified-vocal-coach.json`: fluxo anterior com nós OpenAI para avaliação, chat e TTS.

## Fluxo atual

O Coach local:

- recebe texto ou áudio em `multipart/form-data`;
- envia o conteúdo ao Gemini;
- força respostas em português do Brasil;
- devolve texto estruturado;
- usa a voz PT-BR disponível no aparelho do usuário;
- mantém a credencial do modelo protegida no cofre do n8n.

Production URL esperada:

```text
/webhook/speek-it-coach-local
```

## Importar

1. Abra **Workflows → Import from File** no n8n.
2. Importe `speek-it-coach-local.json`.
3. Abra **Gerar Resposta Gemini**.
4. Selecione ou recrie a credencial HTTP que envia a chave do Gemini.
5. Confirme modelo, prompt PT-BR e resposta do webhook.
6. Salve e publique/ative o workflow.
7. Copie a **Production URL** do nó Webhook.
8. Cadastre-a como `VITE_COACH_API_URL` na Vercel e faça novo deploy.

O JSON exportado pode aparecer com `active: false`; a ativação é feita na instância após a importação.

Não use `/webhook-test/`, pois ele só funciona durante o teste manual do editor.

## Contrato do Coach atual

Requisição:

- `action`: `chat`.
- `sessionId`: identificador da sessão.
- `text`: texto opcional.
- `audio`: gravação opcional.

Resposta:

```json
{
  "textResponse": "Orientação: ...\n\nPrática: ...",
  "audioBase64": null,
  "voiceProvider": "device",
  "timestamp": "ISO-8601"
}
```

## Fluxo anterior

O workflow unificado usa `/webhook/speek-it-api` e requer configuração dos nós OpenAI. Ele não é o endpoint atual do frontend. Só o publique se houver decisão explícita de voltar à arquitetura com OpenAI/TTS externo.

## Manual completo

Consulte [`docs/COACH-IA-E-N8N.md`](../docs/COACH-IA-E-N8N.md).
