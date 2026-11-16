# Demonstração do VivaBairro

## Preparação online — 16/11/2026

Usar o APK configurado para a API HTTPS do Render, com banco no Neon. Não é necessário iniciar API ou banco no computador nesse cenário. Os APKs atuais e seus hashes estão em [implantação](IMPLANTACAO.md); a variante x86_64 foi conferida no emulador, e as variantes ARM aguardam teste em celular.

Antes de apresentar, entrar com uma conta própria, abrir o feed e conferir a disponibilidade do serviço gratuito. Revisar as datas dos eventos fictícios próximos à apresentação; o comando de atualização do seed local não reagenda o banco online. Não usar contas descartáveis de testes encerrados nem publicar credenciais administrativas.

## Preparação do ambiente local

Seguir [desenvolvimento](DESENVOLVIMENTO.md) para iniciar banco e API, aplicar migrações e povoar o banco local. Executar npm run demo:refresh em api/ antes da apresentação para reagendar somente os eventos fictícios do seed.

O cenário local tem 14 eventos, 11 avisos e um comunicado, com autores fictícios distintos, lotação, cancelamento e estados de aviso. As contas de demonstração são morador@vivabairro.test, moderador@vivabairro.test e admin@vivabairro.test. Usar a senha do seed somente localmente, nunca em contas públicas.

## Roteiro

Entrar como morador, filtrar o feed e abrir um evento disponível. Confirmar presença e localizar a inscrição em Meus eventos. Mostrar um evento lotado e explicar a indisponibilidade de vaga.

Criar aviso com local público, revisar e publicar. Editar o texto, marcar como resolvido e remover. Outra conta pode responder ou denunciar; denúncia não remove automaticamente.

Como moderador, analisar denúncia do bairro atribuído com motivo. Voltar ao autor e pedir revisão. Outro responsável deve analisar o recurso.

Como administrador, mostrar bairros, designações e comunicados. Explicar que o cenário é fictício, sem vínculo com prefeitura. A caixa de e-mail local demonstra recuperação para contas fictícias permitidas; não envia mensagens externas.

## Android e conexão

No cenário local, o emulador acessa a API no computador. No APK online, ele acessa diretamente a URL HTTPS do Render. Quando houver aparelho, conectar USB, habilitar depuração e aceitar a confiança no próprio celular. Executar scripts/android-demo.ps1 -DeviceId "IDENTIFICADOR" -Install. A opção local usa adb reverse e depende da API aberta no computador.

Para uso sem computador, gerar o APK com a URL HTTPS validada, conforme [implantação](IMPLANTACAO.md). Antes da apresentação, verificar a disponibilidade da API gratuita e abrir o feed.

## Ensaio final pendente

Este checklist organiza uma nova passagem completa pela versão que será apresentada; não afirma que os fluxos nunca foram testados nem que o ensaio já foi concluído.

- [ ] Encontrar evento por bairro, abrir detalhes, confirmar e cancelar presença e conferir lotação.
- [ ] Publicar aviso com imagem, editar, atualizar o estado e remover somente o conteúdo de demonstração criado para o ensaio.
- [ ] Sair e entrar, mudar bairro principal e conferir bairros acompanhados.
- [ ] Percorrer denúncia, análise, notificação e pedido de revisão entre contas autorizadas, usando apenas conteúdo de teste. Designação e revogação já têm verificação online em 16/11; o percurso completo pelas telas ainda merece ensaio.
- [ ] Conferir recuperação após indisponibilidade da API e preservação de rascunho em falha de publicação.
- [ ] Revisar datas e estados dos exemplos fictícios; preparar um evento futuro com vagas, um lotado e avisos aberto e resolvido.
- [ ] Ensaiar no equipamento e na conexão previstos. Se houver celular disponível, instalar a variante ARM adequada e registrar o resultado.
- [ ] Guardar o APK e preparar uma gravação curta como alternativa em caso de falha de conexão. A gravação ainda não está registrada como produzida.

Ao concluir, registrar data, versão, ambiente, resultado e eventuais correções em [usabilidade e testes](../rt03/usabilidade-e-testes.md). Decisões de responsáveis e prazos pertencem à equipe.

## Limites a apresentar

Teste físico, pesquisa com moradores, desempenho em release e operação municipal continuam pendentes. E-mail externo, push e IA externa não estão conectados. As revisões visuais e de TalkBack têm escopo registrado em [implementação](IMPLEMENTACAO.md).

## Ambiente online disponível

A API hospedada usa um banco próprio no Neon, com 12 eventos, dez avisos e oito autores fictícios. Há uma conta administradora real do responsável, cuja senha foi definida diretamente no aplicativo. As credenciais públicas da demonstração local não funcionam online. Entrar com sua própria conta; exemplos de outros autores aparecem conforme o bairro selecionado. Centro, Jardim Aurora e Vila Esperança têm conteúdo.

A conta administradora encontra Município e bairros em Meu perfil. Concessões feitas enquanto o app estava aberto aparecem após reabertura para recarregar o perfil; permissões continuam verificadas no servidor. O aplicativo já foi reaberto e o painel conferido nesta etapa.
