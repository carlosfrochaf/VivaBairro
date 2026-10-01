# Criação e ciclo de vida dos eventos

Eventos descrevem iniciativas com horário e local definidos. O autor deve conseguir corrigir informações e avisar quem confirmou presença quando algo mudar.

## Dados do evento

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| Título | Sim | Identifica a atividade em listas e notificações. |
| Objetivo/descrição | Sim | Explica o que vai acontecer e para quem. |
| Início e término | Sim | Usar horário local do município; término deve ser posterior ao início. |
| Município e bairro | Sim | Bairro ativo que pertence ao município selecionado. |
| Local público ou referência | Sim | Informar acesso sem exigir endereço residencial de participante. |
| Organizador | Sim | Mostrar autoria; contato direto é opcional e deve ser público por escolha explícita. |
| Limite de participantes | Não | Se preenchido, impedir novas confirmações quando não houver vaga. |
| Custo, materiais e acessibilidade | Não | Mostrar apenas quando informados; gratuito é uma opção explícita. |

## Estados

- **Rascunho:** ainda não aparece no feed.
- **Inscrições abertas:** publicado e futuro.
- **Lotado:** calculado quando as confirmações ativas atingem a capacidade; cancelamentos podem liberar vaga.
- **Em andamento:** horário atual entre início e término.
- **Concluído:** horário de término passou; permanece no histórico.
- **Cancelado:** autor cancela e informa motivo opcional; pessoas inscritas recebem atualização.

“Lotado” é disponibilidade, não um estado terminal. Cancelar um evento não apaga as inscrições ou o histórico. O autor pode corrigir evento próprio; alterações de horário, data, local ou cancelamento precisam gerar histórico e notificação.

## Decisões pendentes

A primeira versão não prevê lista de espera. Definir se, quando uma vaga abre, a confirmação fica disponível a todos ao mesmo tempo ou se uma pessoa é chamada primeiro. Definir também prazo de edição e política para evento que já começou. Até lá, não desenhar uma lista de espera como função existente.
