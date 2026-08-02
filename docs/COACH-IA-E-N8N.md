# Coach IA e n8n

## Produção atual

- Host HTTPS do n8n: `https://n8n-65-109-163-218.nip.io`
- Webhook ativo do Coach: `/webhook/speek-it-coach-local`
- URL completa configurada na Vercel: `VITE_COACH_API_URL`
- Workflow recomendado: `n8n/speek-it-coach-local.json`

Não use `/webhook-test/`: ele funciona apenas enquanto o editor do n8n está aguardando uma execução de teste. Não use `/webhook/speek-it-api` sem publicar o workflow correspondente; um caminho inexistente retorna 404.

## Importar ou restaurar

1. Entre no n8n da VPS.
2. Abra **Workflows → Import from File**.
3. Importe `n8n/speek-it-coach-local.json`.
4. Configure a credencial Gemini no cofre do n8n.
5. Revise todos os nós com alerta.
6. Salve e publique/ative o workflow.
7. Abra o nó Webhook e confirme a Production URL.
8. Teste com POST antes de atualizar a Vercel.

## Contrato

Requisição `multipart/form-data`:

- `action`: `chat`.
- `sessionId`: identificador do usuário/sessão.
- `text`: mensagem opcional.
- `audio`: arquivo opcional `webm` ou `m4a`.

Resposta esperada:

```json
{
  "textResponse": "Orientação em português do Brasil...",
  "audioBase64": null,
  "voiceProvider": "device",
  "timestamp": "ISO-8601"
}
```

Erros devem retornar status HTTP adequado e, quando possível, `{ "error": "mensagem" }`.

## Teste manual

```bash
curl -X POST \
  -F action=chat \
  -F sessionId=teste-operacional \
  -F text='Responda apenas: Coach operacional.' \
  https://n8n-65-109-163-218.nip.io/webhook/speek-it-coach-local
```

Esse teste pode consumir a cota do modelo.

## Diagnóstico

- `404`: URL incorreta, caminho de teste ou workflow inativo.
- `500`: nó falhou; consulte Executions no n8n.
- timeout: VPS, proxy, n8n ou modelo demorou além do limite.
- resposta vazia: último nó não devolveu JSON.
- inglês: prompt do workflow não está fixando PT-BR.
- áudio não entendido: valide tipo MIME e campo `audio`.

## Operação da VPS

Serviços historicamente usados: container `n8n` na porta 5678 e Caddy nas portas 80/443. A persistência do n8n é montada em `/root/.n8n` no host.

Antes de atualizar containers, faça cópia da pasta persistente e exporte workflows/credenciais conforme os recursos do n8n. Não coloque credenciais exportadas no GitHub.
