# Demonstração do VivaBairro

## Preparação

Seguir [desenvolvimento](DESENVOLVIMENTO.md) para iniciar banco e API, aplicar migrações e povoar o banco local. Executar npm run demo:refresh em api/ antes da apresentação para reagendar somente os eventos fictícios do seed.

O cenário local tem 14 eventos, 11 avisos e um comunicado, com autores fictícios distintos, lotação, cancelamento e estados de aviso. As contas de demonstração são morador@vivabairro.test, moderador@vivabairro.test e admin@vivabairro.test. Usar a senha do seed somente localmente, nunca em contas públicas.

## Roteiro

Entrar como morador, filtrar o feed e abrir um evento disponível. Confirmar presença e localizar a inscrição em Meus eventos. Mostrar um evento lotado e explicar a indisponibilidade de vaga.

Criar aviso com local público, revisar e publicar. Editar o texto, marcar como resolvido e remover. Outra conta pode responder ou denunciar; denúncia não remove automaticamente.

Como moderador, analisar denúncia do bairro atribuído com motivo. Voltar ao autor e pedir revisão. Outro responsável deve analisar o recurso.

Como administrador, mostrar bairros, designações e comunicados. Explicar que o cenário é fictício, sem vínculo com prefeitura. A caixa de e-mail local demonstra recuperação para contas fictícias permitidas; não envia mensagens externas.

## Android e conexão

O emulador acessa a API no computador. Quando houver aparelho, conectar USB, habilitar depuração e aceitar a confiança no próprio celular. Executar scripts/android-demo.ps1 -DeviceId "IDENTIFICADOR" -Install. A opção local usa adb reverse e depende da API aberta no computador.

Para uso sem computador, gerar o APK com a URL HTTPS validada, conforme [implantação](IMPLANTACAO.md). Antes da apresentação, verificar a disponibilidade da API gratuita e abrir o feed.

## Limites a apresentar

Teste físico, pesquisa com moradores, desempenho em release e operação municipal continuam pendentes. E-mail externo, push e IA externa não estão conectados. As revisões visuais e de TalkBack têm escopo registrado em [implementação](IMPLEMENTACAO.md).
