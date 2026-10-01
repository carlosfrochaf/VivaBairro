# Central de notificações

Notificações explicam o que aconteceu e levam à publicação ou configuração relacionada. A central mostra data, tipo, estado de leitura e origem da mensagem.

## Eventos que podem gerar notificação

| Evento | Destinatário | Preferência |
| --- | --- | --- |
| Mudança de data, horário ou local de evento | Pessoas com presença confirmada | A atualização deve ficar na central; escolher se e-mail é opcional ou obrigatório para alterações críticas antes da implantação. |
| Cancelamento de evento | Pessoas com presença confirmada | Exibir cancelamento e motivo informado; política de canal precisa ser decidida. |
| Resposta a aviso ou oferta de ajuda | Autor do aviso | Configurável por tipo e canal. |
| Decisão ou recurso de moderação | Autor e, no recurso, moderadores envolvidos | Entrega privada; não pode ser substituída por uma publicação no feed. |
| Comunicado municipal | Pessoas que acompanham bairros afetados | Configurável; comunicados destacados também aparecem no feed. |
| Lembrete de evento | Pessoas com presença confirmada | Opcional; frequência e antecedência precisam ser definidas. |

## Regras de entrega

- Cada alerta leva ao item afetado e identifica quem ou qual órgão originou a atualização.
- Alterar preferências não apaga notificações já recebidas.
- Falha de e-mail não deve apagar o registro da central; registrar falha sem expor conteúdo sensível em logs.
- Não enviar notificações de resposta a quem denunciou se isso revelar sua identidade.
- Frequência, retenção, horários silenciosos e canal para atualizações críticas ainda precisam de decisão operacional.
