# Instruções para agentes de IA — VivaBairro

Este arquivo orienta agentes que trabalham no repositório. O GitBook continua sendo a especificação detalhada do produto: consulte e atualize suas páginas quando mudar comportamento, requisito, arquitetura, protótipo ou decisão. Não replique a documentação inteira aqui.

## Regras de autoria

- Escreva em português brasileiro claro, direto e compatível com o público da página. Use termos concretos e verbos ativos; explique siglas na primeira ocorrência.
- Não use aberturas genéricas, slogans, adjetivos promocionais, conclusões que repetem o texto ou listas previsíveis só para preencher espaço. Não invente coloquialismos nem erros para o texto “parecer humano”. Priorize precisão, exemplos próprios do produto e a voz do grupo.
- Diferencie fatos do produto, decisões aprovadas, hipóteses e perguntas abertas. Dê evidência quando existir: fonte, método, data e o que ela permite concluir. Nunca crie entrevistas, citações, resultados de pesquisa, aprovações municipais, medições ou integrações.
- Quando não houver evidência, escreva “hipótese a validar” e registre como a equipe pode validá-la. Não apresente benefício esperado como resultado comprovado. Mantenha o espaço para descobertas futuras sem preencher lacunas com suposições.
- Use uma página principal por assunto. Antes de criar outra, procure conteúdo existente e prefira completá-lo. Atualize links e `SUMMARY.md` ao criar, renomear ou mover páginas.
- Preserve o conteúdo e a hierarquia do GitBook, imagens, SVGs, protótipos, documentos-fonte e configurações. Não apague nem reorganize artefatos sem pedido explícito.

## Regras para diagramas e protótipos

- Comece pelo público e pela pergunta que o desenho deve responder. Separe contexto do sistema, arquitetura interna, modelo de dados, permissões e fluxo operacional quando misturá-los prejudicar a leitura.
- Em diagramas de arquitetura, mostre fronteira do VivaBairro, sistemas externos, responsabilidade dos blocos, direção e finalidade de cada conexão. Identifique protocolo ou dado quando isso estiver decidido; marque tecnologia ainda hipotética como proposta. Inclua legenda para cores e formas e descrição acessível no SVG.
- Em modelos de dados, mostre entidades, cardinalidades e relações coerentes com o dicionário. Use os mesmos nomes e papéis em texto, diagrama e requisitos. Não use hierarquia visual se os papéis não herdarem permissões.
- Em fluxos de interface, represente entradas, confirmações, erros, cancelamento e recuperação para ações sensíveis. Dados de exemplo devem estar marcados como fictícios; não invente estatísticas ou funções para deixar uma tela mais cheia.
- Preserve contraste, foco, rótulos legíveis e distinção que não dependa apenas de cor. Mantenha padrão visual e de termos com o protótipo existente, sem adornos que ocultem o fluxo.

## Mapa da documentação

`SUMMARY.md` define a navegação do GitBook. Use as páginas atuais como referência por assunto:

| Assunto | Referência |
| --- | --- |
| Propósito, escopo, proposta e públicos | `1-visao-geral/` |
| Bairros e localização | `2-localizacao-bairros/` |
| Eventos e participação | `3-atividades-eventos/` |
| Avisos, colaboração e privacidade | `4-avisos-pedidos-ajuda/` |
| Cadastro, perfil e encerramento de conta | `5-usuarios-perfis/` |
| Papéis municipais, moderação, revisão e comunicados oficiais | `6-governanca-moderacao/` |
| Feed, busca e notificações | `7-busca-notificacoes/` |
| Arquitetura e modelo de dados | `8-arquitetura-tecnica/` |
| Protótipo e fluxos | `9-prototipo-interface/` e `assets/` |
| Requisitos e rastreabilidade | `10-requisitos/` |
| Qualidade e planejamento | `11-qualidade/` e `planejamento/` |

Ao mudar um fluxo, confira o requisito, a página de regra de negócio, o desenho afetado e a rastreabilidade. Atualize todos os elementos impactados na mesma tarefa e confira termos, papéis, links e status entre eles.

## Regras do produto que não podem se contradizer

- O VivaBairro é um site responsivo, organizado por município e bairro. A conta escolhe bairro principal e bairros acompanhados; não é necessário GPS contínuo nem endereço residencial.
- Publicações usam local público ou ponto de referência e não devem expor dados sensíveis de terceiros.
- Autores gerenciam suas próprias publicações; organizadores são autores com ações de gestão do evento. Moderação é uma permissão separada, limitada a bairros atribuídos no servidor.
- Administradores municipais gerenciam o município configurado, bairros, designações e comunicados oficiais. A forma de validar a autoridade municipal é uma decisão pendente, não presumida.
- Denúncia inicia análise humana; não remove conteúdo automaticamente. Toda ação individual de moderação tem motivo, ator e histórico. O autor é avisado e pode pedir revisão.
- Comunicados oficiais são identificados por órgão emissor. O serviço não é canal de emergência nem garante atendimento público.
- IA opcional sugere categoria e redação de avisos. Consentimento explícito precede o envio ao serviço externo. O backend minimiza o texto; a pessoa revisa; a publicação é manual. Falha da IA não bloqueia o fluxo.
- Validar permissões no servidor, privacidade, acessibilidade e auditoria conforme requisitos documentados. Não declarar conformidade, segurança ou qualidade sem verificação.

## Rotina de mudança

1. Identifique a necessidade, o requisito e a regra de negócio relacionados.
2. Confira se a solução altera algum pressuposto aberto; sinalize dúvidas de produto que não podem ser inferidas.
3. Implemente ou atualize o protótipo e os diagramas com estados e limites reais.
4. Atualize as páginas do GitBook e a matriz de rastreabilidade; não marque como validado o que só foi proposto.
5. Revise contradições, permissões territoriais, texto sem evidência, acessibilidade, links e mudanças acidentais em arquivos.

## Decisões ainda sem evidência ou aprovação

O repositório não registra pesquisa concluída com moradores nem autorização oficial de um município. Não há aplicação funcional ou integrações reais demonstradas. Os públicos, a adesão municipal, a operação de moderação, a política de retenção e algumas metas de desempenho devem continuar identificados como propostas até a equipe reunir evidências e decidir. O planejamento em `planejamento/plano-de-desenvolvimento.csv` é um ponto de partida, não um quadro de tarefas já ativo.
