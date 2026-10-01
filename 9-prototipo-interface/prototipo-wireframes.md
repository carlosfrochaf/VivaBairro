# Wireframes e Telas Principais

## Direção visual e dispositivos

O protótipo parte da identidade existente: azul-petróleo, azul-marinho, verde-água e coral; cartões com cantos arredondados; títulos curtos; localização e status visíveis; navegação simples. A implementação proposta é um site responsivo, com prioridade para celular e adaptação a telas largas.

## Protótipo de alta fidelidade existente

![Protótipo mobile do VivaBairro](../.gitbook/assets/prototipo-vivabairro.jpg)

O material inclui boas-vindas, início com atividades e avisos, detalhe de atividade, confirmação de presença, criação de aviso e perfil. As telas existentes cobrem cadastro/entrada, função principal, participação, publicação e perfil. A recomendação de eventos pode personalizar a descoberta, mas não representa a integração de IA exigida no fluxo de aviso.

## Fluxo complementar de IA

O protótipo abaixo acrescenta as telas que faltavam ao fluxo de publicação. A pessoa pode escrever o aviso manualmente ou pedir sugestões opcionais de categoria e resumo. Na tela de resultado, ela revisa cada sugestão antes de aplicar e ainda confirma a publicação por conta própria.

![Telas de ação e resultado da IA](../assets/fluxo-ia-avisos.svg)

### Tela de ação da IA

O formulário mantém título, descrição, bairro e ponto de referência. A ação “Sugerir categoria e resumo” explica que o texto será processado por um serviço de IA. A pessoa pode continuar sem aceitar, usar o serviço ou cancelar. Uma indicação de carregamento informa que a sugestão está sendo preparada.

### Tela de resultado da IA

A resposta mostra a categoria sugerida e um resumo editável, identificados como sugestões. Cada item pode ser aplicado ou descartado. A tela preserva o texto original, explica que a IA pode errar e deixa claro que nada é publicado até a confirmação final.

## Mapa dos fluxos e telas principais

| Tela ou fluxo | Objetivo | Ação principal |
| --- | --- | --- |
| Boas-vindas / Entrar | Apresentar o serviço e autenticar ou criar conta. | Entrar ou criar conta. |
| Início / Feed do bairro | Encontrar atividades futuras, avisos e comunicados. | Abrir publicação, buscar ou trocar de bairro. |
| Detalhe de atividade | Exibir objetivo, data, local, organizador e vagas. | Confirmar participação. |
| Resultado da participação | Confirmar sucesso e apresentar os próximos passos. | Ver minhas atividades ou voltar ao início. |
| Criar aviso / Ação de IA | Registrar problema ou pedido de ajuda, com assistência opcional. | Pedir sugestões ou publicar manualmente. |
| Resultado da IA | Permitir revisar e editar as sugestões recebidas. | Aplicar sugestões ou descartá-las; confirmar publicação separadamente. |
| Perfil e configurações | Gerenciar bairro, dados, avisos, inscrições e notificações. | Editar preferências e acompanhar publicações. |
| Moderação municipal | Analisar denúncias de bairros atribuídos e registrar decisões. | Manter, pedir ajuste, ocultar ou remover com justificativa. |

## Estados que precisam ser prototipados

Além das telas principais, o fluxo deve mostrar carregamento da IA, falha/timeout, resposta inválida, ausência de conexão, formulário com erros, aviso publicado e publicação encaminhada para moderação. Em todos os casos, o rascunho original deve permanecer disponível. A pessoa deve conseguir publicar sem usar IA.

## Critérios de revisão de usabilidade

Os campos devem ter rótulos claros, exemplos próximos ao formato esperado e mensagens de erro que indiquem como corrigir. Ações primárias devem ser distinguíveis das ações de voltar ou cancelar. Sugestões da IA não podem ser visualmente confundidas com fatos confirmados. Em celular, botões devem ser fáceis de tocar; em desktop, conteúdo deve aproveitar o espaço sem esticar excessivamente as linhas de texto.
