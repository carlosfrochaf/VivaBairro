# Demonstração do VivaBairro

> **Verificação de 24/11/2026: ensaio online bloqueado.** O APK ARM64 baixado da release foi instalado no emulador, mas a abertura mostrou falha de conexão. As consultas HTTP à API retornaram 403 com `cf-mitigated: challenge` e HTML do Cloudflare. Cadastro, login, acesso aos exemplos e CRUD ainda não foram revalidados nesta rodada. É necessário investigar a hospedagem e repetir o roteiro antes da apresentação; os testes anteriores permanecem como histórico, não como garantia de disponibilidade atual.


## Baixar o aplicativo Android

- [Baixar APK ARM64 — celulares Android compatíveis](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24/VivaBairro-online-arm64-debug.apk)
- [Baixar APK ARM32 — alternativa para aparelhos dessa arquitetura](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24/VivaBairro-online-arm32-debug.apk)
- [Ver release e instruções de download](https://github.com/carlosfrochaf/VivaBairro/releases/tag/demo-2026-11-24)
- [Conferir hashes SHA-256](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24/SHA256SUMS.txt)

Os APKs desta release usam a API HTTPS do Render, conectada ao banco compartilhado no Neon. Após instalar, entrar ou criar uma conta e selecionar Centro, Jardim Aurora ou Vila Esperança para consultar os exemplos disponíveis. Os dados ficam no servidor, não dentro do APK; é necessário acesso à internet e disponibilidade do serviço. Não há senha pública para contas online nem credenciais administrativas no pacote.

Esta é uma compilação debug de demonstração, com as correções documentadas em 16/11/2026, publicada em 24/11/2026. O código do aplicativo não mudou desde essa revisão. As variantes ARM não têm teste físico registrado. Se o Android solicitar autorização para instalar o arquivo, o próprio usuário deve revisar a origem e decidir se autoriza.

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
