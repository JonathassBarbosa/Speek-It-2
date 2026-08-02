# Manual do usuário

## Acesso

Abra [speekit.jsbsmartservices.com.br](https://speekit.jsbsmartservices.com.br/). Na primeira visita, a apresentação da marca é exibida uma vez por sessão.

### Criar conta

1. Selecione a opção de cadastro.
2. Informe nome, e-mail e senha com pelo menos oito caracteres.
3. Ao concluir, a sessão é iniciada automaticamente.

### Entrar

Use o e-mail e a senha cadastrados. A sessão é mantida por até sete dias no aparelho, salvo se o usuário sair ou o token se tornar inválido.

### Recuperar senha

1. Clique em **Esqueci minha senha**.
2. Informe o e-mail cadastrado.
3. Consulte a caixa de entrada e também o spam.
4. Digite o código de seis dígitos.
5. Cadastre uma nova senha com pelo menos oito caracteres.

O código expira em dez minutos, só pode ser usado uma vez e aceita no máximo cinco tentativas.

## Aba Treinar

1. Escolha um roteiro na lateral.
2. Ajuste velocidade e tamanho do texto.
3. Use **Play/Pause** para ensaiar o movimento do teleprompter.
4. Clique em gravar e permita o uso do microfone.
5. Leia o roteiro. Palavras reconhecidas mudam de cor conforme a correspondência.
6. Pare a gravação para gerar a avaliação.

O resultado contém nota geral, dicção, ritmo, entonação, pausas, sugestões e palavras não reconhecidas. A avaliação é heurística e serve para treinamento; não é diagnóstico clínico ou fonoaudiológico.

### Atalhos

- `Espaço`: iniciar ou pausar o teleprompter.
- `R`: iniciar gravação.
- `Esc`: parar a gravação ou reiniciar o teleprompter.

### Modo criador

Ative a câmera para gravar vídeo junto com o treino. O navegador solicitará permissão. O arquivo permanece no aparelho e deve ser salvo pelo usuário quando disponível.

## Coach IA

Na aba Coach, envie texto ou grave áudio. O Coach responde em PT-BR com orientação e uma prática curta. O áudio é enviado ao webhook do n8n apenas quando o usuário o envia nessa aba.

Use **Ouvir resposta** para a leitura em voz alta. A naturalidade depende das vozes PT-BR instaladas no aparelho e no navegador.

## Biblioteca

- Selecione roteiros predefinidos.
- Crie textos personalizados.
- Edite ou exclua apenas os conteúdos permitidos pela interface.
- Ao escolher um texto, o app volta para a aba Treinar.

## Histórico

Mostra as avaliações guardadas no navegador. É possível abrir detalhes, reproduzir o áudio salvo e excluir uma sessão. Limpar dados do navegador ou usar outro aparelho pode remover ou ocultar esse conteúdo local.

## Evolução e conquistas

Exibe quantidade de treinos, médias, evolução e insígnias. Os dados completos são calculados com o histórico do navegador; o servidor guarda métricas resumidas para administração.

## Tema

O botão de tema alterna entre modo claro e escuro. A preferência fica salva no navegador.

## Permissões e compatibilidade

- Use uma conexão HTTPS.
- Autorize microfone para gravar.
- Autorize câmera somente no modo criador.
- Chrome e navegadores Chromium oferecem a experiência mais completa de reconhecimento ao vivo.
- Em navegadores sem Web Speech API, a gravação pode funcionar, mas o acompanhamento palavra por palavra será limitado.

## Problemas comuns

- **Microfone permitido, mas sem áudio:** confirme a entrada selecionada no sistema e feche outros aplicativos usando o microfone.
- **Sem reconhecimento de palavras:** teste no Chrome e confirme idioma PT-BR.
- **Coach indisponível:** tente texto primeiro e informe o administrador.
- **Código não chegou:** aguarde um minuto, confira spam e confirme o e-mail digitado.
- **Histórico sumiu:** verifique se está no mesmo navegador e perfil usados no treino.
