# Encerramento de conta e dados associados

O encerramento de conta afeta credenciais, preferências e autoria de conteúdo. O sistema precisa explicar o que será removido, o que pode permanecer e por quê antes da confirmação.

## Fluxo e política de dados

1. A pessoa autenticada solicita encerramento e recebe resumo dos efeitos.
2. Confirmar a solicitação antes de desativar o acesso.
3. Revogar sessões e impedir novo uso das credenciais.
4. Aplicar a política aprovada a dados da conta, eventos futuros, inscrições, respostas, denúncias e histórico de moderação.
5. Informar o resultado e conservar apenas registros cuja finalidade e prazo tenham sido definidos.

Não prometer remoção imediata de todo registro, anonimização automática ou um direito legal específico sem uma política revisada por quem será responsável pelo tratamento. Publicações podem ter utilidade comunitária, mas manter conteúdo sem autoria também precisa de justificativa, prazo e opção informada.

## Decisões necessárias

Definir prazo de encerramento, dados eliminados, dados anonimizados, conteúdo que continua público, tratamento de eventos futuros, registros de denúncia/moderação, backups e pedidos em andamento. A equipe ainda não definiu esses prazos. Há um fluxo técnico de demonstração, descrito abaixo, mas ele não representa aprovação da política para uso com dados reais.

## Atualização da implementação — 08/11/2026

A conta pode solicitar exclusão com senha e confirmação. O backend remove sessões, conteúdo público, imagens e preferências e anonimiza identificação, preservando referências técnicas. A última conta administradora é protegida contra exclusão sem sucessão. Essa implementação não define retenção legal nem elimina backups automaticamente; ver docs/IMPLEMENTACAO.md.
