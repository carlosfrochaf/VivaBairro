# Entregas do RT02

Esta página reúne os artefatos pedidos para apresentação, incluindo arquivos visuais e configurações que não aparecem como páginas separadas no menu do GitBook.

## Visão e escopo

[Documento de Visão do Produto](1-visao-geral/documento-visao-produto.md) · [Documento de Escopo](1-visao-geral/documento-escopo.md) · [Lean Canvas e revisão RT02](1-visao-geral/visao-produto-lean-canvas.md)

O Canvas registra onde entram os feedbacks reais do RT01. Essa tabela precisa ser completada pelo grupo, porque os comentários recebidos não estavam nos arquivos fornecidos.

## Requisitos e arquitetura

[Documento de Requisitos Funcionais e Não Funcionais](10-requisitos/requisitos-funcionais-nao-funcionais.md) · [Matriz de Rastreabilidade de Usabilidade](10-requisitos/rastreabilidade-usabilidade.md) · [Descrição da Arquitetura](8-arquitetura-tecnica/visao-arquitetura.md) · [Modelo de Dados](8-arquitetura-tecnica/modelo-dados.md)

![Diagrama visual da arquitetura do VivaBairro](assets/arquitetura-vivabairro.svg)

## Protótipo visual

[Descrição das telas e fluxos](9-prototipo-interface/prototipo-wireframes.md)

Protótipo mobile existente:

![Protótipo inicial mobile do VivaBairro](assets/prototipo-vivabairro.jpg)

Fluxo novo de assistência de IA:

![Ação e resultado da assistência de IA](assets/fluxo-ia-avisos.svg)

## Qualidade de código

As configurações estão na raiz do repositório, então são arquivos de projeto, não páginas do GitBook: [ESLint](eslint.config.mjs), [Prettier](.prettierrc.json), [Markdownlint](.markdownlint-cli2.jsonc), [EditorConfig](.editorconfig) e [atributos Git](.gitattributes). O documento [Gestão e Qualidade de Código](11-qualidade/qualidade-codigo.md) explica o uso; as ferramentas devem ser instaladas e ligadas aos comandos do frontend quando a aplicação for iniciada.

## Planejamento

[Tarefas RT02 em CSV para Excel ou importação](planejamento/tarefas-rt02.csv) · [Instruções para configurar o quadro](planejamento/como-usar-o-quadro.md).

O CSV está pronto, mas o quadro externo no GitHub Projects ainda precisa ser criado no navegador e receber responsáveis e status reais.
