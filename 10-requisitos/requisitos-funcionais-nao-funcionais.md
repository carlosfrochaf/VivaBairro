# Requisitos Funcionais e Não Funcionais

## Escopo

Os requisitos descrevem a versão acadêmica do VivaBairro como site responsivo. A IA auxilia na redação e categorização de avisos; ela não publica conteúdo, confirma informações de segurança nem substitui decisões de moderadores.

## Requisitos funcionais

| ID | Requisito | Critério de aceite |
| --- | --- | --- |
| RF-01 | O sistema deve permitir criar conta, entrar e sair com credenciais válidas. | Credenciais inválidas não abrem uma sessão e a interface informa como corrigir. |
| RF-02 | O usuário deve escolher um bairro principal e poder alterá-lo no perfil. | Feed, busca e formulário de publicação mostram o bairro selecionado. |
| RF-03 | O sistema deve listar atividades futuras e avisos do bairro, com título, local, data e status. | Cada item abre uma visualização de detalhes. |
| RF-04 | O usuário deve buscar e filtrar conteúdo por bairro, categoria, texto e período. | A lista atualiza os resultados e oferece mensagem quando não há correspondências. |
| RF-05 | Um usuário autenticado deve criar e editar atividades com descrição, data, horário, local e limite opcional de participantes. | Publicações inválidas são rejeitadas com indicação dos campos que faltam. |
| RF-06 | O usuário deve confirmar e cancelar sua participação em uma atividade. | O sistema registra uma única inscrição ativa por usuário e atualiza a disponibilidade de vagas. |
| RF-07 | Um usuário autenticado deve criar, editar e atualizar o status de um aviso. | O autor pode marcar seu aviso como em andamento, resolvido ou encerrado. |
| RF-08 | O usuário deve poder responder a um pedido de ajuda ou demonstrar que pode colaborar. | A resposta fica associada ao aviso e pode ser moderada conforme as regras da comunidade. |
| RF-09 | Com consentimento explícito, o sistema deve enviar título e descrição de um rascunho de aviso ao serviço de IA para sugerir categoria e uma versão resumida. | A tela exibe as sugestões como rascunho; o autor pode aceitar, editar ou descartar cada uma. Nada é publicado sem confirmação humana. |
| RF-10 | Se a IA falhar, exceder o tempo limite ou não retornar uma sugestão válida, o usuário deve conseguir continuar sem IA. | A interface informa a falha e preserva o texto original. |
| RF-11 | Usuários devem poder denunciar atividade, aviso ou resposta, selecionando um motivo e adicionando contexto opcional. | A denúncia aparece na fila de moderação sem remover automaticamente o conteúdo. |
| RF-12 | Moderadores designados pela prefeitura devem analisar conteúdo apenas nos bairros atribuídos a eles. | Ações de ocultar, restaurar ou remover exigem motivo e geram registro de auditoria. |
| RF-13 | O autor deve receber aviso quando seu conteúdo for moderado e poder solicitar revisão. | O histórico mostra decisão, motivo e situação do pedido de revisão. |
| RF-14 | Administradores municipais devem gerenciar bairros, designações de moderadores e comunicados oficiais. | As permissões administrativas não permitem editar silenciosamente conteúdo de moradores. |
| RF-15 | O sistema deve notificar o usuário sobre mudanças em atividades inscritas, respostas aos seus avisos e decisões de moderação. | O usuário consegue configurar notificações e consultar a central no perfil. |

## Requisitos não funcionais

| ID | Requisito | Como verificar |
| --- | --- | --- |
| RNF-01 Desempenho | Em condições normais de uso, 95% das consultas comuns devem responder em até 2 segundos. A chamada de IA terá limite próprio e não bloqueará a publicação manual. | Medir tempos de resposta em consultas de feed, busca e detalhes; simular timeout da IA. |
| RNF-02 Responsividade | As páginas devem funcionar em celulares e computadores, sem rolagem horizontal para o conteúdo principal. | Conferir larguras pequenas, médias e grandes e testar em navegador móvel. |
| RNF-03 Segurança | O tráfego deve usar HTTPS; senhas devem ser armazenadas com hash seguro; dados sensíveis e backups devem ter proteção apropriada em repouso; autorização deve ser aplicada no servidor. | Revisar configuração, rotas e testes de acesso por papel e bairro. |
| RNF-04 Proteção de credenciais de IA | Chaves de API não podem estar no navegador, no repositório ou em mensagens de erro. Chamadas à IA passam pelo backend. | Busca no código e revisão das variáveis de ambiente antes de publicar. |
| RNF-05 Privacidade | A localização residencial exata não é necessária. A integração de IA envia somente o texto necessário após consentimento e deve informar que um serviço externo será usado. | Revisar formulários, fluxo de consentimento, payload e política de privacidade. |
| RNF-06 Acessibilidade | Formulários devem ter rótulos, foco visível, contraste legível e operação por teclado; mensagens de erro devem ser compreensíveis. | Revisão manual com teclado e leitor de tela e lista de verificação de acessibilidade. |
| RNF-07 Confiabilidade | Indisponibilidade da IA não pode impedir criar um aviso manualmente. Falhas devem preservar o rascunho sempre que possível. | Simular serviço externo indisponível e verificar recuperação do formulário. |
| RNF-08 Manutenibilidade | Interface, regras de negócio, persistência, moderação e integração de IA devem permanecer separados em módulos. | Revisão do diagrama e do código durante pull requests. |
| RNF-09 Auditabilidade | Ações de moderação devem registrar ator, publicação, data, decisão e justificativa. | Consultar o registro após cada ação de moderação. |
| RNF-10 Compatibilidade | O site deve operar nas versões atuais dos navegadores móveis e desktop escolhidos para a demonstração acadêmica. | Rodar o roteiro de verificação nos navegadores definidos pelo grupo. |

## Regras de segurança e limites da IA

A IA somente produz sugestões de categoria e redação. Não determina se um aviso é verdadeiro, urgente ou seguro; não identifica pessoas; não contata a prefeitura; não publica automaticamente; e não decide denúncias ou sanções. O usuário revisa o resultado e permanece responsável pela publicação. Se o texto contiver dados pessoais, a tela deve orientar a remoção antes do envio.
