# Papéis, permissões e escopo

As permissões dependem de duas coisas: o papel atribuído à conta e o território da ação. A interface pode ocultar ações indisponíveis, mas o servidor sempre precisa conferir a autorização. Os papéis não formam uma hierarquia automática: ter um papel municipal não concede controle sobre qualquer conteúdo ou município.

## Papéis propostos

| Papel | Como recebe o papel | Escopo |
| --- | --- | --- |
| Visitante | Conta não autenticada | Consulta apenas o conteúdo que a política pública permitir; não publica nem confirma presença. |
| Morador | Cadastro comum | Gerencia a própria conta e publicações; não recebe poderes de moderação. |
| Organizador | Marcador de conta ou atribuição ainda a definir | Gerencia eventos de que é autor. Não ganha permissão de moderação por ser organizador. |
| Moderador municipal | Designado por administrador municipal | Revisa denúncias e conteúdo somente nos bairros atribuídos. Não gerencia bairros ou outros moderadores. |
| Administrador municipal | Ativado por processo municipal ainda a definir | Gerencia os bairros e designações do município vinculado e publica comunicados oficiais desse município. |

A verificação da autoridade do administrador municipal é uma decisão em aberto. Antes de uma operação real, definir quem aprova o primeiro administrador, que evidência é aceita, como revogar acesso e como transferir a função. Não conceder esse papel por simples escolha no cadastro.

## Matriz de ações

| Ação | Visitante | Morador | Organizador | Moderador | Administrador municipal | Limite |
| --- | --- | --- | --- | --- | --- | --- |
| Consultar conteúdo público | Sim | Sim | Sim | Sim | Sim | Aplicam-se privacidade e status do item. |
| Publicar aviso ou responder a pedido de ajuda | Não | Sim | Sim | Sim | Sim | Conta autenticada; município e bairro selecionados. |
| Criar evento | Não | Sim | Sim | Sim | Sim | Conta autenticada; autor inicial do evento. |
| Editar ou cancelar evento próprio | Não | Sim | Sim | Sim | Sim | Somente autor/organizador do evento; registrar mudanças relevantes. |
| Confirmar ou cancelar presença | Não | Sim | Sim | Sim | Sim | Uma inscrição ativa por conta e evento. |
| Atualizar aviso próprio | Não | Sim | Sim | Sim | Sim | Somente autor, preservando histórico de status. |
| Denunciar publicação ou resposta | Não | Sim | Sim | Sim | Sim | Denúncia não oculta automaticamente o item. |
| Corrigir bairro de uma publicação | Não | Própria publicação | Própria publicação | Sim | Sim | Autor corrige a própria; moderador só move entre bairros autorizados. Fora do escopo, encaminha ao administrador. Registrar antes/depois. |
| Analisar denúncia, pedir ajuste, ocultar, restaurar ou remover | Não | Não | Não | Sim | Sim | Moderador no bairro atribuído; administrador no município. Ação individual com motivo. |
| Revisar decisão de moderação | Não | Solicitar revisão própria | Solicitar revisão própria | Não revisar a própria decisão | Sim, se designado | Preferir pessoa diferente da decisão inicial; registrar resultado. |
| Cadastrar ou desativar bairros | Não | Não | Não | Não | Sim | Apenas município vinculado; desativação não apaga histórico. |
| Designar ou revogar moderadores | Não | Não | Não | Não | Sim | Apenas bairros do município vinculado; registrar concedente, escopo e validade. |
| Publicar ou corrigir comunicado oficial | Não | Não | Não | Não | Sim | Canal municipal identificado; histórico visível para correções. |

## Regras para implementação

- Organizador não deve duplicar as permissões de Morador; é um atributo ou uma relação de autoria, não um papel superior.
- Guardar designações territoriais separadamente das permissões globais da conta. Conferir município e bairro em toda ação de moderação.
- Recusar por padrão uma ação quando a designação estiver expirada, revogada ou fora de escopo.
- Registrar no histórico quem concedeu ou revogou um papel e quando isso ocorreu.
- Não implementar administrador global ou acesso municipal cruzado sem decisão explícita e justificativa.
