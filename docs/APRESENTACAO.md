# Demonstração do VivaBairro

> **Ensaio de 24/11/2026 concluído para o fluxo principal.** Cadastro, saída e novo login são realizados pelo responsável no APK baixado do GitHub. Feed online, busca, CRUD de aviso, resposta, criação de evento, inscrição, lotação e cancelamento são conferidos no emulador. A versão corrigida também carrega a sessão, aceita horário digitado em 24 horas e salva a edição online. O teste físico e os percursos adicionais listados abaixo continuam pendentes.


## Baixar o aplicativo Android

- [Baixar APK ARM64 — celulares Android compatíveis](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24-r2/VivaBairro-online-arm64-debug.apk)
- [Baixar APK ARM32 — alternativa para aparelhos dessa arquitetura](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24-r2/VivaBairro-online-arm32-debug.apk)
- [Ver release e instruções de download](https://github.com/carlosfrochaf/VivaBairro/releases/tag/demo-2026-11-24-r2)
- [Conferir hashes SHA-256](https://github.com/carlosfrochaf/VivaBairro/releases/download/demo-2026-11-24-r2/SHA256SUMS.txt)

Os APKs desta release usam a API HTTPS do Render, conectada ao banco compartilhado no Neon. Após instalar, entrar ou criar uma conta e selecionar Centro, Jardim Aurora ou Vila Esperança para consultar os exemplos disponíveis. Os dados ficam no servidor, não dentro do APK; é necessário acesso à internet e disponibilidade do serviço. Não há senha pública para contas online nem credenciais administrativas no pacote.

Esta é uma compilação debug de demonstração revisada em 24/11/2026. A release r2 corrige entrada de horário em 24 horas, mensagens de remoção e retorno da conexão. O ARM64 é conferido no emulador API 36; ARM32 é compilado e inspecionado, sem execução registrada. Nenhuma variante tem teste físico registrado. Se o Android solicitar autorização para instalar o arquivo, o próprio usuário deve revisar a origem e decidir se autoriza.

## Preparação online

Usar o APK configurado para a API HTTPS do Render, com banco no Neon. Não é necessário iniciar API ou banco no computador nesse cenário. Os APKs atuais e seus hashes estão em [implantação](IMPLANTACAO.md); a variante x86_64 foi conferida no emulador, e as variantes ARM aguardam teste em celular.

Antes de apresentar, entrar com uma conta própria, abrir o feed e conferir a disponibilidade do serviço gratuito. Revisar as datas dos eventos fictícios próximos à apresentação; o comando de atualização do seed local não reagenda o banco online. Não usar contas descartáveis de testes encerrados nem publicar credenciais administrativas.

## Preparação do ambiente local

Seguir [desenvolvimento](DESENVOLVIMENTO.md) para iniciar banco e API, aplicar migrações e povoar o banco local. Executar npm run demo:refresh em api/ antes da apresentação para reagendar somente os eventos fictícios do seed.

O cenário local tem 14 eventos, 11 avisos e um comunicado, com autores fictícios distintos, lotação, cancelamento e estados de aviso. As contas de demonstração são morador@vivabairro.test, moderador@vivabairro.test e admin@vivabairro.test. Usar a senha do seed somente localmente, nunca em contas públicas.

## Roteiro

Entrar como morador e selecionar Centro. O exemplo **Encontro de demonstracao - evento ficticio** está marcado para 15/12/2026, das 18h às 20h no horário do emulador, com uma vaga. Antes da apresentação, conferir a data e se a vaga está livre; depois dessa data, criar outro evento futuro. Abrir esse evento disponível. Confirmar presença e localizar a inscrição em Meus eventos. Mostrar um evento lotado e explicar a indisponibilidade de vaga.

Criar aviso com local público, revisar e publicar. Editar o texto, marcar como resolvido e remover. Outra conta pode responder ou denunciar; denúncia não remove automaticamente.

Como moderador, analisar denúncia do bairro atribuído com motivo. Voltar ao autor e pedir revisão. Outro responsável deve analisar o recurso.

Como administrador, mostrar bairros, designações e comunicados. Explicar que o cenário é fictício, sem vínculo com prefeitura. A caixa de e-mail local demonstra recuperação para contas fictícias permitidas; não envia mensagens externas.

## Android e conexão

No cenário local, o emulador acessa a API no computador. No APK online, ele acessa diretamente a URL HTTPS do Render. Quando houver aparelho, conectar USB, habilitar depuração e aceitar a confiança no próprio celular. Executar scripts/android-demo.ps1 -DeviceId "IDENTIFICADOR" -Install. A opção local usa adb reverse e depende da API aberta no computador.

Para uso sem computador, gerar o APK com a URL HTTPS validada, conforme [implantação](IMPLANTACAO.md). Antes da apresentação, verificar a disponibilidade da API gratuita e abrir o feed.

## Complementos para o ensaio da equipe

O fluxo principal já foi percorrido em 24/11. O checklist separa esse resultado dos complementos ainda necessários; a equipe deve repetir o roteiro no equipamento e na conexão usados na apresentação.

- [x] Abrir evento no Centro, confirmar presença, conferir Minhas atividades e lotação e cancelar a presença liberando a vaga.
- [x] Publicar aviso sem imagem, buscar, editar, responder, marcar como resolvido e remover o conteúdo descartável.
- [ ] Repetir publicação com imagem na versão distribuída.
- [x] Criar conta, sair e entrar novamente; passos feitos pelo responsável, com feed autenticado observado.
- [ ] Repetir mudança de bairro principal e bairros acompanhados nesta versão.
- [ ] Percorrer denúncia, análise, notificação e pedido de revisão entre contas autorizadas, usando apenas conteúdo de teste. Designação e revogação já têm verificação online em 16/11; o percurso completo pelas telas ainda merece ensaio.
- [ ] Conferir recuperação após indisponibilidade da API e preservação de rascunho em falha de publicação.
- [ ] Revisar datas e estados dos exemplos fictícios; preparar um evento futuro com vagas, um lotado e avisos aberto e resolvido.
- [ ] Ensaiar no equipamento e na conexão previstos. Se houver celular disponível, instalar a variante ARM adequada e registrar o resultado.
- [ ] Guardar o APK e preparar uma gravação curta como alternativa em caso de falha de conexão. A gravação ainda não está registrada como produzida.

Ao concluir, registrar data, versão, ambiente, resultado e eventuais correções em [usabilidade e testes](../rt03/usabilidade-e-testes.md). Decisões de responsáveis e prazos pertencem à equipe.

## Limites a apresentar

Teste físico, pesquisa com moradores, desempenho em release e operação municipal continuam pendentes. E-mail externo, push e IA externa não estão conectados. As revisões visuais e de TalkBack têm escopo registrado em [implementação](IMPLEMENTACAO.md).

## Ambiente online disponível

A carga inicial do Neon possui 12 eventos, dez avisos e oito autores fictícios. O ensaio de 24/11 acrescenta o evento futuro identificado acima; o aviso de teste é removido. Essas contagens descrevem a carga e a alteração registrada, não uma contagem atual automática do banco. Há uma conta administradora real do responsável, cuja senha foi definida diretamente no aplicativo. As credenciais públicas da demonstração local não funcionam online. Entrar com sua própria conta; exemplos de outros autores aparecem conforme o bairro selecionado. Centro, Jardim Aurora e Vila Esperança têm conteúdo.

A conta administradora encontra Município e bairros em Meu perfil. Concessões feitas enquanto o app estava aberto aparecem após reabertura para recarregar o perfil; permissões continuam verificadas no servidor. O aplicativo já foi reaberto e o painel conferido nesta etapa.

## Conexão no início da apresentação

Abrir o aplicativo com antecedência e aguardar a conexão. O plano gratuito pode levar cerca de um minuto para iniciar; a configuração inicial aguarda até 60 segundos e oferece nova tentativa se necessário. No ensaio de 24/11, o aplicativo funciona após a tentativa inicial falhar. As consultas automatizadas inicialmente recebem um desafio HTTP 403, enquanto navegador e fluxo nativo respondem; a rechecagem final de /health e /api/config retorna HTTP 200 com JSON; não foi determinada a condição exata do desafio. Não confundir isso com o 403 esperado ao tentar uma ação administrativa sem permissão. Os detalhes e limites ficam em [implementação](IMPLEMENTACAO.md).

## Demonstração web da EXPOUNA

A edição da feira usa as telas Flutter do Android e uma API com PostgreSQL próprio. “Experimentar como visitante” cria uma sessão individual de morador no Centro. Cadastro e login continuam disponíveis. Use dados fictícios ao publicar. O projeto Neon VivaBairro-EXPOUNA recebe os oito autores, eventos, avisos, ilustrações e respostas do gerador da demonstração. As datas relativas são calculadas na primeira carga. O evento de uma vaga do ensaio também está incluído, com autoria fictícia. A conexão é restrita ao banco da feira no início do serviço. A publicação e o teste do endereço público estão em andamento.
