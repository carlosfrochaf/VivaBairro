# Referências e pesquisa

Esta página reúne fontes para orientar decisões de produto e desenvolvimento do VivaBairro. Elas ajudam a formular perguntas, revisar requisitos e consultar padrões; não comprovam, por si só, que uma necessidade existe entre os moradores nem que o produto atende a um padrão.

## Entender problemas e planejar pesquisa

- [Learning about users and their needs — GOV.UK Service Manual](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs): orienta a começar pelo que as pessoas tentam fazer, observar como resolvem isso hoje e separar evidências de opiniões e hipóteses. Para o VivaBairro, serve para investigar como moradores descobrem eventos, divulgam problemas e encontram ajuda antes de decidir quais funções implementar.
- [Plan user research for your service — GOV.UK Service Manual](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service): ajuda a transformar dúvidas em perguntas de pesquisa, escolher participantes e métodos e compartilhar achados com a equipe. Pode orientar entrevistas e sessões de avaliação do protótipo; o processo deve ser adaptado ao tamanho e ao contexto do projeto.

Perguntas úteis para pesquisa do produto incluem: onde as pessoas procuram informações do bairro hoje; o que torna um aviso confiável ou desatualizado; que dados se sentiriam confortáveis em compartilhar; que tipos de evento e pedido de colaboração seriam úteis; e o que esperam de uma publicação identificada como municipal. Registre método, data, perfil geral dos participantes, achados e limitações. Não publique dados que identifiquem alguém e não transforme uma opinião isolada em necessidade geral.

## Escrita e conteúdo

- [Voice and tone — Google developer documentation style guide](https://developers.google.com/style/tone): recomenda linguagem direta, simples e consistente, reduzindo jargão, clichês e texto desnecessário. É uma referência editorial, não um molde para imitar a voz da equipe.

Use essa referência nas páginas do GitBook, mensagens da interface, erros, avisos de privacidade e explicações sobre moderação. Prefira palavras que moradores reconheçam e exemplos específicos do produto.

## Diagramas e arquitetura

- [C4 model](https://c4model.com/) e [diagramas C4](https://c4model.com/diagrams): explicam como separar diagramas por nível e público. Para o VivaBairro, contexto e containers descrevem limites do sistema, usuários, responsabilidades internas e serviços externos sem exigir que todos os detalhes técnicos sejam decididos de uma vez.

Atualize os diagramas quando mudar uma responsabilidade ou integração. Marque escolhas ainda não aprovadas como propostas e não desenhe uma integração municipal como existente sem confirmação.

## Acessibilidade

- [WCAG 2.2 — W3C Web Accessibility Initiative](https://www.w3.org/WAI/standards-guidelines/wcag/): padrão e materiais de apoio para avaliar acessibilidade de conteúdo e interfaces web. Os documentos de entendimento ajudam a interpretar critérios e a planejar revisões.

Use os critérios pertinentes para revisar teclado, foco, formulários, mensagens de erro, contraste e ampliação. A existência desta referência ou uma inspeção informal não equivale a uma declaração de conformidade; registre o escopo e os resultados de qualquer avaliação.

## Segurança e privacidade

- [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/): catálogo de requisitos para orientar a revisão de controles técnicos em aplicações web. Consulte a versão estável vigente quando a equipe definir a stack e transformar requisitos em verificações concretas.
- [Guia da ANPD sobre tratamento de dados pessoais pelo Poder Público](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_tratamento_de_dados_pessoais_pelo_poder_publico): material brasileiro para leitura quando o cenário envolver tratamento de dados por órgãos públicos. A aplicação ao projeto depende de quem será responsável pelo tratamento e do contexto real; o guia não substitui análise jurídica.

Antes de coletar dados reais, documente finalidade, necessidade, acesso, retenção e descarte. Não peça endereço residencial ou localização contínua sem necessidade demonstrada. Uma referência técnica não confirma que a solução esteja segura ou em conformidade legal.

## Planejamento do trabalho

- [About GitHub Projects — GitHub Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects): descreve quadros, tabelas e roadmaps ligados a issues e pull requests, além de campos para estado, prioridade e datas.
- [Planning your work — GitHub Docs](https://docs.github.com/en/get-started/start-your-journey/planning-your-work): apresenta um exemplo de decomposição de trabalho e acompanhamento num projeto GitHub.

São referências para quando a equipe escolher a ferramenta de planejamento. A lista CSV deste repositório é um ponto de partida e não deve ser descrita como quadro ativo até ser organizada e atualizada pela equipe.

## Como manter estas referências

Ao propor uma decisão com base numa fonte externa, anote na documentação qual recomendação foi usada e o que ela sustenta. Dê preferência a padrões, órgãos responsáveis e documentação primária; confira a versão e a data antes de aplicar recomendações sujeitas a mudança. Adapte práticas de outros países ao contexto brasileiro e aos objetivos do projeto. Registre separadamente evidência de pesquisa com usuários, regra aprovada, requisito e hipótese. Revise os links quando uma decisão importante for tomada ou uma fonte deixar de ser atual.
