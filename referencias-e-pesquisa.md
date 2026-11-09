# Referências e pesquisa

Esta página reúne fontes para orientar decisões de produto e desenvolvimento do VivaBairro. Elas ajudam a formular perguntas, revisar requisitos e consultar padrões; não comprovam, por si só, que uma necessidade existe entre os moradores nem que o produto atende a um padrão.

## Estudos sobre o problema — consulta em 09/11/2026

Os dados, as populações pesquisadas e os limites de interpretação estão em [Propósito, problema e objetivos](1-visao-geral/proposito-objetivos.md). Esta é pesquisa documental; não são entrevistas ou resultados de uso do VivaBairro.

| Fonte primária | Contribuição e limite |
| --- | --- |
| [Observatório Fundação Itaú e Datafolha — Hábitos Culturais, 7ª edição, 2026](https://fundacaoitau.org.br/observatorio/biblioteca/habitos-culturais-7-2026) | Descoberta de atividades e desigualdades de participação cultural no Brasil. Não isola falta de divulgação como causa nem cobre todos os eventos comunitários. |
| [Pew Research Center — Sources of local news, 2024](https://www.pewresearch.org/journalism/2024/05/07/sources-of-local-news/) e [metodologia](https://www.pewresearch.org/journalism/2024/05/07/local-news-trends-methodology/) | Uso de fóruns e grupos para informação local nos EUA; não comprova desorganização nem representa moradores brasileiros. |
| [Pew Research Center — How connected do Americans feel to their neighbors?, 2025](https://www.pewresearch.org/short-reads/2025/05/08/how-connected-do-americans-feel-to-their-neighbors/) | Conhecimento entre vizinhos nos EUA; não equivale a medir comunicação, solidão ou demanda pelo aplicativo. |
| [Cetic.br/NIC.br — resultados da TIC Domicílios 2024](https://www.cetic.br/pt/noticia/em-duas-decadas-proporcao-de-lares-urbanos-brasileiros-com-internet-passou-de-13-para-85-aponta-tic-domicilios-2024/) | Acesso pelo celular e exclusão digital no Brasil, no recorte de 2024. Não demonstra preferência por app instalado nem é apresentado como a edição mais recente. |

Ao citar um percentual, mantenha ano da coleta, território e base de cálculo. Não transforme associação em causa nem dado estrangeiro em estimativa local. A pesquisa própria nos bairros continua pendente.

## Entender problemas e planejar pesquisa

- [Learning about users and their needs — GOV.UK Service Manual](https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs): orienta a começar pelo que as pessoas tentam fazer, observar como resolvem isso hoje e separar evidências de opiniões e hipóteses. Para o VivaBairro, serve para investigar como moradores descobrem eventos, divulgam problemas e encontram ajuda antes de decidir quais funções implementar.
- [Plan user research for your service — GOV.UK Service Manual](https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service): ajuda a transformar dúvidas em perguntas de pesquisa, escolher participantes e métodos e compartilhar achados com a equipe. Pode orientar entrevistas e sessões de avaliação do protótipo; o processo deve ser adaptado ao tamanho e ao contexto do projeto.

Perguntas úteis para pesquisa do produto incluem: onde as pessoas procuram informações do bairro hoje; o que torna um aviso confiável ou desatualizado; que dados se sentiriam confortáveis em compartilhar; que tipos de evento e pedido de colaboração seriam úteis; e o que esperam de uma publicação identificada como municipal. Registre método, data, perfil geral dos participantes, achados e limitações. Não publique dados que identifiquem alguém e não transforme uma opinião isolada em necessidade geral.

## Escrita e conteúdo

- [Voice and tone — Google developer documentation style guide](https://developers.google.com/style/tone): recomenda linguagem direta, simples e consistente, reduzindo jargão, clichês e texto desnecessário. É uma referência editorial, não um molde para imitar a voz da equipe.

Use essa referência nas páginas do GitBook, mensagens da interface, erros, avisos de privacidade e explicações sobre moderação. Prefira palavras que moradores reconheçam e exemplos específicos do produto.

## Interface e usabilidade

- [Material Design 3 — Google](https://m3.material.io/): sistema de design com orientações para componentes, layout, estados de interação, conteúdo e acessibilidade. Consulte-o para comparar padrões visuais e de interação e para discutir consistência entre telas; adapte os exemplos ao VivaBairro e ao uso no Android, sem assumir que o produto precisa copiar o visual ou os componentes do Google.
- [Fundamentos do Material Design 3](https://m3.material.io/foundations/): referência mais específica para layout, estados, acessibilidade e conteúdo de interface.

Material Design 3 é uma referência de design, não uma pesquisa feita com o público do VivaBairro. As decisões de usabilidade do projeto ainda precisam ser avaliadas com pessoas que representem seus públicos.

## Diagramas e arquitetura

- [C4 model](https://c4model.com/) e [diagramas C4](https://c4model.com/diagrams): explicam como separar diagramas por nível e público. Para o VivaBairro, contexto e containers descrevem limites do sistema, usuários, responsabilidades internas e serviços externos sem exigir que todos os detalhes técnicos sejam decididos de uma vez.

Atualize os diagramas quando mudar uma responsabilidade ou integração. Marque escolhas ainda não aprovadas como propostas e não desenhe uma integração municipal como existente sem confirmação.

## Acessibilidade

- [WCAG 2.2 — W3C Web Accessibility Initiative](https://www.w3.org/WAI/standards-guidelines/wcag/): padrão e materiais de apoio para avaliar acessibilidade de conteúdo e interfaces web. Os documentos de entendimento ajudam a interpretar critérios e a planejar revisões.

Use os critérios pertinentes para revisar teclado, foco, formulários, mensagens de erro, contraste e ampliação. A existência desta referência ou uma inspeção informal não equivale a uma declaração de conformidade; registre o escopo e os resultados de qualquer avaliação.

## Segurança e privacidade

- [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/): catálogo de requisitos para orientar a revisão de controles técnicos em aplicações web. Consulte a versão estável vigente ao transformar requisitos em verificações concretas para a stack atual.
- [Guia da ANPD sobre tratamento de dados pessoais pelo Poder Público](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_tratamento_de_dados_pessoais_pelo_poder_publico): material brasileiro para leitura quando o cenário envolver tratamento de dados por órgãos públicos. A aplicação ao projeto depende de quem será responsável pelo tratamento e do contexto real; o guia não substitui análise jurídica.

Antes de coletar dados reais, documente finalidade, necessidade, acesso, retenção e descarte. Não peça endereço residencial ou localização contínua sem necessidade demonstrada. Uma referência técnica não confirma que a solução esteja segura ou em conformidade legal.

## Planejamento do trabalho

- [About GitHub Projects — GitHub Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects): descreve quadros, tabelas e roadmaps ligados a issues e pull requests, além de campos para estado, prioridade e datas.
- [Planning your work — GitHub Docs](https://docs.github.com/en/get-started/start-your-journey/planning-your-work): apresenta um exemplo de decomposição de trabalho e acompanhamento num projeto GitHub.

São referências para quando a equipe escolher a ferramenta de planejamento. A lista CSV deste repositório é um ponto de partida e não deve ser descrita como quadro ativo até ser organizada e atualizada pela equipe.

## Como manter estas referências

Ao propor uma decisão com base numa fonte externa, anote na documentação qual recomendação foi usada e o que ela sustenta. Dê preferência a padrões, órgãos responsáveis e documentação primária; confira a versão e a data antes de aplicar recomendações sujeitas a mudança. Adapte práticas de outros países ao contexto brasileiro e aos objetivos do projeto. Registre separadamente evidência de pesquisa com usuários, regra aprovada, requisito e hipótese. Revise os links quando uma decisão importante for tomada ou uma fonte deixar de ser atual.

## Implementação mobile e hospedagem — consulta em 08/11/2026

| Fonte primária | Aplicação no VivaBairro | Limite |
| --- | --- | --- |
| [Flutter: configuração Android](https://docs.flutter.dev/platform-integration/android/setup) | SDK, build e emulador Android. | Emulador não substitui aparelho físico. |
| [Flutter: testes de integração](https://docs.flutter.dev/testing/integration-tests) | Roteiro automatizado nativo com API local. | Um roteiro não cobre todos os estados. |
| [Material Design 3](https://m3.material.io/) | Componentes, hierarquia, estados e interação. | Não substitui o SVG confirmado nem valida usabilidade sozinho. |
| [Fastify](https://fastify.dev/docs/latest/) | API HTTP e testes por injeção. | Framework não garante regras de autorização corretas. |
| [PostgreSQL: bloqueios](https://www.postgresql.org/docs/current/explicit-locking.html) | Proteção da última vaga em transação. | Depende de verificar a regra e os limites dentro da transação. |
| [Render Free](https://render.com/docs/free) e [Blueprint](https://render.com/docs/blueprint-spec) | API de demonstração e configuração versionada. | Suspensão por inatividade, cotas e disco temporário. |
| [Neon: conexão](https://neon.com/docs/connect/connect-from-any-app) | PostgreSQL gerenciado com conexão segura da API. | Rever limites do plano e backup antes de operação real. |
| [Google: TalkBack](https://support.google.com/accessibility/android/answer/6110948) | Revisão de foco e ativação no Android. | Fala não avaliada e revisão parcial. |

Render com Neon foi escolhido pela simplicidade de operação da demonstração. Isso não é uma conclusão de superioridade geral sobre AWS. Fontes técnicas sustentam configuração e critérios; não comprovam satisfação dos moradores ou conformidade do produto.

## Usabilidade e acessibilidade nativa

- [Dez heurísticas de usabilidade — Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/): orientam a inspeção de estado, linguagem, controle, consistência e recuperação. Aplicação registrada em [usabilidade e testes](rt03/usabilidade-e-testes.md); inspeção não equivale a pesquisa com moradores.
- [Acessibilidade — Flutter](https://docs.flutter.dev/ui/accessibility): referência para semântica, tecnologias assistivas e revisão antes de disponibilizar o app. Não comprova acessibilidade completa do VivaBairro.

## Dependências e ferramentas de desenvolvimento

As fontes abaixo apoiam manutenção e consulta técnica. As versões efetivamente usadas estão nos manifests e arquivos de lock do repositório; não se deve atualizar dependências apenas porque a documentação mostra uma versão mais recente.

| Fonte | Uso no projeto |
| --- | --- |
| [Instalação do Flutter](https://docs.flutter.dev/install/manual) e [pubspec](https://docs.flutter.dev/tools/pubspec) | Distinguir SDK de dependências e reproduzir o ambiente. |
| [Dart: análise estática](https://dart.dev/tools/analysis) | Regras de análise do aplicativo. |
| [TypeScript](https://www.typescriptlang.org/docs/) | Tipos e compilação da API. |
| [ESLint](https://eslint.org/docs/latest/) e [Prettier](https://prettier.io/docs/) | Configuração de lint e formatação; não substituem testes de comportamento. |
| [Node.js: crypto](https://nodejs.org/api/crypto.html) | Primitivas usadas em senhas, tokens e códigos; o uso da biblioteca não constitui auditoria de segurança. |
| [flutter_secure_storage](https://pub.dev/packages/flutter_secure_storage) | Persistência de credenciais no aplicativo. |
| [shared_preferences](https://pub.dev/packages/shared_preferences) | Preferências e rascunhos; não tratar como armazenamento criptografado. |
| [image_picker](https://pub.dev/packages/image_picker) | Seleção de imagens no dispositivo. |
| [Sharp](https://sharp.pixelplumbing.com/) | Processamento das imagens recebidas pela API. |
| [GitHub Actions](https://docs.github.com/en/actions) | Execução automatizada de verificações no repositório. |

## Serviços externos em avaliação

- [Resend por SMTP](https://resend.com/docs/send-with-smtp) e [SMTP da Brevo](https://developers.brevo.com/docs/smtp-integration): opções para entrega de e-mail. Ainda não há provedor conectado. Credenciais, remetente e disponibilidade de portas precisam ser conferidos na hospedagem antes de escolher.
- [Firebase Cloud Messaging para Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/get-started): referência para eventual push. Não está integrado; exige configuração e testes de permissão e entrega. O banco do projeto continua PostgreSQL.

## Assistência de IA e autoria

- [Documentação oficial da OpenAI](https://developers.openai.com/codex/): referência para o ambiente de assistência de programação. Uma página do fornecedor não comprova o modelo usado pela equipe.
- [Claude Code — visão geral](https://code.claude.com/docs/en/overview): explica a ferramenta de programação assistida e sua atuação sobre arquivos e comandos.
- [Relatório de uso de IA do VivaBairro](rt03/relatorio-ia.md): fonte interna para modelos informados pelo responsável, contribuições, revisão e limites. A declaração registra GPT-6 Lunar, GPT-6 Astra e Claude Opus 5.5, com ressalva de memória para o nome Lunar.

Esta consolidação é revisada em 08/11/2026. Referências acrescentadas para manutenção não significam que todas tenham sido consultadas em cada etapa da implementação. Os SVGs fornecidos pela equipe são fontes de design; testes, código e execuções registradas são evidências próprias do projeto. Nenhuma referência externa substitui essas evidências.
