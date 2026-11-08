# Consolidação do projeto

## Versão atual

O VivaBairro é um aplicativo Flutter para Android com API Fastify/TypeScript e PostgreSQL. Implementa contas, bairros acompanhados, eventos, presença, avisos, respostas, denúncias, moderação territorial, recursos e administração municipal. A [cobertura dos requisitos](../10-requisitos/requisitos-funcionais-nao-funcionais.md) distingue fluxos implementados e limitações.

A hospedagem de demonstração foi aprovada com Render e Neon. Consultar [implantação](../docs/IMPLANTACAO.md) para o estado real. [Desenvolvimento](../docs/DESENVOLVIMENTO.md) explica execução local; [apresentação](../docs/APRESENTACAO.md) traz roteiro e geração de APK.

## Histórico preservado

A [Alfa web](versao-alfa.md), mantida em app/, é a etapa anterior com dados fictícios em memória. Os [testes da Alfa](usabilidade-e-testes.md) documentam essa versão e não comprovam cobertura do aplicativo Android. Os SVGs originais permanecem como referência de design.

## Qualidade e autoria

[Implementação e evidências](../docs/IMPLEMENTACAO.md) registra testes da nova API, widgets, revisões no Android, teclado, fonte ampliada e TalkBack. A revisão tem limites e não certifica acessibilidade. O [relatório de IA](relatorio-ia.md) explicita a participação substancial de agentes na escrita e validação, sem presumir revisão humana integral.

## O que falta

Concluir e verificar a hospedagem, testar em aparelho físico quando disponível, configurar entrega externa de e-mails se entrar no escopo da demonstração, avaliar desempenho e realizar sessões com moradores. Push e IA externa não estão conectados. Operação municipal, autoridade dos administradores e política de dados ainda exigem definição antes de uso real.
