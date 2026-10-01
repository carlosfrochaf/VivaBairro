# Participação em eventos

Uma pessoa autenticada pode confirmar e cancelar a própria presença. O sistema deve manter uma única confirmação ativa por conta e evento.

## Confirmação e capacidade

- Sem limite definido, a confirmação registra presença sem bloquear novas pessoas.
- Com limite, a disponibilidade é calculada pelo número de confirmações ativas.
- Duas confirmações concorrentes não podem ocupar a última vaga ao mesmo tempo; a reserva precisa ser atômica no backend.
- Se o evento está lotado, mostrar isso antes de confirmar. Não prometer lista de espera até a equipe decidir como ela funcionará.
- Cancelar libera a vaga. Mostrar confirmação e não cancelar a participação de outra pessoa em nome do organizador sem processo definido.

## Dados e visibilidade

O feed pode exibir número agregado de participantes. Não mostrar publicamente a lista nominal. A necessidade do organizador ver nomes ou exportar participantes ainda precisa de decisão de privacidade e finalidade.

## Mudanças e notificações

Quem confirmou deve receber atualização quando o organizador mudar data, hora, local ou cancelar o evento. A notificação deve mostrar a versão nova e, se possível, o que mudou. Lembretes são opcionais e configuráveis. Definir canais disponíveis antes da implementação; não afirmar entrega de e-mail enquanto o serviço não existir.
