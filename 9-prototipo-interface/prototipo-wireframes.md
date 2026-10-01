# Protótipo e fluxos de interface

## Direção atual

O export vetorial atualizado em [protótipo mobile](../assets/prototipo-vivabairro.svg) mostra entrada, feed, detalhe de evento, confirmação de presença, criação de aviso e perfil. A interface usa azul-marinho, verde-petróleo, verde-água e coral, com navegação mobile-first.

Nomes, bairros, contagens e eventos no fluxo mobile são exemplos fictícios, não contas ou dados de uso reais. O SVG atual usa a lista “Próximas atividades” do bairro selecionado e substitui a métrica sem regra por bairros acompanhados. O JPG que permanece em assets é uma captura anterior e não representa esses ajustes; usar o SVG como versão de referência. Não mostrar métricas de uso sem fonte.

## Fluxo opcional de IA

![Três etapas: escrever, consentir e revisar sugestões](../assets/fluxo-ia-avisos.svg)

O fluxo acrescenta uma decisão explícita antes de enviar título e descrição a um provedor externo. A caixa de autorização começa desmarcada; a tela informa os campos enviados, o uso e a alternativa sem IA. O resultado deixa categoria e resumo editáveis, mantém o original e exige uma confirmação de publicação separada.

Antes de usar serviço real, decidir provedor, política de retenção, texto final de consentimento e canal para explicar tratamento de dados. A tela atual é um fluxo proposto; a caixa está desenhada como estado ainda não autorizado.

## Fluxo de administração e moderação

![Administração de bairros, designação territorial e análise de conteúdo](../assets/fluxo-moderacao-municipal.svg)

O material mostra designação restrita a bairros, análise de um item, motivo obrigatório e histórico. A validação de quem pode ser o primeiro administrador municipal está marcada como pendente porque o processo ainda não foi decidido. Dados são fictícios.

## Telas que completam o produto

A próxima revisão do arquivo de design deve contemplar:

- cadastro, recuperação de acesso e escolha de município/bairro;
- busca e filtros, lista vazia e erro de conexão;
- formulário e edição de evento, lotação, mudança de horário e cancelamento;
- criar/editar aviso, atualizar estado e oferecer ajuda;
- central de notificações e preferências;
- denúncia, fila de moderação, pedido de ajuste, ocultação, remoção, restauração e recurso;
- designação/revogação de moderador e criação/correção de comunicado municipal;
- estados de carregamento, falha e recuperação de rascunho.

## Revisão de conteúdo visual

Usar rótulos que correspondam aos documentos: “evento” para atividade, “aviso” para ocorrência comunitária, “comunicado municipal” para publicação oficial. Distinguir esses tipos pela palavra e contexto, não só por cor. Marcar qualquer dado de demonstração como fictício; não usar nomes, estatísticas ou recomendações sem regra. Em formulários sensíveis, apresentar privacidade, confirmação e recuperação junto à ação correspondente.

As telas propostas ainda precisam ser percorridas com participantes. Registrar versão, tarefa, dúvida observada e alteração escolhida; não afirmar que a interface foi validada antes de realizar essas sessões.
