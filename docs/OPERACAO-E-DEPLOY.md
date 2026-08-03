# Operação e deploy

## Ambientes

- Local: `http://localhost:3000`.
- Preview: criado pela Vercel para branches/PRs.
- Produção Vercel: `https://speek-it-2.vercel.app`.
- Domínio público: `https://speekit.jsbsmartservices.com.br`.
- n8n: VPS externa via HTTPS.

## Fluxo de alteração

1. Atualize `main` localmente.
2. Crie branch `codex/descricao`.
3. Faça alterações restritas ao escopo.
4. Execute `npm run check`.
5. Faça commit e push.
6. Abra PR contra `main`.
7. Verifique GitHub Actions e Vercel Preview.
8. Integre a PR.
9. Aguarde Production `Ready`.
10. Faça smoke test.

## Smoke test de produção

1. `GET /api/monitoring/health` retorna `status: ok` e `backend: redis`.
2. Cadastro e login funcionam.
3. Recuperação envia código.
4. Microfone grava alguns segundos.
5. Teleprompter avança e gera avaliação.
6. Coach responde a texto em PT-BR.
7. Admin abre a Central de Diagnóstico.
8. Domínio personalizado responde HTTPS.

## Variáveis na Vercel

Cadastre em **Project → Settings → Environment Variables**. Alterações em `VITE_*` exigem novo build porque entram no bundle do frontend. Depois de salvar qualquer variável, faça redeploy de Production e Preview conforme necessário.

Variáveis secretas devem ser marcadas como Sensitive. `VITE_COACH_API_URL` pode ser pública, pois URLs `VITE_*` ficam visíveis no navegador.

## Domínio

O subdomínio `speekit.jsbsmartservices.com.br` deve estar adicionado ao projeto Vercel. O DNS na Hostinger deve apontar conforme a instrução atual da Vercel. Se aparecer `ERR_NAME_NOT_RESOLVED`, revise o registro e aguarde propagação. Se houver certificado pendente, não force HTTP.

## Rollback

Na Vercel:

1. abra Deployments;
2. identifique o último deploy `Ready` conhecido;
3. use Promote/Redeploy conforme a interface;
4. confirme os domínios atribuídos;
5. faça o smoke test.

Rollback do frontend não desfaz dados já gravados. Se o incidente afetar usuários/avaliações, use backup administrativo somente após confirmar o snapshot correto.

## Monitoramento

- `.github/workflows/ci.yml`: valida PRs e main.
- `.github/workflows/availability.yml`: consulta produção periodicamente.
- `/api/monitoring/health`: saúde da API/Redis/e-mail.
- Vercel Logs: falhas serverless.
- n8n Executions: falhas do Coach.
- Central de Diagnóstico: teste guiado ponta a ponta.

## Atualização de dependências

Faça em branch separada. Execute `npm audit`, revise changelogs, rode `npm run check` e teste microfone/câmera em preview. Não atualize n8n, Caddy ou Redis durante demonstração ou sem backup.
