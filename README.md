# VivaBairro

Aplicativo de bairro para consultar eventos, confirmar presença, publicar avisos e colaborar com a comunidade. Moderadores analisam denúncias no território atribuído; administradores municipais gerenciam bairros, designações e comunicados.

A implementação atual usa **Flutter para Android, API Fastify/TypeScript e PostgreSQL**.

## Comece por aqui

- [Sobre o projeto](sobre-o-projeto.md) e [escopo](1-visao-geral/documento-escopo.md).
- [Implementação e evidências](docs/IMPLEMENTACAO.md).
- [Executar e desenvolver](docs/DESENVOLVIMENTO.md).
- [Hospedagem Render e Neon](docs/IMPLANTACAO.md).
- [Demonstração e APK](docs/APRESENTACAO.md).
- [Arquitetura](8-arquitetura-tecnica/visao-arquitetura.md), [requisitos](10-requisitos/requisitos-funcionais-nao-funcionais.md) e [protótipo](9-prototipo-interface/prototipo-wireframes.md).
- [Referências](referencias-e-pesquisa.md) e [uso de IA](rt03/relatorio-ia.md).

## Organização

| Caminho | Conteúdo |
| --- | --- |
| mobile/ | Aplicativo Flutter e testes |
| api/ | API, migrações SQL e testes de integração |
| app/ | Demonstração web de apoio, com execução e dados independentes |
| Pastas numeradas e SUMMARY.md | Documentação funcional e navegação do GitBook |
| docs/ | Desenvolvimento, operação e evidências |
| assets/ e docs/design/ | Diagramas e SVGs de referência |
| scripts/ | Ferramentas locais e geração do APK |
| render.yaml | Configuração do serviço da API |
| AGENTS.md | Instruções para manutenção por assistentes |

Os fluxos principais funcionam com banco persistente e dados fictícios. A demonstração está hospedada no Render e no Neon. O estado da publicação fica no guia de implantação. Ainda faltam aparelho físico, avaliação com moradores, desempenho em release e decisões de operação municipal. E-mail externo, push e IA externa não estão conectados.

Toda mudança de comportamento, infraestrutura ou validação deve atualizar a página correspondente do [GitBook](https://vivabairro.gitbook.io/vivabairro) na mesma entrega.
