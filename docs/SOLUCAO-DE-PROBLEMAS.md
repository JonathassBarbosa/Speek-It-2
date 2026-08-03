# Solução de problemas

## Checklist antes de demonstração

Execute com pelo menos 15 minutos de antecedência:

1. confirme internet do aparelho;
2. abra o domínio em janela nova;
3. entre como administrador;
4. execute **Testar funções agora**;
5. confirme Redis operacional;
6. teste microfone e uma gravação de dez segundos;
7. envie texto curto ao Coach;
8. confira bateria, volume e entrada de áudio;
9. feche aplicativos usando microfone/câmera;
10. tenha um roteiro curto previamente selecionado.

## Site não abre

- Teste `speek-it-2.vercel.app` para separar domínio de aplicação.
- Consulte Vercel Deployments.
- Confirme DNS na Hostinger.
- Verifique status HTTPS/certificado.

## API degradada

- Abra `/api/monitoring/health`.
- Se `503`, confira Upstash e nomes das variáveis.
- Consulte Vercel Logs.
- Não use armazenamento local na Vercel.

## Login falha

- Confirme e-mail sem espaços.
- Use recuperação de senha.
- Verifique Redis.
- Para a criação inicial do admin, confira `ADMIN_EMAIL`/`ADMIN_PASSWORD` e o deploy; para um admin existente, use a recuperação de senha.
- Trocar a variável não muda produção até novo deploy.

## Código não chega

- Confira `RESEND_API_KEY` e `EMAIL_FROM`.
- O remetente precisa estar verificado.
- Revise Resend Logs e spam.
- Aguarde o intervalo de nova solicitação.
- Não informe se um e-mail está ou não cadastrado.

## Microfone não funciona

- Confirme permissão do site e do sistema operacional.
- Selecione a entrada correta.
- Feche apps concorrentes.
- Teste Chrome atualizado.
- Recarregue após mudar permissão.

## Palavras não mudam de cor

- O navegador precisa oferecer Web Speech API.
- Idioma deve ser PT-BR.
- Fale próximo ao microfone e reduza ruído.
- A gravação pode funcionar mesmo sem acompanhamento ao vivo.

## Coach retorna 404

- Confirme `VITE_COACH_API_URL`.
- Use `/webhook/`, nunca `/webhook-test/`.
- Produção atual termina em `/webhook/speek-it-coach-local`.
- Confirme workflow publicado/ativo.
- Após mudar `VITE_*`, faça redeploy com novo build.

## Coach retorna 500 ou timeout

- Confira n8n Executions.
- Verifique credencial Gemini e limites.
- Confirme containers n8n/Caddy na VPS.
- Teste o webhook diretamente com POST.
- Verifique tempo máximo da Vercel e do workflow.

## Coach responde em outro idioma

- Reforce PT-BR no prompt do workflow.
- Confirme que o frontend enviado é a versão atual.
- Valide se o modelo não está interpretando o roteiro como idioma solicitado.

## Voz robotizada

- O modo atual pode usar `speechSynthesis` do aparelho.
- Instale/ative voz natural PT-BR no sistema.
- Teste Chrome/Safari conforme o sistema.
- Para voz neural externa, avalie custo, privacidade e latência antes de trocar.

## Histórico ausente

- Verifique navegador e perfil originais.
- Não limpe dados do site.
- IndexedDB não sincroniza integralmente entre aparelhos.
- O painel administrativo contém apenas métricas resumidas.

## Como registrar incidente

Inclua horário, URL, navegador, sistema, ação, mensagem, resultado esperado e screenshot sem dados pessoais. Não inclua tokens, senhas, códigos ou chaves.
