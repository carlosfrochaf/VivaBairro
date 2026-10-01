# Instruções para agentes de IA — VivaBairro

Este arquivo orienta agentes de IA que trabalham neste repositório. Ele não substitui a documentação do GitBook nem é a especificação completa do produto: use as páginas Markdown existentes no repositório como documentação principal e mantenha-as atualizadas junto com mudanças no produto, protótipo ou código.

## Como manter a documentação

- Antes de alterar uma funcionalidade, leia a página correspondente no índice em `SUMMARY.md` e confira também os requisitos e a rastreabilidade de usabilidade.
- Atualize a documentação relacionada na mesma tarefa em que mudar uma regra, fluxo, requisito, tela, arquitetura ou decisão técnica. Inclua links relativos entre páginas e artefatos.
- Preserve a estrutura atual do GitBook e seus documentos especializados. Não apague, mova, renomeie ou consolide páginas existentes só para reduzir a quantidade de arquivos. Se uma reorganização for necessária, mantenha os links do GitBook e a rastreabilidade, e explique a mudança.
- Evite copiar a especificação inteira em várias páginas. Atualize a página que é dona do assunto e acrescente referências nas demais quando necessário.
- Mantenha `SUMMARY.md`, `README.md` e `entregas-rt02.md` coerentes com a navegação e o estado real das entregas. Ao criar uma página, adicione-a ao sumário e à seção correspondente do README.
- Escreva em português claro, preserve os nomes e IDs de requisitos existentes e use linguagem direta. Marque decisões ainda abertas como propostas ou pendências; não as apresente como implementadas ou aprovadas.
- Não invente feedback do RT01, resultados de testes com usuários, integrações realizadas ou funções implementadas. Registre o que está pendente e diferencie protótipo, simulação e funcionalidade real.
- Preserve imagens, SVGs, protótipos, arquivos Word, CSVs e configurações. Atualize referências a esses artefatos se seus caminhos mudarem, mas não os remova sem pedido explícito.

## Índice de referência

`SUMMARY.md` é a navegação do GitBook. Os documentos abaixo são a referência por assunto; leia as páginas relacionadas antes de implementar mudanças.

| Assunto | Páginas de referência |
| --- | --- |
| Propósito, escopo, Lean Canvas e públicos | `1-visao-geral/proposito-objetivos.md`, `1-visao-geral/documento-visao-produto.md`, `1-visao-geral/visao-produto-lean-canvas.md`, `1-visao-geral/personas-perfis.md` |
| Bairros e localização | `2-localizacao-bairros/modelo-geografico.md`, `2-localizacao-bairros/gestao-territorial.md` |
| Eventos e participação | `3-atividades-eventos/ciclo-vida-eventos.md`, `3-atividades-eventos/inscricoes-participacao.md` |
| Avisos, colaboração e privacidade | `4-avisos-pedidos-ajuda/` |
| Cadastro, perfil e encerramento de conta | `5-usuarios-perfis/` |
| Papéis municipais, moderação, recursos e comunicados oficiais | `6-governanca-moderacao/` |
| Feed, busca e notificações | `7-busca-notificacoes/` |
| Arquitetura e modelo de dados | `8-arquitetura-tecnica/` |
| Protótipo e fluxos de interface | `9-prototipo-interface/prototipo-wireframes.md` e os artefatos visuais em `assets/` e `.gitbook/assets/` |
| Requisitos e ligação com usabilidade | `10-requisitos/requisitos-funcionais-nao-funcionais.md`, `10-requisitos/rastreabilidade-usabilidade.md` |
| Qualidade e planejamento | `11-qualidade/`, `planejamento/` e `planejamento/tarefas-rt02.csv` |

## Regras do produto que devem permanecer consistentes

- O VivaBairro é planejado como site responsivo, mobile-first, organizado por município e bairro. Não exigir instalação em loja nem rastreamento contínuo por GPS.
- Localização residencial é privada. Publicações usam bairro e ponto de referência/local público, sem expor dados pessoais de terceiros.
- Moradores podem criar e gerenciar as próprias atividades e avisos, participar de eventos, colaborar e denunciar conteúdo. A prefeitura configura municípios/bairros e designa administradores e moderadores com escopo territorial explícito.
- Moderadores só atuam nos bairros atribuídos. Remoções são individuais, justificadas e auditáveis; denúncia não remove conteúdo automaticamente. O autor recebe o motivo e pode pedir revisão. A prefeitura não altera silenciosamente publicações comunitárias.
- Canais e comunicados municipais oficiais devem ser identificados como tais. A plataforma não é serviço de emergência nem garante despacho ou atendimento público.
- IA é opcional e auxilia somente na categoria e redação de avisos. Deve haver consentimento informado, envio mínimo de texto pelo backend, revisão humana e caminho manual em caso de erro. A IA não publica, verifica fatos ou decide moderação.
- Aplicar permissões no servidor, preservar privacidade, acessibilidade, estados de erro e trilha de auditoria conforme os requisitos não funcionais documentados.

## Rotina ao implementar uma mudança

1. Identifique a necessidade e localize o requisito funcional/não funcional e as páginas de domínio afetadas.
2. Faça a alteração coerente com a arquitetura e os papéis; valide permissões no servidor, especialmente limites de município e bairro.
3. Atualize protótipo, documentação, requisitos e rastreabilidade conforme o impacto. Mantenha links relativos válidos e acrescente novas páginas ao GitBook quando houver um assunto realmente distinto.
4. Registre decisões em aberto, dependências externas e partes simuladas. Não marque como concluído o que não foi implementado ou verificado.
5. Revise as alterações para procurar regras duplicadas ou contraditórias, links quebrados, dados sensíveis e mudanças acidentais nos artefatos.

## Estado acadêmico e cautelas

O repositório contém documentação, protótipos/diagramas e configurações de qualidade para o RT02; isso não implica que exista uma aplicação funcional ou que ESLint/Prettier tenham sido executados. O feedback real do RT01 deve ser incorporado pelo grupo à visão/Lean Canvas. O quadro GitHub Projects também é uma atividade da equipe; `planejamento/tarefas-rt02.csv` serve de base para ele.

Quando houver dúvida de produto que altere escopo ou uma decisão já registrada, não escolha silenciosamente: mantenha a solução atual, identifique a questão como pendência e peça esclarecimento ao usuário. Para detalhes rotineiros e reversíveis, siga os padrões existentes e registre a decisão na página apropriada.
