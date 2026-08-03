# Manual do administrador

## Acesso

A primeira conta administrativa é criada na inicialização a partir de `ADMIN_EMAIL` e `ADMIN_PASSWORD`, somente quando ainda não existe nenhum usuário com função `admin`. Entre pela tela normal e clique no ícone de escudo disponível apenas para essa função.

Nunca compartilhe a senha administrativa. Para uma conta já criada, use a recuperação de senha pelo e-mail administrativo. Alterar `ADMIN_PASSWORD` na Vercel não substitui automaticamente a senha de um administrador existente.

## Controle e operação

O painel apresenta:

- total de usuários não administrativos;
- sessões sincronizadas;
- média global;
- treinos por usuário;
- ranking com médias, recordes, minutos e último acesso;
- backups e restauração;
- Central de Diagnóstico.

## Central de Diagnóstico

Atualiza automaticamente a cada 15 segundos e verifica:

- API e sessão administrativa;
- Redis e latência;
- configuração JWT e conta administrativa;
- Resend e remetente;
- configuração e conectividade do Coach;
- conexão do navegador;
- microfone;
- MediaRecorder;
- reconhecimento de fala;
- voz PT-BR;
- armazenamento local.

O botão **Testar funções agora** executa verificações seguras. O teste completo do Coach fica separado porque envia uma mensagem real e pode consumir cota do provedor.

### Interpretação

- **Operacional:** teste aprovado.
- **Atenção:** recurso opcional, compatibilidade parcial ou teste manual pendente.
- **Falha:** serviço inacessível, variável ausente ou permissão negada.

Antes de uma demonstração, execute o checklist de [Solução de problemas](SOLUCAO-DE-PROBLEMAS.md).

## Backups

**Criar backup agora** gera um snapshot de usuários e avaliações resumidas no Redis. São mantidos até 14 snapshots.

Ao restaurar:

1. confirme a data e os totais;
2. a aplicação cria automaticamente um snapshot do estado atual;
3. usuários e avaliações do backup substituem os conjuntos atuais;
4. dados locais de IndexedDB nos aparelhos não são alterados.

## Erros do frontend

Erros críticos capturados pelo `ErrorBoundary` são enviados para `/api/monitoring/client-error` quando existe sessão válida. Administradores podem consultar `/api/monitoring/errors` com token administrativo.

## Rotina recomendada

### Antes de demonstrar

1. Abra o site em janela normal.
2. Entre como administrador.
3. Execute todos os diagnósticos seguros.
4. Teste o microfone falando por alguns segundos.
5. Envie uma frase curta ao Coach.
6. Confirme um roteiro e uma avaliação.

### Semanalmente

- conferir `/api/monitoring/health`;
- verificar falhas da automação de disponibilidade;
- criar backup antes de alterações importantes;
- revisar consumo de Vercel, Upstash, Resend, VPS e Gemini;
- instalar atualizações somente após teste em branch de preview.

### Em incidentes

Registre horário, navegador, usuário afetado, tela, mensagem e ação executada. Não copie senhas, tokens, códigos de recuperação ou áudio particular para issues públicas.
