# Aplicativo e ambiente de demonstração

O VivaBairro possui um aplicativo Flutter para Android conectado à [API de demonstração](https://vivabairro-api.onrender.com), no Render, e ao banco PostgreSQL no Neon. Contas e publicações persistem entre reinícios da API.

## Conteúdo para apresentação

O ambiente online contém oito autores fictícios, 12 eventos, dez avisos e 12 imagens, além de participações e respostas. Os exemplos cobrem bairros e estados diferentes e não representam ocorrências reais. A conta administrativa recebe permissão municipal de forma controlada e auditada; o cadastro comum não concede esse papel.

O roteiro permite entrar, consultar o feed, filtrar bairro e período, abrir evento, confirmar ou cancelar presença, criar e editar aviso e acompanhar respostas. A administração permite gerenciar bairros e atribuições conforme o escopo autorizado. Consulte [Demonstração e APK](../docs/APRESENTACAO.md) para a sequência de apresentação e os artefatos.

## Execução e limites

O [guia de desenvolvimento](../docs/DESENVOLVIMENTO.md) explica a execução local. O [guia de hospedagem](../docs/IMPLANTACAO.md) descreve configuração, migrações e preparação dos exemplos online. Dados locais e online são conjuntos distintos; não se deve copiar senhas de demonstração para a hospedagem.

A API gratuita pode ficar inativa e demorar no primeiro acesso. Notificações funcionam dentro do aplicativo; e-mail externo, push e IA externa não estão conectados. APKs são de demonstração em modo debug. O emulador não comprova funcionamento ou desempenho em aparelho físico. Consulte o [estado da implementação](../docs/IMPLEMENTACAO.md) para resultados verificados e pendências.
